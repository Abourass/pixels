# PixelIt 2.0

A modern, high-performance TypeScript library for converting images into pixel art with customizable color palettes and effects.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Features

- 🎨 **Custom Color Palettes** - Choose from 13 built-in palettes or create your own
- 🔄 **Multiple Effects** - Pixelation, grayscale conversion, and palette mapping
- ⚡ **Web Worker Support** - Non-blocking image processing using PixelItWorker
- 📐 **Image Resizing** - Automatic scaling with max width/height constraints
- 🎯 **Flexible API** - Method chaining for easy configuration
- 💾 **Export Functionality** - Save processed images as PNG
- 📦 **TypeScript Support** - Fully typed for better developer experience
- 🎮 **UI Bindings** - Built-in support for binding to HTML controls

## Demo

Visit the [live demo](https://abourass.github.io/pixels/) to see PixelIt in action. The demo includes an interactive interface where you can:
- Upload your own images
- Adjust pixelation scale in real-time
- Switch between different color palettes
- Apply grayscale effects
- Download your pixelated creations

## Installation

```bash
npm install pixels
```

Or using pnpm:

```bash
pnpm add pixels
```

Or using yarn:

```bash
yarn add pixels
```

## Quick Start

### Basic Usage

```javascript
import { PixelIt } from 'pixels';

// Create a new instance
const px = new PixelIt({
  from: document.getElementById('source-image'),
  to: document.getElementById('output-canvas'),
  scale: 8
});

// Apply effects
px.draw()
  .pixelate()
  .convertPalette();
```

### Using Web Worker for Better Performance

```javascript
import { PixelItWorker } from 'pixels';

const px = new PixelItWorker({
  from: document.getElementById('source-image'),
  to: document.getElementById('output-canvas'),
  scale: 8
});

// Same API as PixelIt but processing happens in a web worker
px.draw()
  .pixelate()
  .convertPalette();
```

## Usage Examples

### Pixelate an Image

```javascript
import { PixelIt } from 'pixels';

const px = new PixelIt();

// Set source image and scale
px.setFromImgSource('path/to/image.jpg')
  .setScale(10)
  .draw()
  .pixelate();
```

### Apply a Color Palette

```javascript
import { PixelIt, BUILT_IN_PALETTES } from 'pixels';

const px = new PixelIt();

// Use a built-in palette
px.setPalette(BUILT_IN_PALETTES.GAMEBOY)
  .draw()
  .pixelate()
  .convertPalette();
```

### Create a Custom Palette

```javascript
import { PixelIt } from 'pixels';

const customPalette = [
  [255, 0, 0],    // Red
  [0, 255, 0],    // Green
  [0, 0, 255],    // Blue
  [255, 255, 0]   // Yellow
];

const px = new PixelIt();
px.setPalette(customPalette)
  .draw()
  .pixelate()
  .convertPalette();
```

### Apply Grayscale Effect

```javascript
const px = new PixelIt();

px.draw()
  .pixelate()
  .convertGrayscale();
```

### Resize with Constraints

```javascript
const px = new PixelIt({
  maxWidth: 800,
  maxHeight: 600
});

px.draw()
  .resizeImage()
  .pixelate();
```

### Batch Apply Multiple Effects

```javascript
const px = new PixelIt();

px.applyEffects({
  scale: 12,
  grayscale: true,
  applyPalette: true,
  paletteIndex: 2,
  maxWidth: 500,
  debug: true  // Enable color statistics
});
```

### Save the Result

```javascript
const px = new PixelIt();

px.draw()
  .pixelate()
  .convertPalette()
  .saveImage('my-pixel-art');  // Downloads as 'my-pixel-art.png'
```

### Load Palette from Image

```javascript
const px = new PixelIt();

// Extract 16 dominant colors from a palette image
px.setPaletteFromURL('path/to/palette.png', 16);
```

### Bind to UI Controls

```javascript
const px = new PixelIt();

px.bindToControls({
  scaleInput: document.getElementById('scale-slider'),
  paletteSelect: document.getElementById('palette-dropdown'),
  grayscaleCheckbox: document.getElementById('grayscale-toggle'),
  paletteCheckbox: document.getElementById('palette-toggle'),
  downloadButton: document.getElementById('download-btn'),
  palettePreview: document.getElementById('palette-preview')
});
```

## API Reference

### Constructor

#### `new PixelIt(config?: PixelItConfig)`

Creates a new PixelIt instance.

**Config Options:**
- `to?: HTMLCanvasElement` - Target canvas element (default: searches for `#pixelitcanvas`)
- `from?: HTMLImageElement` - Source image element (default: searches for `#pixelitimg`)
- `scale?: number` - Pixelation scale factor 1-50 (default: 8)
- `palette?: RGBColor[]` - Initial color palette (default: DEFAULT_PALETTE)
- `maxWidth?: number` - Maximum output width in pixels
- `maxHeight?: number` - Maximum output height in pixels

### Methods

#### Image Source Methods

- **`setFromImgElement(elem: HTMLImageElement): this`** - Set the source image element
- **`setFromImgSource(src: string): this`** - Set source image from URL
- **`hideFromImg(): this`** - Hide the source image element

#### Configuration Methods

- **`setScale(scale: number): this`** - Set pixelation scale (1-50)
- **`getScale(): number`** - Get current scale factor
- **`setMaxWidth(width: number): this`** - Set maximum width
- **`getMaxWidth(): number | undefined`** - Get maximum width
- **`setMaxHeight(height: number): this`** - Set maximum height
- **`getMaxHeight(): number | undefined`** - Get maximum height

#### Palette Methods

- **`setPalette(arr: RGBColor[]): this`** - Set color palette
- **`getPalette(): RGBColor[]`** - Get current palette
- **`setPaletteByIndex(index: number): this`** - Set palette by index from available palettes
- **`addPalette(palette: RGBColor[]): this`** - Add a palette to available palettes
- **`getAvailablePalettes(): RGBColor[][]`** - Get all available palettes
- **`setPaletteFromURL(src: string, numColors?: number): this`** - Load palette from image URL

#### Effect Methods

- **`draw(): this`** - Draw the source image to canvas
- **`pixelate(): this`** - Apply pixelation effect
- **`convertGrayscale(): this`** - Convert to grayscale
- **`convertPalette(): this`** - Apply palette conversion
- **`resizeImage(): this`** - Resize based on max width/height
- **`applyEffects(options: ApplyEffectsOptions): this`** - Batch apply multiple effects

#### Utility Methods

- **`saveImage(filename?: string): void`** - Download the result as PNG
- **`colorSim(rgbColor: RGBColor, compareColor: RGBColor): number`** - Calculate color similarity
- **`similarColor(actualColor: RGBColor): RGBColor`** - Find most similar color from palette
- **`getColorStats(): Record<string, number>`** - Get color usage statistics
- **`setColorStatsCollection(enable: boolean): this`** - Enable/disable color statistics (for performance)

#### UI Binding Methods

- **`bindToControls(options: UIControlBindingOptions): this`** - Bind to HTML controls
- **`renderPalettePreview(container: HTMLElement, paletteIndex?: number): this`** - Render palette preview

### Types

#### RGBColor

```typescript
type RGBColor = [number, number, number];
```

RGB color represented as a tuple of three integers [r, g, b].

#### PixelItConfig

```typescript
interface PixelItConfig {
  to?: HTMLCanvasElement;
  from?: HTMLImageElement;
  scale?: number;
  palette?: RGBColor[];
  maxHeight?: number;
  maxWidth?: number;
}
```

#### ApplyEffectsOptions

```typescript
interface ApplyEffectsOptions {
  scale?: number;
  palette?: RGBColor[];
  paletteIndex?: number;
  grayscale?: boolean;
  applyPalette?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  debug?: boolean;
}
```

#### UIControlBindingOptions

```typescript
interface UIControlBindingOptions {
  scaleInput?: HTMLInputElement;
  paletteSelect?: HTMLSelectElement;
  grayscaleCheckbox?: HTMLInputElement;
  paletteCheckbox?: HTMLInputElement;
  maxWidthInput?: HTMLInputElement;
  maxHeightInput?: HTMLInputElement;
  downloadButton?: HTMLButtonElement;
  palettePreview?: HTMLElement;
  debugCheckbox?: HTMLInputElement;
}
```

## Built-in Palettes

PixelIt includes 13 built-in color palettes accessible via `BUILT_IN_PALETTES`:

- **DEFAULT** / **RETRO16** - 16-color retro palette (default)
- **EARTH_TONES** - Natural earth-toned colors
- **OCEAN** - Ocean and beach colors
- **NEON** - Vibrant neon colors
- **GAMEBOY** - Classic Game Boy green palette (4 colors)
- **CRIMSON** - Red and dark tones
- **PICO8** - PICO-8 fantasy console palette (16 colors)
- **MUTED** - Subtle, muted tones
- **PASTEL** - Soft pastel colors
- **NES** - Nintendo Entertainment System palette
- **AQUA** - Aqua and teal gradient
- **ROSE** - Rose and pink tones

### Usage

```javascript
import { BUILT_IN_PALETTES } from 'pixels';

px.setPalette(BUILT_IN_PALETTES.PICO8);
```

## Development

### Prerequisites

- Node.js 16+
- pnpm 10.12.2+

### Setup

```bash
# Clone the repository
git clone https://github.com/abourass/pixels.git
cd pixels

# Install dependencies
pnpm install
```

### Development Commands

```bash
# Build the library
pnpm build

# Run the demo in development mode
pnpm dev

# Build the demo for production
pnpm build:demo

# Preview the production build
pnpm preview

# Lint code
pnpm lint

# Format code
pnpm format
```

## Project Structure

```
pixels/
├── src/
│   ├── pixel-it/
│   │   ├── core/
│   │   │   ├── pixelit.ts          # Main PixelIt class
│   │   │   └── pixelit-worker.ts   # Web Worker implementation
│   │   ├── workers/
│   │   │   └── pixelate-worker.ts  # Worker thread logic
│   │   ├── utils/
│   │   │   └── color-utils.ts      # Color manipulation utilities
│   │   ├── constants.ts            # Built-in palettes
│   │   ├── types.ts                # TypeScript type definitions
│   │   └── index.ts                # Main entry point
│   ├── demo.ts                     # Demo application
│   └── canvas-controls.ts          # UI controls for demo
├── index.html                      # Demo page
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Browser Support

PixelIt works in all modern browsers that support:
- Canvas API
- ES6+
- Web Workers (for PixelItWorker)

## Performance Tips

1. **Use Web Workers**: For large images or real-time processing, use `PixelItWorker` instead of `PixelIt` to avoid blocking the main thread.

2. **Disable Color Statistics**: Color statistics collection can impact performance. Disable it when not needed:
   ```javascript
   px.setColorStatsCollection(false);
   ```

3. **Limit Scale Range**: Higher scale values (closer to 1) create larger pixel grids and take longer to process. Start with values between 8-15.

4. **Resize Before Processing**: For very large images, set `maxWidth` and `maxHeight` to reduce processing time.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

This project uses Biome for linting and formatting. Run `pnpm lint` and `pnpm format` before committing.

## License

ISC License - see LICENSE file for details

## Acknowledgments

- Inspired by classic pixel art and retro gaming aesthetics
- Built with TypeScript and Vite
- UI powered by SolidJS

## Links

- [GitHub Repository](https://github.com/abourass/pixels)
- [Report Issues](https://github.com/abourass/pixels/issues)
- [Live Demo](https://abourass.github.io/pixels/)

---

Made with ❤️ for pixel art enthusiasts
