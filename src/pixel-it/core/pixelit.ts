import { DEFAULT_PALETTE } from '../constants';
import type {
	ApplyEffectsOptions,
	PixelItConfig,
	RGBColor,
	UIControlBindingOptions,
} from '../types';
import {
	colorSim,
	countColor,
	extractPaletteFromImageData,
	findSimilarColor,
} from '../utils/color-utils';

/**
 * Class for pixelating and transforming images
 *
 * PixelIt converts images to a pixelated, 8-bit style with
 * customizable color palettes and scaling options
 */
export class PixelIt {
	/** Canvas element to draw to */
	private drawto: HTMLCanvasElement;
	/** Image element to draw from */
	private drawfrom: HTMLImageElement;
	/** Context for the canvas */
	private ctx: CanvasRenderingContext2D;
	/** Scale factor for pixelation (0-0.5) */
	private scale: number;
	/** Color palette to use for converting image */
	private palette: RGBColor[];
	/** Collection of available color palettes */
	private availablePalettes: RGBColor[][] = [];
	/** Currently selected palette index */
	private currentPaletteIndex: number = 0;
	/** Maximum height for the image */
	private maxHeight?: number;
	/** Maximum width for the image */
	private maxWidth?: number;
	/** Stats about colors used in the converted image */
	private endColorStats: Record<string, number> = {};

	/**
	 * Create a new PixelIt instance
	 * @param config Configuration options
	 */
	constructor(config: PixelItConfig = {}) {
		//target for canvas
		this.drawto =
			config.to ||
			(document.getElementById('pixelitcanvas') as HTMLCanvasElement);
		//origin of uploaded image/src img
		this.drawfrom =
			config.from ||
			(document.getElementById('pixelitimg') as HTMLImageElement);
		//hide image element
		this.hideFromImg();
		//range between 0 to 100
		this.scale =
			config.scale && config.scale > 0 && config.scale <= 50
				? config.scale * 0.01
				: 8 * 0.01;

		// Initialize palette and available palettes
		this.palette = config.palette || DEFAULT_PALETTE;
		this.availablePalettes = [DEFAULT_PALETTE];

		// If config.palette is provided, add it to available palettes if it's not the same as default
		if (
			config.palette &&
			JSON.stringify(config.palette) !== JSON.stringify(DEFAULT_PALETTE)
		) {
			this.availablePalettes.push(config.palette);
			this.currentPaletteIndex = 1; // Select the provided palette
		}

		this.maxHeight = config.maxHeight;
		this.maxWidth = config.maxWidth;

		// Initialize canvas context
		if (!this.drawto) {
			// Create a canvas if it doesn't exist
			const canvas = document.createElement('canvas');
			canvas.id = 'pixelitcanvas';
			document.body.appendChild(canvas);
			this.drawto = canvas;
		}
		this.ctx = this.drawto.getContext('2d') as CanvasRenderingContext2D;

		// Set initial dimensions
		this.setScale(8).resizeImage().draw();
	}

	/**
	 * Hides the source image element
	 * @returns this (for method chaining)
	 */
	hideFromImg(): this {
		if (this.drawfrom) {
			this.drawfrom.style.visibility = 'hidden';
			this.drawfrom.style.position = 'fixed';
			this.drawfrom.style.top = '0';
			this.drawfrom.style.left = '0';
			this.drawfrom.style.width = '1px';
			this.drawfrom.style.height = '1px';
		}
		return this;
	}

	/**
	 * Sets the source image element
	 * @param elem Image element to use as source
	 * @returns this (for method chaining)
	 */
	setFromImgElement(elem: HTMLImageElement): this {
		this.drawfrom = elem;
		return this;
	}

	/**
	 * Sets the source image from a URL
	 * @param src Image URL
	 * @returns this (for method chaining)
	 */
	setFromImgSource(src: string): this {
		const img = new Image();
		img.src = src;
		this.drawfrom = img;
		return this;
	}

	/**
	 * Sets the scale factor for pixelation
	 * @param scale Scale factor (1-50)
	 * @returns this (for method chaining)
	 */
	setScale(scale: number): this {
		// Valid range: 1 to 50
		this.scale = scale && scale > 0 && scale <= 50 ? scale * 0.01 : this.scale;
		return this;
	}

	/**
	 * Gets the current scale factor
	 * @returns Current scale factor (1-50)
	 */
	getScale(): number {
		return this.scale * 100;
	}

	/**
	 * Sets the maximum width for the image
	 * @param width Max width in pixels
	 * @returns this (for method chaining)
	 */
	setMaxWidth(width: number): this {
		this.maxWidth = width || this.maxWidth;
		return this;
	}

