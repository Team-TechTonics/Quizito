import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.jpg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Quizito - AI Quiz Portal',
        short_name: 'Quizito',
        description: 'Interactive AI-powered quiz platform',
        theme_color: '#6366f1',
        icons: [
          {
            src: 'favicon.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          }
        ]
      }
    })
  ],

  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },

  publicDir: 'public',

  server: {
    historyApiFallback: true
  }
})
