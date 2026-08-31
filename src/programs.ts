export type Program = {
  id: string;
  name: string;
  index: string;
  note: string;
};

export const PROGRAMS: readonly Program[] = [
  {
    id: "pressure",
    name: "Pressure",
    index: "01",
    note: "Lights that appear when you press on the eyelid.",
  },
  {
    id: "lattice",
    name: "Lattice",
    index: "02",
    note: "Klüver form constant — honeycomb, checker, cobweb.",
  },
  {
    id: "spiral",
    name: "Spiral",
    index: "03",
    note: "Tunnel and funnel; the eye falling inward.",
  },
  {
    id: "afterimage",
    name: "Afterimage",
    index: "04",
    note: "The world burned complementary onto the retina.",
  },
  {
    id: "aura",
    name: "Aura",
    index: "05",
    note: "Scintillating scotoma — fortification spectra at the edge of sight.",
  },
];
