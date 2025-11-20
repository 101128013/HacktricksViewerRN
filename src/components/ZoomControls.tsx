import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useZoom } from '../contexts/ZoomContext';
import { useTheme } from '../contexts/ThemeContext';

interface ZoomControlsProps {
  style?: any;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ style }) => {
  const { zoomLevel, zoomIn, zoomOut, resetZoom, isTransitioning } = useZoom();
  const { currentTheme } = useTheme();

  const animatedValue = useRef(new Animated.Value(zoomLevel)).current;

  React.useEffect(() => {
    if (isTransitioning) {
      Animated.timing(animatedValue, {
        toValue: zoomLevel,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(zoomLevel);
    }
  }, [zoomLevel, isTransitioning, animatedValue]);

  const handleZoomIn = () => {
    zoomIn();
  };

  const handleZoomOut = () => {
    zoomOut();
  };

  const handleResetZoom = () => {
    resetZoom();
  };

  const zoomPercentageText = animatedValue.interpolate({
    inputRange: [50, 200],
    outputRange: ['50%', '200%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.surface }, style]}>
      <TouchableOpacity
        style={[styles.button, { borderColor: currentTheme.colors.primary }]}
        onPress={handleZoomOut}
        disabled={zoomLevel <= 50}
        accessibilityLabel="Zoom out"
        accessibilityHint="Decrease zoom level by 10%"
      >
        <Text style={[styles.buttonText, { color: zoomLevel <= 50 ? currentTheme.colors.text + '50' : currentTheme.colors.primary }]}>
          −
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.resetButton, { backgroundColor: currentTheme.colors.primary }]}
        onPress={handleResetZoom}
        accessibilityLabel="Reset zoom"
        accessibilityHint="Reset zoom level to 100%"
      >
        <Animated.Text style={[styles.percentageText, { color: currentTheme.colors.background }]}>
          {zoomPercentageText}
        </Animated.Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { borderColor: currentTheme.colors.primary }]}
        onPress={handleZoomIn}
        disabled={zoomLevel >= 200}
        accessibilityLabel="Zoom in"
        accessibilityHint="Increase zoom level by 10%"
      >
        <Text style={[styles.buttonText, { color: zoomLevel >= 200 ? currentTheme.colors.text + '50' : currentTheme.colors.primary }]}>
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  resetButton: {
    minWidth: 60,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    paddingHorizontal: 12,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ZoomControls;