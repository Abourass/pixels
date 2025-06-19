import { PixelIt } from './core/pixelit';

// Re-export types and other utilities
export * from './constants';
export * from './types';

// Export the class with PascalCase name (TypeScript convention)
export { PixelIt };

// Export with the original camelCase name for backward compatibility
export { PixelIt as pixelit };
