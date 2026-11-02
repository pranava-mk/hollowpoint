# 🎯 Hollow Point — Gunshot Localization Simulator

> A visual sandbox for TDOA (time-difference-of-arrival) gunshot
> localization — generate a shot, tweak wind/obstacles, see how prediction
> error changes.

A military-themed canvas simulation with a 6-microphone array, adjustable
wind speed/direction, and toggleable obstacles (bunker, wall, vehicle).

🔗 **Live:** [hollowpoint.vercel.app](https://hollowpoint.vercel.app)

![Static Site](https://img.shields.io/badge/type-static%20site-blue)
![Canvas](https://img.shields.io/badge/rendering-Canvas%202D-F7DF1E)
![Deployed on Vercel](https://img.shields.io/badge/deployed-Vercel-black)

---

## ✨ What it does

- **Generate Gunshot** — places a random shot position within range of the
  6-mic array
- Adjustable **wind speed** (0–20 m/s) and **wind direction** (0–360°),
  visualized as an arrow
- Toggleable **obstacles** (Bunker / Wall / Vehicle) that block line-of-sight
  between the shot and a microphone
- **Predict Location** — shows a predicted point and the resulting error
  distance vs. the actual shot

## ⚠️ Honest status: the "prediction" is simulated, not real localization

This is worth being upfront about, since the subject matter (gunshot
localization) sounds like it should be doing real signal processing:

- `calculateTimeDelays()` genuinely computes per-microphone distances and
  time-of-arrival differences, factoring in wind and obstacle line-of-sight
  — that part is real math.
- **`predict()` does NOT use those time delays.** It ignores the computed
  `timeDelays` argument entirely and instead returns a random point within
  a fixed radius of the *known* actual location — i.e. it fakes a
  plausible-looking prediction rather than actually triangulating one from
  the time-delay data.
- `math.js` is loaded via CDN but never referenced anywhere in `script.js`
  — dead dependency, presumably intended for the real triangulation math
  that was never wired in.

So: the simulation *looks* like it's demonstrating TDOA localization
accuracy under wind/obstacles, but the "error" you see is actually just a
random number scaled to look plausible, not a real measure of how well the
math performs. Treat this as a UI/visualization prototype for the concept,
not a working localization algorithm.

## 🚀 Getting Started

Pure static HTML/CSS/JS, no build step:

```bash
python3 -m http.server 8000
```

Then open **http://localhost:8000**.

## 🗂️ Project Structure

```
hollowpoint/
├── index.html    # layout: canvas, control panel, info panel
├── script.js      # simulation logic (see honesty note above)
├── styles.css      # military/neon-green terminal aesthetic
└── camo.png        # background texture
```

## 🔧 If you want to actually wire up real triangulation

The pieces are mostly there — `calculateTimeDelays()` already produces real
per-mic delay data. The actual fix is replacing `predict()`'s body with a
real multilateration solve (e.g. least-squares over the time differences)
instead of the random-point placeholder, and putting the already-loaded
`math.js` to use for that.
