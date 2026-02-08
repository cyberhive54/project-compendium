# StudyTracker — Product Specification Document

## 1. Product Overview

**Product Name:** StudyTracker  
**Version:** 1.0  
**Platform:** Web Application (React SPA)  
**Description:** A comprehensive study management and tracking application designed for students preparing for competitive exams, board exams, and semester courses. It provides a hierarchical organization system (Project > Goal > Stream > Subject > Chapter > Topic > Task), a study timer with Pomodoro support, analytics dashboards, gamification (badges/XP), and encrypted data backup/restore.

**Tech Stack:**
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Backend: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- State Management: Zustand (timer), React Query (server state)
- Routing: React Router v6

**Live Preview URL:** `https://id-preview--2d95d5c5-1414-4ca7-abb5-f9bf951d8ea8.lovable.app`

---

## 2. User Roles

| Role | Description |
|------|-------------|
| **Unauthenticated User** | Can view login/signup pages only. All other routes redirect to `/login`. |
| **Authenticated User** | Full access to all features. Each user's data is isolated via Row-Level Security (RLS). |

---

## 3. Authentication Module

### 3.1 Sign Up (`/signup`)

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| AUTH-01 | Email/password registration | User enters email, password, confirm password. Password requires: 8+ chars, 1 uppercase, 1 lowercase, 1 number. |
| AUTH-02 | Password validation | Real-time Zod validation. Error messages shown inline below each field. |
| AUTH-03 | Password visibility toggle | Eye/EyeOff icon button toggles password field between hidden/visible. Applies to both password fields. |
| AUTH-04 | Email verification | After successful signup, shows "Check your email" confirmation card with the email address displayed. |
| AUTH-05 | Duplicate email handling | Backend returns error; toast notification shows "Sign up failed" with error message. |
| AUTH-06 | Navigate to login | "Already have an account? Sign in" link navigates to `/login`. |
| AUTH-07 | Redirect if authenticated | If user is already logged in, auto-redirect to `/` (dashboard). |

### 3.2 Login (`/login`)

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| AUTH-08 | Email/password login | User enters email and password. Zod validation: valid email required, password required (min 1 char). |
| AUTH-09 | Password visibility toggle | Eye/EyeOff icon button toggles password visibility. |
| AUTH-10 | Failed login | Toast notification: "Login failed" with error message from backend. |
| AUTH-11 | Successful login | Redirects to the page user was trying to access (from `location.state.from`) or `/` by default. |
| AUTH-12 | Navigate to signup | "Don't have an account? Sign up" link navigates to `/signup`. |
| AUTH-13 | Loading state | Shows spinner while auth state is being determined on page load. |
| AUTH-14 | Redirect if authenticated | If user is already logged in, auto-redirect to previous page or `/`. |

### 3.3 Profile Setup (`/profile-setup`)

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| AUTH-15 | Username setup | Input field: 3–20 chars, letters/numbers/underscores only. Zod validated. |
| AUTH-16 | Username uniqueness | Checks against database before submission. Shows inline error "This username is already taken" if taken. |
| AUTH-17 | Avatar upload | Click avatar circle to open file picker. Max 2MB, image files only. Preview shown immediately. |
| AUTH-18 | Avatar storage | Uploaded to Supabase Storage `avatars` bucket at `{user_id}/avatar.{ext}`. |
| AUTH-19 | Skip option | "Skip for now" button navigates to `/` without setting username. |
| AUTH-20 | Submit | Sets username (and avatar if uploaded) in `user_profiles` table, then navigates to `/`. Toast: "Profile set up! Welcome to StudyTracker 🎉". |

### 3.4 Protected Routes

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| AUTH-21 | Route protection | All routes except `/login` and `/signup` require authentication. Unauthenticated users are redirected to `/login` with the intended path stored in state. |
| AUTH-22 | Session persistence | Auth session persists across browser refreshes via Supabase session management. |

---

## 4. Navigation & Layout

### 4.1 Desktop Sidebar

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| NAV-01 | Sidebar menu items | 7 items in order: Dashboard (`/`), Calendar (`/calendar`), Analytics (`/analytics`), Projects (`/projects`), Goals (`/goals`), Badges (`/badges`), Settings (`/settings`). |
| NAV-02 | Active state | Currently active route is highlighted with accent background and primary text color. |
| NAV-03 | Collapsible sidebar | Sidebar can collapse to icon-only mode. Tooltips show item names when collapsed. |
| NAV-04 | Desktop only | Sidebar is hidden on mobile (`hidden md:flex`). |

