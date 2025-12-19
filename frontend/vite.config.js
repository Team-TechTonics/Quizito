import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
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
        assetsDir: 'assets',
        // Copy _redirects file to dist for Render SPA routing
        rollupOptions: {
            output: {
                manualChunks: undefined
            }
        }
    },
    // Copy public files including _redirects
    publicDir: 'public'
})
