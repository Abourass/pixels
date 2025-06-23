// Web worker for handling pixel operations
import { RGBColor } from '../types';
import { findSimilarColor } from '../utils/color-utils';

// Message handler for the web worker
self.onmessage = (e: MessageEvent) => {
  const { operation, imageData, options } = e.data;

  switch (operation) {
    case 'pixelate':
      handlePixelate(imageData, options);
      break;
    case 'grayscale':
      handleGrayscale(imageData);
      break;
    case 'palette':
      handlePalette(imageData, options);
      break;
    default:
      console.error('Unknown operation:', operation);
  }
};

/**
 * Handle pixelation operation
 * @param imageData Original image data
 * @param options Pixelation options
 */
function handlePixelate(originalImageData: ImageData, options: { scale: number, width: number, height: number }) {
  // Calculate scaled dimensions
  const scaledW = Math.floor(options.width * options.scale);
  const scaledH = Math.floor(options.height * options.scale);
  
  // Create temporary canvas for scaling
  const offscreenCanvas = new OffscreenCanvas(scaledW, scaledH);
  const offCtx = offscreenCanvas.getContext('2d');
  
  if (!offCtx) {
    self.postMessage({ error: 'Could not create canvas context' });
    return;
  }
  
  // Create another canvas for full size
  const resultCanvas = new OffscreenCanvas(options.width, options.height);
  const resultCtx = resultCanvas.getContext('2d');
  
  if (!resultCtx) {
    self.postMessage({ error: 'Could not create result canvas context' });
    return;
  }
  
  // Create a new ImageBitmap from the data
  createImageBitmap(originalImageData).then(bitmap => {
    // Draw at small scale
    offCtx.drawImage(bitmap, 0, 0, scaledW, scaledH);
    
    // Disable image smoothing
    resultCtx.imageSmoothingEnabled = false;
    
    // Scale back up
    resultCtx.drawImage(
      offscreenCanvas, 
      0, 0, scaledW, scaledH,
      0, 0, options.width, options.height
    );
    
    // Get the resulting imageData
    const resultData = resultCtx.getImageData(0, 0, options.width, options.height);
    
    // Send back the processed image data
    self.postMessage({ 
      operation: 'pixelate', 
      imageData: resultData 
    }, { transfer: [resultData.data.buffer] });
  }).catch(err => {
    self.postMessage({ error: `Error in pixelate: ${err.message}` });
  });
}

/**
 * Handle grayscale conversion
 * @param imageData Image data to convert
 */
function handleGrayscale(imageData: ImageData) {
  const data = new Uint8ClampedArray(imageData.data);

  for (let i = 0; i < data.length; i += 4) {
    // Calculate grayscale using luminance formula
    const grayscale = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    data[i] = grayscale;     // Red
    data[i + 1] = grayscale; // Green
    data[i + 2] = grayscale; // Blue
    // Alpha remains unchanged
  }

  // Create a new ImageData object with processed data
  const resultData = new ImageData(data, imageData.width, imageData.height);
  
  // Send back the processed image data
  self.postMessage({ 
    operation: 'grayscale',
    imageData: resultData 
  }, { transfer: [resultData.data.buffer] });
}

/**
 * Find the most similar color in the palette
 * @param color Input color as RGB array
 * @param palette Color palette to search in
 */
function similarColor(color: RGBColor, palette: RGBColor[]): RGBColor {
  return findSimilarColor(color, palette);
}

/**
 * Handle palette conversion
 * @param imageData Image data to convert
 * @param options Palette conversion options
 */
function handlePalette(imageData: ImageData, options: { palette: RGBColor[], collectStats: boolean }) {
  const data = new Uint8ClampedArray(imageData.data);
  const colorStats: Record<string, number> = {};

  // Process each pixel
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const color: RGBColor = [r, g, b];

    // Find the most similar color from our palette
    const similarCol = similarColor(color, options.palette);
    data[i] = similarCol[0];     // Red
    data[i + 1] = similarCol[1]; // Green
    data[i + 2] = similarCol[2]; // Blue
    // Alpha remains unchanged

    // Collect color statistics if requested
    if (options.collectStats) {
      const colorKey = similarCol.join(',');
      if (colorStats[colorKey]) {
        colorStats[colorKey]++;
      } else {
        colorStats[colorKey] = 1;
      }
    }
  }

  // Create a new ImageData object with processed data
  const resultData = new ImageData(data, imageData.width, imageData.height);
  
  // Send back the processed image data and color stats
  self.postMessage({
    operation: 'palette',
    imageData: resultData,
    colorStats: options.collectStats ? colorStats : undefined
  }, { transfer: [resultData.data.buffer] });
}
