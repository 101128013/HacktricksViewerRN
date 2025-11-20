import React from 'react';
import { View, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeTransitionWrapperProps {
  children: React.ReactNode;
  style?: any;
}

export const ThemeTransitionWrapper: React.FC<ThemeTransitionWrapperProps> = ({
  children,
  style,
}) => {
  const { isTransitioning } = useTheme();

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: isTransitioning ? 0.7 : 1,
          transform: [
            {
              scale: isTransitioning ? 0.98 : 1,
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default ThemeTransitionWrapper;