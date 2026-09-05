# Phosphene

A camera art installation: **closed-eye vision inside black frames**.

Phosphene is a fullscreen WebGL2 field built to sit with Ryan Rasmussen’s language — stacked armatures, neon, and glitch. The camera is optional. When the eye is open, the world shears into nested frames. Phone tilt, and motion guessed from the camera feed, shift the cage so the overlays feel like they hang in the room. A soothing pad runs under the image, with vinyl crackle and occasional digital glitches. The microphone is mixed into that bed through a long feedback delay so the room returns as a rhythmic pulse. The loudness gate is off for testing, so all mic sound gets through. Nothing is recorded or uploaded.

Live: [https://chrisloken.github.io/phosphene/](https://chrisloken.github.io/phosphene/)

Current release is **v2**. Source tag `v1.0.0` is the silent armature/glitch cut.

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
- **Open the camera** asks for the rear (`environment`) camera on phones, then falls back to whatever is available. Deny it and the field stays on dead air.
- Entering the field starts the pad and asks for the **microphone**. Mic audio is mixed with the pad through a 1.7s delay with feedback (gate off for testing). `M` mutes.
- On a phone, tilt the device (Safari may ask for motion permission). With the camera open, panning the feed also slides nested frames at different depths. On desktop, move the pointer.

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

Vite, TypeScript, WebGL2, Web Audio. No framework, no backend, no analytics.
