# ⚡ DevJ Tutor

A fun, AI-powered tutor that takes you from **beginner to mastery** in **JavaScript, Python, and SQL** — built with the latest **Angular 21**, **Firebase**, and a secure serverless **AI tutor**. Personalized for daily training, with stacking lessons, live code, quizzes, smart flashcards, badges, streaks, and an encouraging AI mentor named **DevJ**.

Inspired by the best of **Team Treehouse** (structured, stacking tracks + badges) and **Codecademy** (hands-on, run-it-live learning).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDevJ1975%2FDevJtutor&env=ANTHROPIC_API_KEY&envDescription=API%20key%20for%20the%20DevJ%20AI%20tutor%20(Anthropic%20Claude)%20%E2%80%94%20kept%20server-side&envLink=https%3A%2F%2Fconsole.anthropic.com%2Fsettings%2Fkeys&project-name=devj-tutor&repository-name=devjtutor)

> One click imports the repo into Vercel and prompts for your `ANTHROPIC_API_KEY`. After it deploys, finish the [Firebase setup](#-firebase-setup-one-time-by-the-owner) so sign-in works.

---

## ✨ Features

- **3 full tracks** — JavaScript 🟨, Python 🐍, SQL 🗄️ — each tiered Beginner → Intermediate → Advanced/Mastery.
- **Stacking skill tree** — every lesson unlocks the next; prerequisites keep you on a solid path.
- **Live code playground** — run real code in your browser:
  - JavaScript in a sandboxed **Web Worker**
  - Python via **Pyodide** (WASM)
  - SQL via **sql.js** (SQLite in the browser)
- **Auto-graded exercises** with hidden test cases.
- **Quizzes** with instant feedback + explanations.
- **Spaced-repetition flashcards** (SM-2 algorithm) — review exactly what you’re about to forget.
- **Gamification** — XP, levels, daily goal ring, 🔥 streaks, and a **badge trophy case**.
- **AI tutor (DevJ)** — personalized greeting + affirmations, lesson-aware hints, “explain simpler”, “review my code”, and free-form chat. Streamed responses. Your API key stays **server-side**.
- **Activity heatmap**, dark mode, and a mobile-first, installable feel.

---

## 🧱 Tech stack

| Layer | Choice |
|------|--------|
| Frontend | Angular 21 (standalone, **signals**, zoneless, lazy routes) |
| Styling | Tailwind CSS v4 + custom design system |
| Auth & data | Firebase Auth (Google + email/password) + Firestore |
| AI | Vercel serverless function → Anthropic Claude (or OpenAI) |
| In-browser runtimes | Web Worker (JS), Pyodide (Python), sql.js (SQL) |
| Hosting | Vercel |

---

## 🚀 Local development

```bash
npm install
npm start          # ng serve → http://localhost:4200
npm run build      # production build → dist/devj-tutor/browser
```

> The AI tutor calls `/api/tutor`, which only exists when running on Vercel (or `vercel dev`). Locally, lessons/quizzes/flashcards/playground work fully; the AI chat needs the deployed function (see below).

---

## 🔥 Firebase setup (one-time, by the owner)

The public Firebase web config is already wired in `src/environments/`. To make auth work:

1. In the [Firebase console](https://console.firebase.google.com/) → **Authentication → Sign-in method**, enable **Email/Password** and **Google**.
2. **Authentication → Settings → Authorized domains** → add your Vercel domain (e.g. `devj-tutor.vercel.app`).
3. **Firestore Database** → create a database (production mode), then deploy the included rules:
   ```bash
   npx firebase deploy --only firestore:rules
   ```
   (Rules live in `firestore.rules` — each user can only access their own data.)

---

## 🤖 AI tutor setup (Vercel env vars)

The LLM key is **never** shipped to the browser. Set **one** of these in
**Vercel → Project → Settings → Environment Variables**:

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Use Claude (preferred). Optional: `ANTHROPIC_MODEL` |
| `OPENAI_API_KEY` | Use GPT instead. Optional: `OPENAI_MODEL` |

See `.env.example`. Until a key is set, the app runs fine and the chat shows a friendly “add your key” message.

---

## ☁️ Deploy to Vercel

This repo is Vercel-ready (`vercel.json`):

- **Framework:** Angular · **Output:** `dist/devj-tutor/browser`
- **Serverless function:** `api/tutor.ts` (the AI proxy)
- **SPA routing:** rewrites all non-`/api` paths to `index.html`

**One-click:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDevJ1975%2FDevJtutor&env=ANTHROPIC_API_KEY&envDescription=API%20key%20for%20the%20DevJ%20AI%20tutor%20(Anthropic%20Claude)%20%E2%80%94%20kept%20server-side&envLink=https%3A%2F%2Fconsole.anthropic.com%2Fsettings%2Fkeys&project-name=devj-tutor&repository-name=devjtutor)

Or connect the GitHub repo in Vercel manually (or run `vercel --prod`), add the AI env var, and you’re live.

---

## 🗺️ Project structure

```
api/tutor.ts                 # Secure serverless AI proxy (streaming)
src/app/
  data/                      # Curriculum (JS/Python/SQL), badges, affirmations
  models/                    # TypeScript interfaces
  services/                  # firebase, auth, user, progress, gamification,
                             # flashcard (SM-2), playground, tutor, affirmation
  guards/auth.guard.ts       # Route protection
  shared/                    # code-editor, quiz, markdown pipe, celebrations
  features/                  # welcome, dashboard, learn, lesson, flashcards,
                             # playground, badges, tutor, profile
```

## ➕ Adding curriculum

Lessons are plain data. Append to the arrays in `src/app/data/*.curriculum.ts` —
set `prerequisites` to wire the skill tree, add `content` (Markdown), an
`exercise` (with hidden `tests`), `quiz`, and `flashcards`. The progression,
badges, and SR deck pick them up automatically.
