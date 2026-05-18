
# Awesome Dotfiles — Project Documentation

This is the official repository for Awesome Dotfiles, a community gallery for Linux desktop configurations. If you want to contribute or spot something broken, feel free to reach out or open a PR. Help is always welcome. 

One thing worth noting upfront: most of the early commit history looks sparse because I had been working on this locally without Git for a while. When I finally pushed, a large portion of the codebase was already functional. That's the whole story behind it — no mystery, just a different workflow.

I don't commit every single line change. I commit when something meaningful is done.

> [!NOTE]
> This is a hobby project, built out of curiosity and a genuine love for the Linux community. If something looks wrong to you — the architecture, the code style, the tooling choices — you're welcome to say so and explain why. That's how things improve.
>
> What doesn't help is hostility. Insulting someone's work without offering anything constructive isn't criticism, it's just noise. If your first instinct when seeing code you disagree with is to mock it rather than explain it, then this isn't the right place for you.
>
> Teaching takes effort. So does learning. Both require a baseline of respect. If you're not willing to meet that bar, please keep it to yourself.

&nbsp;

# Contributing

If you want to contribute, please work on a separate branch — never directly on `master`. A `dev` branch or a feature-specific branch works fine. No changes get merged into master without going through a review first.

The short version:

- Fork the repository
- Create your branch from `master`
- Make your changes
- Open a pull request describing what you changed and why
- Wait for review before anything gets merged

&nbsp;

# Tech Stack

The project uses a fully serverless architecture. There is no traditional backend — everything runs through managed services and a React frontend.

## React + Vite

The frontend is built with React using JSX. Vite handles the build tooling. It gives fast hot module replacement during development and produces optimized bundles for production. All routing is handled client-side with `react-router-dom`, and pages are lazy-loaded using React's `lazy` and `Suspense` to keep the initial bundle small.

## Tailwind CSS v4

Styling is done entirely with Tailwind CSS, specifically version 4, which introduces the `@theme` directive for defining design tokens directly in CSS. There are no separate CSS files for individual components — everything is handled through utility classes. Custom colors, fonts, and spacing are defined once in `src/index.css` under `@theme` and referenced throughout the project using CSS variables.

## SupaBase

All submission data is stored in Firestore, Google's NoSQL document database. Each submitted rice is a document in a `rices` collection with fields like `title`, `author`, `wm`, `distro`, `palette`, `image_Url`, `status`, `views`, `likes`, `dislikes`, and `totalVotes`. The `status` field controls visibility — submissions start as `pending` and only appear in the public gallery once approved.


## SupaBase Auth

The admin panel at `/admin` is protected by Firebase Authentication using email and password. There is only one admin account. The `AuthContext` provider wraps the entire app and exposes the current user state. Protected routes redirect to `/admin/login` when no authenticated user is found.

## Vercel Hosting

This project uses Vercel as its primary hosting provider, both for SSL and other things. We use Vercel because Firebase is a bit of a liability in many ways. Vercel will be the default hosting provider; a custom domain will be added soon.

## Uploadcare

User-uploaded screenshots are stored on Uploadcare, not Firebase Storage. Cloudinary was chosen because it offers a generous free tier without requiring a payment method. Uploads use an unsigned upload preset, meaning images can be sent directly from the browser without exposing API secrets. The returned `secure_url` is what gets saved to Firestore.

## Framer Motion

Component transitions and entrance animations are handled by Framer Motion. Most pages use a simple `opacity` and `y` fade-in on mount. The vote bar in the rice detail page uses an animated width to show the like/dislike ratio. Nothing is overly animated — motion is used where it adds clarity, not decoration.

## Supporting Libraries

- `react-hook-form` — form state and validation for the submission form
- `react-dropzone` — drag-and-drop image upload zone
- `react-hot-toast` — non-intrusive toast notifications for feedback
- `react-type-animation` / `typewriter-effect` — animated text on the hero sections
- `date-fns` — date formatting and relative time (e.g., "3 days ago")
- `clsx` — conditional className utility
- `Font Awesome` — icons throughout the interface

&nbsp;

# Project Structure

```
src/
├── assets/          Static files like the logo
├── components/      Reusable UI components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── RiceCard.jsx  Single gallery card
│   └── RiceGrid.jsx  Full gallery with filters and sorting
├── context/
│   └── AuthContext.jsx  SupaBase auth state provider
├── lib/
│   ├── firebase.js   SupaBase + Auth initialization
│   └── uploadcare.js Image upload helper
└── pages/
    ├── Home.jsx       Landing page with hero and gallery
    ├── About.jsx      About for this project
    ├── Submit.jsx     Submission form
    ├── Theme.jsx     Theme section 
    ├── Wiki.jsx     Guide to creating your own dotfiles (area still under development) 
    ├── RiceDetail.jsx Individual rice page with votes
    ├── Admin.jsx      Moderation panel (protected)
    └── AdminLogin.jsx Authentication page
```

&nbsp;

# How Submissions Work

When a user submits a rice, the form collects a license, author handle, description, window manager, distro, color palette, dotfiles URL, and a screenshot. The image is uploaded to Cloudinary first, and the returned URL is included when the document is saved to Firestore with `status: 'pending'`.

Pending submissions do not appear in the public gallery. The admin reviews them at `/admin`, where each card shows the full image, metadata, and approve or reject buttons. Approving sets `status` to `approved`. Rejecting deletes the document entirely.

The public gallery only queries documents where `status == 'approved'`, so nothing leaks through before review.

&nbsp;




# Environment Variables

The project uses Vite's environment variable system. All sensitive keys live in a `.env` file at the project root and are never committed to the repository. Variables must be prefixed with `VITE_` to be accessible in the browser.

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_UPLOADCARE_PUBLIC_KEY=
VITE_UPLOADCARE_CDN_BASE=
```

&nbsp;

# Firestore Security Rules

The database rules enforce that anyone can read approved rices, anyone can create a submission as long as it has `status: 'pending'`, and only authenticated users can update or delete documents. This prevents someone from submitting a rice with `status: 'approved'` directly and bypassing the review process.

&nbsp;

# Running Locally

```bash
git clone https://github.com/zhaleff/AwesomeDotfiles
cd AwesomeDotfiles
npm install 
```

Create a `.env` file with your Firebase and Cloudinary credentials, then:

```bash
npm run dev
```

The app will be available at `http://localhost`.
