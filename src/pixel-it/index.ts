import { PixelIt } from './core/pixelit';
import { PixelItWorker } from './core/pixelit-worker';

// Re-export types and other utilities
export * from './constants';
export * from './types';

// Export the classes with PascalCase name (TypeScript convention)
export { PixelIt, PixelItWorker };

// Export with the original camelCase name for backward compatibility
export { PixelIt as pixelit };
export { PixelItWorker as pixelitWorker };