	/**
	 * Gets the maximum width
	 * @returns Max width in pixels
	 */
	getMaxWidth(): number | undefined {
		return this.maxWidth;
	}

	/**
	 * Sets the maximum height for the image
	 * @param height Max height in pixels
	 * @returns this (for method chaining)
	 */
	setMaxHeight(height: number): this {
		this.maxHeight = height || this.maxHeight;
		return this;
	}

	/**
	 * Gets the maximum height
	 * @returns Max height in pixels
	 */
	getMaxHeight(): number | undefined {
		return this.maxHeight;
	}

	/**
	 * Sets the color palette
	 * @param arr Array of RGB colors
	 * @returns this (for method chaining)
	 */
	setPalette(arr: RGBColor[]): this {
		this.palette = arr;
		return this;
	}

	/**
	 * Gets the current palette
	 * @returns Current palette as array of RGB colors
	 */
	getPalette(): RGBColor[] {
		return this.palette;
	}

	/**
	 * Loads a palette from a URL (image)
	 * @param src Image URL to extract palette from
	 * @param num Number of colors to extract
	 * @returns this (for method chaining)
	 */
	setPaletteFromURL(src: string, numColors: number = 16): this {
		const img = new Image();
		img.src = src;
		img.onload = () => {
			// Extract dominant colors from image
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0);

			// Sample pixels and find dominant colors
			const imageData = ctx.getImageData(
				0,
				0,
				canvas.width,
				canvas.height,
			).data;
			// Extract palette from image data
			this.palette = extractPaletteFromImageData(imageData, numColors);

			// Trigger redraw with new palette if image is already loaded
			if (this.drawfrom) {
				this.draw().pixelate().convertPalette();
			}
		};
		return this;
	}

	/**
	 * Calculates color similarity between two colors (lower is better)
	 * @param rgbColor First RGB color
	 * @param compareColor Second RGB color to compare with
	 * @returns Euclidean distance between the two colors
	 */
	colorSim(rgbColor: RGBColor, compareColor: RGBColor): number {
		return colorSim(rgbColor, compareColor);
	}

	/**
	 * Finds the most similar color from the palette
	 * @param actualColor RGB color to find a match for
	 * @returns Most similar RGB color from the palette
	 */
	similarColor(actualColor: RGBColor): RGBColor {
		return findSimilarColor(actualColor, this.palette);
	}

	/**
	 * Count color occurrences (private helper)
	 * @param color Color string to count
	 * @param colorCount Existing color count record
	 * @returns Updated color count record
	 */
	private _countColor(
		color: string | null = null,
		colorCount: Record<string, number> = {},
	): Record<string, number> {
		return countColor(color, colorCount);
	}

	/**
	 * Draws the source image to the canvas
	 * @returns this (for method chaining)
	 */
	draw(): this {
		// Check if we have a valid source and destination
		if (!this.drawto || !this.drawfrom) {
			console.error('Missing drawto or drawfrom elements');
			return this;
		}

		// Set canvas dimensions based on source image
		this.drawto.width = this.drawfrom.naturalWidth;
		this.drawto.height = this.drawfrom.naturalHeight;

		// Draw the image on the canvas
		this.ctx.drawImage(
			this.drawfrom,
			0,
			0,
			this.drawfrom.naturalWidth,
			this.drawfrom.naturalHeight,
		);

		return this;
	}

	/**
	 * Resizes the image based on max width/height constraints
	 * @returns this (for method chaining)
	 */
	resizeImage(): this {
		let width = this.drawfrom.naturalWidth;
		let height = this.drawfrom.naturalHeight;

		// Apply max width constraint if specified
		if (this.maxWidth && width > this.maxWidth) {
			const ratio = this.maxWidth / width;
			width = this.maxWidth;
			height = height * ratio;
		}

		// Apply max height constraint if specified
		if (this.maxHeight && height > this.maxHeight) {
			const ratio = this.maxHeight / height;
			height = this.maxHeight;
			width = width * ratio;
		}

		// Set canvas dimensions
		this.drawto.width = width;
		this.drawto.height = height;

		// Redraw with new dimensions
		this.ctx.drawImage(this.drawfrom, 0, 0, width, height);

		return this;
	}

	/**
	 * Pixelates the image using the current scale
	 * @returns this (for method chaining)
	 */
	pixelate(): this {
		const width = this.drawto.width;
		const height = this.drawto.height;

		// Calculate the size of each pixel block based on scale
		const w = width * this.scale;
		const h = height * this.scale;

		// Draw pixelated version
		this.ctx.drawImage(this.drawto, 0, 0, w, h);
		this.ctx.imageSmoothingEnabled = false; // Disable anti-aliasing
		this.ctx.drawImage(this.drawto, 0, 0, w, h, 0, 0, width, height);

		return this;
	}

	/**
	 * Converts the image to grayscale
	 * @returns this (for method chaining)
	 */
	convertGrayscale(): this {
		const imageData = this.ctx.getImageData(
			0,
			0,
			this.drawto.width,
			this.drawto.height,
		);
		const data = imageData.data;

		for (let i = 0; i < data.length; i += 4) {
			// Calculate grayscale value based on RGB average
			const grayscale = (data[i] + data[i + 1] + data[i + 2]) / 3;
			data[i] = grayscale; // R
			data[i + 1] = grayscale; // G
			data[i + 2] = grayscale; // B
			// Alpha channel (data[i + 3]) remains unchanged
		}

		// Put the modified image data back on the canvas
		this.ctx.putImageData(imageData, 0, 0);

		return this;
	}

	/**
	 * Converts the image to use the current palette
	 * @returns this (for method chaining)
	 */
	convertPalette(): this {
		const imageData = this.ctx.getImageData(
			0,
			0,
			this.drawto.width,
			this.drawto.height,
		);
		const data = imageData.data;
		const colorStats: Record<string, number> = {};

		// Process each pixel
		for (let i = 0; i < data.length; i += 4) {
			const r = data[i];
			const g = data[i + 1];
			const b = data[i + 2];
			const color: RGBColor = [r, g, b];

			// Find the most similar color from our palette
			const similarColor = this.similarColor(color);
			data[i] = similarColor[0]; // R
			data[i + 1] = similarColor[1]; // G
			data[i + 2] = similarColor[2]; // B
			// Alpha channel (data[i + 3]) remains unchanged

			// Count colors for statistics
			const colorKey = similarColor.join(',');
			this._countColor(colorKey, colorStats);
		}

		// Store color usage statistics
		this.endColorStats = colorStats;

		// Put the modified image data back on the canvas
		this.ctx.putImageData(imageData, 0, 0);

		return this;
	}

	/**
	 * Gets the color usage statistics from the last palette conversion
	 * @returns Object with color counts
	 */
	getColorStats(): Record<string, number> {
		return this.endColorStats;
	}

	/**
	 * Saves the current canvas as a PNG image
	 * @param filename Optional filename (default: 'pixelit')
	 */
	saveImage(filename = 'pixelit'): void {
		const link = document.createElement('a');
		link.download = filename + '.png';
		link.href = this.drawto.toDataURL('image/png');
		link.click();
	}

	/**
	 * Batch applies multiple effects at once
	 * @param options Configuration for effects to apply
	 * @returns this (for method chaining)
	 */
	applyEffects(options: ApplyEffectsOptions = {}): this {
		// Apply scale if specified
		if (options.scale) {
			this.setScale(options.scale);
		}

		// Set palette from options or index
		if (options.palette) {
			this.setPalette(options.palette);
		} else if (options.paletteIndex !== undefined) {
			this.setPaletteByIndex(options.paletteIndex);
		}

		// Apply max dimensions if specified
		if (options.maxWidth) {
			this.setMaxWidth(options.maxWidth);
		}
		if (options.maxHeight) {
			this.setMaxHeight(options.maxHeight);
		}

		// Draw and pixelate
		this.draw().pixelate();

		// Apply grayscale if requested
		if (options.grayscale) {
			this.convertGrayscale();
		}

		// Apply palette conversion if requested
		if (options.applyPalette) {
			this.convertPalette();
		}

		// Resize if max dimensions were specified
		if (options.maxWidth || options.maxHeight) {
			this.resizeImage();
		}

		return this;
	}

	/**
	 * Sets the palette by index from available palettes
	 * @param index Index of the palette to use
	 * @returns this (for method chaining)
	 */
	setPaletteByIndex(index: number): this {
		if (index >= 0 && index < this.availablePalettes.length) {
			this.currentPaletteIndex = index;
			this.palette = this.availablePalettes[index];
		}
		return this;
	}

	/**
	 * Adds a palette to the available palettes
	 * @param palette RGB color palette to add
	 * @returns this (for method chaining)
	 */
	addPalette(palette: RGBColor[]): this {
		this.availablePalettes.push(palette);
		return this;
	}

	/**
	 * Gets all available palettes
	 * @returns Array of available palettes
	 */
	getAvailablePalettes(): RGBColor[][] {
		return this.availablePalettes;
	}

	/**
	 * Binds UI controls to update the pixelation in real-time
	 * @param options UI control binding options
	 * @returns this (for method chaining)
	 */
	bindToControls(options: UIControlBindingOptions = {}): this {
		// Bind scale input
		if (options.scaleInput) {
			const scaleInput = options.scaleInput;
			scaleInput.addEventListener('input', () => {
				this.setScale(Number(scaleInput.value)).draw().pixelate();

				// Apply additional effects if their controls are checked
				if (options.grayscaleCheckbox?.checked) {
					this.convertGrayscale();
				}
				if (options.paletteCheckbox?.checked) {
					this.convertPalette();
				}
			});
		}

		// Bind palette selector
		if (options.paletteSelect) {
			const paletteSelect = options.paletteSelect;
			paletteSelect.addEventListener('change', () => {
				const index = Number(paletteSelect.value);
				this.setPaletteByIndex(index).draw().pixelate();

				// Apply additional effects if their controls are checked
				if (options.grayscaleCheckbox?.checked) {
					this.convertGrayscale();
				}
				if (options.paletteCheckbox?.checked) {
					this.convertPalette();
				}

				// Update palette preview if available
				if (options.palettePreview) {
					this.renderPalettePreview(options.palettePreview, index);
				}
			});
		}

		// Bind grayscale checkbox
		if (options.grayscaleCheckbox) {
			const grayscaleCheckbox = options.grayscaleCheckbox;
			grayscaleCheckbox.addEventListener('change', () => {
				this.draw().pixelate();
				if (grayscaleCheckbox.checked) {
					this.convertGrayscale();
				}
				if (options.paletteCheckbox?.checked) {
					this.convertPalette();
				}
			});
		}

		// Bind palette checkbox
		if (options.paletteCheckbox) {
			const paletteCheckbox = options.paletteCheckbox;
			paletteCheckbox.addEventListener('change', () => {
				this.draw().pixelate();
				if (options.grayscaleCheckbox?.checked) {
					this.convertGrayscale();
				}
				if (paletteCheckbox.checked) {
					this.convertPalette();
				}
			});
		}

		// Bind max width input
		if (options.maxWidthInput) {
			const maxWidthInput = options.maxWidthInput;
			maxWidthInput.addEventListener('change', () => {
				const width = Number(maxWidthInput.value);
				if (width) {
					this.setMaxWidth(width).draw().resizeImage().pixelate();

					// Apply additional effects if their controls are checked
					if (options.grayscaleCheckbox?.checked) {
						this.convertGrayscale();
					}
					if (options.paletteCheckbox?.checked) {
						this.convertPalette();
					}
				}
			});
		}

		// Bind max height input
		if (options.maxHeightInput) {
			const maxHeightInput = options.maxHeightInput;
			maxHeightInput.addEventListener('change', () => {
				const height = Number(maxHeightInput.value);
				if (height) {
					this.setMaxHeight(height).draw().resizeImage().pixelate();

					// Apply additional effects if their controls are checked
					if (options.grayscaleCheckbox?.checked) {
						this.convertGrayscale();
					}
					if (options.paletteCheckbox?.checked) {
						this.convertPalette();
					}
				}
			});
		}

		// Bind download button
		if (options.downloadButton) {
			options.downloadButton.addEventListener('click', () => {
				this.saveImage();
			});
		}

		// Initialize palette preview if available
		if (options.palettePreview) {
			this.renderPalettePreview(
				options.palettePreview,
				this.currentPaletteIndex,
			);
		}

		return this;
	}

	/**
	 * Renders a preview of a palette
	 * @param container Element to render the preview in
	 * @param paletteIndex Index of the palette to preview
	 * @returns this (for method chaining)
	 */
	renderPalettePreview(container: HTMLElement, paletteIndex?: number): this {
		// Clear existing content
		container.innerHTML = '';

		// Use specified palette index or current one
		const index =
			paletteIndex !== undefined ? paletteIndex : this.currentPaletteIndex;

		// Get palette to preview
		const palette =
			index >= 0 && index < this.availablePalettes.length
				? this.availablePalettes[index]
				: this.palette;

		// Create color blocks for each palette entry
		palette.forEach((color) => {
			const colorBlock = document.createElement('div');
			colorBlock.classList.add('color-preview-block');
			colorBlock.style.backgroundColor = `rgb(${color[0]},${color[1]},${color[2]})`;
			colorBlock.style.width = '20px';
			colorBlock.style.height = '20px';
			colorBlock.style.display = 'inline-block';
			colorBlock.style.margin = '2px';
			container.appendChild(colorBlock);
		});

		return this;
	}
}
