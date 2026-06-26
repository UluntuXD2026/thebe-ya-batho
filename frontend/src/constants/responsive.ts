import { useWindowDimensions } from 'react-native';

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export const TABLET_MIN_DIMENSION = 600;

export function scale(size: number, width: number): number {
  return (width / BASE_WIDTH) * size;
}

export function verticalScale(size: number, height: number): number {
  return (height / BASE_HEIGHT) * size;
}

export function moderateScale(size: number, width: number, factor = 0.5): number {
  return size + (scale(size, width) - size) * factor;
}

export interface Responsive {
  width: number;
  height: number;
  isLandscape: boolean;
  isTablet: boolean;
  /** Scales linearly with screen width relative to a 375pt baseline. */
  scale: (size: number) => number;
  /** Scales linearly with screen height relative to an 812pt baseline. */
  verticalScale: (size: number) => number;
  /** Scales partially (controlled by `factor`) so text/icons don't grow too aggressively on large screens. */
  moderateScale: (size: number, factor?: number) => number;
}

/**
 * Replaces module-level `Dimensions.get('window')` so layouts react to
 * rotation, split-screen resize, and web window resizing.
 */
export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= TABLET_MIN_DIMENSION;

  return {
    width,
    height,
    isLandscape,
    isTablet,
    scale: (size: number) => scale(size, width),
    verticalScale: (size: number) => verticalScale(size, height),
    moderateScale: (size: number, factor = 0.5) => moderateScale(size, width, factor),
  };
}
