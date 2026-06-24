# Imbita Wedding Template

A config-driven, cloneable Next.js wedding website. All couple-specific content lives in `wedding.config.yaml`. To deploy for a new client: clone the repo, fill in the config, swap images in `/public`, set env vars, and deploy to Vercel.

**Tech stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase · Resend · Jest

---

## Quick Start (New Client Deployment)

1. **Clone the repo**
   ```bash
   git clone https://github.com/digitaldags/imbita-skeleton my-client-wedding
   cd my-client-wedding
   npm install
   ```

2. **Fill in `wedding.config.yaml`** — names, dates, venues, theme colors, FAQ. See [Config Reference](#config-reference) below.

3. **Replace images in `/public`** — drop in hero photos and venue images with the filenames referenced in your config.

4. **Set up Supabase** — create a project and run the SQL in [Supabase Setup](#supabase-setup) below.

5. **Set environment variables** — copy `.env.example` → `.env.local` and fill in all values. See [Environment Variables](#environment-variables).

6. **Run locally or deploy**
   ```bash
   npm run dev   # localhost:3000
   ```
   Or connect the repo to Vercel and push.

---

## Supabase Setup

Create a new project at [supabase.com](https://supabase.com), then go to **SQL Editor** and run:

```sql
-- guest_list: pre-approved guests
CREATE TABLE guest_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_guest_list_first_name ON guest_list(first_name);
CREATE INDEX idx_guest_list_last_name ON guest_list(last_name);
CREATE INDEX idx_guest_list_enabled ON guest_list(enabled);
CREATE INDEX idx_guest_list_created_at ON guest_list(created_at);
CREATE INDEX idx_guest_list_updated_at ON guest_list(updated_at);

-- rsvps: submitted RSVPs
CREATE TABLE rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  attending BOOLEAN NOT NULL DEFAULT false,
  attendance_type TEXT NOT NULL DEFAULT 'both' CHECK (attendance_type IN ('ceremony', 'reception', 'both')),
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rsvps_email ON rsvps(email);
CREATE INDEX idx_rsvps_first_name ON rsvps(first_name);
CREATE INDEX idx_rsvps_last_name ON rsvps(last_name);
CREATE INDEX idx_rsvps_attendance_type ON rsvps(attendance_type);
CREATE INDEX idx_rsvps_created_at ON rsvps(created_at);
CREATE INDEX idx_rsvps_updated_at ON rsvps(updated_at);
```

Then go to **Project Settings → API** to get your project URL, anon key, and service role key.

---

## Config Reference

All couple-specific content lives in `wedding.config.yaml` at the project root. No TypeScript knowledge required to deploy for a new client.

### `couple`

| Field | Description |
|---|---|
| `partner1` | First partner's name |
| `partner2` | Second partner's name |
| `date` | Wedding date, display format (e.g. `May 2, 2026`) |
| `location` | City and country |

### `rsvpDeadline`

Display string shown on the RSVP call-to-action (e.g. `April 2, 2026`).

### `hero.images`

Array of hero carousel images. Each entry has:

| Field | Description |
|---|---|
| `src` | Filename in `/public` for desktop |
| `mobileSrc` | Filename in `/public` for mobile |

### `sections`

Toggle entire page sections. Set to `false` to hide.

| Field | Default | Notes |
|---|---|---|
| `ceremony` | `true` | |
| `reception` | `true` | |
| `attire` | `true` | |
| `faq` | `true` | |
| `rsvp` | `true` | |

> If both `ceremony` and `reception` are `true`, the RSVP form shows an attendance type selector (Ceremony Only / Reception Only / Both). If only one is enabled, the field is hidden and the single attendance type is submitted automatically.

### `ceremony`

| Field | Description |
|---|---|
| `name` | Venue name |
| `address` | Full address |
| `date` | Date of ceremony |
| `time` | Start time |
| `note` | Short note for guests (e.g. arrive 15 min early) |
| `mapsUrl` | Google Maps URL |
| `image` | Filename in `/public` |

### `reception`

| Field | Description |
|---|---|
| `name` | Venue name |
| `address` | Full address |
| `time` | Start time |
| `note` | Short note for guests |
| `mapsUrl` | Google Maps URL |
| `image` | Filename in `/public` |

### `attire`

| Field | Description |
|---|---|
| `dress` | Dress code label (e.g. `Strictly Formal`) |
| `male` | Male attire description |
| `female` | Female attire description |
| `note` | Additional attire note |
| `images.male` | Filename in `/public` for male attire example |
| `images.female` | Filename in `/public` for female attire example |

### `faq`

Array of `{ question, answer }` objects. Add as many entries as needed.

### `email`

| Field | Description |
|---|---|
| `senderName` | Display name on reminder emails |
| `senderAddress` | Verified Resend sender address |

### `theme`

Tailwind color tokens sourced at build time. Change here, rebuild, and the whole site updates.

| Field | Role |
|---|---|
| `primary` | Main brand color — button fills, focus rings, borders |
| `secondary` | Background / fill — page bg, cards, outline hover (keep light/neutral) |
| `accent` | Darker brand variant — headings, button hover states |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all values.

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_KEY` | Yes | Service role key — bypasses RLS for admin write operations. Never expose client-side. |
| `ADMIN_PASSWORD` | Yes | Admin dashboard password. Defaults to `admin` if unset — always set this in production. |
| `RESEND_API_KEY` | Email only | Resend API key (starts with `re_`) |
| `RESEND_FROM_EMAIL` | Email only | Verified sender address |
| `NEXT_PUBLIC_WEDDING_DATE` | Yes | Wedding date `YYYY-MM-DD` — used client-side for the countdown |
| `WEDDING_DATE` | Email only | Wedding date `YYYY-MM-DD` — used server-side in reminder email copy |

---

## Guest List

Only guests pre-approved in the `guest_list` table can submit RSVPs. Name matching is case-insensitive. Both "not found" and "disabled" return the same error message to avoid leaking guest status.

### CSV Import

In `/admin/guests`, use the **Import CSV** button to bulk-add guests. Expected format (no header row required):

```
FirstName,LastName
```

All imported guests are enabled by default. Duplicate entries are skipped automatically. The import result shows counts and any errors.

### Manual Management

The `/admin/guests` page supports full CRUD: add, edit, enable/disable, and delete individual guests.

---

## Email Reminders

Reminder emails are sent via [Resend](https://resend.com). The email body computes how many days until the wedding at the time of sending.

### Setup

1. Create a [Resend](https://resend.com) account — the free tier allows 3,000 emails/month and 100/day.
2. In the Resend dashboard, go to **Domains → Add Domain** and verify your sending domain.
3. Go to **API Keys → Create API Key** (Sending access). Copy the key — it is only shown once.
4. Add `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `WEDDING_DATE` to your `.env.local`.

### Sending Reminders

Log in to `/admin/rsvps`:

- **Send All Reminders** — sends to all attending guests who have not yet received a reminder.
- **Send / Resend** (per row) — sends to a single guest. Shows **Resend** after the first send.

Always send a test email to yourself before a bulk send.

---

## Available Scripts

```bash
npm run dev          # Dev server on localhost:3000
npm run build        # Production build
npm run lint         # ESLint check
npm run format       # Prettier format (auto-sorts Tailwind classes)
npm run format:check # Check formatting without writing
npm test             # Jest
npm run test:watch   # Jest watch mode
```

---

## Docker

```bash
docker-compose up --build
```

Or manually:

```bash
docker build -t imbita-wedding .
docker run --rm -p 3000:3000 \
  -e SUPABASE_URL=your_supabase_url \
  -e SUPABASE_KEY=your_supabase_key \
  -e SUPABASE_SERVICE_KEY=your_service_role_key \
  -e ADMIN_PASSWORD=your_admin_password \
  -e RESEND_API_KEY=your_resend_api_key \
  -e RESEND_FROM_EMAIL=noreply@yourdomain.com \
  -e NEXT_PUBLIC_WEDDING_DATE=YYYY-MM-DD \
  -e WEDDING_DATE=YYYY-MM-DD \
  imbita-wedding
```

---

## Deployment (Vercel)

1. Connect your GitHub repository to Vercel.
2. Add all environment variables in the Vercel dashboard under **Settings → Environment Variables**.
3. Push to your main branch — Vercel deploys automatically.

---

## License

MIT
