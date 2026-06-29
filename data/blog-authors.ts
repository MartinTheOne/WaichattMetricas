// Autores seleccionables del blog = founders de Waichatt.
// Fuente de verdad: landing (waiprop/landing) src/config/team.ts + bio de Raúl de
// site.defaultAuthor. Son 5 nombres: se mantienen en sync a mano (no justifica un
// paquete compartido entre repos separados). El frontmatter espera { name, role?, url?, bio? }.
export type BlogAuthor = { name: string; role: string; url: string; bio: string }

export const blogAuthors: BlogAuthor[] = [
  {
    name: "Raúl Morales",
    role: "CEO de Waichatt",
    url: "https://www.linkedin.com/in/raul-morales-1ba27b1b4/",
    bio: "Cofundador y CEO de Waichatt, plataforma de CRM con IA para inmobiliarias y desarrolladoras. Escribe sobre WhatsApp, inteligencia artificial y ventas inmobiliarias.",
  },
  {
    name: "Julián López",
    role: "Cofundador de Waichatt",
    url: "https://www.linkedin.com/in/julian-lopez-garcia-809517247/",
    bio: "Cofundador de Waichatt. Escribe sobre WhatsApp, ventas inmobiliarias y atención de leads.",
  },
  {
    name: "Matías Prieto",
    role: "Cofundador de Waichatt",
    url: "https://www.linkedin.com/in/matias-prieto-75218a342",
    bio: "Cofundador y equipo técnico de Waichatt. Escribe sobre inteligencia artificial aplicada a ventas inmobiliarias.",
  },
  {
    name: "Augusto Terrera",
    role: "Cofundador de Waichatt",
    url: "https://www.linkedin.com/in/augusto-terrera",
    bio: "Cofundador y equipo técnico de Waichatt. Escribe sobre inteligencia artificial aplicada a ventas inmobiliarias.",
  },
  {
    name: "Martín González",
    role: "Cofundador de Waichatt",
    url: "https://www.linkedin.com/in/martin-gonzalez-029360306/",
    bio: "Cofundador y equipo técnico de Waichatt. Escribe sobre inteligencia artificial aplicada a ventas inmobiliarias.",
  },
]
