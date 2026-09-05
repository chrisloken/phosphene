export type Program = {
  id: string;
  name: string;
  index: string;
  note: string;
};

export const PROGRAMS: readonly Program[] = [
  {
    id: "armature",
    name: "Armature",
    index: "01",
    note: "Iridescent matter in a black cage — neon halo, dichroic film.",
  },
  {
    id: "cubic",
    name: "Cubic",
    index: "02",
    note: "Extruded grid. Wireframe rooms stacking and slipping.",
  },
  {
    id: "transmission",
    name: "Transmission",
    index: "03",
    note: "Scanlines, punch cards, dropped signal between stations.",
  },
  {
    id: "static",
    name: "Static",
    index: "04",
    note: "Psychedelic dead air. Afterimage as corrupted broadcast.",
  },
  {
    id: "undone",
    name: "Undone",
    index: "05",
    note: "Architecture glitch — shatter, neon lightning, collapse/build.",
  },
];
