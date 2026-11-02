# 🎯 Hollow Point — Gunshot Localization Simulator

> A real TDOA (time-difference-of-arrival) gunshot localization simulator —
> generate a shot, tweak wind/obstacles, and watch an actual multilateration
> solver estimate the source position from microphone timing data.

A military-themed canvas simulation with a 6-microphone array, adjustable
wind speed/direction, and toggleable obstacles (bunker, wall, vehicle).

🔗 **Live:** [hollowpoint.vercel.app](https://hollowpoint.vercel.app)

![Static Site](https://img.shields.io/badge/type-static%20site-blue)
![Canvas](https://img.shields.io/badge/rendering-Canvas%202D-F7DF1E)
![math.js](https://img.shields.io/badge/math-math.js-orange)
![Deployed on Vercel](https://img.shields.io/badge/deployed-Vercel-black)

---

## ✨ What it does

- **Generate Gunshot** — places a random shot position within range of the
  6-mic array
- Adjustable **wind speed** (0–20 m/s) and **wind direction** (0–360°),
  visualized as an arrow, which skews each mic's measured arrival time
- Toggleable **obstacles** (Bunker / Wall / Vehicle) that block line-of-sight
  between the shot and a microphone, adding measurement noise
- **Predict Location** — runs real TDOA multilateration on the simulated
  arrival-time data and shows the predicted point + actual error distance

## 🧮 How the localization actually works

`calculateTimeDelays()` computes each microphone's true distance to the
shot, perturbs it by the wind component along that bearing, and (if the
line-of-sight is blocked by an obstacle) adds a distortion factor — then
converts to arrival-time delays relative to the first mic to detect the
shot.

`predict()` solves the inverse problem: given those six relative delays,
where was the shot? This is **standard TDOA multilateration** — pick the
mic with the smallest delay as reference, and for every other mic the
measured range difference gives one linear equation in the unknown source
position (after the usual trick of expanding and cancelling the `x² + y²`
term). With 6 mics that's 5 equations in 2 unknowns — solved as a
least-squares linear system via [math.js](https://mathjs.org/)'s
`lusolve`, which was loaded via CDN but previously never used.

**Verified:** with no wind and no obstacles, the solver recovers the exact
shot position (0.00m error) for arbitrary positions — confirmed both via a
standalone Node test against the same mathjs version and live in-browser.
With wind or obstacles active, error increases proportionally and
consistently (not randomly) — e.g. ~13m typical error at 15 m/s wind,
demonstrating the real accuracy cost of environmental interference, which
is the actual point of having those dials.

### What changed from the original version

The original `predict()` ignored the `timeDelays` argument completely and
returned a random point near the *known* actual location — so the
simulator always looked plausible regardless of whether the underlying
math did anything. It's now a real multilateration solve.

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
├── script.js      # simulation + TDOA multilateration solver
├── styles.css      # military/neon-green terminal aesthetic
└── camo.png        # background texture
```

## ⚠️ Known limitations

- The least-squares solve doesn't explicitly model obstacle-induced
  distance distortion as measurement *noise* with a known covariance — it
  just treats the distorted range as ground truth, so obstacle error shows
  up as solver bias rather than modeled uncertainty. A more rigorous
  version would weight each equation by estimated measurement confidence.
- Obstacle geometry is fixed per checkbox (hardcoded x/y per obstacle
  index) rather than user-placeable.
