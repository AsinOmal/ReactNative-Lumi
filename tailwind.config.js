// tailwind.config.js
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          default: '#770CB4',
          light: '#D9BDF8',
          dark: '#320757',
        },
      },
      fontFamily: {
        // NativeWind v2 syntax - remove file extensions
        spicy: ['SpicyRice-Regular'],
        button: ['Catchy-Melody'],
        fredoka: ['Fredoka-Regular'],
        'fredoka-bold': ['Fredoka-Bold'],
        'fredoka-light': ['Fredoka-Light'],
        'fredoka-medium': ['Fredoka-Medium'],
        'fredoka-semibold': ['Fredoka-SemiBold'],
      },
    },
  },
  plugins: [],
};
