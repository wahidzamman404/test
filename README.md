# Shahbaz Furniture

A complete static website demo for a Pakistani furniture and custom woodwork business. The visual direction combines courtyard architecture, jali patterns, sheesham tones, clay and brass accents, and English/Urdu typography. Built with HTML, CSS, and vanilla JavaScript. No application dependencies, build step, database, or API keys are required. Images and fonts are stored locally.

## View the demo

Open `index.html` in a modern browser. Keep `styles.css`, `app.js`, and `assets/` alongside it.

For local development:

```sh
cd /workspace/test
python -m http.server 8000 --bind 0.0.0.0
```

Stop the server with Ctrl+C. Future tasks should use this existing checkout; no Git worktree is needed.

`dist/shahbaz-furniture-demo.html` is also a standalone version with its fonts, pictures, styles, and scripts embedded. Open it directly or send it as one file.

## Included

- Responsive layouts, sticky navigation, mobile menu, and back-to-top button.
- Six illustrative products with category filters and detailed product dialogs.
- Pakistani collection names, Urdu labels, and locally served Noto Nastaliq typography.
- Interactive sheesham, deodar, and ash preferences carried into the project inquiry.
- Custom project information, woodwork process, and expandable FAQs.
- Product-to-inquiry prefill, native form validation, inquiry preview, copy, and TXT download.
- Keyboard support, focus restoration, labelled forms, reduced motion, and locally stored fonts.

The form prepares a project brief on the visitor's device. It does not send information or store personal information. Lahore is a sample location. There is no live business phone number, payment flow, or order submission in this demo.

## Customize

- Business name, copy, navigation, showroom details, and form options: `index.html`.
- Colors, typography, layouts, and breakpoints: `styles.css`.
- Product names, descriptions, images, and filtering: the `products` array in `app.js`.
- Photographs: replace files in `assets/` with the business's own work.
- Inquiry delivery: connect the form to the business's real contact channel or an appropriate server endpoint when moving beyond the demo.

## Source assets

`assets/credits.json` records source details and file hashes. The courtyard hero and Dastarkhwan dining scene are original generated concept images. Other photos are illustrative sample photos, not completed Shahbaz Furniture projects. The sample photo source repositories do not document original photo licenses; use the business's own photos or verified licensed photos for commercial publication. DM Sans, Cormorant Garamond, and Noto Nastaliq Urdu font licenses are included under `assets/`.

## Validation

Run the included browser smoke test against a running server:

```sh
python tests/smoke.py
```

This check requires Python Playwright and Chromium; neither is required to view or serve the site.

Rebuild the standalone demo after editing the source:

```sh
python tools/build_standalone.py
```

## GitHub publication

The source is intended for `wahidzamman404/test` on GitHub. The `gh-pages` branch contains the standalone site as `index.html`, with all required images, fonts, styles, and JavaScript embedded. This lets GitHub Pages serve the complete demo without a build service or application server.

To activate hosting in the repository, open **Settings → Pages**, choose **Deploy from a branch**, select **gh-pages** and **/(root)**, then save. GitHub shows the live URL after deployment. The expected project address is `https://wahidzamman404.github.io/test/`; that address is only live after GitHub confirms deployment.

To download the source through GitHub, use **Code → Download ZIP**, extract the archive, and open `dist/shahbaz-furniture-demo.html` in a browser.
