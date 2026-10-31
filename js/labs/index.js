import forces from "./forces.js";
import structures from "./structures.js";
import machines from "./machines.js";
import energy from "./energy.js";
import circuits from "./circuits.js";
import buoyancy from "./buoyancy.js";
import materials from "./materials.js";
import flight from "./flight.js";

/** Ordered list used by the hub, progress bar and "next lab" button. */
export const labs = [
  forces,
  structures,
  machines,
  energy,
  circuits,
  buoyancy,
  materials,
  flight,
];

export default labs;
