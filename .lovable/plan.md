

# Edit 01 - Tweaks and Feature Additions Plan

## Overview

This plan covers 15 items spanning authentication improvements, timer UX fixes, offline indicator redesign, goal form bug fix, hierarchy detail pages with intuitive UI, and per-project/goal analytics. Items are grouped into logical phases.

---

## Phase 1: Authentication & Onboarding Improvements

### 1.1 Move Username + Avatar to Signup Page (Items #1, #7)

**Current state:** Signup page collects only email + password. A separate `/profile-setup` page handles username + avatar upload.

**Changes:**
- **`src/pages/SignupPage.tsx`** -- Add `username` field (3-20 chars, letters/numbers/underscores, Zod validated) and avatar upload circle (reuse the same pattern from `ProfileSetupPage.tsx`) directly into the signup form, above the email field
- Avatar file size limit: **2MB** (already enforced in ProfileSetupPage, will carry over)
- On submit: call `signUp()` first, then update `user_profiles` with the chosen username and upload avatar to `avatars` bucket
- Since Supabase auto-creates the profile via the `handle_new_user()` trigger with a default `user_` username, the signup flow will update that profile immediately after auth signup succeeds
- **`src/pages/ProfileSetupPage.tsx`** -- Keep the file but it becomes a simple redirect. Users who already signed up without setting username (legacy) can still access it from Settings
- **`src/App.tsx`** -- Remove the dedicated `/profile-setup` route (or redirect it to `/settings`)
- **`src/components/layout/AppHeader.tsx`** -- Change "Edit Profile" link from `/profile-setup` to navigate to `/settings` with profile tab active

### 1.2 Remember Me (Item #2)

**Current state:** Supabase JS client uses default session persistence (localStorage, no expiry control).

**Changes:**
- **`src/pages/LoginPage.tsx`** -- Add a "Remember me" checkbox below the password field
- **`src/hooks/useAuth.tsx`** -- When "Remember me" is NOT checked, after successful sign-in, store a `login_timestamp` in localStorage. In the `onAuthStateChange` listener, check if the timestamp is older than 3 days and auto-sign-out if so
- When "Remember me" IS checked, no timestamp is stored (session persists normally via Supabase defaults)
- On app load (in AuthProvider useEffect), check if `login_timestamp` exists and is > 3 days old, and call `signOut()` if expired

### 1.3 Email Verification Conditional Display (Item #3)

**Current state:** After signup, the app always shows "Check your email" confirmation screen regardless of whether email verification is enabled in Supabase.

**Changes:**
- **`src/pages/SignupPage.tsx`** -- After `signUp()`, check the response. If `data.user` exists and `data.user.email_confirmed_at` is already set (or `data.session` is immediately returned), it means email verification is disabled -- skip the "check email" screen and redirect to dashboard. Only show the email verification screen when `data.session` is null (meaning confirmation is pending)
- This makes the flow adaptive: verification screen only appears when Supabase email confirmation is turned on

### 1.4 Duplicate Email Handling (Item #4)

**Current state:** On signup, duplicate email shows a generic Supabase error message.

**Changes:**
- **`src/pages/SignupPage.tsx`** -- In the `onSubmit` error handler, detect the Supabase error for duplicate email (error message contains "User already registered" or similar). Display a custom toast/error message: "This email is already registered. Please sign in or reset your password."
- Add inline links to `/login` and to the forgot password page within the error message
- **`src/pages/LoginPage.tsx`** -- Similarly, improve "Invalid login credentials" error to say: "Incorrect email or password. Forgot your password?" with a link to the reset page

### 1.5 Forgot Password (Item #5)

**Current state:** No forgot/reset password flow exists.

