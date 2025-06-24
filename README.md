# VibeStream

VibeStream is a modern, full-stack web application for seamless screen recording, video sharing, and collaboration. Developed as a B.Tech Software Engineering final project, it empowers creators, educators, and teams to record, upload, and share videos with ease, all within a secure and beautifully designed platform.

---

## 🚀 Features
- **Google OAuth Sign-In:** Secure, one-click authentication.
- **Screen Recording & Video Upload:** Record your screen or upload videos directly from your device.
- **User Profiles:** Personalized dashboards and video libraries.
- **Video Privacy:** Set videos as public or private for flexible sharing.
- **Search, Filter & Pagination:** Quickly find and browse content.
- **Responsive UI:** Modern, mobile-friendly design with Tailwind CSS.
- **Admin Moderation:** (Extensible) Tools for content management.

---

## 🛠️ Tech Stack
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes, Drizzle ORM, PostgreSQL, Xata
- **Authentication:** Better Auth, Google OAuth
- **Storage:** BunnyCDN (video), Xata (metadata)
- **Testing:** Jest, Playwright/Cypress, ESLint, Prettier

---

## 📂 Project Structure
```
app/            # Next.js app directory (routing, pages, layouts)
components/     # Reusable React components
constants/      # App-wide constants
lib/            # Utilities, hooks, server actions
public/         # Static assets (icons, images)
drizzle/        # Database schema and config
fonts/          # Custom fonts
documentation/  # Software engineering docs
```

---

## 🖥️ Running VibeStream Locally

### 1. **Clone the Repository**
```bash
git clone <your-repo-url>
cd snapcast
```

### 2. **Install Dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. **Configure Environment Variables**
- Copy `.env.example` to `.env` and fill in all required values:
  - `NEXT_PUBLIC_BASE_URL` — Base URL of your app
  - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth credentials
  - `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` — Auth config
  - `XATA_API_KEY` / `DATABASE_URL_POSTGRES` — Database config
  - `BUNNY_STORAGE_ACCESS_KEY`, `BUNNY_LIBRARY_ID`, `BUNNY_STREAM_ACCESS_KEY` — BunnyCDN config
  - `ARCJET_API_KEY` — Rate limiting/abuse prevention

### 4. **Run the Development Server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 5. **Build for Production**
```bash
npm run build && npm start
```

---

## 📑 Documentation
Comprehensive software engineering documentation is available in the `documentation/` folder:
- Project Overview, Requirements, Architecture, Design Decisions, Agile Process, Testing, Deployment, Contributors, User Stories, Glossary, API Docs, Retrospective, Roadmap

---

## 🤝 Contributing
We welcome contributions! Please see `documentation/contributors.md` and open issues or pull requests for improvements.

---

## 📜 License
This project is for academic use. Please refer to your institution's guidelines for reuse.

---

## 🌟 Acknowledgements
- Built with Next.js, Drizzle ORM, Xata, BunnyCDN, and Tailwind CSS.
- Special thanks to all contributors and our project supervisor.

---

> _VibeStream: Share your vibe, stream your story._
