import { createSignal } from 'solid-js';
import type { PixelItWorker } from './pixel-it';
import type { RGBColor } from './pixel-it/types';

// Type for our controller options
interface CanvasControlOptions {
	pixelIt: PixelItWorker;
	container: HTMLElement;
	paletteList: RGBColor[][];
	onPaletteChange?: (paletteIndex: number) => void;
}

// Type for control state
interface ControlState {
	scale: number;
	grayscale: boolean;
	usePalette: boolean;
	paletteIndex: number;
	isOpen: boolean;
	maxWidth?: number;
	maxHeight?: number;
}

export function createCanvasControls(options: CanvasControlOptions) {
	const { pixelIt, container, paletteList, onPaletteChange } = options;

	// Create signals for state
	const [scale, setScale] = createSignal(8);
	const [grayscale, setGrayscale] = createSignal(false);
	const [usePalette, setUsePalette] = createSignal(true);
	const [paletteIndex, setPaletteIndex] = createSignal(0);
	const [isOpen, setIsOpen] = createSignal(false);
	const [isProcessing, setIsProcessing] = createSignal(false);
	const [maxWidth, setMaxWidth] = createSignal<number | undefined>(undefined);
	const [maxHeight, setMaxHeight] = createSignal<number | undefined>(undefined);

	// Create the controls container
	const controlsElement = document.createElement('div');
	controlsElement.classList.add('canvas-controls'); // Map palette names from BUILT_IN_PALETTES  // Try to get palette names - fallback to generic names if not available
	const paletteNames: string[] = [];
	try {
		// Try to get from global BUILT_IN_PALETTES
		const globalPalettes = (window as any).BUILT_IN_PALETTES;
		if (globalPalettes && typeof globalPalettes === 'object') {
			Object.keys(globalPalettes).forEach((name) => {
				// Format palette name for display (e.g. EARTH_TONES -> Earth Tones)
				const formattedName = name
					.split('_')
					.map((word) => word.charAt(0) + word.slice(1).toLowerCase())
					.join(' ');
				paletteNames.push(formattedName);
			});
		}
	} catch (_) {
		// Fallback with generic names
		for (let i = 0; i < paletteList.length; i++) {
			paletteNames.push(i === 0 ? 'Default' : `Palette ${i}`);
		}
	}
  
  // Generate palette HTML with names
		const palettesHtml = paletteList
			.map((palette, idx) => {
				const paletteName =
					idx < paletteNames.length
						? paletteNames[idx]
						: `Custom ${idx - paletteNames.length + 1}`;
				return `
          <div class="palette-option ${idx === 0 ? 'active' : ''}" data-index="${idx}">
            <div class="palette-name">${paletteName}</div>
            <div class="palette-colors">
              ${palette
								.map(
									(color: RGBColor) => `
                <span class="palette-color" style="background-color: rgb(${color[0]}, ${color[1]}, ${color[2]})"></span>
              `,
								)
								.join('')}
            </div>
          </div>
        `;
			})
			.join('');

	controlsElement.innerHTML = `
    <div class="pixel-size-control">
      <div class="pixel-size-slider-container">
        <input type="range" class="scale-slider" min="1" max="50" value="8" />
        <input type="number" class="scale-input" min="1" max="50" value="8" />
        <div class="pixel-label">Pixel Size</div>
      </div>
    </div>
    <div class="additional-controls">
      <button class="controls-toggle">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"></path>
        </svg>
      </button>
      <div class="controls-panel">
        <div class="control-item">
          <label>
            <input type="checkbox" class="grayscale-check" />
            Grayscale
          </label>
        </div>
        <div class="control-item">
          <label>
            <input type="checkbox" class="palette-check" checked />
            Use Palette
          </label>
        </div>
        <div class="control-item">
          <label>Max Size:</label>
          <div class="max-size-controls">
            <div class="max-size-input-group">
              <input type="number" class="max-width-input" placeholder="Auto" min="1" />
              <div class="input-label">Width</div>
            </div>
            <div class="max-size-input-group">
              <input type="number" class="max-height-input" placeholder="Auto" min="1" />
              <div class="input-label">Height</div>
            </div>
          </div>
        </div>
        <div class="control-item palette-select-container">
          <label>Palette:</label>
          <div class="palette-options">
            ${palettesHtml}
          </div>
        </div>
      </div>
    </div>
  `;

	// Add to container
	container.appendChild(controlsElement);

	// Get DOM references
	const toggleButton = controlsElement.querySelector(
		'.controls-toggle',
	) as HTMLButtonElement;
	const controlsPanel = controlsElement.querySelector(
		'.controls-panel',
	) as HTMLDivElement;
	const scaleSlider = controlsElement.querySelector(
		'.scale-slider',
	) as HTMLInputElement;
	const scaleInputEl = controlsElement.querySelector(
		'.scale-input',
	) as HTMLInputElement;
	const grayscaleCheck = controlsElement.querySelector(
		'.grayscale-check',
	) as HTMLInputElement;
	const paletteCheck = controlsElement.querySelector(
		'.palette-check',
	) as HTMLInputElement;
	const paletteOptionElements =
		controlsElement.querySelectorAll<HTMLElement>('.palette-option');
	const maxWidthInput = controlsElement.querySelector(
		'.max-width-input',
	) as HTMLInputElement;
	const maxHeightInput = controlsElement.querySelector(
		'.max-height-input',
	) as HTMLInputElement;

	// Setup event listeners
	toggleButton.addEventListener('click', () => {
		setIsOpen(!isOpen());
		controlsPanel.classList.toggle('active', isOpen());
	});
	
	scaleSlider.addEventListener('input', (e: Event) => {
		const value = (e.target as HTMLInputElement).value;
		setScale(Number(value));
		scaleInputEl.value = value;
		applyChanges();
	});

	scaleInputEl.addEventListener('change', (e: Event) => {
		const value = (e.target as HTMLInputElement).value;
		const numValue = Math.min(Math.max(Number(value), 1), 50);
		setScale(numValue);
		scaleSlider.value = String(numValue);
		scaleInputEl.value = String(numValue);
		applyChanges();
	});

	grayscaleCheck.addEventListener('change', (e: Event) => {
		setGrayscale((e.target as HTMLInputElement).checked);
		applyChanges();
	});

	paletteCheck.addEventListener('change', (e: Event) => {
		setUsePalette((e.target as HTMLInputElement).checked);
		applyChanges();
	});
	
	maxWidthInput.addEventListener('change', (e: Event) => {
		const value = (e.target as HTMLInputElement).value;
		setMaxWidth(value ? Number(value) : undefined);
		applyChanges();
	});

	maxHeightInput.addEventListener('change', (e: Event) => {
		const value = (e.target as HTMLInputElement).value;
		setMaxHeight(value ? Number(value) : undefined);
		applyChanges();
	});

	paletteOptionElements.forEach((option: Element) => {
		option.addEventListener('click', (e: Event) => {
			const index = Number((e.currentTarget as HTMLElement).dataset.index);
			setPaletteIndex(index);

			// Update active class
			paletteOptionElements.forEach((opt: Element) =>
				opt.classList.remove('active'),
			);
			(e.currentTarget as HTMLElement).classList.add('active');

			if (onPaletteChange) {
				onPaletteChange(index);
			}

			applyChanges();
		});
	});

	// Function to apply changes
	async function applyChanges() {
		if (isProcessing()) return;

		setIsProcessing(true);
		controlsElement.classList.toggle('processing', true);

		try {
			await pixelIt.applyEffects({
				scale: scale(),
				grayscale: grayscale(),
				applyPalette: usePalette(),
				paletteIndex: paletteIndex(),
				maxWidth: maxWidth(),
				maxHeight: maxHeight(),
			});
		} finally {
			setIsProcessing(false);
			controlsElement.classList.toggle('processing', false);
		}
	}

	// Expose methods and state
	return {
		element: controlsElement,
		getState: () => ({
			scale: scale(),
			grayscale: grayscale(),
			usePalette: usePalette(),
			paletteIndex: paletteIndex(),
			isOpen: isOpen(),
			maxWidth: maxWidth(),
			maxHeight: maxHeight(),
		}),
		setState: (state: Partial<ControlState>) => {
			if ('scale' in state) setScale(state.scale!);
			if ('grayscale' in state) setGrayscale(state.grayscale!);
			if ('usePalette' in state) setUsePalette(state.usePalette!);
			if ('paletteIndex' in state) setPaletteIndex(state.paletteIndex!);
			if ('isOpen' in state) {
				setIsOpen(state.isOpen!);
				controlsPanel.classList.toggle('active', state.isOpen!);
			}
			if ('maxWidth' in state) setMaxWidth(state.maxWidth);
			if ('maxHeight' in state) setMaxHeight(state.maxHeight);

			// Update UI
			scaleSlider.value = String(scale());
			scaleInputEl.value = String(scale());
			grayscaleCheck.checked = grayscale();
			paletteCheck.checked = usePalette();
			maxWidthInput.value = maxWidth() !== undefined ? String(maxWidth()) : '';
			maxHeightInput.value =
				maxHeight() !== undefined ? String(maxHeight()) : '';

			paletteOptionElements.forEach((option, i) => {
				if (i === paletteIndex()) {
					option.classList.add('active');
				} else {
					option.classList.remove('active');
				}
			});
		},
	};
}
