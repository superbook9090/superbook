// Centralized Tailwind utility classes for consistent styling

// Common spacing patterns
export const spacing = {
  // Page container padding
  pageContainer: 'px-4 sm:px-6 lg:px-8',
  
  // Section spacing
  sectionPadding: 'py-6 sm:py-8 lg:py-12',
  sectionMargin: 'mb-6 sm:mb-8 lg:mb-12',
  
  // Card spacing
  cardPadding: 'p-4 sm:p-6 lg:p-8',
  cardMargin: 'mb-4 sm:mb-6',
  
  // Form spacing
  formGroup: 'mb-4 sm:mb-6',
  formLabel: 'block text-sm font-medium text-gray-700 mb-2',
  
  // Button spacing
  buttonSpacing: 'px-4 py-2 sm:px-6 sm:py-3',
};

// Common layout patterns
export const layouts = {
  // Dashboard layout
  dashboardContainer: 'min-h-screen bg-gray-50',
  dashboardContent: 'flex-1 p-6',
  
  // Card layouts
  card: 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200',
  cardHeader: 'px-4 py-3 sm:px-6 border-b border-gray-200',
  cardBody: 'px-4 py-3 sm:px-6',
  
  // Grid layouts
  grid: {
    two: 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6',
    three: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
    four: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6',
  },
  
  // Flex layouts
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-center justify-start',
    end: 'flex items-center justify-end',
    col: 'flex flex-col',
    wrap: 'flex flex-wrap',
  },
};

// Common component patterns
export const components = {
  // Button styles
  button: {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  },
  
  // Text styles
  text: {
    title: 'text-2xl sm:text-3xl font-bold text-gray-900',
    subtitle: 'text-lg sm:text-xl font-semibold text-gray-800',
    body: 'text-base text-gray-600',
    small: 'text-sm text-gray-500',
  },
  
  // Form styles
  input: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500',
  select: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500',
  textarea: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500',
};

// Animation utilities
export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  scale: 'animate-scale',
  transition: 'transition-all duration-200 ease-in-out',
};

// Responsive utilities
export const responsive = {
  hideMobile: 'hidden sm:block',
  showMobile: 'block sm:hidden',
  hideTablet: 'hidden lg:block',
  showTablet: 'block lg:hidden',
};
