# Engineer Playground

An animated, hands-on engineering playground for curious kids. Explore eight mini-labs covering forces, structures, simple machines, energy, circuits, buoyancy, materials, and flight.

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

| Lab | Concepts |
| --- | --- |
| Rocket Sled | Forces and friction |
| Bridge Builder | Structures and triangles |
| Machine Lab | Levers, pulleys, and ramps |
| Coaster Energy | Potential and kinetic energy |
| Circuit Lab | Conductors and closed circuits |
| Cargo Boat | Buoyancy |
| Egg Drop | Materials and impact |
| Glider Launch | Flight and projectile motion |

Progress is saved in the browser using `localStorage`. Sound effects are synthesized in the browser; Google Fonts are loaded from Google Fonts when online.

## Tech

- HTML, CSS, and vanilla JavaScript (ES modules)
- Canvas and inline SVG animations
- No framework, dependencies, or build process
- Responsive layout for desktop, tablet, and mobile
