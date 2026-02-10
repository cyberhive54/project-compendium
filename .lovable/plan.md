# StudyTracker — Complete MVP Implementation Plan (Revised)

A gamified study management platform for students preparing for board exams, competitive exams, and college semesters. Built with React + Vite + TypeScript + Tailwind + Shadcn/ui, connected to an external Supabase project.

---

## Phase 1: Foundation & Authentication

_Goal: Project setup, design system, auth flows, and full database schema_

### Stage 1.1 — Design System & Layout Shell

- Apply StudyTracker color palette (blue primary, success/error/warning tokens)
- Inter font, dark/light mode toggle with persistent preference
- App shell layout: collapsible sidebar (Dashboard, Calendar, Analytics, Goals, Settings) + top header bar
- Mobile: hamburger menu + fixed bottom navigation bar (Dashboard, Calendar, Timer, Analytics, Profile)
- Z-index hierarchy: Modals z-50, Floating Timer z-45, Bottom Nav z-40, Sidebar z-30
- Minimum touch targets: 44×44px (56×56px for bottom nav)

### Stage 1.2 — Database Schema (SQL Migration Files)

Generate numbered SQL files for manual execution in Supabase:

- `user_profiles` (XP, streak, settings, pomodoro config, backup_encryption_hash)
- `projects`, `goals`, `streams`, `subjects`, `chapters`, `topics` (hierarchy tables with weightage)
- `tasks` (with exam fields, auto-calculated columns, priority 1–9999 higher=higher, preferred_session_id FK)
- `subtasks`
- `timer_sessions`
- `holidays`
- `user_task_types`
- `badges` (pre-seeded with 7+ default badges, JSONB unlock conditions, tiers)
- `user_badges`
- `study_sessions_config` (name, start/end time with overnight support, days_of_week, color)
- `backups_metadata`
- RLS policies for all tables (user can only access own data)
- Database triggers: weightage validation (±0.01% tolerance), timestamp auto-update, profile auto-creation on signup
- Indexes on all frequently queried columns

### Stage 1.3 — Authentication

- Sign up (email/password with Zod validation)
- Login with "Remember Me" (7-day sessions)
- Email verification flow via Supabase Auth
- Protected routes (redirect to login if unauthenticated)
- Username setup (unique, max 20 chars) + optional profile picture (Supabase Storage)
- Backup encryption hash auto-generated on user creation
- Logout functionality

#### ✅ Phase 1 Checklist

- [ ] Light/dark mode toggle works and persists
- [ ] Sidebar navigation renders with correct icons and labels
- [ ] Mobile hamburger menu opens/closes correctly
- [ ] Mobile bottom nav shows on screens <768px, hides on desktop
- [ ] All SQL tables created successfully in Supabase
- [ ] RLS policies prevent cross-user data access
- [ ] Sign up with email/password works
- [ ] Email verification link works
- [ ] Login/logout works
- [ ] Protected routes redirect unauthenticated users
- [ ] Profile picture upload works
- [ ] Username is unique and validated (max 20 chars)
- [ ] Study sessions config table created
- [ ] Badges table created and seeded with default badges
- [ ] Backup encryption hash generated on user creation
- [ ] Priority number validation (1–9999, no decimals/negatives/e notation)

---

## Phase 2: Hierarchy System & Task Management

_Goal: Build the 7-level organizational hierarchy and full task CRUD_

### Stage 2.1 — Hierarchy CRUD (Projects → Topics)

- Projects: create, edit, archive (optional container)
- Goals: create, edit, archive (mandatory, with type: board/competitive/semester/custom)
- Streams, Subjects, Chapters, Topics: CRUD with parent-child relationships
- Weightage system:
  - Children must total 100% ±0.01% (floating-point tolerance)
  - Database trigger validates on INSERT/UPDATE (server-side enforcement)
  - Frontend shows real-time running total as user edits
  - "Auto-Balance" button distributes remaining % equally among siblings
  - Visual feedback: red text if total ≠ 100%, green if valid
