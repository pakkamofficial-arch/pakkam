import { useWindowDimensions } from 'react-native';

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1024;
  const isDesktop = width >= 1024;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    numColumns: isDesktop ? 4 : isTablet ? 3 : 2,
    containerMaxWidth: isDesktop ? 640 : '100%',
  };
};
