import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { themes, ThemeId, themeIds } from '../themes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const THEME_ITEM_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 columns with padding

interface ThemeSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ visible, onClose }) => {
  const { currentTheme, themeId, isHighContrast, setTheme, toggleHighContrast, getThemePreview } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  const handleThemeSelect = async (selectedThemeId: ThemeId) => {
    await setTheme(selectedThemeId, isHighContrast);
  };

  const renderThemePreview = (themeId: ThemeId) => {
    const previewTheme = getThemePreview(themeId, isHighContrast);
    const isSelected = themeId === themeId;

    return (
      <TouchableOpacity
        key={themeId}
        style={[
          styles.themeItem,
          {
            backgroundColor: previewTheme.colors.surface,
            borderColor: isSelected ? previewTheme.colors.primary : previewTheme.colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => handleThemeSelect(themeId)}
        activeOpacity={0.7}
      >
        <View style={styles.themePreview}>
          {/* Background color */}
          <View
            style={[
              styles.colorBlock,
              { backgroundColor: previewTheme.colors.background, flex: 2 },
            ]}
          />
          {/* Surface color */}
          <View
            style={[
              styles.colorBlock,
              { backgroundColor: previewTheme.colors.surface, flex: 1 },
            ]}
          />
          {/* Accent colors */}
          <View style={styles.accentRow}>
            <View
              style={[
                styles.colorBlock,
                { backgroundColor: previewTheme.colors.primary, flex: 1 },
              ]}
            />
            <View
              style={[
                styles.colorBlock,
                { backgroundColor: previewTheme.colors.accent, flex: 1 },
              ]}
            />
            <View
              style={[
                styles.colorBlock,
                { backgroundColor: previewTheme.colors.secondary, flex: 1 },
              ]}
            />
          </View>
        </View>
        <Text
          style={[
            styles.themeName,
            {
              color: previewTheme.colors.text,
              fontFamily: previewTheme.fonts.family,
              fontSize: previewTheme.fonts.size.medium,
              fontWeight: previewTheme.fonts.weight.medium,
            },
          ]}
        >
          {previewTheme.name}
        </Text>
        {isSelected && (
          <View
            style={[
              styles.selectedIndicator,
              { backgroundColor: previewTheme.colors.primary },
            ]}
          >
            <Text style={{ color: previewTheme.colors.surface, fontSize: 12 }}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} activeOpacity={1} />
        <Animated.View
          style={[
            styles.modal,
            {
              backgroundColor: currentTheme.colors.surface,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                {
                  color: currentTheme.colors.text,
                  fontFamily: currentTheme.fonts.family,
                  fontSize: currentTheme.fonts.size.xlarge,
                  fontWeight: currentTheme.fonts.weight.bold,
                },
              ]}
            >
              Choose Theme
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text
                style={{
                  color: currentTheme.colors.text,
                  fontSize: 24,
                  fontWeight: 'bold',
                }}
              >
                ×
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.themesGrid}>
              {themeIds.map((id) => renderThemePreview(id))}
            </View>

            <View style={styles.optionsSection}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: currentTheme.colors.text,
                    fontFamily: currentTheme.fonts.family,
                    fontSize: currentTheme.fonts.size.large,
                    fontWeight: currentTheme.fonts.weight.bold,
                  },
                ]}
              >
                Accessibility
              </Text>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: currentTheme.colors.surfaceVariant,
                    borderColor: currentTheme.colors.border,
                  },
                ]}
                onPress={toggleHighContrast}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: currentTheme.colors.text,
                      fontFamily: currentTheme.fonts.family,
                      fontSize: currentTheme.fonts.size.medium,
                    },
                  ]}
                >
                  High Contrast Mode
                </Text>
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: isHighContrast ? currentTheme.colors.primary : 'transparent',
                      borderColor: currentTheme.colors.border,
                    },
                  ]}
                >
                  {isHighContrast && (
                    <Text style={{ color: currentTheme.colors.surface, fontSize: 12 }}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  modal: {
    width: SCREEN_WIDTH - 32,
    maxHeight: '80%',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeItem: {
    width: THEME_ITEM_WIDTH,
    marginBottom: 16,
    borderRadius: 8,
    padding: 12,
    position: 'relative',
  },
  themePreview: {
    height: 80,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  colorBlock: {
    height: '100%',
  },
  accentRow: {
    flexDirection: 'row',
    height: 20,
  },
  themeName: {
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ThemeSelector;