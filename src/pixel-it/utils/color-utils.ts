import type { RGBColor } from '../types';

/**
 * Calculates color similarity between two colors (lower is better)
 * @param rgbColor First RGB color
 * @param compareColor Second RGB color to compare with
 * @returns Euclidean distance between the two colors (lower means more similar)
 */
export function colorSim(rgbColor: RGBColor, compareColor: RGBColor): number {
	let i: number;
	let max: number;
	let d = 0;
	for (i = 0, max = rgbColor.length; i < max; i++) {
		d += (rgbColor[i] - compareColor[i]) * (rgbColor[i] - compareColor[i]);
	}
	return Math.sqrt(d);
}

/**
 * Finds the most similar color from a palette
 * @param actualColor RGB color to find a match for
 * @param palette Array of RGB colors to search in
 * @returns Most similar RGB color from the palette
 */
export function findSimilarColor(
	actualColor: RGBColor,
	palette: RGBColor[],
): RGBColor {
	let selectedColor: RGBColor = [...palette[0]]; // Initialize with first color
	let currentSim = colorSim(actualColor, palette[0]);
	let nextColor: number;

	palette.forEach((color) => {
		nextColor = colorSim(actualColor, color);
		if (nextColor <= currentSim) {
			selectedColor = color;
			currentSim = nextColor;
		}
	});
	return selectedColor;
}

/**
 * Count color occurrences
 * @param color Color string to count
 * @param colorCount Existing color count record
 * @returns Updated color count record
 */
export function countColor(
	color: string | null = null,
	colorCount: Record<string, number> = {},
): Record<string, number> {
	if (!color) {
		return colorCount;
	}
	if (colorCount[color]) {
		colorCount[color] = parseInt(colorCount[color].toString()) + 1;
	} else {
		colorCount[color] = 1;
	}
	return colorCount;
}

export function rgbToHex(color: RGBColor): string {
	return `#${color[0].toString(16).padStart(2, '0')}${color[1].toString(16).padStart(2, '0')}${color[2].toString(16).padStart(2, '0')}`;
}

export function hexToRgb(hex: string): RGBColor {
	const r = parseInt(hex.substring(1, 3), 16);
	const g = parseInt(hex.substring(3, 5), 16);
	const b = parseInt(hex.substring(5, 7), 16);
	return [r, g, b];
}

/**
 * Extracts a color palette from image data using color quantization
 * @param imageData Raw pixel data from canvas getImageData
 * @param numColors Number of colors to extract (default: 16)
 * @returns Array of most representative RGB colors
 */
export function extractPaletteFromImageData(
	imageData: Uint8ClampedArray,
	numColors: number = 16,
): RGBColor[] {
	// Color frequency map
	const colorMap: Map<string, { color: RGBColor; count: number }> = new Map();

	// Sample pixels (use stride for large images to improve performance)
	const stride = Math.max(1, Math.floor(imageData.length / 4 / 10000));

	// Process pixels and count colors
	for (let i = 0; i < imageData.length; i += 4 * stride) {
		// Skip fully transparent pixels
		if (imageData[i + 3] < 128) continue;

		const r = imageData[i];
		const g = imageData[i + 1];
		const b = imageData[i + 2];

		// Use a slightly reduced color precision to group similar colors
		const quantizedR = Math.round(r / 8) * 8;
		const quantizedG = Math.round(g / 8) * 8;
		const quantizedB = Math.round(b / 8) * 8;

		const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;

		if (colorMap.has(colorKey)) {
			const entry = colorMap.get(colorKey);
			if (!entry) continue; // Safety check
			entry.count++;
			// Blend the colors to get more accurate representation
			entry.color[0] = Math.round(
				(entry.color[0] * entry.count + r) / (entry.count + 1),
			);
			entry.color[1] = Math.round(
				(entry.color[1] * entry.count + g) / (entry.count + 1),
			);
			entry.color[2] = Math.round(
				(entry.color[2] * entry.count + b) / (entry.count + 1),
			);
		} else {
			colorMap.set(colorKey, {
				color: [r, g, b],
				count: 1,
			});
		}
	}

	// Convert map to array and sort by frequency
	const sortedColors = Array.from(colorMap.values())
		.sort((a, b) => b.count - a.count)
		.map((entry) => entry.color);

	// Deduplicate similar colors (simple greedy approach)
	const result: RGBColor[] = [];
	const similarityThreshold = 25; // Adjust based on desired sensitivity

	for (const color of sortedColors) {
		// Skip if we already have enough colors
		if (result.length >= numColors) break;

		// Check if this color is too similar to one we already added
		let isTooSimilar = false;
		for (const existingColor of result) {
			if (colorSim(color, existingColor) < similarityThreshold) {
				isTooSimilar = true;
				break;
			}
		}

		if (!isTooSimilar) {
			result.push(color);
		}
	}

	// If we don't have enough colors after deduplication, add more
	if (result.length < numColors && sortedColors.length > result.length) {
		for (const color of sortedColors) {
			if (result.length >= numColors) break;
			if (
				!result.some(
					(c) => c[0] === color[0] && c[1] === color[1] && c[2] === color[2],
				)
			) {
				result.push(color);
			}
		}
	}

	return result;
}
