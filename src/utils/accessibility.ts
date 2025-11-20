import { Theme } from '../themes';

export interface AccessibilityInfo {
  meetsWCAG: boolean;
  contrastRatio: number;
  issues: string[];
  recommendations: string[];
}

export const calculateContrastRatio = (color1: string, color2: string): number => {
  // Simple implementation - in production, use a proper color library
  // This is a placeholder that returns a basic contrast calculation
  const getLuminance = (hex: string): number => {
    const rgb = hex.replace('#', '').match(/.{2}/g)?.map(c => parseInt(c, 16) / 255) || [0, 0, 0];
    const [r, g, b] = rgb.map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

export const checkColorContrast = (
  foreground: string,
  background: string,
  size: 'normal' | 'large' = 'normal'
): AccessibilityInfo => {
  const ratio = calculateContrastRatio(foreground, background);
  const wcagThreshold = size === 'large' ? 3 : 4.5; // AA standard
  const meetsWCAG = ratio >= wcagThreshold;

  const issues: string[] = [];
  const recommendations: string[] = [];

  if (!meetsWCAG) {
    issues.push(`Contrast ratio ${ratio.toFixed(2)} is below WCAG AA standard (${wcagThreshold})`);
    recommendations.push('Increase color contrast by darkening the foreground or lightening the background');
  }

  return {
    meetsWCAG,
    contrastRatio: ratio,
    issues,
    recommendations,
  };
};

export const validateThemeAccessibility = (theme: Theme): {
  overall: boolean;
  details: Record<string, AccessibilityInfo>;
} => {
  const checks = {
    primaryText: checkColorContrast(theme.colors.text, theme.colors.background),
    secondaryText: checkColorContrast(theme.colors.textSecondary, theme.colors.background),
    surfaceText: checkColorContrast(theme.colors.text, theme.colors.surface),
    linkText: checkColorContrast(theme.colors.link, theme.colors.background),
    buttonText: checkColorContrast(theme.colors.surface, theme.colors.primary),
    errorText: checkColorContrast(theme.colors.error, theme.colors.background),
    successText: checkColorContrast(theme.colors.success, theme.colors.background),
  };

  const overall = Object.values(checks).every(check => check.meetsWCAG);

  return {
    overall,
    details: checks,
  };
};

export const getAccessibleAlternatives = (theme: Theme): Theme[] => {
  // Return variations of the theme that pass accessibility checks
  const alternatives: Theme[] = [];

  // High contrast version
  const highContrast = {
    ...theme,
    colors: {
      ...theme.colors,
      background: '#000000',
      surface: '#1a1a1a',
      surfaceVariant: '#2a2a2a',
      text: '#ffffff',
      textSecondary: '#e0e0e0',
      textTertiary: '#cccccc',
      border: '#ffffff',
      borderLight: '#cccccc',
    },
  };

  // Light version
  const light = {
    ...theme,
    colors: {
      ...theme.colors,
      background: '#ffffff',
      surface: '#f5f5f5',
      surfaceVariant: '#e0e0e0',
      text: '#000000',
      textSecondary: '#333333',
      textTertiary: '#666666',
      border: '#cccccc',
      borderLight: '#999999',
    },
  };

  alternatives.push(highContrast, light);

  return alternatives.filter(alt => validateThemeAccessibility(alt).overall);
};

export const generateAccessibilityReport = (theme: Theme): string => {
  const validation = validateThemeAccessibility(theme);
  const report: string[] = [];

  report.push(`Accessibility Report for ${theme.name} Theme`);
  report.push('='.repeat(50));
  report.push(`Overall Compliance: ${validation.overall ? 'PASS' : 'FAIL'}`);

  Object.entries(validation.details).forEach(([key, info]) => {
    report.push(`\n${key.charAt(0).toUpperCase() + key.slice(1)}:`);
    report.push(`  Contrast Ratio: ${info.contrastRatio.toFixed(2)}`);
    report.push(`  WCAG AA Compliant: ${info.meetsWCAG ? 'Yes' : 'No'}`);

    if (info.issues.length > 0) {
      report.push('  Issues:');
      info.issues.forEach(issue => report.push(`    - ${issue}`));
    }

    if (info.recommendations.length > 0) {
      report.push('  Recommendations:');
      info.recommendations.forEach(rec => report.push(`    - ${rec}`));
    }
  });

  return report.join('\n');
};

// Utility to check if a theme meets minimum accessibility standards
export const meetsMinimumAccessibility = (theme: Theme): boolean => {
  const validation = validateThemeAccessibility(theme);
  return validation.overall;
};

// Get the best accessible alternative for a theme
export const getBestAccessibleAlternative = (theme: Theme): Theme => {
  const alternatives = getAccessibleAlternatives(theme);
  return alternatives.length > 0 ? alternatives[0] : theme;
};