# 📚 StudyTracker

A full-featured academic study tracker with tasks, timers, analytics, gamification, and an admin panel. Built with React + Supabase.

---

## 🧰 What You Need Before Starting

You need **3 things** installed/ready:

| # | What | How to Get It |
|---|------|---------------|
| 1 | **Node.js** (v18 or newer) | Download from [nodejs.org](https://nodejs.org) — pick the **LTS** version |
| 2 | **A Code Editor** | [VS Code](https://code.visualstudio.com/) is recommended (free) |
| 3 | **A Supabase Account** | Sign up free at [supabase.com](https://supabase.com) |

> **How to check if Node.js is installed:** Open a terminal and type `node --version`. If you see a version number like `v18.x.x` or higher, you're good!

---

## 🚀 Setup — Step by Step

### Step 1: Download the Code

```bash
git clone <YOUR_GIT_URL>
```

Or download the ZIP from GitHub and extract it.

### Step 2: Open a Terminal in the Project Folder

Open your terminal (Command Prompt, PowerShell, or VS Code terminal) and navigate to the project:

```bash
cd project-compendium
```

### Step 3: Install Dependencies

Run this one command — it downloads everything the app needs:

```bash
npm install
```

> ⏳ This may take 1–2 minutes. Wait until it finishes.

---

### Step 4: Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Give it a name (e.g. `study-tracker`)
4. Set a **database password** (save it somewhere safe!)
5. Choose a region close to you
6. Click **"Create new project"** and wait ~2 minutes

### Step 5: Get Your Supabase Keys

Once your project is ready:

1. In the Supabase dashboard, click **"Project Settings"** (gear icon, bottom-left)
2. Click **"API"** in the sidebar
3. You'll see two important values:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon public key** — a long string starting with `eyJ...`

**Copy both of these.** You'll need them in the next step.

### Step 6: Connect the App to YOUR Supabase Database

Open this file in your code editor:

```
src/lib/supabase.ts
```

You'll see this code:

```typescript
// ─── EDIT THESE TWO LINES ───────────────────────────
const SUPABASE_URL = "https://ewdprhronbnjvhzvcymt.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
// ─────────────────────────────────────────────────────
```

**Replace them with YOUR values from Step 5:**

```typescript
const SUPABASE_URL = "https://YOUR-PROJECT-ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-KEY-HERE";
```

> ⚠️ **Important:** Keep the quotes (`"`) around the values! Just replace the text inside.

**Save the file.**

---

### Step 7: Set Up the Database (Run SQL Migrations)

Your database needs tables. Run the SQL files to create them:

1. Go to your **Supabase Dashboard**
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**
4. Open the files in the `merged-sql/` folder **one by one, in order** (01 → 10)
5. For each file:
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **"Run"** (or press `Ctrl+Enter`)
   - Make sure it says "Success" before moving to the next file

**Run them in this exact order:**

| Order | File | What It Creates |
|-------|------|-----------------|
| 1st | `01_utilities_and_profiles.sql` | Helper functions + user profiles |
| 2nd | `02_hierarchy.sql` | Projects, Goals, Streams, Subjects, Chapters, Topics |
| 3rd | `03_study_config_and_tasks.sql` | Study sessions, Tasks, Subtasks |
| 4th | `04_timer_holidays_extras.sql` | Timer, Holidays, Task types, Backups |
| 5th | `05_gamification.sql` | Badges and achievements |
| 6th | `06_templates_and_journals.sql` | Task templates + Daily journal |
| 7th | `07_rls_policies.sql` | Security rules (Row Level Security) |
| 8th | `08_functions_and_triggers.sql` | Database functions + auto-completion logic |
| 9th | `09_roles_storage_feedback.sql` | Admin roles, file storage, feedback system |
| 10th | `10_admin_and_contact.sql` | Contact form, admin notes, admin tools |

> 💡 **Optional:** After all 10 files, you can also run `seed_demo_data.sql` (in the `sql/` folder) to load sample data for testing.

---

### Step 8: Enable Supabase Auth

1. In Supabase Dashboard, go to **"Authentication"** → **"Providers"**
2. Make sure **"Email"** is enabled (it should be by default)
3. Optionally, under **"Authentication"** → **"URL Configuration"**, set:
   - Site URL: `http://localhost:5173`
   - Redirect URLs: `http://localhost:5173`

---

### Step 9: Make Yourself Admin

After you've signed up and created an account in the app:

1. Go to **Supabase Dashboard → Authentication → Users**
2. Find your account and copy your **User UID** (the long ID)
3. Go to **SQL Editor → New Query**
4. Paste this (replace the ID with yours):

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('PASTE-YOUR-USER-ID-HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

5. Click **Run**

> 📖 For more details, see [docs/ADMIN_SETUP.md](./docs/ADMIN_SETUP.md)

---

### Step 10: Run the App! 🎉

```bash
npm run dev
```

Open your browser and go to: **http://localhost:5173**

You should see the StudyTracker landing page. Click **Sign Up** to create your first account!

---

## ✨ Features

### For Students
- 📋 **Tasks** — Create, schedule, prioritize, and track study tasks
- ⏱️ **Pomodoro Timer** — Focus sessions linked to tasks
- 📅 **Calendar** — Day, Week, Month, Agenda views
- 📊 **Analytics** — Study trends, consistency scores, focus metrics
- 🏗️ **Hierarchy** — Projects → Goals → Streams → Subjects → Chapters → Topics
- 🏆 **Gamification** — XP, levels, badges, and daily streaks
- 📝 **Journal** — Daily study reflections
- 📋 **Templates** — Reusable recurring task templates

### For Admins
- 👥 **User Management** — View all registered users
- 💊 **System Health** — Live DB status, latency, user counts
- 💬 **Contact Messages** — Manage public contact form submissions
- 🐛 **Feedback** — Review bugs and feature requests
- 📓 **Admin Notes** — Private notes for admins

---

## 🛠️ Tech Stack

| What | Technology |
|------|-----------|
| Frontend | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Data Fetching | TanStack React Query |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Charts | Recharts |

---

## 📁 Project Structure

```
project-compendium/
├── src/
│   ├── components/          # UI components
│   │   ├── ui/              # shadcn/ui base components
│   │   ├── auth/            # Login/signup components
│   │   ├── layout/          # Sidebar, navigation
│   │   └── dashboard/       # Dashboard widgets
│   ├── hooks/               # Custom React hooks
│   ├── lib/
│   │   └── supabase.ts      # ⭐ SUPABASE CONFIG (edit this!)
│   ├── pages/               # All app pages
│   │   └── admin/           # Admin panel pages
│   └── App.tsx              # Routes & app entry
├── sql/                     # Original SQL migrations (41 files)
├── merged-sql/              # Merged SQL migrations (10 files)
├── docs/                    # Documentation
│   └── ADMIN_SETUP.md       # How to make users admin
└── public/                  # Static files
```

---

## 🔒 Security

- **Row Level Security (RLS)** on every table — users only see their own data
- **Admin functions** use `SECURITY DEFINER` with role verification
- **Contact form rate limiting** — 5-minute cooldown for spam prevention
- The **anon key** in `supabase.ts` is a public key (safe to expose) — RLS is the real security layer

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm install` fails | Make sure Node.js v18+ is installed |
| App shows blank page | Check browser console for errors. Make sure Supabase URL/key are correct |
| "relation does not exist" error | Run the SQL migrations in order (Step 7) |
| Can't access admin panel | Make sure you've added your user to `user_roles` (Step 9) |
| Login doesn't work | Check Supabase Auth settings (Step 8) |

---

## 📄 License

Private project — not licensed for redistribution.