- Color assignment for subjects (auto-assigned from palette)
- Cascade archive: archiving parent archives all children (with warning dialog)
- Cannot delete items with children (must archive first)

### Stage 2.2 — Task Management

- Task creation modal with all fields: name, goal, subject, chapter, topic, type, priority, dates, estimated duration
- Priority system: 1–9999, higher number = higher priority
  - Default: 1000 (medium)
  - Quick select buttons: Low (1000), Medium (2500), High (5000), Critical (7500)
- Optional: tag task with preferred study session (dropdown of user's sessions)
- Visual indicator if task is scheduled outside its preferred session time
- Task list views (filter by goal, subject, date, status)
- Task status flow: scheduled → pending → in_progress → done / postponed
- Postponement: forward-only date picker, tracks original date
- Sub-tasks as checkboxes within tasks
- Custom task types (default: notes, lecture, revision, practice, test, mocktest, exam)
- Bulk actions: multi-select, bulk postpone, bulk archive

### Stage 2.3 — Exam-Specific Task Fields

- Conditional exam fields for test/mocktest/exam task types
- Fields: total questions, attempted, correct, wrong, marks/question, negative marking, time taken
- Auto-calculations: skipped questions, total marks, marks obtained, accuracy %, speed (Q/min)
- Real-time validation (correct + wrong ≤ attempted ≤ total)

#### ✅ Phase 2 Checklist

- [ ] Can create/edit/archive projects
- [ ] Can create/edit/archive goals with type selection
- [ ] Streams/Subjects/Chapters/Topics CRUD works
- [ ] Weightage totals validated to 100% (±0.01% tolerance)
- [ ] Auto-balance distributes weightage evenly among siblings
- [ ] Cascade archive warns and archives all children
- [ ] Cannot delete items with children (must archive first)
- [ ] Task creation modal shows all required fields
- [ ] Priority defaults to 1000, quick select buttons work
- [ ] Tasks can be tagged with preferred study session
- [ ] Warning appears if task scheduled outside session time
- [ ] Tasks filter by goal, subject, date, status
- [ ] Task status transitions work correctly
- [ ] Postponement only allows future dates
- [ ] Sub-task checkboxes work
- [ ] Priority sorting works (higher number = higher priority)
- [ ] Custom task types can be added/edited
- [ ] Exam fields appear only for test/mocktest/exam types
- [ ] Exam auto-calculations are correct
- [ ] Exam validation prevents impossible values (correct > attempted)

---

## Phase 3: Dashboard

_Goal: Central hub showing daily overview, stats, active sessions, and goals_

### Stage 3.1 — Dashboard Layout

- Welcome banner with username, level, and streak count
- Quick stats cards (4): Time studied today, Tasks done, Current streak, Adherence %
- Today's task list widget with status badges and quick actions (start timer, mark done, postpone)
- Active goals widget with progress bars

### Stage 3.2 — Data Aggregation

- Real-time stats calculations from tasks and timer sessions
- Recent activity feed (last 10 actions)
- Upcoming tasks (next 7 days)
- Empty states with helpful CTAs ("Create your first goal!")
- Skeleton loading states

### Stage 3.3 — Active Study Session Indicator

- Detect if current time falls within any active study session
- Show badge: "🌙 Night Study Session Active" or "☀️ Morning Focus Active"
- Display session-specific stats: "3/5 night session tasks completed this week"
- Quick link to "View session tasks"

#### ✅ Phase 3 Checklist

- [ ] Dashboard shows correct username, level, streak
- [ ] Quick stats cards show accurate numbers
- [ ] Today's tasks list shows correct tasks for today
- [ ] Task quick actions work from dashboard (done, postpone)
- [ ] Active goals show correct progress percentages
- [ ] Empty states display when no data exists
- [ ] Skeleton loaders appear while data loads
- [ ] Stats update in real-time when tasks are completed
- [ ] Active study session indicator shows if current time matches config
- [ ] Session-specific quick stats display ("3/5 night tasks done")

---

## Phase 4: Timer & Pomodoro System

_Goal: Full-featured study timer with Pomodoro mode and midnight handling_

### Stage 4.1 — Timer Core

- Start/stop/pause timer linked to a specific task
- Single active timer enforced globally (starting new timer stops current)
- Timer persists across page navigation (state in Zustand + localStorage)
- Timer sessions saved to database on stop
- Minimum 60-second session (shorter sessions discarded)
- Maximum 12-hour auto-pause with warning
- Multiple sessions per task allowed
- **Midnight session splitting**: if timer runs past 12:00 AM, auto-split into two records — each linked to the same task, each counted on its respective date

### Stage 4.2 — Timer UI

- Fullscreen focus mode: large timer display, task name, pause/stop buttons, quick actions (+5 min, finish early)
- Floating minimized timer: compact draggable widget (bottom-right, z-45), persists across pages
- Timer session history for each task
- Browser close detection with resume prompt on return

### Stage 4.3 — Pomodoro Mode

- Customizable Pomodoro settings: focus duration (5–120 min), short break (1–30 min), long break (5–60 min), cycles before long break
- Pomodoro cycle indicator (Session X of Y)
- Auto-start break / auto-start focus options
- Break countdown timer
- Browser notifications for session/break completion

#### ✅ Phase 4 Checklist

- [ ] Timer starts and displays HH:MM:SS correctly
- [ ] Only one timer can run at a time
- [ ] Timer persists when navigating between pages
- [ ] Timer state survives page refresh (localStorage)
- [ ] Pause/resume works correctly
- [ ] Sessions < 60 seconds are discarded
- [ ] Timer auto-pauses after 12 hours
- [ ] Fullscreen focus mode displays correctly
- [ ] Floating minimized timer appears and is draggable
- [ ] Floating timer z-index is above bottom nav
- [ ] Clicking floating timer expands to fullscreen
- [ ] Timer session is saved to database on stop
- [ ] Multiple sessions per task are recorded
- [ ] Timer session splits correctly at midnight (two records created)
- [ ] Both midnight-split sessions link to same task
- [ ] Analytics count each split session on correct date
- [ ] Pomodoro mode cycles through focus → short break → focus → ... → long break
- [ ] Pomodoro settings are customizable per user
- [ ] Browser notifications fire on session/break completion
- [ ] Resume prompt appears after browser close/reopen

---

## Phase 5: Gamification System

_Goal: XP, levels, streaks, badges, and holidays to motivate study habits_

### Stage 5.1 — XP & Levels

- XP calculation: baseXP (by task type) + duration bonus + difficulty multiplier + streak bonus + exam accuracy bonus
- XP awarded on task completion and timer session save
- Level formula: floor(sqrt(totalXP / 100)) + 1
- Level-up celebration animation (confetti)
- XP breakdown shown in toast notifications

### Stage 5.2 — Streaks

- Daily streak tracking: streak maintained if ANY condition is met (configurable):
  - Study ≥ X minutes (default: 30 min) OR
  - Complete ≥ Y tasks (default: 1 task) OR
  - Complete all scheduled tasks for the day
- User can configure: min_minutes, min_tasks, require_all_tasks, mode (any/all)
- Current streak and longest streak display
- Streak milestone celebrations (7, 30, 100, 365 days)
- Holiday freeze: marking a day as holiday preserves streak
- Retroactive holiday marking (up to 7 days back) recalculates streak

### Stage 5.3 — Badges & Holidays

- Badge system with 6 categories: Streak, Time, Tasks, Exams, Subject, Milestones
- Badges defined in `badges` table with JSONB unlock conditions and tiers (bronze/silver/gold/platinum)
- Badge unlock notifications with celebration animation
- Badge gallery page showing earned and locked badges with progress toward next unlock
- Holiday management: create, view, delete holidays with custom types
- Calendar visual indicator for holidays

#### ✅ Phase 5 Checklist

- [ ] XP is awarded correctly on task completion
- [ ] XP breakdown shows base + bonus components
- [ ] Level displays correctly based on XP formula
- [ ] Level-up triggers celebration animation
- [ ] Streak increments daily when ANY condition is met (by default)
- [ ] Streak conditions are configurable (min_minutes, min_tasks, mode)
- [ ] Streak resets when a day is missed (no holiday, no conditions met)
- [ ] Holiday freeze maintains streak
- [ ] Retroactive holidays (up to 7 days) recalculate streak
- [ ] Default badges unlock at correct thresholds
- [ ] Badge notification appears on unlock
- [ ] Badge gallery shows earned vs locked badges with progress
- [ ] Holidays appear on calendar with distinct styling

---

## Phase 6: Calendar & Scheduling

_Goal: Multi-view calendar with task scheduling, session blocks, and adherence tracking_

### Stage 6.1 — Calendar Views

- Month view: grid with task counts, time studied, subject color dots per day
- Week view: 7-column layout with time slots
- Day view: single column with hourly breakdown
- Agenda view: chronological list grouped by date
- Today button to jump to current date

### Stage 6.2 — Task List Modal & Scheduling

- Click any date to open task list modal showing: done, pending, and postponed tasks
- Quick actions within modal (start timer, mark done, postpone)
- Add task to specific date directly from calendar
- Time slot assignment (morning/afternoon/evening/custom)
- Planned vs actual adherence: (completed on time / total scheduled) × 100%
- Weekly adherence report with day-by-day breakdown

### Stage 6.3 — Session-Based Scheduling & Visualization

- Visual study session blocks on calendar (background shading for configured time ranges)
- Color-code sessions (different color per session type)
- Tasks can be tagged with preferred session when creating/editing
- Filter calendar by session ("Show only Night Study tasks")
- Session adherence: "You completed 8/10 tasks scheduled for night sessions"
- Warning if task is scheduled outside any study session
- Holidays display with distinct styling (light blue + icon)

#### ✅ Phase 6 Checklist

- [ ] Month view shows correct task counts and time per day
- [ ] Subject color dots appear on calendar days
- [ ] Week view shows tasks in time slots
- [ ] Day view shows hourly breakdown
- [ ] Agenda view lists upcoming tasks chronologically
- [ ] Clicking a date opens task list modal
- [ ] Modal shows tasks grouped by status (done, pending, postponed)
- [ ] Quick actions work from calendar modal
- [ ] Tasks can be added to specific dates from calendar
- [ ] Study session blocks display on calendar (shaded time ranges)
- [ ] Tasks can be tagged with preferred session
- [ ] Session adherence percentage calculates correctly
- [ ] Warning shows if task scheduled outside study sessions
- [ ] Holidays display with distinct styling (light blue + icon)
- [ ] Adherence percentage calculates correctly
- [ ] Weekly adherence summary shows day-by-day data

---

## Phase 7: Analytics, Data Management, Background Jobs & Polish

_Goal: Charts, backup/restore, offline sync, automation, testing, and final polish_

### Stage 7.1 — Analytics Dashboard

- Summary cards: time studied, tasks completed, average accuracy, XP earned (with time period filter: week/month/all-time)
- Score trend line chart (exam scores over time)
- Subject performance bar chart (time spent or progress %)
- Speed vs accuracy scatter plot (for exams)
- Time distribution pie/donut chart (by subject/goal/task type)
- Study heatmap (GitHub-style contribution calendar)
- Streak visualization line chart
- Weekly/monthly summary cards (exportable as social media images)
- **Session Performance Chart** (bar chart): average time studied per session
- **Session Consistency Heatmap**: rows = sessions, columns = days of week, color = frequency
- **Session Task Completion** (pie chart): tasks completed by session type
- **Session Insights**: natural language insights about best-performing sessions

### Stage 7.2 — Data Management & Settings

- Encrypted backup:
  - User enters passphrase (min 8 chars)
  - Key derivation: PBKDF2(encryption_hash + passphrase, salt, 100k iterations, SHA-256)
  - Algorithm: AES-256-CBC
  - Download encrypted JSON
- Restore from backup: upload JSON → enter passphrase → decrypt → merge (not replace)
- Archive vs permanent delete (double confirmation for permanent delete)
- Settings page: theme, Pomodoro config, streak conditions (min_minutes, min_tasks, mode), custom task types
- Study Sessions management: create/edit/delete sessions (name, start/end time, days of week, active toggle, color)
  - Default session suggestions on first setup
- Profile editing (username, profile picture)

### Stage 7.3 — Offline Indicators & Polish

- Online/offline status indicator in UI
- Offline queue in localStorage:
  - FIFO processing, max 3 retries per operation
  - Exponential backoff: 1s, 2s, 4s
  - Conflict resolution: last-write-wins (exception: timer sessions always merge/append)
  - On 3rd failure: mark as permanently failed, notify user
- Sync status indicators on tasks
- Responsive design refinements (mobile, tablet, desktop)
- Animation polish (page transitions, list stagger, progress bar animations)
- Accessibility audit (keyboard navigation, ARIA labels, contrast ratios)
- Error handling and edge cases (PRD edge cases E1–E11)
- Loading states, empty states, and error states for all pages

### Stage 7.4 — Background Jobs / Automation (Client-Side)

- On login/app open:
  - Transition scheduled tasks (scheduled_date ≤ today) to 'pending' status
  - Update streak (check if yesterday was maintained or broken)
- Midnight detection via setInterval (check every minute):
  - Transition today's scheduled tasks to 'pending'
  - Split any active timer session at midnight boundary
- State persisted via localStorage to avoid duplicate processing

### Stage 7.5 — Testing

- Unit tests (Vitest, targeting 70%+ coverage):
  - XP calculation, streak logic, weightage validation, timer midnight split
- Integration tests for critical flows:
  - Auth: Signup → Verify → Login → Logout
  - Hierarchy: Create goal → Create subject → Verify weightage
  - Tasks: Create → Timer → Stop → Complete
- E2E tests (Playwright) for user journeys:
  - New user onboarding flow
  - Study session workflow
  - Offline sync

#### ✅ Phase 7 Checklist

- [ ] All chart types render with correct data (including 3 session charts)
- [ ] Time period filter works (week, month, all-time)
- [ ] Charts update when new data is added
- [ ] Session productivity charts render correctly
- [ ] Session consistency heatmap shows day-of-week patterns
- [ ] Social media summary card generates correctly
- [ ] Backup creates encrypted JSON file (PBKDF2 + AES-256-CBC)
- [ ] Restore decrypts and merges data correctly
- [ ] Archive hides items from UI but preserves data
- [ ] Permanent delete requires double confirmation
- [ ] Settings save and apply correctly (theme, Pomodoro, streak conditions, sessions)
- [ ] Study session CRUD works in settings
- [ ] Offline indicator shows when disconnected
- [ ] Offline queue processes in FIFO order with max 3 retries
- [ ] Changes made offline sync when back online
- [ ] Midnight detection triggers task status transitions
- [ ] App works on mobile (responsive layout)
- [ ] Mobile bottom nav displays only on screens <768px
- [ ] Floating timer z-index is above bottom nav
- [ ] Keyboard navigation works for all interactive elements
- [ ] All pages have loading, empty, and error states
- [ ] Single timer enforcement works across tabs
- [ ] Timer sessions split at midnight correctly
- [ ] Unit tests pass (70%+ coverage)
- [ ] E2E tests pass for critical flows

---

## Technical Architecture

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + Shadcn/ui
- **Routing**: React Router v6
- **State**: Zustand (timer, offline queue, UI preferences) + React Query (all Supabase data with optimistic updates)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Database**: External Supabase — SQL migration files provided numbered (e.g., `001_create_user_profiles.sql`) for manual execution
- **Auth**: Supabase Auth (email/password)
- **Storage**: Supabase Storage (profile pictures)
- **Testing**: Vitest (unit) + Playwright (E2E)
