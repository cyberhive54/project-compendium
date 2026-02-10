

# Edit 03 -- Major Enhancements Plan

This plan covers 39 enhancement items from `enhancements.txt`, broken down into **14 main features** with lettered sub-features. Each main feature is grouped by domain. The plan document will be created at `docs/edit-03-major-plan.md`.

---

## Feature 1: Storage and Profile Picture Fix

**Problem:** The avatars storage bucket SQL exists (`sql/019_create_storage_bucket.sql`) but was never actually created in Supabase.

a. Run the storage bucket SQL in Supabase to create the `avatars` bucket with proper RLS policies
b. Verify upload/download works from `SignupPage.tsx` and `ProfileSettings.tsx`

**SQL required:** Execute `sql/019_create_storage_bucket.sql` manually in Supabase SQL editor.

---

## Feature 2: Modal Spacing Fix

**Problem:** All modals/dialogs sit too close to top and bottom edges.

a. Update the global `DialogContent` component (`src/components/ui/dialog.tsx`) to add vertical margin/padding -- add `my-4` or `py-4` to ensure breathing room at top and bottom edges
b. This single change applies to all dialogs app-wide (GoalFormDialog, TaskFormDialog, ArchiveConfirmDialog, HierarchyItemForm, AddGoalToProjectDialog, etc.)

**Files:** `src/components/ui/dialog.tsx`

---

## Feature 3: Backup and Restore Enhancement

**Problem:** Restore function is broken, needs loader states, feedback, and modal-based UX. Must include all new fields.

a. **Move restore to a modal:** Replace the inline file-upload restore with a proper `Dialog` that shows: file selection, passphrase input, progress steps, and results summary
b. **Add loading states:** Show a multi-step progress indicator during restore (Decrypting -> Validating -> Restoring table X of Y -> Complete)
c. **Add proper feedback:** Show per-table success/failure counts, total restored records, and any errors in a summary card after completion
d. **Update table list:** Add missing tables to backup/restore: `subtasks`, `study_sessions_config`, `user_badges`, `backups_metadata`, and any new tables (journals, feature_requests, etc.)
e. **Add backup metadata:** Record backup timestamp, version, and table counts in the exported file for validation before restore

**Files:** `src/components/settings/DataManagement.tsx` (major rewrite), new `src/components/settings/RestoreBackupDialog.tsx`

---

## Feature 4: Holidays Page with Partial Holidays

**Problem:** Holidays are currently embedded in the Badges page. Need a dedicated page with CRUD, partial holidays, search, and sort.

a. **New page `/holidays`:** Move holiday management from `BadgesPage.tsx` to a dedicated `src/pages/HolidaysPage.tsx`
b. **Full CRUD:** Add, edit, delete holidays with proper form dialog
c. **Partial holidays feature:** Add a `study_percentage` field (0-100) to holidays table. A partial holiday means the user plans to study a fraction of the normal day (e.g., 50%). Streak calculation considers partial holidays differently -- if `study_percentage > 0`, user needs to complete that percentage of planned study to maintain streak
d. **Search:** Filter holidays by date range, type, or reason text
e. **Sort by:** Date (asc/desc), type, creation date
f. **Update sidebar & mobile nav** to include Holidays link

**SQL required:**
```sql
ALTER TABLE holidays ADD COLUMN study_percentage INTEGER DEFAULT 0 CHECK (study_percentage >= 0 AND study_percentage <= 100);
ALTER TABLE holidays ADD COLUMN is_partial BOOLEAN GENERATED ALWAYS AS (study_percentage > 0) STORED;
```

**Files:** New `src/pages/HolidaysPage.tsx`, update `src/hooks/useHolidays.ts`, update `sql/013_create_holidays.sql`, update sidebar/nav, update `src/lib/gamificationService.ts` (streak logic)

---

## Feature 5: Admin System

**Problem:** No admin panel exists. Need admin auth, badge management, and multi-level badge system.

a. **Admin auth at `/admin/auth`:** Separate login page for admins. Admin users are identified by an `is_admin` flag in `user_profiles` or a separate `admin_users` table. Admin login uses the same Supabase auth but checks the admin flag post-login
b. **Admin layout at `/admin`:** Protected by admin auth check. Sidebar with: Dashboard, Badges, (future: Users, Reports)
c. **Admin badge management at `/admin/badges`:** Full CRUD for badges. Admin can create, edit, delete badges. Each badge has: name, description, icon, category, tier, XP reward, and unlock conditions (JSONB)
d. **Multi-level badge system:** Replace the flat badge structure with levels per badge. A badge can have 2-5 levels, each with increasing unlock conditions. Example: "Top Scorer" -- Level 1 (80% once), Level 2 (90% once), Level 3 (95% once), Level 4 (90% x3 times), Level 5 (95% x3 times)
e. **Default badges:** Seed existing badges as defaults that cannot be deleted but can be edited by admin
f. **Update badge checking engine:** `src/lib/gamificationService.ts` must evaluate multi-level conditions (threshold + count requirements)
g. **Update user-facing badge display:** `BadgesPage.tsx` and `BadgeCard.tsx` show level indicators (Level 1/5, progress to next level)

