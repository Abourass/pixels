# PixelIt Examples

Practical examples and use cases for PixelIt.

## Table of Contents

- [Basic Examples](#basic-examples)
- [Advanced Examples](#advanced-examples)
- [Real-world Use Cases](#real-world-use-cases)
- [Integration Examples](#integration-examples)
- [Performance Optimization](#performance-optimization)

## Basic Examples

### Example 1: Simple Pixelation

The most basic use case - pixelate an image.

```html
<!DOCTYPE html>
<html>
<head>
  <title>Simple Pixelation</title>
</head>
<body>
  <img id="sourceImg" src="photo.jpg" style="display: none;" />
  <canvas id="resultCanvas"></canvas>

  <script type="module">
    import { PixelIt } from 'pixels';

    const px = new PixelIt({
      from: document.getElementById('sourceImg'),
      to: document.getElementById('resultCanvas'),
      scale: 10
    });

    px.draw().pixelate();
  </script>
</body>
</html>
```

### Example 2: Game Boy Style

Convert any image to classic Game Boy green aesthetic.

```javascript
import { PixelIt, BUILT_IN_PALETTES } from 'pixels';

const px = new PixelIt();

// Apply Game Boy palette
px.setFromImgSource('photo.jpg')
  .setScale(8)
  .setPalette(BUILT_IN_PALETTES.GAMEBOY)
  .draw()
  .pixelate()
  .convertPalette();
```

### Example 3: Grayscale Pixelation

Create a retro black and white pixelated image.

```javascript
import { PixelIt } from 'pixels';

const px = new PixelIt({
  scale: 12
});

px.setFromImgSource('landscape.jpg')
  .draw()
  .pixelate()
  .convertGrayscale();
```

### Example 4: File Upload Handler

Handle user file uploads and pixelate them.

```html
<input type="file" id="upload" accept="image/*" />
<canvas id="canvas"></canvas>

<script type="module">
  import { PixelIt } from 'pixels';

  const px = new PixelIt({
    to: document.getElementById('canvas')
  });

  document.getElementById('upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        px.setFromImgElement(img)
          .setScale(10)
          .draw()
          .pixelate();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
</script>
```

## Advanced Examples

### Example 5: Interactive Controls

Create a full interactive pixel art editor.

```html
<!DOCTYPE html>
<html>
<head>
  <title>Pixel Art Editor</title>
  <style>
    .controls { margin: 20px 0; }
    .control-group { margin: 10px 0; }
    canvas { border: 2px solid #333; max-width: 100%; }
  </style>
</head>
<body>
  <div class="controls">
    <div class="control-group">
      <label>Scale: <span id="scaleValue">8</span></label>
      <input type="range" id="scale" min="1" max="50" value="8" />
    </div>

    <div class="control-group">
      <label>Palette:</label>
      <select id="palette"></select>
    </div>

    <div class="control-group">
      <label>
        <input type="checkbox" id="grayscale" /> Grayscale
      </label>
      <label>
        <input type="checkbox" id="applyPalette" checked /> Apply Palette
      </label>
    </div>

    <div class="control-group">
      <label>Max Width:</label>
      <input type="number" id="maxWidth" placeholder="Auto" />
      <label>Max Height:</label>
      <input type="number" id="maxHeight" placeholder="Auto" />
    </div>

    <div class="control-group">
      <input type="file" id="upload" accept="image/*" />
      <button id="download">Download</button>
    </div>

    <div id="palettePreview" style="margin: 10px 0;"></div>
  </div>

  <img id="sourceImg" src="default.jpg" style="display: none;" />
  <canvas id="canvas"></canvas>

  <script type="module">
    import { PixelIt, BUILT_IN_PALETTES } from 'pixels';

    const px = new PixelIt({
      from: document.getElementById('sourceImg'),
      to: document.getElementById('canvas')
    });

    // Populate palette dropdown
    const paletteSelect = document.getElementById('palette');
    Object.keys(BUILT_IN_PALETTES).forEach((name, index) => {
      px.addPalette(BUILT_IN_PALETTES[name]);
      const option = document.createElement('option');
      option.value = index;
      option.textContent = name;
      paletteSelect.appendChild(option);
    });

    // Bind controls
    px.bindToControls({
      scaleInput: document.getElementById('scale'),
      paletteSelect: paletteSelect,
      grayscaleCheckbox: document.getElementById('grayscale'),
      paletteCheckbox: document.getElementById('applyPalette'),
      maxWidthInput: document.getElementById('maxWidth'),
      maxHeightInput: document.getElementById('maxHeight'),
      downloadButton: document.getElementById('download'),
      palettePreview: document.getElementById('palettePreview')
    });

    // Update scale display
    const scaleInput = document.getElementById('scale');
    const scaleValue = document.getElementById('scaleValue');
    scaleInput.addEventListener('input', () => {
      scaleValue.textContent = scaleInput.value;
    });

    // Handle file upload
    document.getElementById('upload').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          px.setFromImgElement(img).draw().pixelate();
          if (document.getElementById('applyPalette').checked) {
            px.convertPalette();
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });

    // Initial render
    px.draw().pixelate().convertPalette();
  </script>
</body>
</html>
```

### Example 6: Custom Palette Creator

Let users create and save custom palettes.

```javascript
import { PixelIt } from 'pixels';

class PaletteBuilder {
  constructor() {
    this.colors = [];
    this.px = new PixelIt();
  }

  addColor(hex) {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    this.colors.push([r, g, b]);
  }

  removeColor(index) {
    this.colors.splice(index, 1);
  }

  applyPalette() {
    if (this.colors.length === 0) {
      alert('Add at least one color to the palette');
      return;
    }

    this.px.setPalette(this.colors)
      .draw()
      .pixelate()
      .convertPalette();
  }

  savePalette(name) {
    const palettes = JSON.parse(localStorage.getItem('customPalettes') || '{}');
    palettes[name] = this.colors;
    localStorage.setItem('customPalettes', JSON.stringify(palettes));
  }

  loadPalette(name) {
    const palettes = JSON.parse(localStorage.getItem('customPalettes') || '{}');
    if (palettes[name]) {
      this.colors = palettes[name];
      this.applyPalette();
    }
  }
}

// Usage
const builder = new PaletteBuilder();
builder.addColor('#FF0000');
builder.addColor('#00FF00');
builder.addColor('#0000FF');
builder.addColor('#FFFF00');
builder.applyPalette();
builder.savePalette('My Custom Palette');
```

### Example 7: Batch Processing Multiple Images

Process multiple images with the same settings.

```javascript
import { PixelIt, BUILT_IN_PALETTES } from 'pixels';

async function batchProcess(imageUrls, options = {}) {
  const {
    scale = 10,
    palette = BUILT_IN_PALETTES.DEFAULT,
    grayscale = false,
    maxWidth = 800
  } = options;

  const results = [];
  const canvas = document.createElement('canvas');
  const px = new PixelIt({ to: canvas });

  for (const url of imageUrls) {
    await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        px.setFromImgElement(img)
          .setScale(scale)
          .setMaxWidth(maxWidth)
          .setPalette(palette)
          .draw()
          .resizeImage()
          .pixelate();

        if (grayscale) {
          px.convertGrayscale();
        } else {
          px.convertPalette();
        }

        // Get data URL
        const dataUrl = canvas.toDataURL('image/png');
        results.push({
          original: url,
          processed: dataUrl
        });

        resolve();
      };
      img.src = url;
    });
  }

  return results;
}

// Usage
const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
batchProcess(images, {
  scale: 12,
  palette: BUILT_IN_PALETTES.PICO8,
  maxWidth: 600
}).then(results => {
  console.log('Processed', results.length, 'images');
  results.forEach(({ original, processed }) => {
    console.log(`${original} -> ${processed}`);
  });
});
```

### Example 8: Animated GIF Frame Processing

Process individual frames of an animated GIF.

```javascript
import { PixelIt, BUILT_IN_PALETTES } from 'pixels';

class GifPixelator {
  constructor(options = {}) {
    this.px = new PixelIt(options);
    this.frames = [];
  }

  async loadGif(url) {
    // Note: You'll need a GIF parsing library like 'gif.js' or 'libgif'
    // This is a conceptual example
    const gif = await parseGif(url);
    this.frames = gif.frames;
    return this;
  }

  processFrames(scale = 10, palette = BUILT_IN_PALETTES.DEFAULT) {
    const processedFrames = [];

    this.frames.forEach(frame => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = frame.width;
      canvas.height = frame.height;
      ctx.putImageData(frame.imageData, 0, 0);

      const img = new Image();
      img.src = canvas.toDataURL();

      this.px.setFromImgElement(img)
        .setScale(scale)
        .setPalette(palette)
        .draw()
        .pixelate()
        .convertPalette();

      processedFrames.push({
        delay: frame.delay,
        dataUrl: this.px.drawto.toDataURL()
      });
    });

    return processedFrames;
  }
}
```

### Example 9: Real-time Webcam Pixelation

Pixelate webcam feed in real-time using Web Worker.

```html
<!DOCTYPE html>
<html>
<head>
  <title>Webcam Pixelation</title>
  <style>
    video { display: none; }
    canvas { max-width: 100%; border: 2px solid #333; }
  </style>
</head>
<body>
  <video id="video" autoplay></video>
  <canvas id="canvas"></canvas>

  <div>
    <label>Scale: <input type="range" id="scale" min="1" max="30" value="8" /></label>
    <label>Palette:
      <select id="palette">
        <option value="0">Default</option>
        <option value="1">Game Boy</option>
        <option value="2">NES</option>
      </select>
    </label>
  </div>

  <script type="module">
    import { PixelItWorker, BUILT_IN_PALETTES } from 'pixels';

    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const scaleInput = document.getElementById('scale');
    const paletteSelect = document.getElementById('palette');

    // Get webcam stream
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream;
        video.play();
      });

    const px = new PixelItWorker({ to: canvas });

    // Add palettes
    px.addPalette(BUILT_IN_PALETTES.DEFAULT);
    px.addPalette(BUILT_IN_PALETTES.GAMEBOY);
    px.addPalette(BUILT_IN_PALETTES.NES);

    // Process video frames
    function processFrame() {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Create temporary canvas for video frame
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(video, 0, 0);

        // Convert to image and process
        const img = new Image();
        img.onload = () => {
          px.setFromImgElement(img)
            .setScale(parseInt(scaleInput.value))
            .setPaletteByIndex(parseInt(paletteSelect.value))
            .draw()
            .pixelate()
            .convertPalette();
        };
        img.src = tempCanvas.toDataURL();
      }

      requestAnimationFrame(processFrame);
    }

    video.addEventListener('loadeddata', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      processFrame();
    });
  </script>
</body>
</html>
```

## Real-world Use Cases

### Use Case 1: Social Media Avatar Generator

Create pixelated profile pictures.

```javascript
import { PixelIt, BUILT_IN_PALETTES } from 'pixels';

function createPixelAvatar(file, size = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const px = new PixelIt({
          from: img,
          to: canvas,
          maxWidth: size,
          maxHeight: size
        });

        px.setScale(8)
          .setPalette(BUILT_IN_PALETTES.PICO8)
          .draw()
          .resizeImage()
          .pixelate()
          .convertPalette();

        // Convert to blob for upload
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      };

      img.onerror = reject;
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Usage with form upload
document.getElementById('avatarUpload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const avatarBlob = await createPixelAvatar(file, 256);

    // Upload to server
    const formData = new FormData();
    formData.append('avatar', avatarBlob, 'avatar.png');

    await fetch('/api/upload-avatar', {
      method: 'POST',
      body: formData
    });

    alert('Avatar uploaded successfully!');
  } catch (error) {
    console.error('Error creating pixel avatar:', error);
  }
});
```

### Use Case 2: E-commerce Product Showcase

Create retro-style product images.

```javascript
import { PixelIt, BUILT_IN_PALETTES } from 'pixels';

class ProductPixelator {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.px = new PixelIt();
  }

  async pixelateProducts(products) {
    for (const product of products) {
      const wrapper = document.createElement('div');
      wrapper.className = 'product-card';

      const canvas = document.createElement('canvas');
      const img = new Image();

      await new Promise((resolve) => {
        img.onload = () => {
          this.px.to = canvas;
          this.px.setFromImgElement(img)
            .setScale(10)
            .setMaxWidth(400)
            .setPalette(BUILT_IN_PALETTES.PASTEL)
            .draw()
            .resizeImage()
            .pixelate()
            .convertPalette();

          const title = document.createElement('h3');
          title.textContent = product.name;

          const price = document.createElement('p');
          price.textContent = `$${product.price}`;

          wrapper.appendChild(canvas);
          wrapper.appendChild(title);
          wrapper.appendChild(price);

          this.container.appendChild(wrapper);
          resolve();
        };
        img.src = product.imageUrl;
      });
    }
  }
}

// Usage
const products = [
  { name: 'Product 1', price: 29.99, imageUrl: 'product1.jpg' },
  { name: 'Product 2', price: 39.99, imageUrl: 'product2.jpg' },
];

const pixelator = new ProductPixelator('#products-grid');
pixelator.pixelateProducts(products);
```

### Use Case 3: Game Asset Generator

Generate pixel art assets for games.

```javascript
import { PixelIt, BUILT_IN_PALETTES } from 'pixels';

class GameAssetGenerator {
  constructor() {
    this.px = new PixelIt();
  }

  async generateSprite(imageUrl, options = {}) {
    const {
      scale = 4,
      size = 64,
      palette = BUILT_IN_PALETTES.PICO8,
      transparent = true
    } = options;

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        this.px.to = canvas;
        this.px.setFromImgElement(img)
          .setScale(scale)
          .setMaxWidth(size)
          .setMaxHeight(size)
          .setPalette(palette)
          .draw()
          .resizeImage()
          .pixelate()
          .convertPalette();

        // Export as data URL
        const dataUrl = canvas.toDataURL('image/png');

        resolve({
          dataUrl,
          width: size,
          height: size,
          palette: palette
        });
      };

      img.src = imageUrl;
    });
  }

  async generateSpriteSheet(images, options = {}) {
    const sprites = await Promise.all(
      images.map(url => this.generateSprite(url, options))
    );

    // Combine into sprite sheet
    const size = options.size || 64;
    const cols = Math.ceil(Math.sqrt(sprites.length));
    const rows = Math.ceil(sprites.length / cols);

    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = cols * size;
    sheetCanvas.height = rows * size;
    const ctx = sheetCanvas.getContext('2d');

    sprites.forEach((sprite, index) => {
      const x = (index % cols) * size;
      const y = Math.floor(index / cols) * size;

      const img = new Image();
      img.src = sprite.dataUrl;
      ctx.drawImage(img, x, y);
    });

    return {
      dataUrl: sheetCanvas.toDataURL('image/png'),
      width: sheetCanvas.width,
      height: sheetCanvas.height,
      spriteSize: size,
      count: sprites.length
    };
  }
}

// Usage
const generator = new GameAssetGenerator();

// Generate single sprite
const sprite = await generator.generateSprite('character.png', {
  scale: 4,
  size: 64,
  palette: BUILT_IN_PALETTES.PICO8
});

// Generate sprite sheet
const characterFrames = [
  'walk1.png', 'walk2.png', 'walk3.png', 'walk4.png'
];

const spriteSheet = await generator.generateSpriteSheet(characterFrames, {
  scale: 4,
  size: 64
});
```

## Integration Examples

### React Integration

```jsx
import React, { useEffect, useRef, useState } from 'react';
import { PixelIt, BUILT_IN_PALETTES } from 'pixels';

function PixelArtEditor() {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [scale, setScale] = useState(8);
  const [palette, setPalette] = useState('DEFAULT');
  const [px, setPx] = useState(null);

  useEffect(() => {
    if (canvasRef.current && imgRef.current) {
      const pixelIt = new PixelIt({
        from: imgRef.current,
        to: canvasRef.current
      });

      // Add all palettes
      Object.keys(BUILT_IN_PALETTES).forEach(key => {
        pixelIt.addPalette(BUILT_IN_PALETTES[key]);
      });

      setPx(pixelIt);
    }
  }, []);

  useEffect(() => {
    if (px) {
      const paletteIndex = Object.keys(BUILT_IN_PALETTES).indexOf(palette);
      px.setScale(scale)
        .setPaletteByIndex(paletteIndex)
        .draw()
        .pixelate()
        .convertPalette();
    }
  }, [px, scale, palette]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !px) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      imgRef.current.src = event.target.result;
      imgRef.current.onload = () => {
        px.draw().pixelate().convertPalette();
      };
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (px) {
      px.saveImage('pixel-art');
    }
  };

  return (
    <div className="pixel-art-editor">
      <div className="controls">
        <input type="file" onChange={handleFileUpload} accept="image/*" />

        <label>
          Scale: {scale}
          <input
            type="range"
            min="1"
            max="50"
            value={scale}
            onChange={(e) => setScale(parseInt(e.target.value))}
          />
        </label>

        <label>
          Palette:
          <select value={palette} onChange={(e) => setPalette(e.target.value)}>
            {Object.keys(BUILT_IN_PALETTES).map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </label>

        <button onClick={handleDownload}>Download</button>
      </div>

      <img ref={imgRef} src="/default.jpg" style={{ display: 'none' }} alt="" />
      <canvas ref={canvasRef} />
    </div>
  );
}

export default PixelArtEditor;
```

### Vue Integration

```vue
<template>
  <div class="pixel-art-editor">
    <div class="controls">
      <input type="file" @change="handleUpload" accept="image/*" />

      <label>
        Scale: {{ scale }}
        <input type="range" v-model="scale" min="1" max="50" />
      </label>

      <label>
        Palette:
        <select v-model="selectedPalette">
          <option v-for="name in paletteNames" :key="name" :value="name">
            {{ name }}
          </option>
        </select>
      </label>

      <button @click="download">Download</button>
    </div>

    <img ref="img" src="/default.jpg" style="display: none" />
    <canvas ref="canvas" />
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { PixelIt, BUILT_IN_PALETTES } from 'pixels';

export default {
  name: 'PixelArtEditor',
  setup() {
    const canvas = ref(null);
    const img = ref(null);
    const scale = ref(8);
    const selectedPalette = ref('DEFAULT');
    const paletteNames = ref(Object.keys(BUILT_IN_PALETTES));
    let px = null;

    onMounted(() => {
      px = new PixelIt({
        from: img.value,
        to: canvas.value
      });

      paletteNames.value.forEach(name => {
        px.addPalette(BUILT_IN_PALETTES[name]);
      });

      px.draw().pixelate().convertPalette();
    });

    watch([scale, selectedPalette], () => {
      if (px) {
        const paletteIndex = paletteNames.value.indexOf(selectedPalette.value);
        px.setScale(scale.value)
          .setPaletteByIndex(paletteIndex)
          .draw()
          .pixelate()
          .convertPalette();
      }
    });

    const handleUpload = (e) => {
      const file = e.target.files[0];
      if (!file || !px) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        img.value.src = event.target.result;
        img.value.onload = () => {
          px.draw().pixelate().convertPalette();
        };
      };
      reader.readAsDataURL(file);
    };

    const download = () => {
      if (px) {
        px.saveImage('pixel-art');
      }
    };

    return {
      canvas,
      img,
      scale,
      selectedPalette,
      paletteNames,
      handleUpload,
      download
    };
  }
};
</script>
```

## Performance Optimization

### Example 10: Debounced Updates

Optimize performance when adjusting controls.

```javascript
import { PixelIt } from 'pixels';

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const px = new PixelIt();

const updatePixelation = debounce((scale) => {
  px.setScale(scale)
    .draw()
    .pixelate()
    .convertPalette();
}, 150); // Wait 150ms after user stops adjusting

document.getElementById('scale').addEventListener('input', (e) => {
  updatePixelation(parseInt(e.target.value));
});
```

### Example 11: Progressive Enhancement

Show loading states during processing.

```javascript
import { PixelItWorker } from 'pixels';

async function processWithLoading(imageFile) {
  const loader = document.getElementById('loader');
  const canvas = document.getElementById('canvas');

  // Show loader
  loader.style.display = 'block';
  canvas.style.opacity = '0.5';

  try {
    const px = new PixelItWorker({ to: canvas });

    const img = new Image();
    img.src = URL.createObjectURL(imageFile);

    await new Promise((resolve) => {
      img.onload = () => {
        px.setFromImgElement(img)
          .setScale(10)
          .setColorStatsCollection(false) // Disable for performance
          .draw()
          .pixelate()
          .convertPalette();

        resolve();
      };
    });
  } finally {
    // Hide loader
    loader.style.display = 'none';
    canvas.style.opacity = '1';
  }
}
```

---

For more information, see the [API Documentation](API.md) and [README](../README.md).
