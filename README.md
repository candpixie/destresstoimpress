🎮 Welcome to Destress to Impress or (Destress2Impress)

Clear your mind. Perform your ultimate best.

Destress to Impress is our PennApps project where entertainment meets biometric data.

We integrated the EmotiBit wearable with AI + web games to transform stress into fun resets — music, memes, and mini-games designed to help students clear their head and bounce back.

✨ What it does
- 📊 Reads stress/excitement signals from EmotiBit (HR, HRV, EDA).
- 🖥️ Dashboard displays biometric data in real time (or demo mode with simulated data).
- 🎮 Four entertainment modules connected to stress levels:
  - Flappy Breath 🐦 → control the bird with your breath.
  - Fit Check 👗 → style your avatar and earn points.
  - MeMeMeMer 😂 → trending memes + meme puzzles.
  - MuMo 🎶🎬 → music + movie recommender using Cerebras AI mood detection.

⏱️ Gamified stress regulation: stress scores (0–10) map to modules (calm → Flappy Breath, high stress → MuMo).

📈 Temporal tracking: compare mood before and after interventions.

Not therapy — just entertainment.

Because for people under 30, stress is constant (exams, internships, jobs). We already turn to music, memes, and games as coping tools. Destress to Impress simply makes that entertainment adaptive to your mood.

🛠️ How we built it
- Hardware
  - EmotiBit sensor → provides biometric data (HR, HRV, EDA).
  - Integrated via API, with fallback simulated data for demo mode.

- Frontend
  - Bolt (React + TypeScript + Tailwind + shadcn-ui) for UI.
  - Comic-inspired design with pastel gradients, dark/light mode, smooth animations.
  - Dashboard to show biometric values + recommended module.

- Backend & APIs
  - Cerebras AI → classifies free-text input into Happy | Sad | Stressed | Chill for MuMo.
  - YouTube API → fetches playlists + clips (with static fallback).
  - Reddit API / Imgflip API → meme generation (with fallback JSON).
  - Simulated /api/emotibit endpoint → provides live demo data when sensor is not available.

🧩 Tech Stack
- Framework: Next.js / React (Bolt)
- Languages: TypeScript, JavaScript, Python
- Styling: TailwindCSS, shadcn-ui
- AI: Cerebras LLM (mood detection)
- APIs: YouTube Data API, Reddit API, Imgflip API
- Hardware: EmotiBit sensor (HR, HRV, EDA streaming)

📊 Dashboard Functions
- Displays live or simulated biometric data (HR, HRV, EDA).
- Calculates stress score (0–10).
- Maps stress score → recommended entertainment module.
- Users can toggle EmotiBit Mode ↔ Demo Mode for safe presentations.

🚀 Why this matters

Entertainment is everywhere, but it’s not designed to connect to how we actually feel.

By syncing entertainment with stress signals, we make coping interactive, playful, and adaptive.

👩‍💻 Team
- Candy Xie
- Lara De
- Emily New
- Lakshitha Vengadeswaran

⚡ Quick Start (Dev Setup)
git clone https://github.com/candpixie/destresstoimpress
cd destresstoimpress
npm install
npm run dev

📝 Notes
- This project was built in <30 hours at PennApps 2025.
- Some APIs (Reddit, YouTube)  fallback content for demo reliability.
- EmotiBit integration is real, but can be simulated in demo mode if device not available.
