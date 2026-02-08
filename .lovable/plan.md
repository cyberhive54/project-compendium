

# Project Management System -- Complete Implementation Plan (Revised)

All tweaks from the checklist have been incorporated. Mandatory, highly recommended, optional enhancements, and additional edge cases are all addressed below.

---

## Overview

The Project system is the top-level optional container in the study hierarchy: **Project > Goal > Stream > Subject > Chapter > Topic > Task**. The database table and data hook already exist but there is no UI. This plan adds full project management with CRUD, goal assignment, cascade archive, and proper integration across the app.

---

## What Already Exists

- `projects` table in Supabase (SQL 003) with name, description, color, icon, archive support
- `useProjects.ts` hook with create, update, archive, unarchive, remove mutations
- `Project` TypeScript type in `database.ts`
- Goals table has `project_id` FK (nullable, ON DELETE SET NULL)
- `ArchiveConfirmDialog` component (reusable, supports `childCount` and `isPermanentDelete`)
- `useGoals.ts` already has full cascade archive logic (Goal > Streams > Subjects > Chapters > Topics > Tasks)

---

## 1. Projects Page (`src/pages/ProjectsPage.tsx`)

A dedicated page showing all projects as expandable cards with goal nesting.

**Layout:**
- Page header: "Projects" title + "+ Project" button
- Active projects listed as `ProjectCard` components (collapsed by default)
- "Unassigned Goals" section at the bottom showing goals where `project_id` is null
- Toggle switch or tab to show/hide archived projects (with unarchive action)
- Empty state: folder icon, "No projects yet" message, "+ Create Your First Project" CTA button
- Skeleton loading states while data loads

**v1.1 features (not built now, noted for future):**
- Search bar to filter projects by name
- Sort dropdown (Name A-Z, Recently Used, Most Tasks)
- Grid vs List view toggle

---

## 2. Project Form Dialog (`src/components/projects/ProjectFormDialog.tsx`)

Create/Edit dialog following the same pattern as `GoalFormDialog`.

**Fields:**
- Name (required, max 100 chars, Zod validated)
- Description (optional, max 500 chars, textarea)
- Color: **Preset palette of 8 colors** displayed as a grid of colored circles
- Icon: text input accepting emojis (default: book emoji)

**Preset Color Palette (8 colors):**
| Color   | Hex       |
|---------|-----------|
| Blue    | `#3B82F6` (default) |
| Green   | `#10B981` |
| Amber   | `#F59E0B` |
| Red     | `#EF4444` |
| Purple  | `#8B5CF6` |
| Pink    | `#EC4899` |
| Teal    | `#14B8A6` |
| Orange  | `#F97316` |

**Color Picker UI:**
- Grid of 8 colored circles (32x32px each, with gap)
- Selected color shows a ring/border to indicate selection
- Clicking a circle selects it
- No free-form hex input in v1 (can be added in v1.1)

---

## 3. Project Card (`src/components/projects/ProjectCard.tsx`)

Expandable card displaying project details, stats, and nested goals.

**Header (always visible):**
- Left: Project icon + name + description (1-line truncated)
- Left border: 4px thick colored accent using project's color
- Stats row (3 stats, horizontal, small text with icons):
  - Stat 1: Goal count (e.g., "5 goals")
  - Stat 2: Task completion (e.g., "12/20 tasks")
  - Stat 3: Progress percentage (e.g., "60% complete")
- Action buttons: Edit | Archive | + Add Goal
- Expand/Collapse chevron button

**Expanded content (lazy-loaded):**
- List of `GoalCard` components filtered by this `project_id`
- If zero goals: empty state with folder icon, "No goals in this project yet", and "+ Add First Goal" button that opens `GoalFormDialog` with this project pre-selected

**Progress Calculation:**
```text
1. Get all non-archived goals where project_id = this project
2. Get all non-archived tasks under those goals
3. totalTasks = count of all tasks
4. doneTasks = count of tasks where status = 'done'
5. progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
6. Display: "{progress}% complete" + progress bar
```
This calculation will live as a utility function (`getProjectProgress`) called within the ProjectCard component, using data already available from the goals and tasks queries.

**Expand/Collapse Behavior:**
- All projects start collapsed by default
- Expand state persisted in localStorage (key: `expanded_projects`)
- Goals are fetched only when a project is expanded (lazy loading)
- Smooth CSS animation on expand/collapse (using Radix Collapsible)

