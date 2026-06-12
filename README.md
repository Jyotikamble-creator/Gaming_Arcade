# 🎮 Gaming Arcade

A comprehensive gaming platform featuring multiple interactive games built with Next.js and Node.js. Includes word games, puzzles, memory games, and more with user authentication, scoring, and leaderboards.Gaming Arcade is a full-stack gaming platform where users can register, play multiple browser-based games, track their progress, compete on leaderboards, and manage their profiles.

The project is built using **Next.js App Router**, **TypeScript**, **Prisma**, and **PostgreSQL**, following a scalable and modular architecture.

---

# ✨ Features

## 👤 Authentication

- User Registration
- Secure Login
- JWT Authentication
- Protected Routes
- Profile Management

---

## 🏆 Leaderboards

- Global Leaderboards
- Individual Game Scores
- Player Statistics
- Progress Tracking
- Achievements

---

## 🎮 Games

- 🧩 Word Guess
- 🔤 Word Scramble
- 😀 Emoji Guess
- 🧠 Brain Teaser
- 💻 Coding Puzzle
- ➕ Math Quiz
- 🃏 Memory Card
- 🎯 Reaction Time
- 🎹 Music Tiles
- 💣 Minesweeper
- 🔢 Sudoku
- ❌ Tic Tac Toe
- 🔷 2048
- 🎲 Number Maze
- ⚡ Simon Says
- ⌨️ Typing Test
- 🔨 Whack-a-Mole
- 🏗️ Tower Stacker
- 🧱 Sliding Puzzle
- 🎨 Pixel Art Creator
- 🔠 Word Builder

---

## 🎨 User Experience

- Fully Responsive Design
- Modern UI
- Animated Components
- Loading Indicators
- Error Handling
- Beautiful Gradients
- Mobile Friendly

---

# 🛠 Tech Stack

## Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Axios
- Lucide Icons

## Backend

- Next.js API Routes
- Epress.js
- Prisma ORM
- PostgreSQL

## Authentication

- JWT
- bcryptjs

## Database

- PostgreSQL
- Prisma

---

# 📂 Project Structure

```text
Gaming_Arcade/
│
├── public/
│
├── prisma/
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── dashboard/
│   │   ├── games/
│   │   ├── leaderboard/
│   │   ├── profile/
│   │   ├── settings/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │
│   ├── hooks/
│   │
│   ├── lib/
│   │
│   ├── models/
│   │
│   ├── types/
│   │
│   └── utility/
│
├── .env
├── next.config.js
├── package.json
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL

---

## Clone Repository

```bash
git clone https://github.com/Jyotikamble-creator/Gaming_Arcade.git

cd Gaming_Arcade
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL=

NEXTAUTH_URL=

NEXTAUTH_SECRET=

JWT_SECRET=

```

Fill these values with your own credentials.

---

## Generate Prisma Client

```bash
npx prisma generate
```

---

## Run Database Migrations

```bash
npx prisma db push
```

---

## Start Development Server

```bash
npm run dev
```

Visit

```
http://localhost:3000
```

---

# 📜 Available Scripts

### Start Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production

```bash
npm run start
```

### Lint

```bash
npm run lint
```

### Generate Prisma Client

```bash
npm run db:generate
```

### Push Database

```bash
npm run db:push
```

### Prisma Studio

```bash
npm run db:studio
```

---

# 🌐 Deployment

The project can be deployed easily on **Vercel**.

## Deploy

```bash
npm run build
```

Push the project to GitHub and import it into **Vercel**.

### Framework

```
Next.js
```

### Build Command

```
npm run build
```

### Output Directory

```
(leave empty)
```

Add all required environment variables inside the Vercel Dashboard before deploying.

---

# 📸 Screenshots

## Landing Page

![Landing](https://github.com/user-attachments/assets/14fe20e9-c50e-4891-a9af-8f1a48b44a00)

---

## Authentication

![Auth](https://github.com/user-attachments/assets/ae1cd6a6-4c79-4710-8a21-f2cbbf6f2ad8)

---

## Dashboard

![Dashboard](https://github.com/user-attachments/assets/da4dfb6e-9119-41d7-9957-c47baf2b50b4)

---

## Word Guess

![Word Guess](https://github.com/user-attachments/assets/f6e457cb-8904-48f9-9193-0c62c8fe3b98)

---

## Word Scramble

![Word Scramble](https://github.com/user-attachments/assets/7af9e073-0078-4150-9abe-823d69e93ef5)

---

## Emoji Guess

![Emoji Guess](https://github.com/user-attachments/assets/94d887e2-2685-4e6b-89fe-b3535eefa3fe)

---

## 2048

![2048](https://github.com/user-attachments/assets/2e94a10f-4766-4cf0-a7f9-4899844cd5bd)

---

## Typing Test

![Typing Test](https://github.com/user-attachments/assets/858d3de2-8ec4-4fcb-aec0-64da5febf626)

---

## Quiz

![Quiz](https://github.com/user-attachments/assets/34255038-bee4-415a-b163-19193943b859)

---

## Tic Tac Toe

![Tic Tac Toe](https://github.com/user-attachments/assets/b0b62373-5957-4eba-9650-44cecd88853f)

---

## Whack-a-Mole

![Whack-a-Mole](https://github.com/user-attachments/assets/4fbb40f6-54c6-416b-948b-e92371260f54)

---

## Simon Says

![Simon Says](https://github.com/user-attachments/assets/1944b6fc-a6c8-4f00-8c2d-fdc7d0f236e0)

---

# 📈 Future Improvements

- Multiplayer Support
- AI Opponents
- Daily Challenges
- Dark / Light Theme
- Friend System
- Game Achievements
- Notifications
- Cloud Save
- PWA Support

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository

2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push the branch

```bash
git push origin feature-name
```

5. Open a Pull Request.

---

# 👨‍💻 Author

**Jyoti Kamble**

GitHub:
https://github.com/Jyotikamble-creator

---

# 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

⭐ If you like this project, consider giving it a Star on GitHub!

Made with ❤️ using Next.js & TypeScript

</div>