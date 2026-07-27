## Personal Finance Dashboard — build plan

Built in clear stages so you can review after each one. Stack: React + Vite (TanStack Router for pages), Tailwind, Recharts, Firebase Auth + Firestore. Visual direction: lavender/purple, glassmorphism, gradients, rounded cards, soft shadows, smooth motion, dark + light mode.

### What I need from you (before Stage 2)
Your Firebase web app config: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`. Get it from console.firebase.google.com → your project → Project settings → Your apps → Web app. These are publishable keys, safe in the code. Also enable in Firebase: Authentication → Email/Password, Firestore Database, and Storage (for profile pictures).

---

### Stage 1 — Design system + Landing page
Purple/lavender token set in `src/styles.css` (glass surfaces, gradient tokens, glow shadows), dark/light theme with a toggle that persists.
Landing page at `/`: hero, features grid, screenshots, testimonials, FAQ accordion, contact section, footer. Own SEO metadata.

### Stage 2 — Firebase + Auth
Firebase initialised in a browser-safe module. Auth pages: `/login`, `/signup`, `/forgot-password` (email reset). Auth context in the router, protected `_authenticated` layout that redirects to `/login`. Header reflects session (avatar menu + sign out).

### Stage 3 — Data layer
Firestore collections per user: `transactions`, `budgets`, `goals`, `profile`, `settings`. Security rules so a user reads/writes only their own docs. Typed hooks with TanStack Query for reads, writes and optimistic updates, plus skeleton loaders.

### Stage 4 — Transactions
`/transactions`: add / edit / delete via a modal form (amount, type, category, date, note), validated with Zod. Search box, category filter, income/expense filter, date range filter. Empty states and loading skeletons.
Categories: Food, Shopping, Transport, Bills, Entertainment, Health, Education, Salary, Freelance, Investments, Others — each with an icon and colour.

### Stage 5 — Dashboard
`/dashboard`: welcome card, current balance, total income, total expenses, savings, monthly budget progress ring, and a Financial Health Score (composite of savings rate, budget adherence and expense concentration — I'll show the formula in the UI tooltip).

### Stage 6 — Charts (Recharts)
Monthly expense line chart, monthly income line chart, expense-by-category pie, savings trend area chart, income vs expense grouped bar chart. All responsive and theme-aware.

### Stage 7 — Budget planner + Goals
`/budget`: set monthly budget (overall + per category), progress bars, remaining amount, alert when exceeded or near limit.
`/goals`: add savings goal with target amount, deadline, amount saved; progress indicator and achieved state.

### Stage 8 — Analytics
`/analytics`: highest expense category, average daily spending, month-over-month and week-over-week comparison, yearly report table + chart.

### Stage 9 — Profile, Settings, Notifications
`/profile`: edit name/details, upload profile picture to Firebase Storage.
`/settings`: dark mode, currency selection (formatting applied app-wide), export CSV, export PDF.
In-app notification centre: budget exceeded, goal achieved, monthly reminder — generated from data, stored per user, with unread badge.

### Stage 10 — Production polish
Responsive pass at mobile/tablet/desktop with a mobile bottom nav, accessibility pass, page metadata for every route, error and 404 states, final visual QA in the browser.

### Technical notes
- Firebase SDK is browser-only, so auth/Firestore access is client-side; auth routes render client-side to avoid SSR mismatch.
- Firestore rules ship as a file you paste into the Firebase console (I can't deploy rules to your project from here) — I'll give exact copy-paste content.
- PDF export via jsPDF + autotable; CSV generated client-side.
- No secrets in code beyond the publishable Firebase config.
