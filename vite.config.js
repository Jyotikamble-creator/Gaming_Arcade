import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  base: process.env.NODE_ENV === 'production' ? '/' : '/',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@gamearchade': '/gamearchade/src',
      '@src': '/src'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core dependencies
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react'],
          http: ['axios'],
          
          // Game pages - split by category  
          wordGames: [
            '/src/pages/WordGuess',
            '/src/pages/WordScramble'
          ],
          puzzleGames: [
            '/src/pages/EmojiGuess',
            '/src/pages/MemoryCard',
            '/src/pages/Game2048'
          ],
          skillGames: [
            '/src/pages/MathQuiz',
            '/src/pages/TypingTest',
            '/src/pages/Quiz'
          ],
          actionGames: [
            '/src/pages/WhackMole',
            '/src/pages/SimonSays',
            '/src/pages/TicTacToe'
          ],
          
          // Core app components
          auth: [
            '/src/pages/Auth',
            '/src/components/auth/Login',
            '/src/components/auth/Signup'
          ],
          dashboard: [
            '/src/pages/Dashboard', 
            '/src/pages/Home',
            '/src/components/gamehub/Sidebar'
          ],
          utilities: [
            '/src/pages/LeaderboardPage',
            '/src/pages/ScoresPage', 
            '/src/pages/ProgressPage',
            '/src/pages/ProfilePage'
          ]
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 4173
  }
})
