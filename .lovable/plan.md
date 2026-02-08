
# Edit 02 - Custom 404 Page, Landing Page, and Goal Detail Page Redesign ✅ COMPLETED

## Overview

All three changes implemented: (1) polished custom 404 page with animated gradient and auth-aware CTAs, (2) public landing page at `/` with Google login mockup on auth pages, (3) Goal Detail Page redesigned with flat grid layout matching mockups. Root route changed from Dashboard to Landing/Dashboard conditional. All internal nav updated to `/dashboard`.

---

## 1. Custom 404 Error Page

**Current state:** A plain centered "404 / Oops! Page not found" with a text link.

**Changes to `src/pages/NotFound.tsx`:**
- Add a large, visually interesting illustration using CSS/SVG (a "lost in space" or "broken book" theme fitting StudyTracker)
- Large animated "404" heading with gradient text
- Friendly message: "Looks like this page wandered off. Let's get you back on track."
- Two CTA buttons: "Go to Dashboard" (primary) and "Back to Home" (outline)
- If user is not authenticated, show "Go Home" and "Login" buttons instead
- Subtle animated background elements (floating shapes or gradient blobs)
- Fully responsive for mobile

---

## 2. Landing / Home Page

**New file: `src/pages/LandingPage.tsx`**

A public-facing landing page focused on students. This page is shown at `/` when the user is NOT logged in. When logged in, `/` continues to show the Dashboard.

### Layout Sections:

**Hero Section:**
- Headline: "Master Your Studies with study tracker."
- Subtext: short value prop about organized study tracking, gamification, and analytics
- Two CTAs: "Get Started Free" (links to `/signup`) and "Learn More" (scrolls down)
- A decorative visual/illustration on the right (CSS-based or emoji-based visual element)

**Features Grid (3-4 cards):**
- Organized Hierarchy (Project > Goal > Subject > Topic)
- Smart Timer (Pomodoro with analytics)
- Gamified Progress (XP, badges, streaks)
- Visual Analytics (charts, heatmaps)

**How It Works (3 steps):**
- Step 1: Set up your goals
- Step 2: Track your study sessions
- Step 3: Review analytics and improve

**Social Proof / Stats Section:**
- Placeholder stats like "10,000+ study sessions tracked"

**CTA Footer:**
- "Ready to level up your study game?" with Sign Up button

### Auth Page Updates:

**`src/pages/LoginPage.tsx`:**
- Add a Google login mockup button (styled like a real Google button, shows a "Coming soon" toast on click)
- Add a horizontal divider "or continue with email"
- Add a "Back to Home" link at the bottom
- Keep existing form logic unchanged

**`src/pages/SignupPage.tsx`:**
- Add a Google signup mockup button (same style, "Coming soon" toast)
- Add "or sign up with email" divider
- Add "Back to Home" link

### Router Update:

**`src/App.tsx`:**
- Change the `/` route logic: if user is NOT authenticated, render `LandingPage`; if authenticated, render `Dashboard` (inside protected layout)
- Approach: Add `/` as a public route pointing to a wrapper component that checks auth state and conditionally renders LandingPage or redirects to Dashboard

---

## 3. Goal Detail Page Redesign

Based on the reference mockups (desktop and mobile), the Goal Detail Page needs a significant layout change from the current card-based tree view to a flat, sectioned layout.

### Key Design Principles from Mockups:

1. **Breadcrumb** at top: `projects > XYZ project > XYZ goal`
2. **Header card** with goal icon, name, type badges (Urgent, Thesis), project name, Edit and Archive buttons, progress bar with percentage
3. **Stream tabs** (horizontal scrollable tabs: Stream X, Stream Y, Stream Z) with a collapse/expand chevron
4. **Flat grid sections** (not tree indentation):
   - **SUBJECTS** section header with `+ Add subject` button on the right. Subjects displayed as a **card grid** (4 columns on desktop, 3 on tablet, 2 on mobile). Each subject is a rounded card with a right chevron for expandability
   - **CHAPTERS** section header with `+ Add chapters` button. Same card grid layout with chevrons
   - **TOPICS** section header with `+ Add topics` button. Same card grid (slightly different styling -- outlined pills)
5. **Tasks section** at the bottom with:
   - `Date filter` button, list/grid view toggle icons, `+ Add task` button
   - Tasks displayed in a **2-column grid** (1 column on mobile). Each task is a card with a completion circle, task name, and status/due info