**Changes:**
- **New file: `src/pages/ForgotPasswordPage.tsx`** -- A simple page with an email input. Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })`. Shows confirmation message after sending
- **New file: `src/pages/ResetPasswordPage.tsx`** -- Handles the redirect from the Supabase email link. Extracts the token from URL hash/params, then shows a "New Password" + "Confirm Password" form. Calls `supabase.auth.updateUser({ password })` to set the new password
- **`src/App.tsx`** -- Add routes: `/forgot-password` and `/reset-password` (public, not protected)
- **`src/pages/LoginPage.tsx`** -- Add "Forgot password?" link below the password field, linking to `/forgot-password`

### 1.6 Reset Password in Settings (Item #6)

**Current state:** Settings has a Profile tab but no password change option.

**Changes:**
- **`src/components/settings/ProfileSettings.tsx`** -- Add a "Change Password" section below the email field. Contains: Current password (not strictly needed with Supabase, but good UX), New Password, Confirm New Password inputs. Submit calls `supabase.auth.updateUser({ password: newPassword })`. Show success/error toast
- Add Zod validation matching signup rules (8+ chars, uppercase, lowercase, number)

---

## Phase 2: Timer UX Improvements

### 2.1 Auto-Minimize Timer on Page Navigation (Item #8)

**Current state:** When a timer is running and user navigates away from `/timer`, the `FloatingTimer` shows in the corner (if `isMinimized` is true). But `isMinimized` is only set when user clicks "Minimize" manually. When the timer starts, `isFullscreen: true, isMinimized: false` is set.

**Changes:**
- **`src/pages/TimerPage.tsx`** -- Add a `useEffect` cleanup that sets `setMinimized(true)` when the user navigates AWAY from the timer page (i.e., when the component unmounts while a timer is running)
- This ensures that whenever a user leaves the timer page with an active timer, it automatically appears as the floating minimized timer on all other pages

### 2.2 Start Timer with Pre-Selected Task (Item #9)

**Current state:** Calendar and Dashboard pass `taskId` via `navigate("/timer", { state: { taskId } })`, but `TimerPage` never reads `location.state` -- it always opens the TaskSelectDialog for manual selection.

**Changes:**
- **`src/pages/TimerPage.tsx`** -- Read `location.state?.taskId` on mount. If a valid `taskId` is present:
  1. Look up the task name from the tasks query
  2. Auto-start the timer with that task (call `startTimer(taskId, taskName, false)`)
  3. Skip the TaskSelectDialog entirely
- **`src/components/dashboard/TodaysTasks.tsx`** -- Update `onStartTimer` to pass the `task.task_id` to the navigation state (currently it just navigates to `/timer` without the task ID)
- **`src/components/tasks/TaskCard.tsx`** -- Add a "Start Timer" option in the dropdown menu that navigates to `/timer` with the task ID in state

---

## Phase 3: UI Polish

### 3.1 Offline Indicator Redesign (Item #10)

**Current state:** A full-width yellow banner at the top of the screen showing "You're offline" text.

**Changes:**
- **`src/components/layout/OfflineIndicator.tsx`** -- Replace the banner with a small `WifiOff` icon in the header area (or fixed position). On hover or click, show a tooltip/popover with the message "You're offline -- changes will sync when connection is restored"
- Use Radix `Tooltip` component for the hover behavior
- Icon should be subtle but noticeable (e.g., amber/warning colored)

### 3.2 Fix Goal Date Validation Error (Item #11)

**Current state:** The `GoalFormDialog` sends an empty string `""` for `target_date` when the date field is not filled. The database expects either a valid date or `null`, causing "invalid input syntax for type date" error.

**Changes:**
- **`src/components/goals/GoalFormDialog.tsx`** -- In the `handleSubmit` function, convert empty `target_date` string to `null` before passing to the mutation. Add: `target_date: rest.target_date || null`
- Also update the Zod schema to transform empty string to undefined: `target_date: z.string().optional().transform(v => v || undefined)`

---

## Phase 4: Goal Dialog Enhancement (Item #12)

### 4.1 Tabbed Create/Add Existing Goals in Project Context

**Current state:** When clicking "+ Goal" on a ProjectCard, it always opens `GoalFormDialog` to create a new goal.

**Changes:**
- **New file: `src/components/projects/AddGoalToProjectDialog.tsx`** -- A dialog with two tabs:
  - **"Create New" tab**: Renders the existing `GoalFormDialog` form content (project pre-selected)
  - **"Add Existing" tab**: Shows a list of unassigned goals (goals with `project_id = null`) with checkboxes. User can select one or more goals and click "Add to Project" which updates their `project_id`
- **`src/pages/ProjectsPage.tsx`** -- Replace the `GoalFormDialog` usage for project-context goal creation with the new `AddGoalToProjectDialog`
- The standalone "+ Goal" button on the Goals page continues to use the simple `GoalFormDialog`

---

## Phase 5: Dedicated Project and Goal Detail Pages (Items #13, #14)

### 5.1 Project Detail Page

**New file: `src/pages/ProjectDetailPage.tsx`**

A full page for a single project accessed via `/projects/:projectId`.

**Layout:**
- Header section: Project icon, name, description, color accent, edit/archive action buttons
- Stats bar: Goal count, task completion (done/total), overall progress percentage + progress bar
- Full hierarchy section with excellent UX for adding items at any level:
  - Goals listed as expandable cards
  - Each Goal expands to show Streams, and the Subject > Chapter > Topic tree (reusing `HierarchyTree`)
  - Prominent "+ Goal" button at the top, and "+ Task" buttons at each goal level
- **Key UX principle**: Every level in the hierarchy has a clearly visible "+" button to add children directly. No need to navigate elsewhere
- Bottom section: Per-project analytics summary (see Phase 6)

**Navigation:**
- Clicking a `ProjectCard` on `/projects` navigates to `/projects/:projectId`
- Breadcrumb: Projects > {Project Name}

### 5.2 Goal Detail Page

**New file: `src/pages/GoalDetailPage.tsx`**

A full page for a single goal accessed via `/goals/:goalId`.

**Layout:**
- Header: Goal icon, name, type badge, project badge (if assigned), target date, description, edit/archive buttons
- Full hierarchy tree below the header showing the complete subtree:
  - Streams section (with "+ Stream" button)
  - Subjects section (with "+ Subject" button)
  - Each Subject expands to Chapters > Topics
  - Tasks section at the bottom (with "+ Task" button)
- Each hierarchy level has inline "+" buttons for adding children at that exact position
- The UX focus: A user can land on a Goal page and immediately add a Subject, then add Chapters under it, then Topics under those chapters -- all without leaving the page
- Bottom section: Per-goal analytics summary (see Phase 6)

**Navigation:**
- Clicking a `GoalCard` anywhere navigates to `/goals/:goalId`
- Breadcrumb: Projects > {Project Name} > {Goal Name} (or Goals > {Goal Name} if unassigned)

### 5.3 Router Updates

**`src/App.tsx`:**
- Add route: `/projects/:projectId` -> `ProjectDetailPage`
- Add route: `/goals/:goalId` -> `GoalDetailPage`
- Both inside the protected `AppLayout` group

### 5.4 Card Click Navigation

- **`src/components/projects/ProjectCard.tsx`** -- Make the project name/icon area clickable, navigating to `/projects/:projectId`. Action buttons (edit, archive, etc.) use `stopPropagation()` to prevent navigation
- **`src/components/goals/GoalCard.tsx`** -- Make the goal name/icon area clickable, navigating to `/goals/:goalId`. Action buttons use `stopPropagation()`
- Both cards remain functional on the listing pages (Projects page, Goals page) with existing expand/collapse behavior, but clicking the title area navigates to the detail page

---

## Phase 6: Per-Project and Per-Goal Analytics (Item #15)

### 6.1 Analytics Components

**New file: `src/components/analytics/ProjectAnalytics.tsx`**

Compact analytics panel for a single project, shown on the project detail page:
- Total study time across all project goals (from `timer_sessions` where task's goal belongs to this project)
- Task completion rate (done/total tasks)
- Average accuracy across exam-type tasks
- Mini study heatmap filtered to project goals
- Subject-wise time distribution within the project

**New file: `src/components/analytics/GoalAnalytics.tsx`**

Compact analytics panel for a single goal, shown on the goal detail page:
- Total study time for this goal's tasks
- Task completion rate
- Score trend chart (for exam-type tasks under this goal)
- Subject-wise breakdown within this goal
- Average accuracy

### 6.2 Analytics Hook Updates

**`src/hooks/useAnalyticsData.ts`** -- Add new query hooks:
- `useProjectAnalytics(projectId)` -- Fetches timer sessions and tasks scoped to goals under a specific project
- `useGoalAnalytics(goalId)` -- Fetches timer sessions and tasks scoped to a specific goal
- Both return the same shape as existing analytics (summary cards, score trend, subject performance) but filtered to the entity scope

---

## Technical Details: File Changes Summary

**New files (6):**
- `src/pages/ForgotPasswordPage.tsx`
- `src/pages/ResetPasswordPage.tsx`
- `src/pages/ProjectDetailPage.tsx`
- `src/pages/GoalDetailPage.tsx`
- `src/components/projects/AddGoalToProjectDialog.tsx`
- `src/components/analytics/ProjectAnalytics.tsx`
- `src/components/analytics/GoalAnalytics.tsx`

**Modified files (12):**
- `src/pages/SignupPage.tsx` -- Add username + avatar fields, adaptive email verification check
- `src/pages/LoginPage.tsx` -- Add "Remember me" checkbox, "Forgot password?" link, better error messages
- `src/hooks/useAuth.tsx` -- Add remember-me expiry logic (3-day check)
- `src/lib/supabase.ts` -- No changes needed (Supabase built-in reset works with current client)
- `src/App.tsx` -- Add routes for forgot-password, reset-password, project detail, goal detail; remove/redirect profile-setup
- `src/components/settings/ProfileSettings.tsx` -- Add "Change Password" section
- `src/pages/TimerPage.tsx` -- Read `location.state.taskId` for auto-start; auto-minimize on unmount
- `src/components/dashboard/TodaysTasks.tsx` -- Pass task ID in navigation state for timer
- `src/components/tasks/TaskCard.tsx` -- Add "Start Timer" dropdown option
- `src/components/layout/OfflineIndicator.tsx` -- Replace banner with icon + tooltip
- `src/components/goals/GoalFormDialog.tsx` -- Fix empty date -> null conversion
- `src/pages/ProjectsPage.tsx` -- Use `AddGoalToProjectDialog`, make cards navigate to detail pages
- `src/components/projects/ProjectCard.tsx` -- Make name clickable for navigation
- `src/components/goals/GoalCard.tsx` -- Make name clickable for navigation
- `src/components/layout/AppHeader.tsx` -- Update "Edit Profile" to go to Settings
- `src/hooks/useAnalyticsData.ts` -- Add project/goal-scoped analytics hooks

---

## Edge Cases

1. **Signup with username conflict**: Check username uniqueness before completing signup. If taken, show inline error without losing email/password
2. **Avatar upload failure during signup**: Username is set first, avatar upload is best-effort. If upload fails, user can set avatar later from Settings
3. **Remember me expiry**: If session token is expired by Supabase before 3 days, the user is signed out regardless
4. **Timer auto-start with invalid taskId**: If `location.state.taskId` references a deleted/archived task, show a toast and fall back to the task select dialog
5. **Empty goal target_date**: Convert `""` to `null` to prevent Postgres type error
6. **Project/Goal detail page 404**: If the ID in the URL doesn't match any record, show a "Not Found" state with a link back to the listing page
7. **Offline indicator**: The icon should animate/pulse briefly when transitioning from online to offline to catch user attention
8. **Add Existing Goals dialog**: Only show unassigned goals (project_id = null). If none exist, show empty state with "All goals are assigned" message

---

## Implementation Order

1. Goal form date bug fix (quick win, Item #11)
2. Auth improvements (Items #1, #2, #3, #4, #5, #6, #7)
3. Timer UX (Items #8, #9)
4. Offline indicator (Item #10)
5. Add Goal tabbed dialog (Item #12)
6. Project and Goal detail pages (Items #13, #14)
7. Per-entity analytics (Item #15)