**Project Color Usage:**
- Project card: 4px colored left border
- Goal badges on other pages: project color as subtle border/accent
- Backgrounds remain neutral; color is accent-only
- Ensure contrast with text (all 8 preset colors already have sufficient contrast)

---

## 4. Cascade Archive for Projects

When archiving a project, all child goals and their entire subtree must be archived.

**Archive Confirmation Dialog:**
- Title: `Archive Project '{projectName}'?`
- Message body (fetched counts before showing dialog):
  - "This will archive {goalCount} goal(s), along with all their streams, subjects, chapters, topics, and {taskCount} task(s)."
  - "You can restore this project and its contents from the Archived Projects view."
- Buttons: "Cancel" (outline) | "Archive Project" (destructive/red style)
- Counts are fetched by querying goals where `project_id = id` and `archived = false`, then summing tasks under those goals

**Archive Logic in `useProjects.ts`:**
```text
archive(projectId):
  1. Fetch all non-archived goals where project_id = projectId
  2. For each goal, run the existing goal archive cascade logic:
     (Goal -> Streams -> Subjects -> Chapters -> Topics -> Tasks)
  3. Archive the project record itself
  4. Invalidate queries: projects, goals, streams, subjects, chapters, topics, tasks
```

**Delete vs Archive Clarification:**
- Archive is the default action (soft delete, reversible)
- Permanent delete is only available from the "Archived Projects" view
- Permanent delete requires double confirmation (existing `ArchiveConfirmDialog` with `isPermanentDelete=true`)
- On permanent delete: database automatically sets `project_id = NULL` on child goals (FK ON DELETE SET NULL)

---

## 5. Goal Form Updates

**`GoalFormDialog.tsx` changes:**
- Add optional "Project" dropdown at the top of the form (before name field)
- Uses `useProjects()` to fetch active projects
- Select options: "No Project" (sentinel `__none__`) + list of active projects (showing icon + name)
- On submit: include `project_id` (null if `__none__` selected)
- When editing, pre-select the current project
- When opened from a ProjectCard's "+ Add Goal" button, pre-select that project

**Moving Goals Between Projects edge case:**
- When editing a goal, user can change its project via the dropdown
- Changing project just updates `goal.project_id`; tasks remain linked to the goal
- Stats recalculate for both old and new projects automatically (React Query invalidation)

---

## 6. Goals Page Integration

**`Goals.tsx` changes:**
- Add project filter dropdown at the top of the goals list (options: "All Projects", each project by name, "Unassigned")
- Filter the displayed goals by selected project
- Show a small project badge/tag on each `GoalCard` if the goal belongs to a project (using project color as accent)

**`GoalCard.tsx` changes:**
- If goal has a `project_id`, display a small badge below the goal type badge showing the project name with the project's color accent

---

## 7. Navigation Updates

**Sidebar order (`AppSidebar.tsx`):**
```text
Dashboard
Calendar
Analytics
Projects     <-- NEW (FolderKanban icon from lucide-react)
Goals
Badges
Settings
```

**Mobile bottom nav (`MobileBottomNav.tsx`):** No changes needed (limited to 5 items: Dashboard, Calendar, Timer, Analytics, Profile). Projects is accessible via the sidebar on desktop or the hamburger menu.

**Router (`App.tsx`):**
- Add `<Route path="/projects" element={<ProjectsPage />} />` inside the protected AppLayout group

---

## 8. Seed Data Update (`sql/seed_demo_data.sql`)

Update the existing seed file to wire projects to goals:

**Projects to create:**
| Project Name       | Color     | Icon | Description |
|-------------------|-----------|------|-------------|
| JEE Preparation   | `#3B82F6` | graduation cap emoji  | Comprehensive JEE Main + Advanced prep |
| 12th Board Exams  | `#10B981` | books emoji  | CBSE Class 12 board exam preparation |

**Goal-to-Project linking:**
- "JEE Main 2026" goal -> JEE Preparation project
- "JEE Advanced 2026" goal -> JEE Preparation project (if exists, or the existing JEE goal)
- "12th Board" goal -> 12th Board Exams project
- "Semester" and "Custom" goals remain unassigned (to test unassigned section)

