/**
 * Diccionario de términos (tecnologías, herramientas y habilidades) que reconocemos
 * dentro del texto de un CV. No es procesamiento de lenguaje natural: es una lista
 * curada, pensada para los rubros que maneja PraxisLink (Sistemas, Comercial,
 * Administración, Talent, Operaciones). Cada entrada puede tener variantes
 * (ej: "node" y "node.js") que se normalizan al mismo término canónico.
 */
const KEYWORD_DICTIONARY: Array<{ canonical: string; variants: string[] }> = [
  // Lenguajes
  { canonical: "JavaScript", variants: ["javascript"] },
  { canonical: "TypeScript", variants: ["typescript"] },
  { canonical: "Python", variants: ["python"] },
  { canonical: "Java", variants: ["java"] },
  { canonical: "PHP", variants: ["php"] },
  { canonical: "C++", variants: ["c++", "c plus plus"] },
  { canonical: "C#", variants: ["c#", "c sharp"] },
  { canonical: ".NET", variants: [".net", "dotnet"] },

  // Backend / frameworks
  { canonical: "Node.js", variants: ["node.js", "nodejs", "node js"] },
  { canonical: "NestJS", variants: ["nestjs", "nest.js", "nest js"] },
  { canonical: "Express", variants: ["express.js", "expressjs", "express js", "express"] },
  { canonical: "Django", variants: ["django"] },
  { canonical: "Flask", variants: ["flask"] },
  { canonical: "FastAPI", variants: ["fastapi"] },
  { canonical: "Spring Boot", variants: ["spring boot", "spring"] },
  { canonical: "Laravel", variants: ["laravel"] },
  { canonical: "GraphQL", variants: ["graphql"] },
  { canonical: "WebSockets", variants: ["websocket", "websockets", "socket.io"] },
  { canonical: "Microservicios", variants: ["microservicio", "microservicios", "microservice"] },

  // Frontend
  { canonical: "React", variants: ["react.js", "reactjs", "react"] },
  { canonical: "Next.js", variants: ["next.js", "nextjs"] },
  { canonical: "Angular", variants: ["angular"] },
  { canonical: "Vue", variants: ["vue.js", "vuejs", "vue"] },
  { canonical: "HTML", variants: ["html5", "html"] },
  { canonical: "CSS", variants: ["css3", "css"] },
  { canonical: "Sass/SCSS", variants: ["scss", "sass"] },
  { canonical: "Tailwind CSS", variants: ["tailwind css", "tailwindcss", "tailwind"] },
  { canonical: "Bootstrap", variants: ["bootstrap"] },
  { canonical: "Material UI", variants: ["material ui", "materialui", "mui"] },
  { canonical: "Redux", variants: ["redux"] },

  // Bases de datos
  { canonical: "SQL", variants: ["sql"] },
  { canonical: "PostgreSQL", variants: ["postgresql", "postgres"] },
  { canonical: "MySQL", variants: ["mysql"] },
  { canonical: "SQL Server", variants: ["sql server", "sqlserver", "mssql"] },
  { canonical: "SQLite", variants: ["sqlite"] },
  { canonical: "Oracle", variants: ["oracle"] },
  { canonical: "MongoDB", variants: ["mongodb", "mongo"] },
  { canonical: "Redis", variants: ["redis"] },
  { canonical: "Prisma", variants: ["prisma orm", "prisma"] },
  { canonical: "TypeORM", variants: ["typeorm"] },
  { canonical: "Sequelize", variants: ["sequelize"] },
  { canonical: "Supabase", variants: ["supabase"] },
  { canonical: "Firebase", variants: ["firebase"] },

  // Infraestructura, DevOps y cloud
  { canonical: "Docker", variants: ["docker"] },
  { canonical: "Kubernetes", variants: ["kubernetes", "k8s"] },
  { canonical: "AWS", variants: ["aws", "amazon web services"] },
  { canonical: "Azure", variants: ["azure"] },
  { canonical: "Google Cloud", variants: ["google cloud", "gcp"] },
  { canonical: "Heroku", variants: ["heroku"] },
  { canonical: "Vercel", variants: ["vercel"] },
  { canonical: "Netlify", variants: ["netlify"] },
  { canonical: "Nginx", variants: ["nginx"] },
  { canonical: "CI/CD", variants: ["ci/cd", "ci cd", "integración continua", "integracion continua"] },
  { canonical: "Jenkins", variants: ["jenkins"] },
  { canonical: "GitHub Actions", variants: ["github actions"] },
  { canonical: "Kafka", variants: ["kafka"] },
  { canonical: "RabbitMQ", variants: ["rabbitmq"] },
  { canonical: "BullMQ", variants: ["bullmq"] },
  { canonical: "Git", variants: ["github", "gitlab", "git"] },
  { canonical: "Linux", variants: ["linux"] },
  { canonical: "Webpack", variants: ["webpack"] },
  { canonical: "Vite", variants: ["vite"] },

  // Testing y calidad
  { canonical: "Testing", variants: ["testing", "control de calidad"] },
  { canonical: "QA", variants: ["qa"] },
  { canonical: "Jest", variants: ["jest"] },
  { canonical: "Cypress", variants: ["cypress"] },
  { canonical: "Selenium", variants: ["selenium"] },
  { canonical: "Postman", variants: ["postman"] },

  // Seguridad / autenticación
  { canonical: "JWT", variants: ["jwt", "json web token"] },
  { canonical: "OAuth", variants: ["oauth"] },
  { canonical: "RBAC", variants: ["rbac", "control de acceso basado en roles"] },
  { canonical: "APIs REST", variants: ["api rest", "rest api", "apis rest"] },

  // Metodologías y diseño de producto
  { canonical: "Scrum", variants: ["scrum"] },
  { canonical: "Agile", variants: ["agile", "metodologías ágiles", "metodologias agiles"] },
  { canonical: "Figma", variants: ["figma"] },
  { canonical: "UX/UI", variants: ["ux/ui", "experiencia de usuario", "ux", "ui"] },

  // Comercial y Marketing
  { canonical: "Ventas", variants: ["ventas", "vendedor"] },
  { canonical: "Marketing digital", variants: ["marketing digital", "marketing"] },
  { canonical: "SEO", variants: ["seo"] },
  { canonical: "SEM", variants: ["sem"] },
  { canonical: "Redes sociales", variants: ["redes sociales", "community manager", "social media"] },
  { canonical: "CRM", variants: ["crm", "hubspot", "salesforce"] },
  { canonical: "Atención al cliente", variants: ["atención al cliente", "atencion al cliente", "customer success"] },
  { canonical: "Negociación", variants: ["negociación", "negociacion"] },

  // Administración y Legal
  { canonical: "Contabilidad", variants: ["contabilidad", "contable"] },
  { canonical: "Facturación", variants: ["facturación", "facturacion"] },
  { canonical: "Excel", variants: ["excel", "excel avanzado"] },
  { canonical: "Power BI", variants: ["power bi", "powerbi"] },
  { canonical: "Recursos Humanos", variants: ["recursos humanos", "rrhh", "hr"] },
  { canonical: "Reclutamiento", variants: ["reclutamiento", "selección de personal", "seleccion de personal"] },
  { canonical: "Legales", variants: ["derecho", "legales", "abogacía", "abogacia"] },

  // Transversales
  { canonical: "Inglés", variants: ["inglés", "ingles", "english", "b1", "b2", "c1"] },
  { canonical: "Comunicación", variants: ["comunicación", "comunicacion"] },
  { canonical: "Liderazgo", variants: ["liderazgo"] },
  { canonical: "Trabajo en equipo", variants: ["trabajo en equipo"] },
  { canonical: "Gestión de proyectos", variants: ["gestión de proyectos", "gestion de proyectos", "project management"] },
  { canonical: "Resolución de problemas", variants: ["resolución de problemas", "resolucion de problemas"] },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * true si `term` aparece en `text` como palabra/término completo, no como
 * substring suelto. Evita falsos positivos como detectar "Java" únicamente
 * porque el texto dice "JavaScript", o "SQL" únicamente porque dice "PostgreSQL".
 * Se usa tanto para extraer palabras clave del CV como para compararlas
 * después contra los requisitos de cada oferta.
 */
export function containsTerm(text: string, term: string): boolean {
  const normalizedText = normalize(text);
  const normalizedTerm = normalize(term);
  const startsWithWordChar = /^[a-z0-9]/.test(normalizedTerm);
  const endsWithWordChar = /[a-z0-9]$/.test(normalizedTerm);
  const pattern = `${startsWithWordChar ? "\\b" : ""}${escapeRegex(normalizedTerm)}${endsWithWordChar ? "\\b" : ""}`;
  return new RegExp(pattern, "i").test(normalizedText);
}

// Reconoce líneas del tipo "Backend: NestJS, Node.js, TypeScript." o
// "Infraestructura & Testing: Docker, Git, Linux.", muy comunes en la sección
// de habilidades/tecnologías de un CV.
const LABELED_LIST_LINE = /^[\s•●\-]*([\p{L}][\p{L}\s&()/]{1,40}):\s*(.+)$/u;

/**
 * Si el CV tiene líneas del tipo "Backend: NestJS, Node.js, TypeScript.",
 * devuelve solo el texto de esas listas (lo que la persona realmente cargó
 * como sus habilidades/tecnologías). Si no encuentra ninguna, devuelve null
 * para que se use el documento completo como respaldo.
 *
 * Esto evita falsos positivos como detectar "RBAC" o "Ventas" únicamente
 * porque esas palabras aparecen sueltas dentro de una oración que describe
 * una tarea (ej: "un control de accesos basado en roles (RBAC)"), en vez de
 * en una lista de habilidades.
 */
function extractLabeledSkillLines(rawText: string): string | null {
  const matches: string[] = [];
  for (const line of rawText.split(/\r?\n/)) {
    const match = line.match(LABELED_LIST_LINE);
    if (match) matches.push(match[2]);
  }
  return matches.length > 0 ? matches.join(" ") : null;
}

/**
 * Recorre el texto (extraído del PDF del CV) y devuelve la lista de términos
 * canónicos del diccionario que aparecen mencionados, sin duplicados.
 * Esto es lo que después se compara contra los requisitos de cada oferta
 * para calcular el % de compatibilidad.
 */
export function extractKeywordsFromCvText(rawText: string): string[] {
  const skillsSection = extractLabeledSkillLines(rawText);
  const text = normalize(skillsSection ?? rawText);
  const found = new Set<string>();

  for (const entry of KEYWORD_DICTIONARY) {
    const matches = entry.variants.some((variant) => containsTerm(text, normalize(variant)));
    if (matches) found.add(entry.canonical);
  }

  return Array.from(found);
}
