import { useMemo } from 'react';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

type NamedStyles<T> = StyleSheet.NamedStyles<T>;

export const useThemeStyles = <T extends NamedStyles<T>>(createStyles: (theme: any) => T): T => {
  const { currentTheme } = useTheme();

  return useMemo(() => {
    return StyleSheet.create(createStyles(currentTheme));
  }, [currentTheme, createStyles]);
};

export const useTheme = () => {
  const { currentTheme, isTransitioning } = useTheme();
  return { theme: currentTheme, isTransitioning };
};

// Utility functions for common theme-aware styles
export const createThemeStyles = (theme: any) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  surface: {
    backgroundColor: theme.colors.surface,
  },

  text: {
    color: theme.colors.text,
    fontFamily: theme.fonts.family,
    fontSize: theme.fonts.size.medium,
  },

  textSecondary: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family,
    fontSize: theme.fonts.size.medium,
  },

  textTertiary: {
    color: theme.colors.textTertiary,
    fontFamily: theme.fonts.family,
    fontSize: theme.fonts.size.small,
  },

  heading1: {
    color: theme.colors.text,
    fontFamily: theme.fonts.family,
    fontSize: theme.fonts.size.xxlarge,
    fontWeight: theme.fonts.weight.bold,
  },

  heading2: {
    color: theme.colors.text,
    fontFamily: theme.fonts.family,
    fontSize: theme.fonts.size.xlarge,
    fontWeight: theme.fonts.weight.bold,
  },

  heading3: {
    color: theme.colors.text,
    fontFamily: theme.fonts.family,
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
  },

  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },

  buttonText: {
    color: theme.colors.surface,
    fontFamily: theme.fonts.family,
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.medium,
  },

  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    color: theme.colors.text,
    fontFamily: theme.fonts.family,
    fontSize: theme.fonts.size.medium,
  },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    margin: theme.spacing.xs,
    ...theme.shadows.sm,
  },

  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },

  link: {
    color: theme.colors.link,
    textDecorationLine: 'underline' as const,
  },

  codeBlock: {
    backgroundColor: theme.colors.codeBackground,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontFamily: 'monospace',
  },

  codeText: {
    color: theme.colors.codeText,
    fontFamily: 'monospace',
    fontSize: theme.fonts.size.small,
  },

  errorText: {
    color: theme.colors.error,
    fontFamily: theme.fonts.family,
    fontSize: theme.fonts.size.small,
  },

  successText: {
    color: theme.colors.success,
    fontFamily: theme.fonts.family,
    fontSize: theme.fonts.size.small,
  },

  warningText: {
    color: theme.colors.warning,
    fontFamily: theme.fonts.family,
    fontSize: theme.fonts.size.small,
  },

  infoText: {
    color: theme.colors.info,
    fontFamily: theme.fonts.family,
    fontSize: theme.fonts.size.small,
  },
});

export default useThemeStyles;