**SQL changes:**
- Update the existing project INSERT statements to use the names/colors above
- Add `UPDATE goals SET project_id = v_proj_competitive WHERE goal_id = v_goal_jee;`
- Add `UPDATE goals SET project_id = v_proj_academic WHERE goal_id = v_goal_boards;`

---

## Implementation Checklist

### Phase 1: Database Verification
- [ ] Verify projects table exists with all fields (name, description, color, icon, archived, archived_at)
- [ ] Verify goals.project_id foreign key exists and is nullable
- [ ] Test ON DELETE SET NULL (delete project -> goals.project_id becomes null)

### Phase 2: Build UI Components
- [ ] Create `ProjectFormDialog` component (create/edit form with preset color palette)
- [ ] Create `ProjectCard` component (expandable card with stats, lazy-loaded goals)
- [ ] Create `ProjectsPage` component (main page with project list + unassigned goals)
- [ ] Create `ArchiveProjectDialog` wrapper (confirmation with fetched counts)

### Phase 3: Integrate with Existing Pages
- [ ] Add project dropdown to `GoalFormDialog` (with `__none__` sentinel)
- [ ] Add project badge display to `GoalCard`
- [ ] Add project filter dropdown to `Goals` page
- [ ] Add "Projects" menu item to sidebar navigation (FolderKanban icon)
- [ ] Add `/projects` route to `App.tsx`

### Phase 4: Hook & Logic Updates
- [ ] Update `useProjects.ts` archive mutation with cascade logic
- [ ] Add progress calculation utility
- [ ] Add archive count fetching (goals + tasks counts before showing dialog)

### Phase 5: Testing and Polish
- [ ] Test empty state (no projects created yet)
- [ ] Test empty project (project with no goals)
- [ ] Test archive/unarchive flow with cascade verification
- [ ] Test moving goal from one project to another
- [ ] Test "Unassigned Goals" section shows goals without project_id
- [ ] Test preset color selection works
- [ ] Test icon input accepts emojis
- [ ] Test expand/collapse persists in localStorage

### Phase 6: Seed Data
- [ ] Update seed SQL to create named demo projects
- [ ] Link JEE and Board goals to their respective projects
- [ ] Verify demo account shows 2 projects with linked goals

---

## Edge Cases Handled

1. **Projects with no goals**: Show empty state with folder icon, "No goals in this project yet" message, and "+ Add First Goal" CTA
2. **Goals with no project**: Appear in "Unassigned Goals" section on Projects page
3. **Cascade archive**: Archiving a project cascades to all goals -> streams -> subjects -> chapters -> topics -> tasks
4. **ON DELETE SET NULL**: Permanently deleting a project sets `project_id = NULL` on child goals (handled by DB FK)
5. **Unique name constraint**: Project names are unique per user (enforced by DB)
6. **Moving goals between projects**: Editing a goal allows changing its project; tasks stay linked to goal; stats recalculate automatically
7. **Delete vs Archive**: Archive is reversible (default action); permanent delete only from Archived view with double confirmation
8. **Color defaults**: New projects default to Blue (#3B82F6)
9. **Expand state persistence**: Which projects are expanded is remembered across page visits via localStorage

---

## Future Enhancements (v1.1+)

- Drag and drop goals between projects
- Full color picker with hex input
- Project templates (pre-filled for common exam types)
- Project duplication feature
- Search/sort/filter on Projects page
- Grid vs List view toggle
- Project-level analytics dashboard
- Bulk project operations

---

## Technical Details: File Changes Summary

**New files (4):**
- `src/pages/ProjectsPage.tsx`
- `src/components/projects/ProjectFormDialog.tsx`
- `src/components/projects/ProjectCard.tsx`
- `src/components/projects/ArchiveProjectDialog.tsx`

**Modified files (7):**
- `src/hooks/useProjects.ts` -- cascade archive logic + archive count fetching
- `src/components/goals/GoalFormDialog.tsx` -- add project_id select
- `src/components/goals/GoalCard.tsx` -- show project badge
- `src/pages/Goals.tsx` -- add project filter dropdown
- `src/components/layout/AppSidebar.tsx` -- add Projects nav item
- `src/App.tsx` -- add /projects route
- `sql/seed_demo_data.sql` -- update project names and link goals

