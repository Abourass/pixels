/**
 * RGB color represented as a tuple of three integers [r, g, b]
 */
export type RGBColor = [number, number, number];

/**
 * Configuration options for PixelIt
 */
export interface PixelItConfig {
	/** Canvas element to draw to */
	to?: HTMLCanvasElement;
	/** Image element to draw from */
	from?: HTMLImageElement;
	/** Scale factor for pixelation (0-50) */
	scale?: number;
	/** Color palette to use for converting image */
	palette?: RGBColor[];
	/** Maximum height for the image */
	maxHeight?: number;
	/** Maximum width for the image */
	maxWidth?: number;
}

/**
 * Configuration options for batch applying effects
 */
export interface ApplyEffectsOptions {
	/** Scale factor for pixelation (0-50) */
	scale?: number;
	/** Custom palette to use */
	palette?: RGBColor[];
	/** Palette index from available palettes */
	paletteIndex?: number;
	/** Whether to convert to grayscale */
	grayscale?: boolean;
	/** Whether to apply palette conversion */
	applyPalette?: boolean;
	/** Maximum width for the image */
	maxWidth?: number;
	/** Maximum height for the image */
	maxHeight?: number;
}

/**
 * Configuration options for binding to UI controls
 */
export interface UIControlBindingOptions {
	/** Input element for scale control */
	scaleInput?: HTMLInputElement;
	/** Select element for palette selection */
	paletteSelect?: HTMLSelectElement;
	/** Checkbox for grayscale toggle */
	grayscaleCheckbox?: HTMLInputElement;
	/** Checkbox for palette application toggle */
	paletteCheckbox?: HTMLInputElement;
	/** Input for max width */
	maxWidthInput?: HTMLInputElement;
	/** Input for max height */
	maxHeightInput?: HTMLInputElement;
	/** Button to download image */
	downloadButton?: HTMLButtonElement;
	/** Element to display palette preview */
	palettePreview?: HTMLElement;
}
