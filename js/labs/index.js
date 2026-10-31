import forces from "./forces.js";
import structures from "./structures.js";
import machines from "./machines.js";
import energy from "./energy.js";
import circuits from "./circuits.js";
import buoyancy from "./buoyancy.js";
import materials from "./materials.js";
import flight from "./flight.js";
import { extensionLabs } from "./next.js";

/** Ordered list used by the hub, progress bar and "next lab" button. */
const coreLabs = [
  forces,
  energy,
  flight,
  structures,
  machines,
  materials,
  buoyancy,
  circuits,
];

const sections = {
  "Motion & energy": ["forces", "energy", "flight", "momentum", "gravity", "gear-ratio", "sound-waves"],
  "Structures & materials": ["structures", "machines", "materials", "arches", "tower-wind", "thermal", "material-match"],
  "Fluids & water": ["buoyancy", "density", "water-pressure", "water-wheel"],
  "Electricity & signals": ["circuits", "series-parallel", "electromagnet", "solar", "signals"],
  "Systems & design": ["sensor", "feedback"],
};

const allLabs = [...coreLabs, ...extensionLabs];
export const labs = Object.entries(sections).flatMap(([section, ids]) =>
  ids.map((id) => {
    const lab = allLabs.find((item) => item.id === id);
    return { ...lab, section };
  }),
).map((lab, index) => ({ ...lab, num: String(index + 1).padStart(2, "0") }));

export default labs;