**SQL required:**
```sql
-- New badges schema with levels
ALTER TABLE badges ADD COLUMN is_default BOOLEAN DEFAULT FALSE;
ALTER TABLE badges ADD COLUMN levels JSONB DEFAULT '[]';
-- levels example: [{"level": 1, "threshold": 80, "count": 1}, {"level": 2, "threshold": 90, "count": 1}, ...]

-- Admin flag
ALTER TABLE user_profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- user_badges tracks which level was achieved
ALTER TABLE user_badges ADD COLUMN badge_level INTEGER DEFAULT 1;
```

**New files:** `src/pages/admin/AdminAuth.tsx`, `src/pages/admin/AdminLayout.tsx`, `src/pages/admin/AdminDashboard.tsx`, `src/pages/admin/AdminBadges.tsx`, `src/components/admin/BadgeFormDialog.tsx`, `src/components/admin/BadgeLevelEditor.tsx`, `src/hooks/useAdminAuth.ts`

**Modified files:** `src/App.tsx` (admin routes), `src/lib/gamificationService.ts`, `src/pages/BadgesPage.tsx`, `src/components/gamification/BadgeCard.tsx`, `sql/015_create_badges.sql`

---

## Feature 6: Dedicated Tasks Page and Task Detail Page

**Problem:** Tasks are embedded in the Goals page tab. Need a standalone tasks page with advanced filtering and a task detail page.

a. **Tasks page at `/tasks`:** Standalone page with:
   - Search bar (search by task name)
   - Pagination (20 tasks per page)
   - Sort by: priority, date, name, status, created date
   - Filters: project, goal, stream, subject, chapter, topic, status, date range
   - Special filter: task type -- selecting a task type shows sub-filters specific to that type (e.g., exam types show accuracy range filter, score range, etc.)
b. **Task detail page at `/tasks/:taskId`:** Shows:
   - Full parent hierarchy breadcrumb (Project > Goal > Stream > Subject > Chapter > Topic)
   - Task details card (name, description, type, priority, status, dates)
   - Timer sessions associated with this task (from `timer_sessions` table)
   - Action buttons: change status, edit, delete, postpone, start timer (direct or pomodoro options)
   - Exam results section (if exam type) with marks, accuracy, time analysis
c. **Task status change from detail page:** Status dropdown with transitions (scheduled -> pending -> in_progress -> done)
d. **Start timer from detail page:** Two buttons -- "Focus Timer" and "Pomodoro" -- both navigate to `/timer` with `taskId` in state

**New files:** `src/pages/TasksPage.tsx`, `src/pages/TaskDetailPage.tsx`
**Modified files:** `src/App.tsx` (routes), sidebar/nav

---

## Feature 7: Task Creation and Completion Enhancements

**Problem:** Exam fields shown during task creation instead of completion. Need session-based task creation and task-type-specific completion modals.

a. **Move exam fields to completion:** Remove exam fields (`ExamFields` component) from `TaskFormDialog`. Instead, show them in a "Mark Complete" dialog that appears when marking a task as done
b. **Task completion modal per type:** When marking any task complete, a modal appears with fields based on task type:
   - **Lecture/Notes/Revision:** If no timer session was used: start time and duration fields
   - **Test/Exam/Question Practice/Mock Test:** Same as above plus: analysis toggle. If yes: total questions, attempted, correct (wrong and skipped auto-calculated), marks/question, negative marking, time taken. Marks, percentage, accuracy are auto-calculated and saved
c. **Session inheritance in task creation:** Add a dropdown in `TaskFormDialog` to optionally select an existing study session. When selected, the session's start/end times are inherited as the task's scheduled time and duration
d. **Custom task types in settings:** Allow users to create/edit/delete custom task types in `SettingsPage.tsx` (already partially exists in `StudySessionsSettings`). Each custom type specifies whether it's "exam-like" (needs analysis fields on completion) or "simple" (just time tracking)

