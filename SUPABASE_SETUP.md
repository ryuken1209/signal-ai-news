# Supabase Setup Guide — Phase 3: Database & Authentication

This guide walks you through setting up Supabase for **AI News Hub ("Signal")**.

---

## 1. Create a Free Supabase Project

1. Visit [supabase.com](https://supabase.com) and sign in or create a free account.
2. Click **New Project** in your dashboard.
3. Enter your project details:
   - **Name:** `ai-news-hub` (or `signal`)
   - **Database Password:** Choose a secure password (save it safely).
   - **Region:** Choose a region geographically close to you or your target users.
4. Click **Create new project** and wait ~1–2 minutes for the database cluster to provision.

---

## 2. Obtain Your Supabase API Keys

1. In your project dashboard, navigate to the left sidebar and click **Project Settings** (the gear icon at the bottom).
2. Click **API** under the Configuration section.
3. Locate the following two values:
   - **Project URL:** Looks like `https://abcdefghijklm.supabase.co`
   - **Project API Keys $\rightarrow$ `anon` / `public`:** A long JWT token marked as public/safe for browser use.

> [!WARNING]
> Never put your `service_role` key into your frontend `.env` file. Only use the `anon` / `public` key for client-side React apps.

---

## 3. Configure Local Environment Variables

1. In the root directory of this project, copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in the values copied from Step 2:
   ```env
   VITE_SUPABASE_URL=https://abcdefghijklm.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Save the file. `.env` is ignored by git (`.gitignore`) to prevent leaking your project keys.

---

## 4. Run the SQL Migration

You can run the migration directly in your browser using the Supabase SQL Editor:

1. Open your Supabase Dashboard and click **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open the file [`supabase/schema.sql`](supabase/schema.sql) in this repository and copy its entire content.
4. Paste the SQL code into the Supabase SQL Editor query box.
5. Click **Run** (or press `Ctrl + Enter` / `Cmd + Enter`).
6. You should see `Success. No rows returned`.

### What this migration sets up:
* **13 Database Tables**:
  1. `profiles`: Private user information (username, display name, avatar).
  2. `articles`: Persistent storage schema matching the Phase 2 live news model.
  3. `categories`: Pre-seeded standard categories (`AI`, `Technology`, `Startups`, `Research`, `Programming`, `Cybersecurity`).
  4. `tags`: Topics and tags.
  5. `article_tags`: Many-to-many relationship linking articles to tags.
  6. `saved_articles`: User bookmarks with unique constraint per user & article.
  7. `collections`: User folders (private by default).
  8. `collection_articles`: Many-to-many relationship linking collections to articles.
  9. `notes`: Private user notes on articles.
  10. `likes`: Article likes with unique constraint per user & article.
  11. `reading_history`: Reading activity log with progress tracking.
  12. `user_preferences`: Theme and personalization settings.
  13. `followed_topics`: Topics followed by the user.
* **Row Level Security (RLS)**: Enabled on all 13 tables with strict ownership checks (`auth.uid() = user_id`).
* **Automated Profile Trigger**: Automatically creates a record in `public.profiles` and `public.user_preferences` whenever a user registers in `auth.users`.

---

## 5. Configure Supabase Auth Settings (Optional for Local Dev)

In your Supabase Dashboard:
1. Go to **Authentication** $\rightarrow$ **Providers** $\rightarrow$ **Email**.
2. **Confirm email**:
   - For easy local testing, you can toggle **Confirm email** to `OFF` so new users are instantly signed in upon sign up without waiting for an email confirmation link.
   - For production, keep it `ON`.
3. Under **URL Configuration**, set the Site URL to:
   - Local development: `http://localhost:5173`
   - Production: your Vercel deployment URL (e.g., `https://your-site.vercel.app`)

---

## 6. How Authentication & Security Work

* **Client Initialization (`src/lib/supabase.js`)**: Uses `@supabase/supabase-js`. Validates environment variables on startup. If keys are missing, the UI gracefully prompts setup rather than crashing.
* **Global Session Context (`src/context/AuthContext.jsx`)**: Listens to `supabase.auth.onAuthStateChange` to persist login state across browser refreshes and tab switches.
* **Row Level Security (RLS)**:
  - User A can never read, modify, or delete User B's bookmarks, notes, collections, preferences, or reading history.
  - Profiles are strictly private to the authenticated owner by default (`auth.uid() = id`).
* **Live News Isolation**:
  - The live RSS engine (`/api/news` $\rightarrow$ Vercel serverless $\rightarrow$ RSS feeds) remains completely independent. Live news feeds continue working seamlessly whether a user is signed in or logged out.

---

## 7. Running the Application Locally

1. Start the Vite development server:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:5173/](http://localhost:5173/) in your browser.
3. Click **Sign in** in the top-right header to create an account or sign in.
