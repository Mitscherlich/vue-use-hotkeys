import jsx from '@vitejs/plugin-vue-jsx'

export default {
  plugins: [jsx()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
}
