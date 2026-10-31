# Engineer Playground

An animated, hands-on engineering playground for curious kids. Explore 25 mini-labs that move from motion and energy to structures, materials, water, electricity, and complete systems.

**Play it:** [CE47.github.io/Engr_Concepts](https://CE47.github.io/Engr_Concepts/)

## Run locally

This is a static site with no build step. Since it uses JavaScript ES modules, serve the project over HTTP rather than opening `index.html` directly.

```bash
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

## Publish with GitHub Pages

1. Push this project to [github.com/CE47/Engr_Concepts](https://github.com/CE47/Engr_Concepts).
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/ (root)` folder, then click **Save**.
5. After GitHub finishes deploying, visit [https://CE47.github.io/Engr_Concepts/](https://CE47.github.io/Engr_Concepts/).

The site uses relative asset paths, so it can be hosted from the repository’s project page.

## Labs

### Motion & energy

| Lab | Concepts |
| --- | --- |
| Rocket Sled | Forces and friction |
| Coaster Energy | Potential and kinetic energy |
| Glider Launch | Flight and projectile motion |
| Momentum Mixer | Momentum and mass |
| Gravity Drop | Gravity and air drag |
| Gear Train | Gear ratios, speed, and turning force |
| Sound Wave Studio | Vibration, pitch, and volume |

### Structures & materials

| Lab | Concepts |
| --- | --- |
| Bridge Builder | Structures and triangles |
| Machine Lab | Levers, pulleys, and ramps |
| Egg Drop | Materials and impact |
| Arch Builder | Arches and compression |
| Windproof Tower | Stability and wind |
| Heat & Expand | Thermal expansion and design gaps |
| Material Match | Material properties and trade-offs |

### Fluids & water

| Lab | Concepts |
| --- | --- |
| Cargo Boat | Buoyancy |
| Density Diver | Density and floating |
| Deep Sea Pressure | Water pressure and depth |
| Water Wheel Power | Flow and energy transfer |

### Electricity & signals

| Lab | Concepts |
| --- | --- |
| Circuit Lab | Conductors and closed circuits |
| Series or Parallel? | Parallel circuit paths |
| Electromagnet Lift | Coils, current, and magnetism |
| Solar Tracker | Sunlight and solar panels |
| Signal Relay | Signals and networks |

### Systems & design

| Lab | Concepts |
| --- | --- |
| Smart Greenhouse | Sensors and automation |
| Steady Robot | Feedback and control |

Progress is saved in the browser using `localStorage`. Sound effects are synthesized in the browser; Google Fonts are loaded from Google Fonts when online.

The hub groups labs by learning area. New missions use a shared test loop: adjust two controls, run the animated experiment, read the result, and tune again. Each mission includes a short hint that explains the engineering idea in everyday language.

## Tech

- HTML, CSS, and vanilla JavaScript (ES modules)
- Canvas and inline SVG animations
- No framework, dependencies, or build process
- Responsive layout for desktop, tablet, and mobile
