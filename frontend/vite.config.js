import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    server: {
        port: 5173,
        host: true,
        watch: {
            usePolling: true,
            interval: 500,
        },
        proxy: {
            '/api': {
                target: process.env.VITE_API_TARGET || 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
})
