# Phosphene

A camera art installation: **closed-eye vision inside black frames**.

Phosphene is a fullscreen WebGL2 field built to sit with Ryan Rasmussen’s language — stacked armatures, neon, and glitch. The camera is optional. When the eye is open, the world shears into nested frames. When it is closed, the piece keeps running as dropped signal. Nothing is recorded or uploaded.

Live: [https://chrisloken.github.io/phosphene/](https://chrisloken.github.io/phosphene/)

## Programs

1. **Armature** — iridescent matter in a black cage, neon halo
2. **Cubic** — extruded wireframe rooms
3. **Transmission** — scanlines, punch cards, dropped signal
4. **Static** — psychedelic dead air / corrupted broadcast
5. **Undone** — architecture glitch, shatter, neon lightning

## Controls

- Click or tap the field to cycle programs
- Keys `1`–`5` jump to a program
- Hold **space** (or press and hold) to increase interference
- `H` hides the captions
- `F` toggles fullscreen
- **Open the camera** asks for `getUserMedia`. Deny it and the field stays on dead air.

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://127.0.0.1:43147/`). A camera needs HTTPS or localhost.

```bash
npm run build
npm run preview
```

## Publish to GitHub Pages

From this directory (or `/agent/phosphene` if that path is linked):

```bash
./scripts/publish-github-pages.sh
```

The script targets [chrisloken/phosphene](https://github.com/chrisloken/phosphene), pushes `main`, and deploys the production build to `gh-pages` so the site is served at `https://chrisloken.github.io/phosphene/`.

It needs the GitHub CLI (`gh`) authenticated as **chrisloken** with permission to push and to enable Pages. Override the owner with `GITHUB_PAGES_OWNER` if needed.

## Stack

Vite, TypeScript, WebGL2. No framework, no backend, no analytics.
