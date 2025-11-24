import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  base: process.env.NODE_ENV === 'production' ? '/' : '/',
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
            './src/pages/WordGuess.jsx',
            './src/pages/WordScramble.jsx'
          ],
          puzzleGames: [
            './src/pages/EmojiGuess.jsx',
            './src/pages/MemoryCard.jsx',
            './src/pages/Game2048.jsx'
          ],
          skillGames: [
            './src/pages/MathQuiz.jsx',
            './src/pages/TypingTest.jsx',
            './src/pages/Quiz.jsx'
          ],
          actionGames: [
            './src/pages/WhackMole.jsx',
            './src/pages/SimonSays.jsx',
            './src/pages/TicTacToe.jsx'
          ],
          
          // Core app components
          auth: [
            './src/pages/Auth.jsx',
            './src/components/auth/Login.jsx',
            './src/components/auth/Signup.jsx'
          ],
          dashboard: [
            './src/pages/Dashboard.jsx',
            './src/pages/Home.jsx',
            './src/components/gamehub/Sidebar.jsx'
          ],
          utilities: [
            './src/pages/LeaderboardPage.jsx',
            './src/pages/ScoresPage.jsx',
            './src/pages/ProgressPage.jsx',
            './src/pages/ProfilePage.jsx'
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
