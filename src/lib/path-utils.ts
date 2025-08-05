/**
 * Utility functions for handling dynamic paths based on environment
 */

/**
 * Get the base path for the application
 * Returns '/Gym' in production, empty string in development
 */
export function getBasePath(): string {
  return process.env.NODE_ENV === 'production' ? '/Gym' : '';
}

/**
 * Create a path with the appropriate base path prefix
 * @param path - The path to prefix (should start with '/')
 * @returns The path with base path prefix
 */
export function createPath(path: string): string {
  const basePath = getBasePath();
  return `${basePath}${path}`;
}

/**
 * Create paths for common assets
 */
export const paths = {
  icon: {
    svg: () => createPath('/icon.svg'),
    png192: () => createPath('/icon-192.png'),
    png512: () => createPath('/icon-512.png'),
  },
  apple: {
    touchIcon: () => createPath('/apple-touch-icon.png'),
  },
  manifest: () => createPath('/manifest.json'),
  favicon: () => createPath('/favicon.ico'),
};