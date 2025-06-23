import { PixelItWorker, BUILT_IN_PALETTES } from './pixel-it';
import { hexToRgb } from './pixel-it/utils/color-utils';
import type { RGBColor } from './pixel-it/types';

// SlimSelect definition for TypeScript
declare var SlimSelect: any;

document.addEventListener('DOMContentLoaded', () => {
	// Create pixel-it instance with default image using the worker implementation
	const px = new PixelItWorker({
		from: document.getElementById('pixelitimg') as HTMLImageElement,
		to: document.getElementById('pixelitcanvas') as HTMLCanvasElement,
	});

	// DOM elements
	const blocksize = document.querySelector<HTMLInputElement>('#blocksize')!;
	const blocksizeValue = document.querySelector<HTMLElement>('#blockvalue')!;
	const greyscale = document.querySelector<HTMLInputElement>('#greyscale')!;
	const palette = document.querySelector<HTMLInputElement>('#palette')!;
	const maxheight = document.querySelector<HTMLInputElement>('#maxheight')!;
	const maxwidth = document.querySelector<HTMLInputElement>('#maxwidth')!;
	const downloadimage =
		document.querySelector<HTMLButtonElement>('#downloadimage')!;
	const palettePreview = document.querySelector<HTMLElement>('#palettecolor')!;
	const paletteSelect =
		document.querySelector<HTMLSelectElement>('#paletteselector')!;
	const currentPaletteDiv = document.getElementById(
		'currentpallete',
	) as HTMLElement;
	const loaderElement = document.querySelector<HTMLElement>('.loader')!;

	// Load all built-in palettes
	Object.entries(BUILT_IN_PALETTES).forEach(([name, colors]) => {
		px.addPalette(colors);
	});

	// Load custom palettes from localStorage
	const customPalettes = JSON.parse(
		localStorage.getItem('customPalettes') || '[]',
	);
	customPalettes.forEach((palette: RGBColor[]) => {
		px.addPalette(palette);
	});

	// Bind UI controls to the PixelIt instance
	px.bindToControls({
		scaleInput: blocksize,
		grayscaleCheckbox: greyscale,
		paletteCheckbox: palette,
		maxHeightInput: maxheight,
		maxWidthInput: maxwidth,
		downloadButton: downloadimage,
		palettePreview,
		paletteSelect,
	});

	// Update the block size display when the value changes
	blocksize.addEventListener('input', () => {
		blocksizeValue.innerText = blocksize.value;
	});

	// Custom function to show/hide loader during operations
	const withLoading = async (callback: () => Promise<void> | void) => {
		loaderElement.classList.add('active');

		try {
			// Add small delay to ensure loader is visible
			await new Promise(resolve => setTimeout(resolve, 100));
			await callback();
		} finally {
			// Add small delay before removing loader
			setTimeout(() => loaderElement.classList.remove('active'), 200);
		}
	};

	// File input handler with loading indicator
	document.getElementById('pixlInput')!.onchange = (e) => {
		const input = e.target as HTMLInputElement;
		if (!input.files?.length) return;

		const img = new Image();
		img.src = URL.createObjectURL(input.files[0]);
		img.onload = () => {
			withLoading(async () => {
				// Set source and apply all effects at once
				await px.setFromImgSource(img.src);
				await px.applyEffects({
					scale: Number(blocksize.value),
					grayscale: greyscale.checked,
					applyPalette: palette.checked,
					maxHeight: maxheight.value ? Number(maxheight.value) : undefined,
					maxWidth: maxwidth.value ? Number(maxwidth.value) : undefined,
				});
			});
		};
	};

	// Add color to palette builder
	document.getElementById('addcustomcolor')!.addEventListener('click', () => {
		const colorInput = document.getElementById(
			'customcolor',
		) as HTMLInputElement;
		const color = colorInput.value;
		const rgbColor = hexToRgb(color);

		const colorSpan = document.createElement('span');
		colorSpan.style.backgroundColor = color;
		colorSpan.dataset.color = rgbColor.join(',');
		colorSpan.classList.add('colorblock');
		currentPaletteDiv.appendChild(colorSpan);
	});

	// Save custom palette
	document
		.getElementById('savecustompalette')!
		.addEventListener('click', () => {
			const colors = Array.from(
				currentPaletteDiv.querySelectorAll<HTMLElement>('.colorblock'),
			);

			if (colors.length === 0) return;

			// Extract RGB colors from elements
			const palette: RGBColor[] = colors
				.map((el) => el.dataset.color?.split(',').map(Number) as RGBColor)
				.filter(Boolean);

			// Save to localStorage
			const existingPalettes = JSON.parse(
				localStorage.getItem('customPalettes') || '[]',
			);
			existingPalettes.push(palette);
			localStorage.setItem('customPalettes', JSON.stringify(existingPalettes));

			// Add to PixelIt instance
			px.addPalette(palette);

			// Clear the palette builder
			currentPaletteDiv.innerHTML = '';

			// Rebuild the palette selector
			populatePaletteSelector();
		});

	// Clear custom palettes
	document
		.getElementById('clearcustompalettes')!
		.addEventListener('click', () => {
			localStorage.setItem('customPalettes', JSON.stringify([]));

			// Reload the page to reset everything
			location.reload();
		});

	// Populate palette selector with available palettes
	function populatePaletteSelector() {
		// Clear existing options
		paletteSelect.innerHTML = '';

		// Get all palettes from PixelIt
		const availablePalettes = px.getAvailablePalettes();

		// Add options to select
		availablePalettes.forEach((colors: RGBColor[], index: number) => {
			const option = document.createElement('option');
			option.value = index.toString();

			// Create color blocks for preview
			colors.forEach((color: RGBColor) => {
				const div = document.createElement('div');
				div.className = 'colorblock';
				div.style.backgroundColor = `rgba(${color[0]},${color[1]},${color[2]},1)`;
				option.appendChild(div);
			});

			paletteSelect.appendChild(option);
		});

		// Initialize SlimSelect
		new SlimSelect({
			hideSelectedOption: true,
			showSearch: false,
			select: '#paletteselector',
			onChange: (info: { value: string }) => {
				const paletteIndex = Number(info.value);

				withLoading(async () => {
					// Use the applyEffects method with the selected palette
					palette.checked = true; // Force palette mode on
					await px.applyEffects({
						paletteIndex,
						scale: Number(blocksize.value),
						grayscale: greyscale.checked,
						applyPalette: true,
						maxHeight: maxheight.value ? Number(maxheight.value) : undefined,
						maxWidth: maxwidth.value ? Number(maxwidth.value) : undefined,
					});
				});
			},
		});
	}

	// Initialize the UI
	populatePaletteSelector();
	blocksizeValue.innerText = blocksize.value;

	// Run initial pixelation with default settings
	withLoading(async () => {
		await px.applyEffects({
			scale: Number(blocksize.value),
			paletteIndex: 0,
			grayscale: greyscale.checked,
			applyPalette: palette.checked,
		});
	});
});
