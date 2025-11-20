export interface ThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  primaryVariant: string;
  secondary: string;
  accent: string;
  border: string;
  borderLight: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  highlight: string;
  codeBackground: string;
  codeText: string;
  link: string;
  linkVisited: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  fonts: {
    family: string;
    size: {
      small: number;
      medium: number;
      large: number;
      xlarge: number;
      xxlarge: number;
    };
    weight: {
      normal: string;
      medium: string;
      bold: string;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

export const themes: Record<string, Theme> = {
  dark: {
    id: 'dark',
    name: 'Dark',
    colors: {
      background: '#1e1e1e',
      surface: '#252526',
      surfaceVariant: '#2d2d30',
      text: '#cccccc',
      textSecondary: '#999999',
      textTertiary: '#666666',
      primary: '#007acc',
      primaryVariant: '#0056b3',
      secondary: '#569cd6',
      accent: '#4ec9b0',
      border: '#3e3e42',
      borderLight: '#454545',
      error: '#f48771',
      warning: '#cca700',
      success: '#6cc04a',
      info: '#75beff',
      highlight: '#264f78',
      codeBackground: '#1e1e1e',
      codeText: '#d4d4d4',
      link: '#4ec9b0',
      linkVisited: '#c586c0',
    },
    fonts: {
      family: 'Segoe UI',
      size: {
        small: 12,
        medium: 14,
        large: 16,
        xlarge: 18,
        xxlarge: 24,
      },
      weight: {
        normal: '400',
        medium: '500',
        bold: '600',
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 4,
      md: 6,
      lg: 8,
      xl: 12,
    },
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
      md: '0 2px 4px rgba(0, 0, 0, 0.3)',
      lg: '0 4px 8px rgba(0, 0, 0, 0.3)',
    },
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      background: '#0f1419',
      surface: '#1b2838',
      surfaceVariant: '#263238',
      text: '#e0e0e0',
      textSecondary: '#b0b0b0',
      textTertiary: '#808080',
      primary: '#00bcd4',
      primaryVariant: '#008ba3',
      secondary: '#4dd0e1',
      accent: '#26c6da',
      border: '#37474f',
      borderLight: '#455a64',
      error: '#ff6b6b',
      warning: '#ffa726',
      success: '#66bb6a',
      info: '#42a5f5',
      highlight: '#00695c',
      codeBackground: '#1b2838',
      codeText: '#e0e0e0',
      link: '#4dd0e1',
      linkVisited: '#ba68c8',
    },
    fonts: {
      family: 'Segoe UI',
      size: {
        small: 12,
        medium: 14,
        large: 16,
        xlarge: 18,
        xxlarge: 24,
      },
      weight: {
        normal: '400',
        medium: '500',
        bold: '600',
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 4,
      md: 6,
      lg: 8,
      xl: 12,
    },
    shadows: {
      sm: '0 1px 2px rgba(15, 20, 25, 0.3)',
      md: '0 2px 4px rgba(15, 20, 25, 0.3)',
      lg: '0 4px 8px rgba(15, 20, 25, 0.3)',
    },
  },

  forest: {
    id: 'forest',
    name: 'Forest',
    colors: {
      background: '#1a1a1a',
      surface: '#2d3436',
      surfaceVariant: '#34495e',
      text: '#ecf0f1',
      textSecondary: '#bdc3c7',
      textTertiary: '#7f8c8d',
      primary: '#27ae60',
      primaryVariant: '#229954',
      secondary: '#2ecc71',
      accent: '#55efc4',
      border: '#34495e',
      borderLight: '#3d566e',
      error: '#e74c3c',
      warning: '#f39c12',
      success: '#27ae60',
      info: '#3498db',
      highlight: '#2c3e50',
      codeBackground: '#2d3436',
      codeText: '#ecf0f1',
      link: '#55efc4',
      linkVisited: '#a29bfe',
    },
    fonts: {
      family: 'Segoe UI',
      size: {
        small: 12,
        medium: 14,
        large: 16,
        xlarge: 18,
        xxlarge: 24,
      },
      weight: {
        normal: '400',
        medium: '500',
        bold: '600',
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 4,
      md: 6,
      lg: 8,
      xl: 12,
    },
    shadows: {
      sm: '0 1px 2px rgba(26, 26, 26, 0.3)',
      md: '0 2px 4px rgba(26, 26, 26, 0.3)',
      lg: '0 4px 8px rgba(26, 26, 26, 0.3)',
    },
  },

  sunset: {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      background: '#2c1810',
      surface: '#3d291e',
      surfaceVariant: '#4a3328',
      text: '#ffeaa7',
      textSecondary: '#fab1a0',
      textTertiary: '#e17055',
      primary: '#fdcb6e',
      primaryVariant: '#e17055',
      secondary: '#fd79a8',
      accent: '#a29bfe',
      border: '#4a3328',
      borderLight: '#5d4037',
      error: '#fd79a8',
      warning: '#fdcb6e',
      success: '#00b894',
      info: '#00cec9',
      highlight: '#6c5ce7',
      codeBackground: '#3d291e',
      codeText: '#ffeaa7',
      link: '#a29bfe',
      linkVisited: '#fd79a8',
    },
    fonts: {
      family: 'Segoe UI',
      size: {
        small: 12,
        medium: 14,
        large: 16,
        xlarge: 18,
        xxlarge: 24,
      },
      weight: {
        normal: '400',
        medium: '500',
        bold: '600',
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 4,
      md: 6,
      lg: 8,
      xl: 12,
    },
    shadows: {
      sm: '0 1px 2px rgba(44, 24, 16, 0.3)',
      md: '0 2px 4px rgba(44, 24, 16, 0.3)',
      lg: '0 4px 8px rgba(44, 24, 16, 0.3)',
    },
  },

  purple: {
    id: 'purple',
    name: 'Purple',
    colors: {
      background: '#2d1b69',
      surface: '#3f2b8b',
      surfaceVariant: '#4c3a99',
      text: '#e8d5ff',
      textSecondary: '#c7a4ff',
      textTertiary: '#9b7ce8',
      primary: '#9c88ff',
      primaryVariant: '#6c5ce7',
      secondary: '#a29bfe',
      accent: '#fd79a8',
      border: '#4c3a99',
      borderLight: '#5e4cb6',
      error: '#fd79a8',
      warning: '#fdcb6e',
      success: '#00b894',
      info: '#00cec9',
      highlight: '#6c5ce7',
      codeBackground: '#3f2b8b',
      codeText: '#e8d5ff',
      link: '#a29bfe',
      linkVisited: '#fd79a8',
    },
    fonts: {
      family: 'Segoe UI',
      size: {
        small: 12,
        medium: 14,
        large: 16,
        xlarge: 18,
        xxlarge: 24,
      },
      weight: {
        normal: '400',
        medium: '500',
        bold: '600',
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 4,
      md: 6,
      lg: 8,
      xl: 12,
    },
    shadows: {
      sm: '0 1px 2px rgba(45, 27, 105, 0.3)',
      md: '0 2px 4px rgba(45, 27, 105, 0.3)',
      lg: '0 4px 8px rgba(45, 27, 105, 0.3)',
    },
  },

  matrix: {
    id: 'matrix',
    name: 'Matrix',
    colors: {
      background: '#000000',
      surface: '#001100',
      surfaceVariant: '#002200',
      text: '#00ff00',
      textSecondary: '#00cc00',
      textTertiary: '#009900',
      primary: '#00ff00',
      primaryVariant: '#00cc00',
      secondary: '#00aa00',
      accent: '#00ff88',
      border: '#003300',
      borderLight: '#004400',
      error: '#ff0000',
      warning: '#ffaa00',
      success: '#00ff00',
      info: '#00aaff',
      highlight: '#002200',
      codeBackground: '#001100',
      codeText: '#00ff00',
      link: '#00ff88',
      linkVisited: '#88ff00',
    },
    fonts: {
      family: 'Courier New',
      size: {
        small: 12,
        medium: 14,
        large: 16,
        xlarge: 18,
        xxlarge: 24,
      },
      weight: {
        normal: '400',
        medium: '500',
        bold: '600',
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 0,
      md: 0,
      lg: 0,
      xl: 0,
    },
    shadows: {
      sm: '0 0 2px #00ff00',
      md: '0 0 4px #00ff00',
      lg: '0 0 8px #00ff00',
    },
  },
};

export type ThemeId = keyof typeof themes;
export const themeIds = Object.keys(themes) as ThemeId[];

export const getTheme = (themeId: string): Theme => {
  return themes[themeId] || themes.dark;
};

export const getAccessibleTheme = (theme: Theme): Theme => {
  // Return a high contrast version for accessibility
  return {
    ...theme,
    colors: {
      ...theme.colors,
      text: '#ffffff',
      textSecondary: '#e0e0e0',
      textTertiary: '#cccccc',
      background: '#000000',
      surface: '#1a1a1a',
      surfaceVariant: '#2a2a2a',
      border: '#ffffff',
      borderLight: '#cccccc',
      // Ensure high contrast for all interactive elements
      primary: '#ffffff',
      primaryVariant: '#e0e0e0',
      secondary: '#cccccc',
      accent: '#ffff00',
      error: '#ff0000',
      warning: '#ffff00',
      success: '#00ff00',
      info: '#00ffff',
      highlight: '#ffff00',
    },
  };
};