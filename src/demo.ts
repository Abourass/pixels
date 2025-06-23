import { createCanvasControls } from './canvas-controls';
import './canvas-controls.css';
import { BUILT_IN_PALETTES, PixelItWorker } from './pixel-it';
import type { RGBColor } from './pixel-it/types';
import { hexToRgb } from './pixel-it/utils/color-utils';

// SlimSelect definition for TypeScript
declare var SlimSelect: any;

document.addEventListener('DOMContentLoaded', () => {
	console.log('---- DEBUG: PixelIt Initialization ----');
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

	// Clear paletteNames array
	let paletteNames: string[] = [];
	console.log('---- DEBUG: Loading Built-in Palettes ----');
	console.log('Built-in palette keys in original order:', Object.keys(BUILT_IN_PALETTES));

	// First, load palette names to maintain the correct order
	paletteNames = Object.keys(BUILT_IN_PALETTES).map(name => {
		return name
			.split('_')
			.map((word) => word.charAt(0) + word.slice(1).toLowerCase())
			.join(' ');
	});
	console.log('Formatted palette names:', paletteNames);

	// Get original keys in the exact order
	const originalPaletteKeys = Object.keys(BUILT_IN_PALETTES);
	console.log('Original palette keys:', originalPaletteKeys);
	
	// Clear the availablePalettes array to ensure we have completely manual control
	px.clearPalettes();
	
	// Then load palettes in the SAME order as the original keys
	originalPaletteKeys.forEach((key, index) => {
		// Format the name for display
		const formattedName = key
			.split('_')
			.map((word) => word.charAt(0) + word.slice(1).toLowerCase())
			.join(' ');
		
		paletteNames[index] = formattedName;
		console.log(`Adding palette ${index}: Key=${key}, Name=${formattedName}`);
		
		// Force add the palette (we'll modify the worker method)
		px.forceAddPalette(BUILT_IN_PALETTES[key]);
	});

	// Now load custom palettes from localStorage
	const customPalettes = JSON.parse(
		localStorage.getItem('customPalettes') || '[]',
	);

	// Get custom palette names
	const customPaletteNames = JSON.parse(
		localStorage.getItem('customPaletteNames') || '[]'
	);

	// Add custom palettes
	customPalettes.forEach((palette: RGBColor[], index: number) => {
		const builtInCount = Object.keys(BUILT_IN_PALETTES).length;
		const totalIndex = builtInCount + index;
		
		px.forceAddPalette(palette);
		
		// Use stored custom name or fallback to generic name
		const customName = customPaletteNames[index] || `Custom ${index + 1}`;
		paletteNames.push(customName);
		
		console.log(`Adding custom palette ${index} (total index ${totalIndex}): Name=${customName}`);
	});
  
	// Function to populate palette names
	// Update the updatePaletteNames function to correctly synchronize built-in and custom palette names

function updatePaletteNames() {
    // Reset the array
    paletteNames = [];
    
    // Get all built-in palette names in the exact order they were added
    const originalPaletteKeys = Object.keys(BUILT_IN_PALETTES);
    originalPaletteKeys.forEach(name => {
        paletteNames.push(
            name.split('_')
                .map(word => word.charAt(0) + word.slice(1).toLowerCase())
                .join(' ')
        );
    });
    
    console.log('Updated palette names:', paletteNames);
    
    // Add custom palette names from localStorage
    const customPaletteNames = JSON.parse(
        localStorage.getItem('customPaletteNames') || '[]'
    );
    
    if (customPaletteNames.length > 0) {
        // Use the stored names if available
        paletteNames = paletteNames.concat(customPaletteNames);
    } else {
        // Use generic names when custom names aren't available
        const customPaletteCount = customPalettes.length;
        for (let i = 0; i < customPaletteCount; i++) {
            paletteNames.push(`Custom ${i + 1}`);
        }
    }
    
    // Debug - Verify that the paletteNames length matches the total number of palettes
    const totalPalettes = Object.keys(BUILT_IN_PALETTES).length + customPalettes.length;
    console.log(`Palette names: ${paletteNames.length}, Total palettes: ${totalPalettes}`);
}
	
	// Initialize palette names
	updatePaletteNames();

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
			await new Promise((resolve) => setTimeout(resolve, 100));
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
			
			// Get existing palette names
			const existingPaletteNames = JSON.parse(
				localStorage.getItem('customPaletteNames') || '[]'
			);
			
			// Add a generic name for this new custom palette
			const newName = `Custom ${existingPalettes.length + 1}`;
			existingPaletteNames.push(newName);
			
			// Save everything to localStorage
			existingPalettes.push(palette);
			localStorage.setItem('customPalettes', JSON.stringify(existingPalettes));
			localStorage.setItem('customPaletteNames', JSON.stringify(existingPaletteNames));

			// Update our palette names array
			updatePaletteNames();
			
			// Add to PixelIt instance
			px.forceAddPalette(palette);

			// Clear the palette builder
			currentPaletteDiv.innerHTML = '';

			// Rebuild the palette selector
			populatePaletteSelector();
			
			// Show feedback to the user
			alert(`Custom palette "${newName}" saved successfully!`);
		});

	// Clear custom palettes
	document
		.getElementById('clearcustompalettes')!
		.addEventListener('click', () => {
			localStorage.setItem('customPalettes', JSON.stringify([]));
			localStorage.setItem('customPaletteNames', JSON.stringify([]));

			// Reload the page to reset everything
			location.reload();
		});
		
	// Process hex file upload
	document.getElementById('hexPaletteInput')!.onchange = (e) => {
		const input = e.target as HTMLInputElement;
		if (!input.files?.length) return;
		
		const file = input.files[0];
		
		// Validate file extension
		const validExtensions = ['.hex', '.txt'];
		const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
		
		if (!validExtensions.includes(fileExtension)) {
			alert('Please upload a .hex or .txt file containing hex color codes.');
			input.value = ''; // Reset input
			return;
		}
		
		// Create palette name from filename
		const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
		const paletteName = fileName.split(/[_\-\s]/)
			.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(' ');
		
		const reader = new FileReader();
		reader.onload = (event) => {
			const text = event.target?.result as string;
			if (!text) return;
			
			// Process the hex file - expecting one hex color per line
			const hexColors = text.split('\n')
				.map(line => line.trim()) // Remove whitespace
				.filter(line => {
					if (!line || line.startsWith('//') || line.startsWith('#!') || line.startsWith('/*')) {
						return false; // Skip empty lines and comments
					}
					
					// Check for valid hex formats #RGB or #RRGGBB
					if (/^#[0-9A-Fa-f]{6}$/.test(line)) {
						return true; // Standard #RRGGBB format
					}
					
					// Check for hex without # prefix
					if (/^[0-9A-Fa-f]{6}$/.test(line)) {
						return true; // RRGGBB format without #
					}
					
					// Check for 3-character hex format
					if (/^#[0-9A-Fa-f]{3}$/.test(line)) {
						return true; // #RGB format
					}
					
					return false;
				})
				.map(line => {
					// Normalize all colors to #RRGGBB format
					if (!line.startsWith('#')) {
						line = '#' + line;
					}
					
					// Convert #RGB to #RRGGBB if needed
					if (line.length === 4) {
						const r = line[1];
						const g = line[2];
						const b = line[3];
						line = `#${r}${r}${g}${g}${b}${b}`;
					}
					
					return line;
				});
			
			if (hexColors.length === 0) {
				alert('No valid hex colors found in file. Format should be one #RRGGBB color per line.');
				return;
			}
			
			// Convert hex colors to RGB format
			const rgbColors: RGBColor[] = hexColors.map(hex => hexToRgb(hex));
			
			// Check if the exact same palette already exists
			const existingPalettes = JSON.parse(
				localStorage.getItem('customPalettes') || '[]',
			);
			
			// Convert to strings for comparison
			const newPaletteString = JSON.stringify(rgbColors);
			const isDuplicate = existingPalettes.some((palette: RGBColor[]) => {
				return JSON.stringify(palette) === newPaletteString;
			});
			
			if (isDuplicate) {
				alert('This exact palette already exists in your custom palettes.');
				input.value = ''; // Reset input
				return;
			}
			
			// Get existing palette names
			const existingPaletteNames = JSON.parse(
				localStorage.getItem('customPaletteNames') || '[]'
			);
			
			// Add the new palette to localStorage
			existingPalettes.push(rgbColors);
			existingPaletteNames.push(paletteName);
			
			localStorage.setItem('customPalettes', JSON.stringify(existingPalettes));
			localStorage.setItem('customPaletteNames', JSON.stringify(existingPaletteNames));
			
			// Update our palette names array
			updatePaletteNames();
			
			// Add to PixelIt instance
			px.forceAddPalette(rgbColors);
			
			// Get the new palette index (it's the last one in the list)
			const newPaletteIndex = px.getAvailablePalettes().length - 1;
			
			// Rebuild the palette selector to include the new palette
			populatePaletteSelector();
			
			// Show loading indicator and apply the new palette
			withLoading(async () => {
				// Use the applyEffects method with the selected palette
				palette.checked = true; // Force palette mode on
				await px.applyEffects({
					paletteIndex: newPaletteIndex,
					scale: Number(blocksize.value),
					grayscale: greyscale.checked,
					applyPalette: true,
					maxHeight: maxheight.value ? Number(maxheight.value) : undefined,
					maxWidth: maxwidth.value ? Number(maxwidth.value) : undefined,
				});
				
				// Update the SlimSelect dropdown to show the new palette
				// @ts-ignore - SlimSelect adds this property to the DOM element
				const slimSelect = document.querySelector('.ss-main')?.__slimSelect__;
				if (slimSelect) {
					slimSelect.set(newPaletteIndex.toString());
				}
				
				// Update canvas controls
				canvasControls.setState({
					paletteIndex: newPaletteIndex,
					usePalette: true
				});
				
				// Reset the file input
				input.value = '';
				
				// Alert the user
				setTimeout(() => {
					alert(`Palette "${paletteName}" imported successfully with ${hexColors.length} colors and applied to the image.`);
				}, 300); // Small delay after loading indicator disappears
			});
		};
		
		reader.readAsText(file);
	};

	// Populate palette selector with available palettes
	function populatePaletteSelector() {
		console.log('---- DEBUG: Populating Palette Selector ----');
		console.log('Current paletteNames array:', paletteNames);
		
		// Clear existing options
		paletteSelect.innerHTML = '';

		// Get all palettes from PixelIt
		const availablePalettes = px.getAvailablePalettes();
		console.log(`Available palettes count: ${availablePalettes.length}`);

		// Add options to select
		availablePalettes.forEach((colors: RGBColor[], index: number) => {
			const option = document.createElement('option');
			option.value = index.toString();

			// Use the palette names from our array
			if (index < paletteNames.length) {
				option.textContent = paletteNames[index];
				console.log(`Palette ${index}: Name=${paletteNames[index]}, Colors=${colors.length}`);
			} else {
				// Fallback for any palettes that might not have a name
				option.textContent = `Palette ${index + 1}`;
				console.log(`Palette ${index}: Name=Palette ${index + 1} (fallback), Colors=${colors.length}`);
			}

			// Create color blocks for preview
			colors.forEach((color: RGBColor) => {
				const div = document.createElement('div');
				div.className = 'colorblock';
				div.style.backgroundColor = `rgba(${color[0]},${color[1]},${color[2]},1)`;
				if (!option.textContent) {
					option.appendChild(div);
				}
			});

			paletteSelect.appendChild(option);
		});

		// Initialize or update SlimSelect
		const existingSlimSelectEl = document.querySelector('.ss-main');
		// @ts-ignore - SlimSelect adds this property to the DOM element
		const existingSlimSelect = existingSlimSelectEl?.__slimSelect__;
		if (existingSlimSelect) {
			// If SlimSelect already exists, destroy it before recreating
			existingSlimSelect.destroy();
		}
		
		// Create new SlimSelect instance
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
	
	// Debug verification - check palette count matches name count
	const finalAvailablePalettes = px.getAvailablePalettes();
	console.log(`---- VERIFICATION ----`);
	console.log(`Total palettes: ${finalAvailablePalettes.length}, Total names: ${paletteNames.length}`);
	
	if (finalAvailablePalettes.length !== paletteNames.length) {
		console.error('ERROR: Palette count mismatch! This causes name-palette misalignment.');
	} else {
		console.log('SUCCESS: Palette count matches name count.');
	}
	
	// Add canvas controls
	const previewContainer = document.querySelector(
		'.pixel-preview',
	) as HTMLElement;

	// Get available palettes
	const availablePalettes = px.getAvailablePalettes();

	// Create canvas controls
	const canvasControls = createCanvasControls({
		pixelIt: px,
		container: previewContainer,
		paletteList: availablePalettes,
		paletteNames: paletteNames,
		onPaletteChange: (index) => {
			// Update the SlimSelect dropdown to stay in sync
			// This is a hack to access the SlimSelect instance
			// @ts-ignore - SlimSelect adds this property to the DOM element
			const slimSelect = document.querySelector('.ss-main')?.__slimSelect__;
			if (slimSelect) {
				slimSelect.set(index.toString());
			}
		},
	});

	// Initialize the control state
	canvasControls.setState({
		scale: Number(blocksize.value),
		grayscale: greyscale.checked,
		usePalette: palette.checked,
		paletteIndex: 0,
		isOpen: true, // Set to true to show palette options by default
		// No default size percentage
		maxWidth: maxwidth.value ? Number(maxwidth.value) : undefined,
		maxHeight: maxheight.value ? Number(maxheight.value) : undefined,
	});

	// Make sure the custom palette controls are properly set up
	document.querySelectorAll('#customcolor').forEach((elem) => {
		(elem as HTMLInputElement).value = '#ff00ff';
	});

	// Expose BUILT_IN_PALETTES to window for palette name display
	(window as any).BUILT_IN_PALETTES = BUILT_IN_PALETTES;

	// Run initial pixelation with default settings
	withLoading(async () => {
		await px.applyEffects({
			scale: Number(blocksize.value),
			paletteIndex: 0,
			grayscale: greyscale.checked,
			applyPalette: palette.checked,
		});

		// Final debug - verify palette order matches names
		console.log('---- DEBUG: Final Palette Check ----');
		const finalAvailablePalettes = px.getAvailablePalettes();
		console.log(`Total palettes: ${finalAvailablePalettes.length}, Total names: ${paletteNames.length}`);
		
		// Output first few colors for key palettes to help identify them
		console.log('Key palette samples:');
		['DEFAULT', 'NES', 'AQUA', 'ROSE'].forEach(name => {
			const formattedName = name
				.split('_')
				.map((word) => word.charAt(0) + word.slice(1).toLowerCase())
				.join(' ');
			
			const index = paletteNames.findIndex(n => 
				n.toLowerCase() === formattedName.toLowerCase());
				
			const paletteColors = finalAvailablePalettes[index];
			const sampleColors = paletteColors ? paletteColors.slice(0, 2) : [];
			
			console.log(`${name} (index ${index}): ${JSON.stringify(sampleColors)}`);
		});
	});
});
