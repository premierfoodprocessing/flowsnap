# FlowSnap

A lightweight, responsive one-page website prepared for free deployment on GitHub Pages.

## What is included

- Responsive landing page
- Mobile navigation
- URL validation and clipboard paste interaction
- Privacy and terms pages
- SEO and social metadata
- SVG favicon
- GitHub Pages compatibility

## Important limitation

This project is a front-end website only. It does not download or process media. Connect it only to a lawful, authorised backend or official API, and only process content the user owns or has permission to save.

## Publish on GitHub Pages

1. Create a new public repository, for example `flowsnap`.
2. Upload every file in this folder to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then save.
6. GitHub will provide a URL similar to `https://YOUR-USERNAME.github.io/flowsnap/`.

## Run locally

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