### 4.2 Mobile Bottom Navigation

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| NAV-05 | Bottom nav items | 5 items: Dashboard (`/`), Calendar (`/calendar`), Timer (`/timer`), Analytics (`/analytics`), Profile (`/settings`). |
| NAV-06 | Active state | Active item is highlighted with primary text color. |
| NAV-07 | Fixed position | Fixed at bottom of viewport, visible on mobile only (`md:hidden`). |
| NAV-08 | Z-index | Above page content, below modals/dialogs. |

### 4.3 Floating Timer

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| NAV-09 | Floating timer indicator | When a timer session is running and minimized, a floating widget appears showing elapsed time and task name. |
| NAV-10 | Click to expand | Clicking the floating timer navigates to the Timer page or expands the timer view. |

### 4.4 Offline Indicator

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| NAV-11 | Offline detection | When the browser goes offline, a banner/indicator is shown to the user. |

---

## 5. Dashboard (`/`)

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| DASH-01 | Active session indicator | If a study timer is running, shows a banner at the top with task name and elapsed time. |
| DASH-02 | Welcome banner | Displays personalized greeting with the user's username. |
| DASH-03 | Quick stats cards | Shows summary statistics: tasks completed today, total study time, current streak, etc. Loading skeleton while data fetches. |
| DASH-04 | Today's tasks | List of tasks scheduled for today with status indicators. |
| DASH-05 | Upcoming tasks | List of tasks scheduled for the near future. |
| DASH-06 | Active goals | Shows currently active (non-archived) goals with progress indicators. |
| DASH-07 | Recent activity | Feed of recent actions (tasks completed, sessions recorded, etc.). |
| DASH-08 | Responsive layout | Desktop: 3-column grid (tasks 2/3, goals+activity 1/3). Mobile: single column stack. |

---

## 6. Projects Module (`/projects`)

### 6.1 Projects Page

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| PROJ-01 | Page header | Title "Projects" with "+ Project" button. |
| PROJ-02 | Empty state | When no projects exist: folder icon, "No projects yet" message, "+ Create Your First Project" CTA button. |
| PROJ-03 | Loading state | 3 skeleton cards while data loads. |
| PROJ-04 | Active projects list | Shows `ProjectCard` components for each non-archived project. |
| PROJ-05 | Unassigned goals section | Below projects, shows goals where `project_id` is null, each as a `GoalCard`. Section header: "Unassigned Goals". |
| PROJ-06 | Archived toggle | Switch labeled "Show archived projects" at the bottom. When toggled on, shows archived projects with Restore and Delete buttons. |
| PROJ-07 | Archived project actions | Restore button: unarchives the project. Delete button: opens permanent delete confirmation dialog. |
| PROJ-08 | Archived project appearance | Archived project cards have `opacity-60` styling. |

