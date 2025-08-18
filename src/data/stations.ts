export type Station = {
  id: string;
  name: string;
  description?: string;
  streamUrl: string; // URL de Zeno: https://stream.zeno.fm/....
  imageUrl: string;  // Logo/cover
  genres: string[];
  zenoUrl?: string;  // ← opcional: perfil público en Zeno.fm (reemplaza cuando lo tengas)
};

export const stations: Station[] = [
  {
    id: "romantica",
    name: "Radio Romántica USS",
    description: "Baladas en español",
    streamUrl: "https://stream.zeno.fm/fcocpujtg6kuv",
    imageUrl:
      "https://images.zeno.fm/krx4WHsrRUiQIs6hskwbNITNj-hfFBnW3AkspfIu7tU/rs:fit:170:170/g:ce:0:0/aHR0cHM6Ly9zdHJlYW0tdG9vbHMuemVub21lZGlhLmNvbS9jb250ZW50L3N0YXRpb25zLzcxNjljYWE3LWI3NGYtNDE2Zi04ZTEwLTJkN2Q3Y2E3M2RmMC9pbWFnZS8_dT0xNzU0NTQ1Mzg1NTIz.webp",
    genres: ["Baladas", "Romántica", "Pop latino"],
    zenoUrl: "https://zeno.fm/radio/radio-romantica-uss/", 
  },
  {
    id: "folclore",
    name: "Folclore peruano",
    description: "Música andina y huayno",
    streamUrl: "https://stream.zeno.fm/2cryaopfrl2tv",
    imageUrl:
      "https://images.zeno.fm/2iVyMBTlcTBDNr2Io4GFtnjJBWY9G5G7va3oqNiABlQ/rs:fit:170:170/g:ce:0:0/aHR0cHM6Ly9zdHJlYW0tdG9vbHMuemVub21lZGlhLmNvbS9jb250ZW50L3N0YXRpb25zLzk1MjNlMmQyLTM4YzAtNGJlNC1hZWQwLTVmNjE0OTFmMmRkNS9pbWFnZS8_dT0xNzU0NTQ2MjgzMTMx.webp",
    genres: ["Huayno", "Andina", "Folclore"],
    zenoUrl: "https://zeno.fm/radio/radio-folclore-gvbk/", 
  },
  {
    id: "sabor",
    name: "Radio Sabor",
    description: "Ritmos tropicales 24/7",
    streamUrl: "https://stream.zeno.fm/gveyphbr9jpuv",
    imageUrl:
      "https://zeno.fm/_ipx/_/https://images.zeno.fm/aRRhtW-Aj-Y418EJ-BPdEvqqIGmmwNvxit5l2ywb-7s/rs:fill:288:288/g:ce:0:0/aHR0cHM6Ly9wcm94eS56ZW5vLmZtL2NvbnRlbnQvc3RhdGlvbnMvZGQ0Mjk4MGQtODY4NC00OGMwLTlmYTUtNDI4MTY3ZGVmZjJlL2ltYWdlLz91PTE3NDQwMzk3MzQwMDA.webp",
    genres: ["Salsa", "Cumbia", "Merengue"],
    zenoUrl: "https://zeno.fm/radio/radio-sabor-uss/", 
  },
  {
    id: "rockpop",
    name: "Radio Rock & Pop",
    description: "Clásicos de rock and roll y pop",
    streamUrl: "https://stream.zeno.fm/vth96t3szc9uv",
    imageUrl:
      "https://images.zeno.fm/D2LY5HHog1syxJ9KiyT4yFF1eR5aNcpqheZnI-A0dRk/rs:fit:170:170/g:ce:0:0/aHR0cHM6Ly9zdHJlYW0tdG9vbHMuemVub21lZGlhLmNvbS9jb250ZW50L3N0YXRpb25zL2FneHpmbnBsYm04dGMzUmhkSE55TWdzU0NrRjFkR2hEYkdsbGJuUVlnSUR3Z2FyQTVBc01DeElPVTNSaGRHbHZibEJ5YjJacGJHVVlnSUR3OGN5RnB3c01vZ0VFZW1WdWJ3L2ltYWdlLz91PTE3NTQ5NTkzOTM2NzU.webp",
    genres: ["Rock and roll", "Pop"],
    zenoUrl: "https://zeno.fm/radio/ussradiochiclayo/", 
  },
];
