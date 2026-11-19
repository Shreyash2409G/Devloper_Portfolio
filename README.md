# Shreyash Gurav – Portfolio

Static portfolio website (HTML5, CSS3, vanilla JavaScript). No build step, no frameworks, no backend.

## Run locally
Open `index.html` in any browser.

## Where to put your files

| What | Path | Notes |
|---|---|---|
| Profile photo | `images/profile.jpg` | Square image works best (already added) |
| Project screenshots | `images/projects/jobhub.jpg` and `images/projects/tech-shop.jpg` | **Currently placeholders.** Replace with real screenshots using the same file names (about 1200×750 px) |
| Resume PDF | `resume/resume.pdf` | Used by every "Download Resume" button. Replace to update |
| Certificates | `images/certificates/` | Add new files here, then add a card in the Certifications section of `index.html` |

## Deploy free on GitHub Pages
1. Create a new GitHub repository (e.g. `portfolio`) and upload everything in this folder (keep the folder structure).
2. Repository **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder `/ (root)`.
3. Your site will be live at `https://<username>.github.io/<repository>/`.

Netlify and Vercel also work: drag-and-drop the folder, no settings needed.

## Things to update later
- **Live demo links:** your resume mentions Netlify. If you have live URLs, add a "Live Demo" button next to GitHub in each project card in `index.html`.
- **Open Graph image:** for link previews (LinkedIn, WhatsApp), change `images/og-profile.jpg` in the `<meta property="og:image">` tag to the full URL once deployed.
- **Contact form:** it validates the fields and opens the visitor's email app (mailto). Nothing is sent automatically.

## Animations (js/script.js + css/style.css)
Custom cursor with glow trail, scroll progress bar, word-by-word section titles, directional/staggered scroll reveals, hero parallax, 3D tilt + spotlight cards, magnetic buttons, timeline line that draws on scroll, and a hero background that reacts to the mouse. Cursor, tilt and magnetic effects are disabled on touch devices, and everything respects "reduce motion" settings.