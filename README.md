# Phosphene

A camera art installation: **closed-eye vision from an open camera**.

Phosphene is a fullscreen WebGL2 field. It synthesizes the lights that appear when you press on an eyelid — pressure blobs, Klüver form constants (lattice, tunnel, spiral), retinal afterimages, and scintillating aura. A live camera is optional. When the eye is open, the world bleeds into the field. When it is closed, the piece keeps running from noise and memory. Nothing is recorded or uploaded.

Live: [https://chrisloken.github.io/phosphene/](https://chrisloken.github.io/phosphene/)

## Programs

1. **Pressure** — expanding rings and soft gold/magenta blobs
2. **Lattice** — honeycomb / cobweb form constant
3. **Spiral** — tunnel and funnel
4. **Afterimage** — complementary burn of the camera (or a closed-eye stand-in)
5. **Aura** — fortification spectra around a moving scotoma

## Controls

- Click or tap the field to cycle programs
- Keys `1`–`5` jump to a program
- Hold **space** (or press and hold) to increase eyelid pressure
- `H` hides the captions
- `F` toggles fullscreen
- **Open the camera** asks for `getUserMedia`. Deny it and the eyelids stay closed.

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
