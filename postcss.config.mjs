/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
  resolve: {
    alias: {
      "@codemirror/state": require.resolve("@codemirror/state"),
    },
  },
  
};

export default config;