**New files:** `src/components/tasks/TaskCompletionDialog.tsx`
**Modified files:** `src/components/tasks/TaskFormDialog.tsx`, `src/components/tasks/ExamFields.tsx`, `src/hooks/useTasks.ts` (markDone flow), `src/components/settings/StudySessionsSettings.tsx`

---

## Feature 8: Goal Page and Goal Detail Page Enhancements

**Problem:** Goal page needs more filters. Goal detail page needs hierarchy-scoped task display and inline edit/delete for hierarchy items.

a. **Goal page filters:** Add search input, project filter (already exists), date range filter (filter goals by target_date range), and start/end date fields for goals
b. **Goal schema update:** Add `start_date` and `end_date` to goals table (max constrained to parent project's start/end date if project has one)
c. **Project schema update:** Add `start_date` and `end_date` to projects table
d. **Scoped task display on goal detail:** Instead of showing all tasks by default, only show tasks for the selected topic (or chapter if no topic selected, etc.). Tasks cascade with hierarchy selection: select a stream -> subjects shown -> select subject -> chapters shown -> select chapter -> topics shown -> select topic -> tasks for that topic shown
e. **Inline edit/delete on hierarchy items:** On right-click, long-press, or double-click on any stream/subject/chapter/topic card, show a mini context menu with Edit and Delete options. Delete shows a confirmation dialog with count of child items that will be deleted
f. **Task card navigation:** Clicking any task in goal detail redirects to `/tasks/:taskId`

**SQL required:**
```sql
ALTER TABLE goals ADD COLUMN start_date DATE;
ALTER TABLE projects ADD COLUMN start_date DATE;
ALTER TABLE projects ADD COLUMN end_date DATE;
```

**Modified files:** `src/pages/Goals.tsx`, `src/pages/GoalDetailPage.tsx`, `src/components/goals/GoalDetailContent.tsx`, `src/components/goals/GoalFormDialog.tsx`, `src/types/database.ts`, `sql/003_create_projects.sql`, `sql/004_create_goals.sql`

---

## Feature 9: Journal System

**Problem:** No journaling feature exists.

a. **Journal page at `/journal`:** A page for daily study journaling
b. **Journal entry form:** Large text area to write about the day's study experience. One entry per date (enforced by unique constraint on `user_id + date`)
c. **Journal history:** List of past entries with date headers, filterable by date range
d. **Journal schema:**

```sql
CREATE TABLE journals (
  journal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

**New files:** `src/pages/JournalPage.tsx`, `src/hooks/useJournals.ts`
**Modified files:** `src/App.tsx`, sidebar/nav

---

## Feature 10: Timer and Pomodoro Enhancements

**Problem:** Task list ordering is random. Need pause time tracking, fullscreen distraction-free mode, and pomodoro session integration.

a. **Task list ordering in timer:** Sort tasks in TaskSelectDialog: today's tasks first, then previous days' uncompleted tasks, then next days' tasks
b. **Pause time recording:** When user clicks pause, start a separate pause timer. Record pause durations separately in `timer_sessions.paused_duration_seconds` (already exists in schema)
c. **Fullscreen distraction-free modal:** A 100% width/height modal with: task name, large timer display, pause button, break button, resize/exit button. Pure focus mode with no navigation visible
d. **Pomodoro session integration with tasks:** If a task is linked to a session, adjust pomodoro phases accordingly
e. **Day start time setting:** Allow users to set their study day start time in settings (e.g., "My day starts at 6 AM"). This affects which tasks show as "today's tasks" and when streaks reset

**New files:** `src/components/timer/FullscreenTimerModal.tsx`
**Modified files:** `src/components/timer/TaskSelectDialog.tsx`, `src/pages/TimerPage.tsx`, `src/stores/timerStore.ts`, `src/components/settings/StudySessionsSettings.tsx`

---

## Feature 11: Hierarchy Management Page and Syllabus Import

**Problem:** No standalone page to manage streams/subjects/chapters/topics. Need syllabus import via JSON.

a. **Hierarchy page at `/hierarchy`:** Tabbed view for Streams, Subjects, Chapters, Topics with pagination, search, and contextual filters. Each tab shows items in a paginated table/grid with right-click/long-press/double-click edit and delete (same pattern as goal detail page)
b. **Syllabus import at `/import`:** Upload a `.json` file that contains the full hierarchy (goal, streams, subjects, chapters, topics) minus project and tasks. On upload:
   - Parse and validate the JSON structure
   - Show a preview that looks exactly like the goal detail page (with all hierarchy items)
   - Ask for goal target date / start-end dates
   - "Import" button creates everything in the database
c. **JSON format spec:** Define a standard JSON schema for syllabus files

**New files:** `src/pages/HierarchyPage.tsx`, `src/pages/SyllabusImportPage.tsx`
**Modified files:** `src/App.tsx`, sidebar/nav

---

## Feature 12: Sidebar, Dashboard, and Navigation Overhaul

**Problem:** Sidebar needs all pages, independent scrolling, collapse/expand behavior. Dashboard needs layout changes.

a. **Sidebar updates:**
   - Add all new pages: Tasks, Holidays, Journal, Hierarchy, Import, Help
   - Move hamburger/trigger icon INTO the sidebar itself
   - Sidebar scrolls independently from main content (CSS `overflow-y-auto` on sidebar, separate scroll context)
   - Collapse to icon-only via button (already supported by `SidebarProvider`), ensure expand button is visible
b. **Dashboard changes:**
   - Remove Welcome Banner card completely
   - Stats card updates: "Time Studied" becomes "Study Time" showing `X hours` (bold) `of planned Y hours` (small). Card border is partially colored green based on completion percentage. "Tasks Done" same border logic. "Adherence" becomes "Discipline Score" (7-day rolling calculation)
   - Show XP alongside Level in the top-right user dropdown
   - Add calendar day view grid (same as Calendar day view) after stats cards
   - Add "Today's Tasks" agenda view sidebar
   - Keep "Upcoming Tasks (next 7 days)" and "Active Goals" sections
c. **Account delete:** In Settings, add account deletion with: confirmation dialog, type a phrase (e.g., "DELETE MY ACCOUNT"), enter password, then wipe all user data from database and delete auth account

**Modified files:** `src/components/layout/AppSidebar.tsx`, `src/components/layout/MobileBottomNav.tsx`, `src/pages/Dashboard.tsx`, `src/components/dashboard/QuickStatsCards.tsx`, `src/components/dashboard/WelcomeBanner.tsx` (remove), `src/components/layout/AppHeader.tsx`, `src/components/settings/ProfileSettings.tsx` or new `src/components/settings/AccountSettings.tsx`

---

## Feature 13: Calendar Page Enhancements

**Problem:** Calendar needs project/goal scoping, improved views, and task completion modals.

a. **Project/Goal scope filter:** Add a project and goal selector at the top of the calendar page. All data filters to the selected scope
b. **Month view:** Remove task-add option from date cell click modal. Timer icon in modal gives two options: "Pomodoro" or "Direct Timer". Mark complete triggers the task-type-specific completion modal (Feature 7b)
c. **Week view:** Fix width of weekday columns so they don't overflow vertically. Show sessions and tasks in their respective day cells
d. **Day view redesign:** Change to a 6x5 grid of 30 hour-cells (3 previous days + current day + 3 next days). Active hours highlighted. Cell background colored by session colors. If multiple sessions in one hour, cell is horizontally divided. Task bars run across cells showing scheduled duration, clickable to navigate to task detail
e. **Agenda view:** Add view range options: Day (today/tomorrow/yesterday/selected date), Week (this/next/previous/next 7 days), Month (this/next/previous/next 30 days), Custom (date range picker bounded by project dates)
f. **Adherence section:** Updates with above selections. Add a summary card showing total tasks, completed, total study hours, and other metrics
g. **Current date cell highlight:** Ensure today's date is always visually highlighted in all views

**Modified files:** `src/pages/Calendar.tsx`, `src/components/calendar/CalendarMonthView.tsx`, `src/components/calendar/CalendarWeekView.tsx`, `src/components/calendar/CalendarDayView.tsx`, `src/components/calendar/CalendarAgendaView.tsx`, `src/components/calendar/DateTasksModal.tsx`, `src/components/calendar/AdherencePanel.tsx`

---

## Feature 14: Analytics, Features/Bug Reporting, and Help Pages

**Problem:** Analytics needs hierarchy scoping. No feedback system or help page exists.

a. **Scoped analytics:** Add project/goal/stream/subject/chapter/topic filter cascade on the analytics page. When a scope is selected, all charts and metrics filter to that scope. Different metrics for different hierarchy levels (e.g., topic-level shows task completion, exam scores; project-level shows overall time distribution, goal progress)
b. **Task type analytics:** Add analytics for task types -- time per type, completion rate per type, exam performance trends
c. **Session analytics:** Add timer session analytics -- average session duration, sessions per day trend, best focus times

d. **Features & Bug reporting page at `/feedback`:**
   - Form to submit: title, description, page-specific or general, image upload (max 5MB, supports clipboard paste via Ctrl+V)
   - List of all feature requests and bug reports (own + others)
   - Status indicators (submitted, in review, planned, resolved)

e. **Help page at `/help`:** Comprehensive documentation page covering:
   - How to use each feature
   - Description of all pages
   - Step-by-step guides for common workflows
   - FAQ section
   - All content is static/hardcoded (no database needed)

**New files:** `src/pages/FeedbackPage.tsx`, `src/pages/HelpPage.tsx`, `src/hooks/useFeedback.ts`

**SQL required:**
```sql
CREATE TABLE feedback (
  feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('feature', 'bug')),
  page VARCHAR(100),
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'planned', 'resolved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Modified files:** `src/pages/Analytics.tsx`, `src/hooks/useAnalyticsData.ts`, `src/App.tsx`, sidebar/nav

---

## Feature 15: Task Templates

**Problem:** Creating repetitive tasks daily is tedious. Templates allow pre-scheduling.

a. **Template system:** Users create a task template with: name pattern (with variables like `{chapter}`, `{date}`), task type, priority, estimated duration, and a schedule (date range + time)
b. **Template application:** When a template is active for a date range, tasks are auto-generated or shown as suggestions that the user confirms with just a name entry
c. **Template management:** In Settings or a dedicated section, users can create/edit/delete templates

**SQL required:**
```sql
CREATE TABLE task_templates (
  template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  goal_id UUID REFERENCES goals(goal_id) ON DELETE SET NULL,
  task_type VARCHAR(50) DEFAULT 'study',
  priority_number INTEGER DEFAULT 1000,
  estimated_duration INTEGER,
  schedule_start DATE,
  schedule_end DATE,
  recurrence VARCHAR(20) DEFAULT 'daily',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**New files:** `src/components/tasks/TaskTemplateDialog.tsx`, `src/hooks/useTaskTemplates.ts`

---

## Feature 16: Google Login

**Problem:** Currently a mockup button. Need real Google OAuth.

a. **Enable Google provider in Supabase Auth settings** (manual step in Supabase dashboard)
b. **Update login/signup pages:** Replace mockup Google button with real `supabase.auth.signInWithOAuth({ provider: 'google' })`
c. **Post-Google-login redirect:** After Google login, if the user's profile has a default `user_` username, redirect to a profile setup page for username and avatar selection
d. **Handle edge cases:** User signs up with email, then tries Google with same email -- should link accounts or show proper error

**Modified files:** `src/pages/LoginPage.tsx`, `src/pages/SignupPage.tsx`, `src/hooks/useAuth.tsx`

---

## Implementation Order (Recommended Phases)

Due to the massive scope, this should be implemented in phases:

**Phase A -- Quick Fixes (Features 1, 2, 3):**
Storage fix, modal spacing, backup/restore enhancement

**Phase B -- Core Pages (Features 4, 6, 9):**
Holidays page, Tasks page + detail, Journal

**Phase C -- Task & Goal Enhancements (Features 7, 8):**
Task completion modals, goal detail redesign, hierarchy editing

**Phase D -- Admin & Badges (Feature 5):**
Admin system, multi-level badges

**Phase E -- Timer & Templates (Features 10, 15):**
Timer improvements, fullscreen mode, task templates

**Phase F -- Navigation & Dashboard (Feature 12):**
Sidebar overhaul, dashboard redesign, account delete

**Phase G -- Calendar (Feature 13):**
All calendar view enhancements

**Phase H -- Analytics & Utilities (Features 11, 14, 16):**
Hierarchy page, syllabus import, scoped analytics, feedback, help, Google login

---

## SQL Migrations Summary

New SQL files needed:
- `sql/020_add_holiday_partial.sql` -- partial holidays
- `sql/021_add_admin_and_badge_levels.sql` -- admin flag, badge levels
- `sql/022_add_project_goal_dates.sql` -- start/end dates
- `sql/023_create_journals.sql` -- journal table
- `sql/024_create_feedback.sql` -- feedback table
- `sql/025_create_task_templates.sql` -- templates table
- `sql/026_update_rls_policies.sql` -- RLS for new tables

## New Pages Summary

| Route | Page | Feature |
|-------|------|---------|
| `/tasks` | TasksPage | 6a |
| `/tasks/:taskId` | TaskDetailPage | 6b |
| `/holidays` | HolidaysPage | 4a |
| `/journal` | JournalPage | 9a |
| `/hierarchy` | HierarchyPage | 11a |
| `/import` | SyllabusImportPage | 11b |
| `/feedback` | FeedbackPage | 14d |
| `/help` | HelpPage | 14e |
| `/admin/auth` | AdminAuth | 5a |
| `/admin` | AdminDashboard | 5b |
| `/admin/badges` | AdminBadges | 5c |

