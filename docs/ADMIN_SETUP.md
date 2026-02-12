# 🔑 Admin Setup Guide

How to grant admin access to any user in StudyTracker using Supabase.

---

## Prerequisites

- Access to your [Supabase Dashboard](https://supabase.com/dashboard)
- The user must have already signed up (their account must exist in `auth.users`)

---

## Step 1: Find the User's ID

Go to **Supabase Dashboard → Authentication → Users** and find the user you want to make an admin. Copy their **User UID** (a UUID like `a1b2c3d4-e5f6-...`).

---

## Step 2: Run the SQL Command

Go to **Supabase Dashboard → SQL Editor → New Query** and paste the following command:

```sql
-- Replace YOUR_USER_ID_HERE with the actual UUID from Step 1
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

### Example

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

Click **Run** (or press `Ctrl+Enter`).

---

## Step 3: Verify

Run this query to confirm the role was added:

```sql
SELECT ur.user_id, au.email, ur.role
FROM public.user_roles ur
JOIN auth.users au ON au.id = ur.user_id
WHERE ur.role = 'admin';
```

You should see the user listed with the `admin` role.

---

## Removing Admin Access

```sql
DELETE FROM public.user_roles
WHERE user_id = 'YOUR_USER_ID_HERE'
  AND role = 'admin';
```

---

## Available Roles

| Role        | Description                              |
| ----------- | ---------------------------------------- |
| `admin`     | Full access to admin dashboard & features |
| `moderator` | Can view contact submissions & feedback   |
| `user`      | Default role (no entry needed)            |

---

## How It Works

The `user_roles` table (created by `021_create_user_roles.sql`) stores role assignments. The app checks for admin access using the `has_role()` function:

```sql
-- This function is used internally by RLS policies and the frontend
SELECT public.has_role('USER_UUID', 'admin');
-- Returns: true/false
```

The admin sidebar and routes are only accessible when the logged-in user has the `admin` role in this table.
