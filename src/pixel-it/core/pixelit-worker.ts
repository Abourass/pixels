import { DEFAULT_PALETTE } from '../constants';
import type {
  ApplyEffectsOptions,
  PixelItConfig,
  RGBColor,
  UIControlBindingOptions,
} from '../types';
import { extractPaletteFromImageData } from '../utils/color-utils';

// Create a worker URL with a blob for TypeScript compatibility
const getWorkerBlob = () => {
  return new Worker(new URL('../workers/pixelate-worker.ts', import.meta.url), { type: 'module' });
};

/**
 * Class for pixelating and transforming images with Web Worker support
 * 
 * This version offloads heavy pixel calculations to a web worker
 * to prevent UI freezing during processing
 */
export class PixelItWorker {
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
  /** Collect color statistics */
  private colorStatsEnabled: boolean = false;
  /** The web worker instance */
  private worker: Worker;
  /** Queue of pending operations */
  private pendingOperations: Array<() => Promise<void>> = [];
  /** Flag to indicate if a worker operation is in progress */
  private isProcessing: boolean = false;
  /** Callbacks for when operations complete */
  private callbacks: Map<string, (data: any) => void> = new Map();

  /**
   * Create a new PixelItWorker instance
   * @param config Configuration options
   */
  constructor(config: PixelItConfig = {}) {
    // Initialize the web worker
    this.worker = getWorkerBlob();
    
    // Set up worker message handler
    this.worker.onmessage = this.handleWorkerMessage.bind(this);

    // Target for canvas
    this.drawto =
      config.to ||
      (document.getElementById('pixelitcanvas') as HTMLCanvasElement);
    
    // Origin of uploaded image/src img
    this.drawfrom =
      config.from ||
      (document.getElementById('pixelitimg') as HTMLImageElement);
    
    // Hide image element
    this.hideFromImg();
    
    // Range between 0 to 50
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
   * Handle messages from the web worker
   * @param event Message event from worker
   */
  private handleWorkerMessage(event: MessageEvent): void {
    const { operation, imageData, colorStats, error } = event.data;
    
    if (error) {
      console.error('Worker error:', error);
      this.processNextOperation();
      return;
    }

    // Process the response based on operation type
    switch (operation) {
      case 'pixelate':
        // Apply the pixelated image data to the canvas
        this.ctx.putImageData(imageData, 0, 0);
        break;
        
      case 'grayscale':
        // Apply the grayscale image data to the canvas
        this.ctx.putImageData(imageData, 0, 0);
        break;
        
      case 'palette':
        // Apply the palette-converted image data to the canvas
        this.ctx.putImageData(imageData, 0, 0);
        
        // Store color statistics if provided
        if (colorStats) {
          this.endColorStats = colorStats;
        }
        break;
    }
    
    // Execute callback if one exists for this operation
    const callback = this.callbacks.get(operation);
    if (callback) {
      callback(event.data);
      this.callbacks.delete(operation);
    }
    
    // Process the next operation in queue
    this.processNextOperation();
  }

  /**
   * Add an operation to the queue and process if not busy
   * @param operation Function that returns a promise
   */
  private queueOperation(operation: () => Promise<void>): Promise<void> {
    return new Promise<void>((resolve) => {
      this.pendingOperations.push(async () => {
        await operation();
        resolve();
      });
      
      // Start processing if not already in progress
      if (!this.isProcessing) {
        this.processNextOperation();
      }
    });
  }

  /**
   * Process the next operation in the queue
   */
  private processNextOperation(): void {
    if (this.pendingOperations.length === 0) {
      this.isProcessing = false;
      return;
    }
    
    this.isProcessing = true;
    const nextOperation = this.pendingOperations.shift();
    if (nextOperation) {
      nextOperation().catch(error => {
        console.error('Error processing operation:', error);
        this.processNextOperation();
      });
    }
  }

  /**
   * Hides the source image element
   * @returns this (for method chaining)
   */
  hideFromImg(): this {
    this.drawfrom.style.display = 'none';
    return this;
  }

  /**
   * Shows the source image element
   * @returns this (for method chaining)
   */
  showFromImg(): this {
    this.drawfrom.style.display = 'initial';
    return this;
  }

  /**
   * Sets the pixelation scale
   * @param scale Scale factor (1-50)
   * @returns this (for method chaining)
   */
  setScale(scale: number): this {
    this.scale = scale > 0 && scale <= 50 ? scale * 0.01 : 8 * 0.01;
    return this;
  }

  /**
   * Sets the maximum width constraint
   * @param width Max width in pixels
   * @returns this (for method chaining)
   */
  setMaxWidth(width: number): this {
    this.maxWidth = width;
    return this;
  }

  /**
   * Sets the maximum height constraint
   * @param height Max height in pixels
   * @returns this (for method chaining)
   */
  setMaxHeight(height: number): this {
    this.maxHeight = height;
    return this;
  }

  /**
   * Enables or disables color statistics collection
   * @param enable Whether to collect color statistics
   * @returns this (for method chaining)
   */
  setColorStatsCollection(enable: boolean): this {
    this.colorStatsEnabled = enable;
    return this;
  }

  /**
   * Sets the color palette to use
   * @param palette RGB color palette
   * @returns this (for method chaining)
   */
  setPalette(palette: RGBColor[]): this {
    this.palette = palette;
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
   * Sets image source from a URL
   * @param url Image URL
   * @returns Promise that resolves when the image is loaded
   */
  setFromImgSource(url: string): Promise<this> {
    return new Promise((resolve) => {
      this.drawfrom.onload = () => {
        resolve(this);
      };
      this.drawfrom.src = url;
    });
  }

  /**
   * Adds a new palette to available palettes
   * @param palette RGB color palette to add
   * @returns this (for method chaining)
   */
  addPalette(palette: RGBColor[]): this {
    // Check if palette already exists
    const paletteStr = JSON.stringify(palette);
    const exists = this.availablePalettes.some(
      (p) => JSON.stringify(p) === paletteStr,
    );

    if (!exists) {
      this.availablePalettes.push(palette);
    }

    return this;
  }

  /**
   * Gets all available color palettes
   * @returns Array of all palettes
   */
  getAvailablePalettes(): RGBColor[][] {
    return this.availablePalettes;
  }

  /**
   * Gets the color usage statistics from the last palette conversion
   * @returns Object with color counts
   */
  getColorStats(): Record<string, number> {
    return this.endColorStats;
  }

  /**
   * Draws the source image to the canvas
   * @returns this (for method chaining)
   */
  draw(): this {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.drawto.width, this.drawto.height);

    // Set dimensions from source image
    this.drawto.width = this.drawfrom.naturalWidth;
    this.drawto.height = this.drawfrom.naturalHeight;

    // Draw the image
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
   * Pixelates the image using the web worker
   * @returns Promise that resolves when the operation is complete
   */
  async pixelate(): Promise<this> {
    return this.queueOperation(async () => {
      // Get current image data from canvas
      const imageData = this.ctx.getImageData(
        0,
        0,
        this.drawto.width,
        this.drawto.height,
      );

      // Send to worker for processing
      this.worker.postMessage(
        {
          operation: 'pixelate',
          imageData,
          options: {
            scale: this.scale,
            width: this.drawto.width,
            height: this.drawto.height,
          },
        },
        [imageData.data.buffer] // Transfer buffer for better performance
      );
    }).then(() => this);
  }

  /**
   * Converts the image to grayscale using the web worker
   * @returns Promise that resolves when the operation is complete
   */
  async convertGrayscale(): Promise<this> {
    return this.queueOperation(async () => {
      // Get current image data from canvas
      const imageData = this.ctx.getImageData(
        0,
        0,
        this.drawto.width,
        this.drawto.height,
      );

      // Send to worker for processing
      this.worker.postMessage(
        {
          operation: 'grayscale',
          imageData,
        },
        [imageData.data.buffer] // Transfer buffer for better performance
      );
    }).then(() => this);
  }

  /**
   * Converts the image to use the current palette using the web worker
   * @returns Promise that resolves when the operation is complete
   */
  async convertPalette(): Promise<this> {
    return this.queueOperation(async () => {
      // Get current image data from canvas
      const imageData = this.ctx.getImageData(
        0,
        0,
        this.drawto.width,
        this.drawto.height,
      );

      // Send to worker for processing
      this.worker.postMessage(
        {
          operation: 'palette',
          imageData,
          options: {
            palette: this.palette,
            collectStats: this.colorStatsEnabled,
          },
        },
        [imageData.data.buffer] // Transfer buffer for better performance
      );
    }).then(() => this);
  }

  /**
   * Creates a color palette from the current image
   * @param colorCount Maximum number of colors
   * @returns Array of RGB colors
   */
  createPaletteFromCanvas(colorCount: number = 16): RGBColor[] {
    const imageData = this.ctx.getImageData(
      0,
      0,
      this.drawto.width,
      this.drawto.height,
    );
    return extractPaletteFromImageData(imageData, colorCount);
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
   * @returns Promise that resolves when all effects are applied
   */
  async applyEffects(options: ApplyEffectsOptions = {}): Promise<this> {
    // Apply scale if specified
    if (options.scale) {
      this.setScale(options.scale);
    }

    if (options.debug !== undefined) {
      this.setColorStatsCollection(options.debug);
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
    this.draw();
    await this.pixelate();

    // Apply grayscale if requested
    if (options.grayscale) {
      await this.convertGrayscale();
    }

    // Apply palette conversion if requested
    if (options.applyPalette) {
      await this.convertPalette();
    }

    // Resize if max dimensions were specified
    if (options.maxWidth || options.maxHeight) {
      this.resizeImage();
    }

    return this;
  }

  /**
   * Bind UI controls to the PixelIt instance
   * @param options UI control binding options
   */
  bindToControls(options: UIControlBindingOptions): void {
    // Scale Input
    if (options.scaleInput) {
      options.scaleInput.addEventListener('change', () => {
        this.setScale(Number(options.scaleInput!.value)).draw();
        this.pixelate().then(() => {
          // Apply grayscale if needed
          if (options.grayscaleCheckbox?.checked) {
            return this.convertGrayscale();
          }
          return Promise.resolve();
        }).then(() => {
          // Apply palette if needed
          if (options.paletteCheckbox?.checked) {
            return this.convertPalette();
          }
          return Promise.resolve();
        });
      });
    }

    // Grayscale checkbox
    if (options.grayscaleCheckbox) {
      options.grayscaleCheckbox.addEventListener('change', () => {
        this.draw();
        this.pixelate().then(() => {
          if (options.grayscaleCheckbox!.checked) {
            return this.convertGrayscale();
          }
          return Promise.resolve();
        }).then(() => {
          // Apply palette if needed
          if (options.paletteCheckbox?.checked) {
            return this.convertPalette();
          }
          return Promise.resolve();
        });
      });
    }

    // Palette checkbox
    if (options.paletteCheckbox) {
      options.paletteCheckbox.addEventListener('change', () => {
        this.draw();
        this.pixelate().then(() => {
          // Apply grayscale if needed
          if (options.grayscaleCheckbox?.checked) {
            return this.convertGrayscale();
          }
          return Promise.resolve();
        }).then(() => {
          if (options.paletteCheckbox!.checked) {
            return this.convertPalette();
          }
          return Promise.resolve();
        });
      });
    }

    // Max width input
    if (options.maxWidthInput) {
      options.maxWidthInput.addEventListener('change', () => {
        const value = options.maxWidthInput!.value;
        this.setMaxWidth(value ? Number(value) : undefined);
        this.resizeImage();
      });
    }

    // Max height input
    if (options.maxHeightInput) {
      options.maxHeightInput.addEventListener('change', () => {
        const value = options.maxHeightInput!.value;
        this.setMaxHeight(value ? Number(value) : undefined);
        this.resizeImage();
      });
    }

    // Download button
    if (options.downloadButton) {
      options.downloadButton.addEventListener('click', () => {
        this.saveImage();
      });
    }

    // Palette preview
    if (options.palettePreview && options.paletteSelect) {
      // Display palette colors on selection
      options.paletteSelect.addEventListener('change', () => {
        const paletteIndex = Number(options.paletteSelect!.value);
        if (
          paletteIndex >= 0 &&
          paletteIndex < this.availablePalettes.length
        ) {
          this.setPaletteByIndex(paletteIndex);

          // Show palette colors in the preview
          if (options.palettePreview) {
            options.palettePreview.innerHTML = '';
            this.palette.forEach((color) => {
              const div = document.createElement('div');
              div.className = 'colorblock';
              div.style.backgroundColor = `rgba(${color[0]},${color[1]},${color[2]},1)`;
              options.palettePreview!.appendChild(div);
            });
          }
        }
      });
    }
  }

  /**
   * Clean up resources when done with this instance
   */
  destroy(): void {
    this.worker.terminate();
  }
}
