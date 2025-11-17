# PixelIt API Reference

Complete API documentation for PixelIt 2.0.

## Table of Contents

- [Classes](#classes)
  - [PixelIt](#pixelit)
  - [PixelItWorker](#pixelitworker)
- [Types](#types)
- [Constants](#constants)
- [Utility Functions](#utility-functions)

## Classes

### PixelIt

Main class for pixelating and transforming images.

#### Constructor

```typescript
constructor(config?: PixelItConfig)
```

**Parameters:**
- `config` (optional): Configuration object
  - `to?: HTMLCanvasElement` - Target canvas element (default: searches for `#pixelitcanvas`)
  - `from?: HTMLImageElement` - Source image element (default: searches for `#pixelitimg`)
  - `scale?: number` - Pixelation scale factor 1-50 (default: 8)
  - `palette?: RGBColor[]` - Initial color palette
  - `maxWidth?: number` - Maximum output width in pixels
  - `maxHeight?: number` - Maximum output height in pixels

**Example:**
```javascript
const px = new PixelIt({
  from: document.getElementById('myImage'),
  to: document.getElementById('myCanvas'),
  scale: 10,
  maxWidth: 800
});
```

---

### Image Source Methods

#### `setFromImgElement(elem: HTMLImageElement): this`

Sets the source image element.

**Parameters:**
- `elem`: HTMLImageElement to use as the source

**Returns:** `this` for method chaining

**Example:**
```javascript
const img = document.createElement('img');
img.src = 'photo.jpg';
px.setFromImgElement(img);
```

---

#### `setFromImgSource(src: string): this`

Sets the source image from a URL.

**Parameters:**
- `src`: Image URL

**Returns:** `this` for method chaining

**Example:**
```javascript
px.setFromImgSource('https://example.com/image.jpg')
  .draw()
  .pixelate();
```

---

#### `hideFromImg(): this`

Hides the source image element by setting its visibility to hidden and positioning it off-screen.

**Returns:** `this` for method chaining

**Example:**
```javascript
px.hideFromImg();
```

---

### Configuration Methods

#### `setScale(scale: number): this`

Sets the pixelation scale factor.

**Parameters:**
- `scale`: Scale factor between 1 and 50
  - Lower values (1-5): Heavy pixelation, large pixels
  - Medium values (8-15): Moderate pixelation (recommended)
  - Higher values (20-50): Light pixelation, small pixels

**Returns:** `this` for method chaining

**Example:**
```javascript
px.setScale(12)
  .draw()
  .pixelate();
```

---

#### `getScale(): number`

Gets the current scale factor.

**Returns:** Current scale factor (1-50)

**Example:**
```javascript
const currentScale = px.getScale();
console.log(`Current scale: ${currentScale}`);
```

---

#### `setMaxWidth(width: number): this`

Sets the maximum width constraint for the output image.

**Parameters:**
- `width`: Maximum width in pixels

**Returns:** `this` for method chaining

**Example:**
```javascript
px.setMaxWidth(600)
  .draw()
  .resizeImage();
```

---

#### `getMaxWidth(): number | undefined`

Gets the current maximum width constraint.

**Returns:** Maximum width in pixels or undefined if not set

---

#### `setMaxHeight(height: number): this`

Sets the maximum height constraint for the output image.

**Parameters:**
- `height`: Maximum height in pixels

**Returns:** `this` for method chaining

**Example:**
```javascript
px.setMaxHeight(400)
  .draw()
  .resizeImage();
```

---

#### `getMaxHeight(): number | undefined`

Gets the current maximum height constraint.

**Returns:** Maximum height in pixels or undefined if not set

---

### Palette Methods

#### `setPalette(arr: RGBColor[]): this`

Sets the color palette to use for palette conversion.

**Parameters:**
- `arr`: Array of RGB colors, where each color is `[r, g, b]`

**Returns:** `this` for method chaining

**Example:**
```javascript
const customPalette = [
  [255, 0, 0],    // Red
  [0, 255, 0],    // Green
  [0, 0, 255],    // Blue
  [255, 255, 255] // White
];

px.setPalette(customPalette)
  .draw()
  .pixelate()
  .convertPalette();
```

---

#### `getPalette(): RGBColor[]`

Gets the current active palette.

**Returns:** Array of RGB colors

**Example:**
```javascript
const currentPalette = px.getPalette();
console.log(`Palette has ${currentPalette.length} colors`);
```

---

#### `setPaletteByIndex(index: number): this`

Sets the palette by index from the available palettes list.

**Parameters:**
- `index`: Zero-based index of the palette

**Returns:** `this` for method chaining

**Example:**
```javascript
// Switch to the third available palette
px.setPaletteByIndex(2)
  .draw()
  .pixelate()
  .convertPalette();
```

---

#### `addPalette(palette: RGBColor[]): this`

Adds a palette to the list of available palettes.

**Parameters:**
- `palette`: Array of RGB colors

**Returns:** `this` for method chaining

**Example:**
```javascript
const newPalette = [[0, 0, 0], [255, 255, 255]];
px.addPalette(newPalette);

// Now can be selected by index
const index = px.getAvailablePalettes().length - 1;
px.setPaletteByIndex(index);
```

---

#### `getAvailablePalettes(): RGBColor[][]`

Gets all available palettes.

**Returns:** Array of palette arrays

**Example:**
```javascript
const palettes = px.getAvailablePalettes();
console.log(`${palettes.length} palettes available`);
```

---

#### `setPaletteFromURL(src: string, numColors?: number): this`

Loads a palette by extracting dominant colors from an image URL.

**Parameters:**
- `src`: Image URL to extract colors from
- `numColors` (optional): Number of colors to extract (default: 16)

**Returns:** `this` for method chaining

**Example:**
```javascript
// Extract 8 dominant colors from an image
px.setPaletteFromURL('palette-image.png', 8);
```

---

### Effect Methods

#### `draw(): this`

Draws the source image onto the canvas. This should be called before applying effects.

**Returns:** `this` for method chaining

**Example:**
```javascript
px.draw()
  .pixelate();
```

---

#### `pixelate(): this`

Applies the pixelation effect using the current scale factor.

**Returns:** `this` for method chaining

**Algorithm:**
1. Creates a temporary canvas
2. Downscales the image based on the scale factor
3. Upscales back to original size without smoothing
4. Results in a pixelated appearance

**Example:**
```javascript
px.setScale(10)
  .draw()
  .pixelate();
```

---

#### `convertGrayscale(): this`

Converts the current canvas image to grayscale using the averaging method.

**Returns:** `this` for method chaining

**Example:**
```javascript
px.draw()
  .pixelate()
  .convertGrayscale();
```

---

#### `convertPalette(): this`

Converts each pixel to the nearest color in the current palette.

**Returns:** `this` for method chaining

**Algorithm:**
1. Iterates through each pixel
2. Finds the most similar color from the palette using Euclidean distance
3. Replaces the pixel with the matched palette color

**Example:**
```javascript
px.setPalette(BUILT_IN_PALETTES.GAMEBOY)
  .draw()
  .pixelate()
  .convertPalette();
```

---

#### `resizeImage(): this`

Resizes the image based on maxWidth and maxHeight constraints while maintaining aspect ratio.

**Returns:** `this` for method chaining

**Example:**
```javascript
px.setMaxWidth(800)
  .setMaxHeight(600)
  .draw()
  .resizeImage();
```

---

#### `applyEffects(options: ApplyEffectsOptions): this`

Batch applies multiple effects at once.

**Parameters:**
- `options`: Configuration object
  - `scale?: number` - Pixelation scale
  - `palette?: RGBColor[]` - Custom palette
  - `paletteIndex?: number` - Palette index from available palettes
  - `grayscale?: boolean` - Apply grayscale effect
  - `applyPalette?: boolean` - Apply palette conversion
  - `maxWidth?: number` - Maximum width
  - `maxHeight?: number` - Maximum height
  - `debug?: boolean` - Enable color statistics collection

**Returns:** `this` for method chaining

**Example:**
```javascript
px.applyEffects({
  scale: 10,
  paletteIndex: 2,
  applyPalette: true,
  grayscale: false,
  maxWidth: 800,
  debug: true
});
```

---

### Utility Methods

#### `saveImage(filename?: string): void`

Downloads the current canvas as a PNG image.

**Parameters:**
- `filename` (optional): Filename without extension (default: 'pixelit')

**Returns:** void

**Example:**
```javascript
px.draw()
  .pixelate()
  .convertPalette()
  .saveImage('my-pixel-art');
// Downloads as 'my-pixel-art.png'
```

---

#### `colorSim(rgbColor: RGBColor, compareColor: RGBColor): number`

Calculates the Euclidean distance between two colors. Lower values indicate more similar colors.

**Parameters:**
- `rgbColor`: First RGB color
- `compareColor`: Second RGB color

**Returns:** Euclidean distance as a number

**Formula:**
```
distance = √((r1-r2)² + (g1-g2)² + (b1-b2)²)
```

**Example:**
```javascript
const color1 = [255, 0, 0];
const color2 = [255, 50, 50];
const similarity = px.colorSim(color1, color2);
console.log(`Distance: ${similarity}`);
```

---

#### `similarColor(actualColor: RGBColor): RGBColor`

Finds the most similar color from the current palette.

**Parameters:**
- `actualColor`: RGB color to match

**Returns:** Most similar RGB color from the palette

**Example:**
```javascript
const inputColor = [127, 89, 200];
const closestMatch = px.similarColor(inputColor);
console.log(`Closest palette color: rgb(${closestMatch.join(',')})`);
```

---

#### `getColorStats(): Record<string, number>`

Gets color usage statistics from the last palette conversion.

**Returns:** Object mapping color strings (e.g., "255,0,0") to usage counts

**Note:** Color statistics must be enabled via `setColorStatsCollection(true)` first.

**Example:**
```javascript
px.setColorStatsCollection(true)
  .draw()
  .pixelate()
  .convertPalette();

const stats = px.getColorStats();
for (const [color, count] of Object.entries(stats)) {
  console.log(`Color ${color} used ${count} times`);
}
```

---

#### `setColorStatsCollection(enable: boolean): this`

Enables or disables color statistics collection. Disabling improves performance.

**Parameters:**
- `enable`: true to enable, false to disable

**Returns:** `this` for method chaining

**Example:**
```javascript
// Enable for debugging
px.setColorStatsCollection(true);

// Disable for production performance
px.setColorStatsCollection(false);
```

---

### UI Binding Methods

#### `bindToControls(options: UIControlBindingOptions): this`

Binds PixelIt to HTML controls for interactive adjustment.

**Parameters:**
- `options`: Configuration object with HTML element references
  - `scaleInput?: HTMLInputElement` - Range input for scale
  - `paletteSelect?: HTMLSelectElement` - Dropdown for palette selection
  - `grayscaleCheckbox?: HTMLInputElement` - Checkbox for grayscale toggle
  - `paletteCheckbox?: HTMLInputElement` - Checkbox for palette toggle
  - `maxWidthInput?: HTMLInputElement` - Number input for max width
  - `maxHeightInput?: HTMLInputElement` - Number input for max height
  - `downloadButton?: HTMLButtonElement` - Button to trigger download
  - `palettePreview?: HTMLElement` - Container for palette preview

**Returns:** `this` for method chaining

**Example:**
```javascript
px.bindToControls({
  scaleInput: document.getElementById('scale'),
  paletteSelect: document.getElementById('palette'),
  downloadButton: document.getElementById('download')
});
```

---

#### `renderPalettePreview(container: HTMLElement, paletteIndex?: number): this`

Renders a visual preview of a palette as colored blocks.

**Parameters:**
- `container`: HTML element to render the preview in
- `paletteIndex` (optional): Index of palette to preview (default: current palette)

**Returns:** `this` for method chaining

**Example:**
```javascript
const previewDiv = document.getElementById('palette-preview');
px.renderPalettePreview(previewDiv, 2);
```

---

### PixelItWorker

Web Worker implementation of PixelIt for non-blocking image processing.

**API:** Same as PixelIt class

**Usage:**
```javascript
import { PixelItWorker } from 'pixels';

const px = new PixelItWorker({
  from: document.getElementById('source'),
  to: document.getElementById('canvas')
});

// Same methods as PixelIt
px.draw().pixelate().convertPalette();
```

**Benefits:**
- Processing happens in a separate thread
- Doesn't block the main UI thread
- Better for large images or real-time processing

---

## Types

### RGBColor

```typescript
type RGBColor = [number, number, number];
```

Represents an RGB color as a tuple of three integers (0-255).

**Example:**
```typescript
const red: RGBColor = [255, 0, 0];
const green: RGBColor = [0, 255, 0];
const blue: RGBColor = [0, 0, 255];
```

---

### PixelItConfig

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

Configuration options for PixelIt constructor.

---

### ApplyEffectsOptions

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

Options for batch applying effects.

---

### UIControlBindingOptions

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

Options for binding to UI controls.

---

## Constants

### DEFAULT_PALETTE

```typescript
const DEFAULT_PALETTE: RGBColor[];
```

The default 16-color retro palette used when no custom palette is specified.

---

### BUILT_IN_PALETTES

```typescript
const BUILT_IN_PALETTES: Record<string, RGBColor[]>;
```

Collection of built-in color palettes:

- `DEFAULT` - 16-color retro palette
- `EARTH_TONES` - Natural earth colors
- `OCEAN` - Ocean and beach colors
- `NEON` - Vibrant neon colors
- `GAMEBOY` - Classic Game Boy palette (4 colors)
- `CRIMSON` - Red and dark tones
- `PICO8` - PICO-8 fantasy console palette (16 colors)
- `MUTED` - Subtle, muted tones
- `PASTEL` - Soft pastel colors
- `RETRO16` - Same as DEFAULT
- `NES` - Nintendo Entertainment System palette
- `AQUA` - Aqua and teal gradient
- `ROSE` - Rose and pink tones

**Example:**
```javascript
import { BUILT_IN_PALETTES } from 'pixels';

px.setPalette(BUILT_IN_PALETTES.PICO8);
```

---

## Utility Functions

### Color Utilities

The following utility functions are available from `color-utils`:

#### `colorSim(rgbColor: RGBColor, compareColor: RGBColor): number`

Calculates Euclidean distance between two colors.

#### `findSimilarColor(actualColor: RGBColor, palette: RGBColor[]): RGBColor`

Finds the most similar color from a palette.

#### `extractPaletteFromImageData(imageData: Uint8ClampedArray, numColors: number): RGBColor[]`

Extracts dominant colors from image data.

#### `hexToRgb(hex: string): RGBColor | null`

Converts hex color string to RGB tuple.

**Example:**
```javascript
import { hexToRgb } from 'pixels/utils/color-utils';

const rgb = hexToRgb('#FF5733');
// Returns: [255, 87, 51]
```

---

## Method Chaining

All methods that return `this` can be chained together for concise code:

```javascript
px.setScale(10)
  .setPalette(BUILT_IN_PALETTES.GAMEBOY)
  .setMaxWidth(800)
  .draw()
  .resizeImage()
  .pixelate()
  .convertPalette()
  .saveImage('gameboy-style');
```

---

## Performance Considerations

1. **Color Statistics**: Disable when not needed
   ```javascript
   px.setColorStatsCollection(false);
   ```

2. **Scale Factor**: Lower values process faster
   ```javascript
   px.setScale(5); // Faster than scale 20
   ```

3. **Use Workers**: For large images
   ```javascript
   const px = new PixelItWorker(config);
   ```

4. **Resize First**: Reduce image size before processing
   ```javascript
   px.setMaxWidth(800).resizeImage().pixelate();
   ```

---

## Error Handling

PixelIt logs errors to the console but doesn't throw exceptions. Check the console for debugging information when operations don't work as expected.

Common issues:
- Missing source image element
- Missing canvas element
- Invalid scale values (must be 1-50)
- Invalid palette index

---

For more examples, see the [Examples documentation](EXAMPLES.md).
