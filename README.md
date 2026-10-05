# ◆ Black & Gold Login Portal

### 🔗 Live Demo → [loginnaccount.vercel.app](https://loginnaccount.vercel.app)

---

A sleek, luxury-themed authentication portal built with vanilla HTML, CSS, and JavaScript — powered by **Supabase Auth** for secure user management.

---

## Features

- **User Registration** — sign up with full name, email, and password
- **User Login** — secure sign in with email and password
- **Session Persistence** — stays logged in across page refreshes via Supabase JWT tokens
- **Change Password** — update password from the profile dropdown while logged in
- **Real-time Password Strength Meter** — visual indicator (Weak / Good / Strong)
- **Password Match Validator** — live confirmation badge while typing
- **Show / Hide Password** — toggle visibility on all password fields
- **Toast Notifications** — success and error feedback for every action
- **Auto Session Sync** — handles token refresh and multi-tab sign-out automatically
- **Responsive Design** — works on desktop and mobile
- **Black & Gold Luxury UI** — custom theme with animated tab slider, ambient glows, and gold accents

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Authentication | [Supabase Auth](https://supabase.com/docs/guides/auth) |
| Database | Supabase PostgreSQL |
| Fonts | Google Fonts — Plus Jakarta Sans, Cinzel |
| Hosting | [Vercel](https://vercel.com) |

---

## Project Structure

```
Login/
├── index.html       # Main HTML — auth screen + dashboard + modal
├── style.css        # Black & Gold luxury theme
├── app.js           # Supabase auth logic (register, login, logout, change password)
├── env.js           # Supabase credentials (local only — gitignored)
├── build.js         # Vercel build script — generates env.js from environment variables
├── package.json     # Build script runner
├── vercel.json      # Vercel deployment config
├── .env             # Environment variable reference (gitignored)
└── .gitignore       # Keeps credentials out of version control
```

---

## Run Locally

**1. Clone the repo**
```bash
git clone https://github.com/anish-vasanthan/Login.git
cd Login
```

**2. Create `env.js`** in the project root:
```js
window.__ENV__ = {
  SUPABASE_URL: 'https://your-project-id.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_your_key_here',
};
```

Get your keys from: [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Settings → API Keys**

**3. Serve the project**
```bash
npx serve .
```
Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

**1.** Import the repo at [vercel.com/new](https://vercel.com/new)

**2.** Add these Environment Variables in Vercel project settings:

| Key | Value |
|---|---|
| `SUPABASE_URL` | `https://your-project-id.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` |

**3.** Vercel auto-runs `node build.js` which generates `env.js` securely at build time — your keys never touch the repo.

**4.** After deploy, add your Vercel URL to Supabase:
- Dashboard → **Authentication → URL Configuration**
- Add your URL to **Site URL** and **Redirect URLs**

---

## Supabase Setup

Run this SQL in your Supabase **SQL Editor** to create the profiles table:

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  email       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## Security

- Credentials are stored in `env.js` which is **gitignored** and never committed
- On Vercel, keys are injected via **environment variables** at build time
- Supabase **Publishable key** is safe to expose in the browser — access is controlled by Row Level Security policies
- Passwords are **never stored locally** — fully managed by Supabase Auth

---

## Author

**Anish Vasanthan** — [github.com/anish-vasanthan](https://github.com/anish-vasanthan)