### 6.2 Project Form Dialog

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| PROJ-09 | Create mode | Dialog title: "Create New Project". Fields: Name (required, max 100), Description (optional, max 500, textarea), Color (preset palette), Icon (emoji input, default "📚"). |
| PROJ-10 | Edit mode | Dialog title: "Edit Project". Pre-populates all fields with existing values. |
| PROJ-11 | Color palette | 8 colored circles: Blue (#3B82F6), Green (#10B981), Amber (#F59E0B), Red (#EF4444), Purple (#8B5CF6), Pink (#EC4899), Teal (#14B8A6), Orange (#F97316). Selected color shows ring/scale effect. Default: Blue. |
| PROJ-12 | Validation | Name is required (min 1 char after trim). Shows Zod error inline. |
| PROJ-13 | Submit | Create: calls `createProject` mutation. Edit: calls `updateProject` mutation. Shows success/error toast. Dialog closes on success. |
| PROJ-14 | Cancel | "Cancel" button closes dialog without saving. |

### 6.3 Project Card

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| PROJ-15 | Card appearance | Left border: 4px colored accent using project's color. Shows icon + name + description (1-line truncated). |
| PROJ-16 | Stats row | 3 stats: goal count (e.g., "3 goals"), task completion (e.g., "12/20 tasks"), progress percentage (e.g., "60%"). |
| PROJ-17 | Progress bar | Visual bar showing completion percentage using project color. |
| PROJ-18 | Action buttons | Edit (pencil icon), Archive (archive icon), + Add Goal button. |
| PROJ-19 | Expand/collapse | Chevron button toggles expanded state. Smooth animation via Radix Collapsible. |
| PROJ-20 | Expanded content | Shows list of GoalCard components for goals under this project. |
| PROJ-21 | Empty expanded state | If project has no goals: folder icon, "No goals in this project yet", "+ Add First Goal" button. |
| PROJ-22 | Expand persistence | Expanded/collapsed state saved in localStorage (`expanded_projects` key). Persists across page visits. |

### 6.4 Archive Project

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| PROJ-23 | Archive confirmation | Dialog shows: "Archive '{projectName}'?" with dynamically fetched counts of affected goals and tasks. |
| PROJ-24 | Cascade archive | Archiving a project archives all child: goals → streams → subjects → chapters → topics → tasks. Sets `archived = true` and `archived_at = now()` on all. |
| PROJ-25 | Query invalidation | After archive: invalidates projects, goals, streams, subjects, chapters, topics, tasks, project-task-stats queries. |
| PROJ-26 | Unarchive project | Restores only the project record (`archived = false`, `archived_at = null`). Child items remain archived. |
| PROJ-27 | Permanent delete | From archived view only. Uses double confirmation. Database FK `ON DELETE SET NULL` sets `project_id = NULL` on child goals. |

---

## 7. Goals Module (`/goals`)

### 7.1 Goals Page

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| GOAL-01 | Page header | Title "Goals & Tasks" with "+ Task" and "+ Goal" buttons. |
| GOAL-02 | Tab navigation | Two tabs: "Goals" (Target icon) and "Tasks" (ListTodo icon). |
| GOAL-03 | Project filter | Dropdown with FolderKanban icon. Options: "All Projects", "Unassigned", and each active project (icon + name). Filters displayed goals. |
| GOAL-04 | Goals list | Shows GoalCard components filtered by selected project. |
| GOAL-05 | Empty state | Folder icon, "No goals yet" message, "+ Create Goal" CTA. |
| GOAL-06 | Loading state | 3 skeleton cards. |
| GOAL-07 | Tasks tab | Shows TaskListView component with all tasks. |

### 7.2 Goal Form Dialog

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| GOAL-08 | Project dropdown | First field. Options: "No Project" (`__none__` sentinel) + list of active projects (icon + name). |
| GOAL-09 | Pre-selected project | When opened from ProjectCard's "+ Add Goal", project is pre-selected. When editing, shows current project. |
| GOAL-10 | Goal fields | Name (required), Description (optional), Goal Type (board/competitive/semester/custom), Target Date (optional), Color, Icon, Weightage Enabled toggle. |
| GOAL-11 | Submit | Creates/updates goal with `project_id` (null if "No Project"). Success/error toast. |

### 7.3 Goal Card

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| GOAL-12 | Project badge | If goal has a `project_id`, shows a small badge with project name and project color accent. |
| GOAL-13 | Goal type badge | Shows goal type (Board Exam, Competitive Exam, etc.) with icon. |
| GOAL-14 | Hierarchy tree | Expandable tree showing Streams > Subjects > Chapters > Topics. |
| GOAL-15 | Action buttons | Edit, Archive, + Add Task. |
| GOAL-16 | Cascade archive | Archiving a goal cascades to streams, subjects, chapters, topics, and tasks. |

### 7.4 Goal Hierarchy (Streams, Subjects, Chapters, Topics)

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| GOAL-17 | Streams | Organizational grouping under goals. Has name, weightage, color. |
| GOAL-18 | Subjects | Under goals (optionally under a stream). Has name, weightage, color, icon, chapter tracking. |
| GOAL-19 | Chapters | Under subjects. Has name, chapter number, weightage, description, estimated hours, completion status. |
| GOAL-20 | Topics | Under chapters. Has name, weightage, difficulty (easy/medium/hard), tags, notes, completion status. |
| GOAL-21 | Weightage system | When `weightage_enabled` on a goal, streams/subjects/chapters/topics can have weightage values (0-100). Visualized with WeightageBar. |
| GOAL-22 | Add hierarchy items | HierarchyItemForm allows adding streams, subjects, chapters, topics inline. |

---

## 8. Tasks Module

### 8.1 Task Form Dialog

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| TASK-01 | Required fields | Name, Goal (dropdown), Task Type (from user_task_types). |
| TASK-02 | Optional fields | Description, Subject, Chapter, Topic (cascading dropdowns), Scheduled Date, Time Slot (from study sessions), Priority, Estimated Duration. |
| TASK-03 | Task types | Default types: notes 📝, lecture 🎧, revision 🔄, practice ✏️, test 📊, mocktest 🧪, exam 📑. Users can add custom types. |
| TASK-04 | Exam fields | For task types "test", "mocktest", "exam": additional fields appear — Total Questions, Marks per Question, Negative Marking, Time Taken. |
| TASK-05 | Priority selector | 4 presets: Low (1000), Medium (2500), High (5000), Critical (7500). Also accepts custom numeric value. |
| TASK-06 | Subtasks | Inline subtask list. Add/remove/reorder subtasks. Each has title + completed checkbox. |
| TASK-07 | Preset goal | When opened from a goal context, goal is pre-selected. |

### 8.2 Task Card

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| TASK-08 | Display | Shows task name, type icon, status badge, priority, scheduled date. |
| TASK-09 | Status values | scheduled, pending, in_progress, done, postponed. |
| TASK-10 | Mark done | Action to mark task as completed. Sets `status = 'done'` and `completed_at`. |
| TASK-11 | Postpone | Action to postpone task to a new date. Updates `postponed_to_date`, `postponed_from_date`, `is_postponed`. |
| TASK-12 | Start timer | Action to start a study timer for this task. |

### 8.3 Task List View

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| TASK-13 | Task listing | Shows all non-archived tasks for the user. |
| TASK-14 | Edit task | Click to open TaskFormDialog in edit mode. |
| TASK-15 | Task filtering | Can filter by status, goal, date range, etc. |

---

## 9. Study Timer Module (`/timer`)

### 9.1 Timer Page

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| TIMER-01 | Idle state | Shows "Ready to Study?" card with timer icon, description text, and "Start Focus Session" button. Tips shown: sessions < 60s discarded, midnight auto-split, Pomodoro mode. |
| TIMER-02 | Task selection | "Start Focus Session" opens TaskSelectDialog. User picks a task and chooses regular or Pomodoro mode. |
| TIMER-03 | Fullscreen focus mode | When timer is running and fullscreen: shows task name, timer display (large), Pomodoro indicator (if applicable), controls, and minimize button. |
| TIMER-04 | Timer display | Shows elapsed time in HH:MM:SS format. Updates every second. |
| TIMER-05 | Timer controls | Play/Pause and Stop buttons. Pause saves paused timestamp. Stop ends session. |
| TIMER-06 | Minimize | Minimize button reduces timer to floating widget. User can continue navigating the app. |
| TIMER-07 | Session history | When viewing a task's timer, shows past timer sessions for that task. |

### 9.2 Pomodoro Mode

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| TIMER-08 | Pomodoro config | Configurable: Focus Duration (5–120 min, default 25), Short Break (1–30 min, default 5), Long Break (5–60 min, default 15), Cycles Before Long Break (1–10, default 4). |
| TIMER-09 | Auto-start options | `autoStartBreak` and `autoStartFocus` toggles. |
| TIMER-10 | Phase transitions | After focus ends → break. After break ends → next focus cycle. After N cycles → long break. Cycle resets after long break. |
| TIMER-11 | Pomodoro indicator | Shows current cycle number and phase (focus/break). |
| TIMER-12 | Pomodoro settings | Accessible from Timer page header gear icon. Opens PomodoroSettings component. |

### 9.3 Timer Engine

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| TIMER-13 | Single active timer | Only one timer can run at a time. Starting a new timer stops the previous one. |
| TIMER-14 | Persistence | Timer state persisted in localStorage via Zustand persist middleware. Survives page refresh. |
| TIMER-15 | Max duration | Timer caps at 12 hours (43,200 seconds). |
| TIMER-16 | Minimum session | Sessions under 60 seconds are automatically discarded (not saved). |
| TIMER-17 | Pause tracking | Total paused duration is tracked separately. Actual study time = elapsed - paused. |
| TIMER-18 | Session saving | On stop: saves session to `timer_sessions` table with task_id, start_time, end_time, duration, mode, cycle, paused duration. Toast confirmation with duration. |

---

## 10. Calendar Module (`/calendar`)

### 10.1 Calendar Page

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| CAL-01 | View modes | 4 views: Month, Week, Day, Agenda. Tabs to switch between them. |
| CAL-02 | Navigation | Previous/Next buttons navigate by view period. "Today" button jumps to current date. |
| CAL-03 | Header title | Shows context-appropriate title: "January 2026" (month), "Jan 1 – Jan 7, 2026" (week), "Monday, January 5, 2026" (day), "Next 30 Days" (agenda). |
| CAL-04 | Session filter | SessionFilterBar allows filtering tasks by study session time slots. |
| CAL-05 | Loading state | Skeleton placeholder while data loads. |

### 10.2 Month View

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| CAL-06 | Grid layout | Standard calendar grid showing weeks. Days outside current month are dimmed. |
| CAL-07 | Day summaries | Each day cell shows task count, completion status, timer minutes, holiday indicators. |
| CAL-08 | Click day | Opens DateTasksModal showing all tasks for that date. |

### 10.3 Week View

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| CAL-09 | 7-day layout | Shows 7 columns for the current week with tasks positioned by time slot. |
| CAL-10 | Click day | Opens DateTasksModal for that date. |

### 10.4 Day View

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| CAL-11 | Detailed day | Shows all tasks for a single day with time slots. |
| CAL-12 | Task actions | Mark done, start timer from day view. |

### 10.5 Agenda View

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| CAL-13 | 30-day list | Chronological list of upcoming tasks for the next 30 days. |
| CAL-14 | Task actions | Mark done, start timer from agenda view. |

### 10.6 Date Tasks Modal

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| CAL-15 | Modal content | Shows all tasks for a selected date with summary stats. |
| CAL-16 | Task actions | Mark done, postpone (with date picker), start timer, add new task. |

### 10.7 Adherence Panel

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| CAL-17 | Sidebar panel | Shows adherence statistics for the current view period: completion rate, on-time percentage, etc. |

---

## 11. Analytics Module (`/analytics`)

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| ANA-01 | Time period selector | Tabs: Week, Month, All Time. Filters all charts/stats. |
| ANA-02 | Summary cards | Overview stats: total study time, tasks completed, average score, etc. Loading skeletons. |
| ANA-03 | Score trend chart | Line/area chart showing exam/test score trends over time. |
| ANA-04 | Subject performance | Bar/radar chart comparing performance across subjects. |
| ANA-05 | Time distribution | Pie/donut chart showing study time distribution by subject or task type. |
| ANA-06 | Session performance | Chart showing study session effectiveness (duration, focus time, breaks). |
| ANA-07 | Study heatmap | GitHub-style heatmap showing study activity intensity over the past year. |
| ANA-08 | Streak chart | Visualization of streak history — consecutive study days. |
| ANA-09 | Responsive layout | Charts arranged in 2-column grid on desktop, single column on mobile. |

---

## 12. Badges & Holidays Module (`/badges`)

### 12.1 Badges Tab

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| BADGE-01 | Header stats | Shows: earned/total badges count, current level, total XP. |
| BADGE-02 | Category filter | Button group: All, 🔥 Streak, ⏱️ Time, ✅ Tasks, 🏆 Exams, 🎯 Milestones. |
| BADGE-03 | Progress bar | Overall badge completion percentage with visual bar. |
| BADGE-04 | Badge grid | 2–4 column responsive grid. Earned badges shown first, then locked badges. |
| BADGE-05 | Badge card | Shows badge icon, name, description. Earned badges are full color; locked badges are dimmed/greyed. Earned badges show unlock date. |
| BADGE-06 | Empty state | Category with no badges: centered icon, "No badges in this category yet". |

### 12.2 Holidays Tab

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| BADGE-07 | Add holiday form | Date picker (min: 7 days ago, no max), Type dropdown (Holiday, Festival, Sick Day, Family Event, Travel, Mental Health, Other), Reason text input (optional). |
| BADGE-08 | Add holiday action | "Add Holiday" button. Success toast: "Holiday added! Your streak will be preserved." |
| BADGE-09 | Holidays list | Chronological list showing date (formatted), type, reason. Each has delete button. |
| BADGE-10 | Delete holiday | AlertDialog confirmation: "Remove Holiday? Removing this holiday may affect your streak calculation." |
| BADGE-11 | Empty holidays | Calendar icon, "No holidays marked yet". |
| BADGE-12 | Streak preservation | Holidays are factored into streak calculations — a holiday day doesn't break a study streak. |

### 12.3 Gamification System

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| BADGE-13 | XP system | Users earn XP for completing tasks, study sessions, streaks. XP calculated based on task type, duration, difficulty. |
| BADGE-14 | Level system | Users have a current level based on total XP accumulated. |
| BADGE-15 | Badge unlock toast | When a new badge is earned, a toast/celebration notification appears. |
| BADGE-16 | Level up celebration | When user levels up, a celebration animation/toast is shown. |
| BADGE-17 | Streak milestone toast | When user hits streak milestones, a congratulatory toast appears. |
| BADGE-18 | XP toast | On XP gain, a brief toast shows "+X XP" earned. |

---

## 13. Settings Module (`/settings`)

### 13.1 Settings Page

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| SET-01 | Tab navigation | 6 tabs: Profile, Appearance, Pomodoro, Streaks, Sessions, Data. |

### 13.2 Profile Settings

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| SET-02 | View/edit username | Display current username with option to change. |
| SET-03 | Avatar management | View/change profile picture. Upload to Supabase Storage. |
| SET-04 | Logout | Button to sign out. Clears session and redirects to `/login`. |

### 13.3 Appearance Settings

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| SET-05 | Theme toggle | Switch between Light, Dark, and System themes. |
| SET-06 | Theme persistence | Theme preference persists across sessions. |

### 13.4 Pomodoro Settings

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| SET-07 | Focus duration | Slider/input: 5–120 minutes (default 25). |
| SET-08 | Short break | Slider/input: 1–30 minutes (default 5). |
| SET-09 | Long break | Slider/input: 5–60 minutes (default 15). |
| SET-10 | Cycles before long break | Slider/input: 1–10 (default 4). |
| SET-11 | Auto-start toggles | Auto-start break after focus, auto-start focus after break. |

### 13.5 Streak Settings

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| SET-12 | Streak configuration | Configure what counts as a "study day" for streak purposes (minimum minutes, etc.). |

### 13.6 Study Sessions Settings

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| SET-13 | Session management | CRUD for study session time slots. Each has: name, start time, end time, is_overnight, days of week, color, is_active. |
| SET-14 | Session scheduling | Sessions define time blocks that can be assigned to tasks for calendar scheduling. |

### 13.7 Data Management

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| SET-15 | Encrypted backup | Enter passphrase (min 8 chars). Downloads AES-256 encrypted JSON backup of all user data. Uses PBKDF2 key derivation (100,000 iterations). |
| SET-16 | Backup contents | Includes: tasks, goals, streams, subjects, chapters, topics, projects, holidays, timer_sessions, user_task_types. |
| SET-17 | Backup file | Downloads as `studytracker-backup-YYYY-MM-DD.json`. |
| SET-18 | Restore from backup | Upload a backup file + enter passphrase. Decrypts and upserts data (merge, not replace). |
| SET-19 | Wrong passphrase | Shows "Wrong passphrase" error toast on decryption failure. |
| SET-20 | Restore confirmation | Toast: "Restored {N} records". |

---

## 14. Data Model / Database Schema

### 14.1 Entity Hierarchy

```
User
├── Projects (optional container)
│   └── Goals
│       ├── Streams (organizational grouping)
│       ├── Subjects
│       │   └── Chapters
│       │       └── Topics
│       ├── Tasks
│       │   └── Subtasks
│       └── Timer Sessions
├── Study Session Configs
├── User Task Types
├── Holidays
├── Badges (user_badges junction)
└── Backups Metadata
```

### 14.2 Key Relationships

| Parent | Child | FK | On Delete |
|--------|-------|-----|-----------|
| User | Projects | `user_id` | CASCADE |
| User | Goals | `user_id` | CASCADE |
| Project | Goals | `project_id` | SET NULL |
| Goal | Streams | `goal_id` | CASCADE |
| Goal | Subjects | `goal_id` | CASCADE |
| Goal | Tasks | `goal_id` | CASCADE |
| Subject | Chapters | `subject_id` | CASCADE |
| Chapter | Topics | `chapter_id` | CASCADE |
| Task | Subtasks | `task_id` | CASCADE |
| Task | Timer Sessions | `task_id` | SET NULL |

### 14.3 Archive System

- Most entities support soft delete via `archived` (boolean) and `archived_at` (timestamp) fields.
- Archiving cascades down the hierarchy (project → goals → streams → subjects → chapters → topics → tasks).
- Unarchiving restores only the directly targeted entity, not its children.
- Permanent delete is available only for archived items, with confirmation dialog.

---

## 15. Task Types & Custom Task Types

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| TYPE-01 | Default task types | 7 built-in types: notes, lecture, revision, practice, test, mocktest, exam. Each has an icon. |
| TYPE-02 | Custom task types | Users can create custom task types with name, icon, default duration, and base XP. |
| TYPE-03 | Exam-specific fields | Tasks of type test/mocktest/exam show additional fields: total questions, attempted, correct, wrong, marks per question, negative marking, time taken, total marks, marks obtained, accuracy, speed (QPM). |

---

## 16. Theme System

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| THEME-01 | Light mode | Clean light theme with proper contrast ratios. |
| THEME-02 | Dark mode | Full dark theme with inverted color palette. |
| THEME-03 | System mode | Follows OS/browser theme preference. |
| THEME-04 | CSS variables | All colors defined as HSL CSS variables in `index.css`. Both `:root` (light) and `.dark` (dark) themes. |
| THEME-05 | Toggle location | ThemeToggle component accessible from app header. |

---

## 17. Responsive Design

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| RESP-01 | Mobile breakpoint | `md` breakpoint (768px) switches between mobile and desktop layouts. |
| RESP-02 | Desktop | Sidebar navigation + main content area. Multi-column layouts for dashboard and analytics. |
| RESP-03 | Mobile | Bottom navigation bar + single-column layouts. Full-width cards and forms. |
| RESP-04 | Dialogs | All dialogs are responsive — full width on mobile, max-width on desktop. |
| RESP-05 | Charts | Analytics charts stack vertically on mobile. |

---

## 18. Error Handling & Edge Cases

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| ERR-01 | 404 page | `/not-found` or any unmatched route shows NotFound component. |
| ERR-02 | API errors | All mutations show error toasts with the error message from backend. |
| ERR-03 | Loading states | All data-fetching components show skeleton loading states. |
| ERR-04 | Empty states | All list views show appropriate empty state illustrations with CTAs. |
| ERR-05 | Unique constraints | Project names are unique per user (database enforced). Goals have unique name per user. Appropriate error messages on violation. |
| ERR-06 | File upload limits | Avatar: max 2MB, image files only. Backup: .json files only. |
| ERR-07 | Session expiry | When auth session expires, user is redirected to login. |

---

## 19. Performance & Optimization

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| PERF-01 | Lazy loading | Project goals are fetched only when a project card is expanded. |
| PERF-02 | Query caching | React Query caches all data with appropriate cache keys. Mutations invalidate related queries. |
| PERF-03 | Memoization | `useMemo` and `useCallback` used for expensive computations (filtering, mapping, stats calculation). |
| PERF-04 | LocalStorage | Timer state, expanded project IDs, and background job timestamps stored in localStorage for persistence. |
| PERF-05 | Background jobs | Background tasks (task status transitions, streak checks) run on timestamps to avoid redundant work. |

---

## 20. Security

| ID | Feature | Expected Behavior |
|----|---------|-------------------|
| SEC-01 | Row Level Security | All database tables have RLS policies ensuring users can only access their own data. |
| SEC-02 | Auth enforcement | All API calls use the authenticated user's session. No anonymous access to user data. |
| SEC-03 | Encrypted backups | Backup files encrypted with AES-256-GCM. Key derived from user passphrase via PBKDF2 with 100K iterations. |
| SEC-04 | Input validation | All forms use Zod schemas for client-side validation. Server-side constraints enforce data integrity. |
| SEC-05 | File upload validation | File type and size validation on avatar uploads. |

---

## 21. Test Scenarios Summary

Below is a consolidated list of user-facing test scenarios grouped by module. Use these for end-to-end testing.

### Authentication Flows
1. Sign up with valid credentials → verify email confirmation screen appears
2. Sign up with weak password → verify inline validation errors
3. Sign up with existing email → verify error toast
4. Log in with valid credentials → verify redirect to dashboard
5. Log in with wrong password → verify error toast
6. Access protected route while logged out → verify redirect to login
7. Set up profile with username + avatar → verify profile saved
8. Set up profile with taken username → verify inline error
9. Skip profile setup → verify redirect to dashboard

### Project CRUD
10. Create project with name + color → verify appears in list
11. Create project with empty name → verify validation error
12. Edit project name and color → verify changes persist
13. Archive project → verify cascade archive confirmation shows correct counts
14. Archive project → verify project and all children are archived
15. Unarchive project → verify only project is restored
16. Permanently delete archived project → verify double confirmation
17. Verify "Unassigned Goals" section shows goals without projects
18. Verify expand/collapse state persists after page refresh

### Goal CRUD
19. Create goal with project assigned → verify appears under correct project
20. Create goal without project → verify appears in "Unassigned Goals"
21. Edit goal to change project → verify goal moves between projects
22. Archive goal → verify cascade to streams/subjects/chapters/topics/tasks
23. Filter goals by project → verify correct filtering
24. Verify project badge appears on goal cards

### Task Management
25. Create task with all fields → verify saved correctly
26. Create exam-type task → verify exam-specific fields appear and save
27. Add subtasks to a task → verify subtask list
28. Mark task as done → verify status change and completed_at
29. Postpone task to new date → verify date fields update
30. Edit task → verify changes persist

### Timer
31. Start focus session → verify timer counts up
32. Pause and resume timer → verify paused time is excluded
33. Stop timer after 60+ seconds → verify session saved with toast
34. Stop timer before 60 seconds → verify session discarded with toast
35. Start Pomodoro mode → verify focus/break cycle transitions
36. Minimize timer → verify floating widget appears
37. Navigate to timer page while running → verify fullscreen mode
38. Verify only one timer can run at a time
39. Refresh page during timer → verify timer state persists

### Calendar
40. Switch between Month/Week/Day/Agenda views → verify correct data display
41. Navigate previous/next/today → verify date changes
42. Click a day in month view → verify DateTasksModal opens
43. Mark task done from calendar → verify status updates
44. Postpone task from calendar modal → verify date change
45. Filter by study session → verify tasks filtered
46. Verify adherence panel shows correct stats

### Analytics
47. Switch between Week/Month/All Time → verify charts update
48. Verify summary cards show correct data
49. Verify all 6 charts render without errors
50. Verify heatmap shows study activity

### Badges & Holidays
51. Filter badges by category → verify correct badges shown
52. Verify earned badges appear first, locked badges greyed
53. Verify badge progress bar shows correct percentage
54. Add a holiday → verify success toast and streak preservation message
55. Delete a holiday → verify confirmation dialog and removal
56. Verify holiday date restrictions (max 7 days in past)

### Settings
57. Change theme (Light/Dark/System) → verify theme applies globally
58. Change Pomodoro settings → verify timer uses new values
59. Create encrypted backup → verify file downloads
60. Restore backup with correct passphrase → verify data restored
61. Restore backup with wrong passphrase → verify "Wrong passphrase" error
62. Update profile username → verify change persists
63. Upload new avatar → verify image updates

### Responsive Design
64. Test all pages on mobile viewport (375px) → verify single-column layouts
65. Test all pages on desktop viewport (1920px) → verify multi-column layouts
66. Verify mobile bottom nav shows 5 items
67. Verify desktop sidebar shows 7 items
68. Verify all dialogs are usable on mobile

### Edge Cases
69. Project with no goals → verify empty state in expanded card
70. Goals with no tasks → verify 0/0 tasks, 0% progress
71. Moving a goal between projects → verify stats recalculate
72. Archiving already archived item → should be no-op
73. Concurrent timer sessions → verify single-timer enforcement
74. Very long task/project names → verify text truncation
75. Rapid button clicks → verify no duplicate submissions (disabled during loading)

---

## 22. Application Routes

| Route | Page | Auth Required |
|-------|------|---------------|
| `/login` | LoginPage | No |
| `/signup` | SignupPage | No |
| `/profile-setup` | ProfileSetupPage | Yes |
| `/` | Dashboard | Yes |
| `/calendar` | CalendarPage | Yes |
| `/analytics` | AnalyticsPage | Yes |
| `/projects` | ProjectsPage | Yes |
| `/goals` | GoalsPage | Yes |
| `/settings` | SettingsPage | Yes |
| `/timer` | TimerPage | Yes |
| `/badges` | BadgesPage | Yes |
| `*` | NotFound (404) | No |

---

## 23. Environment & Configuration

- **Supabase URL:** Configured via `src/lib/supabase.ts`
- **Supabase Anon Key:** Configured via `src/lib/supabase.ts`
- **Storage Bucket:** `avatars` (public, for profile pictures)
- **Theme:** Managed by `next-themes` ThemeProvider with `class` attribute strategy

---

*Document generated: February 2026*  
*Last updated: v1.0 — Full feature set including Projects module*
