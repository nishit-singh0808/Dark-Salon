# DARK Salon Website

DARK Salon is a website where customers can browse salon services, create an account, choose a service, and manage bookings. Professionals and administrators have separate areas to manage work, customers, services, orders, and reviews.

This guide explains the project in simple words.

## Live Demo

- [Visit DARK Salon](https://darkglamsalon.web.app/)
- [Firebase Hosting URL](https://darkglamsalon.firebaseapp.com/)

## What This Project Uses

- **Next.js**: Builds the website and handles page navigation.
- **React**: Creates the page contents and interactive buttons.
- **Firebase Authentication**: Handles email and Google sign-in.
- **Firebase Firestore**: Stores users, services, bookings, orders, reviews, and messages.
- **Firebase Storage**: Stores uploaded images.
- **Bootstrap and React-Bootstrap**: Provides ready-made layout and UI helpers.
- **Swiper**: Creates the image slider on the home page.
- **React Icons and Font Awesome**: Provides icons.

## Quick Preview

![DARK Salon home page banner](public/images/slide1.png)

![Salon service example](public/images/women-makeup.avif)

The other images used by the website are in `public/images/`.

## How to Run the Project

### 1. Install Node.js

Install Node.js from [nodejs.org](https://nodejs.org/). A current LTS version is recommended.

Check that Node.js and npm are installed:

```bash
node --version
npm --version
```

### 2. Open the project folder

```bash
cd /home/rpdevs/Desktop/temp/DARK_Website
```

### 3. Install the packages

Run this once after downloading the project, or whenever `package.json` changes:

```bash
npm install
```

### 4. Add Firebase settings

Create a local environment file from the example:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the Firebase web configuration from the Firebase Console. Keep `.env.local` on your computer. It is ignored by Git and must not be committed.

### 5. Start the development website

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

The website refreshes automatically when you edit a file.

### Other commands

```bash
npm run build   # Create a production build in the out folder
npm start       # Run the production build locally
npm run lint    # Check the code style, if supported by the installed Next.js version
```

## How the Website Works

### Customer flow

1. A visitor opens the home page.
2. The home page shows the salon banner, service categories, and reviews.
3. The visitor chooses Men or Women, then chooses Makeup, Hairstyle, or Beauty.
4. A visitor who is not signed in is sent to the login page when login is required.
5. A new customer creates an account on the signup page.
6. The customer completes their name and phone details.
7. The customer can browse services, add items to the cart, review the cart, and continue to checkout.
8. Bookings, orders, and reviews are saved in Firebase.

### Login and profile check

The file `pages/_app.js` wraps every page in a login check.

- Login, signup, and edit profile pages can open without a completed profile.
- Other pages check whether the visitor is signed in.
- A new user is sent to signup to complete their profile.
- A user without a name or phone number is also sent to signup.
- A normal customer stays on the customer pages.
- The administrator is sent to `/admin/dashboard`.
- A professional is sent to `/worker-dashboard`.

### Administrator flow

The administrator pages are inside `pages/admin/`:

| Page | What it does |
| --- | --- |
| `/admin/dashboard` | Shows the main admin dashboard |
| `/admin/addService` | Adds or edits salon services |
| `/admin/serving-and-pricing` | Manages service availability and prices |
| `/admin/orders` | Reviews customer orders |
| `/admin/applications` | Reviews professional applications |
| `/admin/worker` | Manages professionals |
| `/admin/client-database` | Views customer information |
| `/admin/money` | Shows money and payment information |
| `/admin/reviews` | Reviews customer feedback |
| `/admin/query-messages` | Reads customer questions and messages |

The administrator uses the same Firebase database as the customer pages, so changes made in the admin area can appear on the customer website.

### Professional flow

1. A professional applies through `/apply-as-professional`.
2. An administrator reviews the application.
3. After approval, the professional can use `/worker-dashboard`.
4. The professional can manage their profile, services, pricing, and related work from that dashboard.

## Important Folders and Files

```text
pages/                  Website pages. The file name becomes the URL.
pages/admin/            Administrator pages.
pages/_app.js           Shared login check and global CSS imports.
pages/_document.js      Shared HTML document setup.
components/             Reusable parts such as the navbar and reviews.
lib/firebase.js         Firebase login, database, storage, and Google login setup.
styles/                 Website and admin styling.
public/images/          Images shown on the website.
next.config.mjs         Next.js settings and static export settings.
firebase.json           Tells Firebase to publish the out folder.
out/                    Production files created by the build command.
```

In a Next.js Pages Router project, a file such as `pages/about.js` becomes `/about`. A file such as `pages/admin/orders.js` becomes `/admin/orders`.

## Firebase

Firebase is configured in [lib/firebase.js](lib/firebase.js) using values from `.env.local`. The project currently uses:

- Firebase Authentication for account login.
- Firestore for application data.
- Firebase Storage for uploaded images.
- Google login through `GoogleAuthProvider`.

Before deploying your own copy, check the Firebase project settings and make sure Authentication, Firestore, and Storage are enabled.

Firebase web configuration values are normally visible in a browser. They are not the same as Firebase Admin credentials. Real protection comes from Firebase Authentication, Firestore rules, Storage rules, and API restrictions.

## Public Repository Safety

Before pushing this project to a public GitHub repository:

1. Make sure `.env.local` is not listed by `git status`.
2. Commit `.env.example`, but never commit `.env.local`.
3. Never commit Firebase Admin service-account JSON files, private keys, passwords, payment keys, or access tokens.
4. Review Firestore and Storage rules. Do not leave them open to everyone.
5. Add API restrictions in Google Cloud for the Firebase browser API key, such as your website domains.
6. Check the complete Git history before making the repository public. Removing a value from the current file does not remove it from old commits.

If a real private key, password, token, or service-account file was ever committed, revoke or rotate it immediately and clean the Git history before publishing. The Firebase browser API key currently used by this app is a client-side value, but it should still be restricted and protected by Firebase rules.

## Building and Deploying

This project is configured for a static export. The build creates website files in `out/`.

```bash
npm run build
firebase login
firebase deploy
```

The `firebase.json` file tells Firebase Hosting to publish the `out/` folder for the `darkglamsalon` site.

## Common Problems

### The page does not open

Make sure the development server is running:

```bash
npm run dev
```

Then open `http://localhost:3000`.

### Packages are missing

Run:

```bash
npm install
```

### Login or database features do not work

Check that the Firebase project is active and that Authentication, Firestore, and Storage are enabled. Also check the Firebase configuration in `lib/firebase.js`.

### Port 3000 is already being used

Start Next.js on another port:

```bash
npm run dev -- -p 3001
```

Then open `http://localhost:3001`.