### Changes to `src/pages/GoalDetailPage.tsx` (complete rewrite):

**Header:**
- Keep breadcrumb as-is
- Redesign the header card to show: goal icon + goal name on the left, type badges (using goal_type), project badge if assigned
- "Edit" and "Archive" buttons aligned to the right (icon + text)
- Progress bar below with percentage text on the right

**Stream Tabs:**
- Replace the single HierarchyTree with a horizontal tab bar for streams
- Each stream is a tab. Clicking a stream tab filters the content below to that stream
- If no streams exist, skip the tabs and show subjects directly
- A `>>` chevron icon on the right to collapse/show all streams (scrollable on mobile)
- Content below the tabs is filtered by the selected stream

**Subjects Section:**
- Section label "SUBJECTS" in uppercase, muted text
- `+ Add subject` button on the right (small, blue, outlined)
- Subjects displayed as a responsive grid of cards (rounded-lg border, padding, subject name, right chevron)
- Clicking a subject card expands/shows the chapters for that subject (toggle behavior)

**Chapters Section:**
- Shows when a subject is selected/expanded
- Section label "CHAPTERS" with `+ Add chapters` button
- Chapters in a card grid, each with a right chevron
- Clicking a chapter shows topics below it

**Topics Section:**
- Shows when a chapter is selected/expanded
- Section label "TOPICS" with `+ Add topics` button
- Topics as outlined pill/cards in a grid

**Tasks Section:**
- Section at the bottom, always visible
- Filter bar with: "Date filter" button (calendar icon), list/grid view toggle, `+ Add task` button
- Tasks in a 2-column responsive grid
- Each task card: completion circle (color-coded by status), task name, subtitle (due date or status like "In Progress", "Completed", "Pending", "Overdue")
- Task status colors: green for done, blue for in-progress, orange for pending, red for overdue

### Technical Approach:

Instead of rewriting the entire `HierarchyTree` component (which is used elsewhere), create a new `GoalDetailContent` component specifically for the Goal Detail Page that follows this flat layout pattern.

**New file: `src/components/goals/GoalDetailContent.tsx`**
- Takes `goalId` as prop
- Uses existing hooks: `useStreams`, `useSubjects`, `useChapters`, `useTopics`
- Manages state for: selected stream, selected subject, selected chapter
- Uses `HierarchyItemForm` dialog for all add/edit operations (reuses existing form)
- Uses `TaskFormDialog` for adding tasks

**State management:**
- `selectedStreamId: string | null` -- which stream tab is active
- `selectedSubjectId: string | null` -- which subject card is expanded
- `selectedChapterId: string | null` -- which chapter card is expanded
- `taskViewMode: "list" | "grid"` -- toggle between views
- `taskDateFilter: string | null` -- optional date filter for tasks

**File changes:**
- `src/pages/GoalDetailPage.tsx` -- Replace the HierarchyTree card and "Add Task" button with the new `GoalDetailContent` component. Keep header card, breadcrumb, and analytics section
- `src/components/goals/GoalDetailContent.tsx` -- New component with the flat grid layout
- Both files use existing hooks and dialogs, no database changes needed

### Responsive Behavior:
- Desktop: 4-column grids for subjects/chapters/topics, 2-column for tasks
- Tablet: 3-column grids, 2-column tasks
- Mobile: 2-column grids for subjects/chapters/topics, 1-column tasks
- Stream tabs scroll horizontally on mobile
- Section headers and add buttons stack nicely

---

## Technical: File Changes Summary

**New files (2):**
- `src/pages/LandingPage.tsx` -- Public landing page
- `src/components/goals/GoalDetailContent.tsx` -- Flat grid layout for goal detail

**Modified files (4):**
- `src/pages/NotFound.tsx` -- Complete redesign with illustrations and better UX
- `src/pages/LoginPage.tsx` -- Add Google mockup button, "or" divider, "Back to Home" link
- `src/pages/SignupPage.tsx` -- Add Google mockup button, "or" divider, "Back to Home" link
- `src/App.tsx` -- Add LandingPage route logic for unauthenticated users
- `src/pages/GoalDetailPage.tsx` -- Replace HierarchyTree with GoalDetailContent, redesign header

---

## Implementation Order

1. Custom 404 page (quick standalone change)
2. Landing page + auth page updates + router changes
3. GoalDetailContent component (new flat grid layout)
4. GoalDetailPage redesign (integrate new component, update header)
