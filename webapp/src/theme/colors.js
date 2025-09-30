// src/theme/colors.js
export const colors = {
  light: {
    // Backgrounds
    background: {
      primary: 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50',
      secondary: 'bg-white',
      card: 'bg-white',
      input: 'bg-slate-50',
      elevated: 'bg-white/80',
      modal: 'bg-white',
      accent: 'bg-blue-100',
      danger: 'bg-red-100',
      success: 'bg-emerald-100',
      warning: 'bg-amber-50',
      info: 'bg-blue-50',
    },
    // Text colors
    text: {
      primary: 'text-slate-900',
      secondary: 'text-slate-600',
      tertiary: 'text-slate-400',
      accent: 'text-blue-700',
      danger: 'text-red-700',
      success: 'text-emerald-700',
      warning: 'text-amber-700',
      info: 'text-blue-700',
    },
    // Borders
    border: {
      primary: 'border-slate-200',
      secondary: 'border-slate-300',
      input: 'border-slate-200',
      accent: 'border-blue-200',
      danger: 'border-red-200',
      success: 'border-emerald-200',
      warning: 'border-amber-200',
      info: 'border-blue-200',
    },
    // Hover states
    hover: {
      primary: 'hover:bg-slate-100',
      secondary: 'hover:bg-slate-50',
    },
    // Status colors
    status: {
      confirmed: 'from-emerald-400 to-teal-500',
      pending: 'from-amber-400 to-orange-500',
      completed: 'from-blue-400 to-indigo-500',
      cancelled: 'from-red-400 to-pink-500',
      default: 'from-gray-400 to-slate-500',
    },
    // Feature-specific
    charger: {
      ac: 'text-emerald-400',
      dc: 'text-orange-400',
    },
    // Special gradients
    gradient: {
      bluePurple: 'from-blue-500 to-purple-600',
      navLogo: 'from-blue-500 to-purple-600',
    },
    // Shadows
    shadow: {
      primary: 'shadow-lg shadow-blue-500/50',
    },
  },
  dark: {
    // Backgrounds
    background: {
      primary: 'bg-slate-950',
      secondary: 'bg-slate-900',
      card: 'bg-slate-900/50',
      input: 'bg-slate-800',
      elevated: 'bg-slate-900/80',
      modal: 'bg-slate-900',
      accent: 'bg-blue-500/20',
      danger: 'bg-red-500/20',
      success: 'bg-emerald-500/20',
      warning: 'bg-amber-500/10',
      info: 'bg-blue-500/10',
    },
    // Text colors
    text: {
      primary: 'text-white',
      secondary: 'text-slate-400',
      tertiary: 'text-slate-500',
      accent: 'text-blue-400',
      danger: 'text-red-400',
      success: 'text-emerald-400',
      warning: 'text-amber-300',
      info: 'text-blue-300',
    },
    // Borders
    border: {
      primary: 'border-slate-800',
      secondary: 'border-slate-700',
      input: 'border-slate-700',
      accent: 'border-blue-500/30',
      danger: 'border-red-500/30',
      success: 'border-emerald-500/30',
      warning: 'border-amber-500/30',
      info: 'border-blue-500/30',
    },
    // Hover states
    hover: {
      primary: 'hover:bg-slate-800',
      secondary: 'hover:bg-slate-800',
    },
    // Status colors - same as light mode
    status: {
      confirmed: 'from-emerald-400 to-teal-500',
      pending: 'from-amber-400 to-orange-500',
      completed: 'from-blue-400 to-indigo-500',
      cancelled: 'from-red-400 to-pink-500',
      default: 'from-gray-400 to-slate-500',
    },
    // Feature-specific
    charger: {
      ac: 'text-emerald-400',
      dc: 'text-orange-400',
    },
    // Special gradients - same as light mode
    gradient: {
      bluePurple: 'from-blue-500 to-purple-600',
      navLogo: 'from-blue-500 to-purple-600',
    },
    // Shadows
    shadow: {
      primary: 'shadow-lg shadow-blue-500/50',
    },
  },
};

// Placeholders
export const placeholders = {
  light: 'placeholder-slate-400',
  dark: 'placeholder-slate-500',
};

// Helper function to get theme-specific color
export const getThemeColor = (theme, colorPath) => {
  const parts = colorPath.split('.');
  let result = theme === 'dark' ? colors.dark : colors.light;
  
  for (const part of parts) {
    if (result[part] === undefined) {
      console.warn(`Color path "${colorPath}" not found in theme`);
      return '';
    }
    result = result[part];
  }
  
  return result;
};