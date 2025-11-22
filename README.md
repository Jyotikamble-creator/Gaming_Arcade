# Gaming Arcade

A comprehensive gaming platform featuring multiple interactive games built with React and Node.js. Includes word games, puzzles, memory games, and more with user authentication, scoring, and leaderboards.

## Features

- 🎮 Multiple Games: Word Guess, Emoji Guess, Math Quiz, Memory Card, Tic Tac Toe, Word Scramble, Simon Says, Typing Test, Whack-a-Mole, Game2048.
- 👤 User Authentication & Profiles
- 🏆 Leaderboards & Scoring System
- 📱 Responsive Design with Tailwind CSS
- 🔒 Secure JWT Authentication
- 📊 Progress Tracking
- 🎨 Animated UI with Confetti Effects

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT, bcrypt
- **Deployment**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- Docker (optional)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Jyotikamble-creator/Gaming_Arcade.git
   cd Gaming_Arcade
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd server
   npm install
   cd ..
   ```

4. Create environment file:
   ```bash
   cp  server/.env
   ```
   Update the `.env` file with your MongoDB URI and JWT secret.

5. Start the development servers:
   ```bash
   # Frontend (port 5173)
   npm run dev

   # Backend (port 4000) - in another terminal
   cd server && npm run dev
   ```

<!-- ## Deployment

### Using Docker (Recommended for Local/Full Control)

1. Build and run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

2. Or build and run manually:
   ```bash
   docker build -t gaming-arcade .
   docker run -p 4000:4000 --env-file server/.env gaming-arcade
   ```

### Deploy to Vercel (Frontend) + Railway/Render (Backend)

#### 1. Deploy Backend to Railway or Render

**Railway (Recommended):**
1. Go to [Railway.app](https://railway.app) and sign up
2. Create a new project from GitHub
3. Connect your repository
4. Set environment variables in Railway dashboard:
   ```
   MONGO_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   ```
5. Deploy - Railway will provide a URL like `https://your-app.railway.app`

**Render:**
1. Go to [Render.com](https://render.com) and sign up
2. Create a new Web Service from GitHub
3. Select your repository
4. Configure:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Add environment variables as above
5. Deploy - Render will provide a URL

#### 2. Deploy Frontend to Vercel

1. Go to [Vercel.com](https://vercel.com) and sign up
2. Click "New Project" and import your GitHub repository
3. Configure the project:
   - Framework Preset: `Other`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variable:
   ```
   VITE_API_BASE=https://your-backend-url.railway.app
   ```
   (Replace with your actual backend URL from Railway/Render)
5. Click "Deploy"

Your app will be live at `https://your-project.vercel.app`!

### Manual Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Start the backend:
   ```bash
   cd server
   npm start
   ``` -->

### Environment Variables

Create a `.env` file in the `server` directory:

```env
MONGODB_URI=mongodb://localhost:27017/wordgame
JWT_SECRET=your-secret-key
NODE_ENV=production
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
wordgame/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── api/               # API service functions
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utilities and helpers
├── server/                # Backend server
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   └── config/            # Server configuration
└── dist/                  # Built frontend (generated)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
