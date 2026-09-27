/**
 * Carga datos de prueba variados: universidades, empresas, estudiantes,
 * ofertas, postulaciones (con estados distintos) y convenios.
 * Habla con la API ya corriendo (no toca la base directo), así que respeta
 * toda la lógica de negocio real (límites de plan, matching, etc.).
 *
 * Uso: node scripts/seed-demo-data.js [http://localhost:3000/api]
 */
const BASE = process.argv[2] || "http://localhost:3000/api";
const PASSWORD = "123456";

async function api(method, path, token, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    return { ok: false, status: res.status, error: data?.message || text };
  }
  return { ok: true, data };
}

async function registerOrLogin(payload) {
  const reg = await api("POST", "/auth/register", null, payload);
  if (reg.ok) return reg.data;
  const login = await api("POST", "/auth/login", null, { email: payload.email, password: payload.password });
  if (login.ok) return login.data;
  throw new Error(`No se pudo crear ni loguear a ${payload.email}: ${JSON.stringify(reg.error)}`);
}

const UNIVERSITIES = [
  { email: "uni@test.com", password: PASSWORD, role: "universidad", name: "UTN Facultad Regional Tucuman", location: "San Miguel de Tucuman" },
  { email: "unt@test.com", password: PASSWORD, role: "universidad", name: "Universidad Nacional de Tucuman", location: "San Miguel de Tucuman" },
  { email: "siglo21@test.com", password: PASSWORD, role: "universidad", name: "Universidad Siglo 21", location: "Cordoba (sede remota)" },
];

const COMPANIES = [
  { email: "empresa@test.com", password: PASSWORD, role: "empresa", name: "Vantia Software", rubro: "Desarrollo de software" },
  { email: "nortit@test.com", password: PASSWORD, role: "empresa", name: "NortIT Consulting", rubro: "Consultoria de datos" },
  { email: "deltalogica@test.com", password: PASSWORD, role: "empresa", name: "Deltalogica", rubro: "Logistica" },
  { email: "coral@test.com", password: PASSWORD, role: "empresa", name: "Coral Studio", rubro: "Diseno y marketing" },
  { email: "rumbonorte@test.com", password: PASSWORD, role: "empresa", name: "Rumbo Norte Logistica", rubro: "Transporte y logistica" },
];

const STUDENTS = [
  { email: "ana@test.com", password: PASSWORD, role: "estudiante", name: "Ana Carrizo", university: "UTN Facultad Regional Tucuman", career: "Ingenieria en Sistemas de Informacion", skills: ["JavaScript", "SQL", "Node.js", "Excel"] },
  { email: "martina@test.com", password: PASSWORD, role: "estudiante", name: "Martina Rios", university: "Universidad Nacional de Tucuman", career: "Ingenieria en Sistemas de Informacion", skills: ["Python", "SQL", "Excel"] },
  { email: "bruno@test.com", password: PASSWORD, role: "estudiante", name: "Bruno Salcedo", university: "UTN Facultad Regional Tucuman", career: "Ingenieria en Sistemas de Informacion", skills: ["Java", "PostgreSQL", "Docker"] },
  { email: "camila@test.com", password: PASSWORD, role: "estudiante", name: "Camila Juarez", university: "Universidad Nacional de Tucuman", career: "Diseno Grafico", skills: ["Figma", "UX/UI", "Illustrator"] },
  { email: "sofia@test.com", password: PASSWORD, role: "estudiante", name: "Sofia Molina", university: "Universidad Siglo 21", career: "Licenciatura en Administracion", skills: ["Excel", "Atencion al cliente"] },
  { email: "diego@test.com", password: PASSWORD, role: "estudiante", name: "Diego Paz", university: "UTN Facultad Regional Tucuman", career: "Licenciatura en Marketing", skills: ["Marketing digital", "SEO", "Redes sociales"] },
  { email: "lucas@test.com", password: PASSWORD, role: "estudiante", name: "Lucas Herrera", university: "Universidad Nacional de Tucuman", career: "Contador Publico", skills: ["Contabilidad", "Facturacion"] },
];

async function main() {
  console.log("== Universidades ==");
  const universities = {};
  for (const u of UNIVERSITIES) {
    const result = await registerOrLogin(u);
    universities[u.email] = result.token;
    console.log(`  ${u.name} -> ${u.email} / ${PASSWORD}`);
  }

  console.log("== Empresas ==");
  const companies = {};
  for (const c of COMPANIES) {
    const result = await registerOrLogin(c);
    companies[c.email] = result.token;
    console.log(`  ${c.name} -> ${c.email} / ${PASSWORD}`);
  }

  console.log("== Estudiantes ==");
  const students = {};
  for (const s of STUDENTS) {
    const result = await registerOrLogin(s);
    students[s.email] = result.token;
    await api("PATCH", "/students/me", result.token, { skills: s.skills, availability: "PPS / Part-time" });
    console.log(`  ${s.name} -> ${s.email} / ${PASSWORD}`);
  }

  console.log("== Ofertas ==");
  const offerDefs = [
    { companyEmail: "empresa@test.com", title: "Analista de Sistemas Jr.", area: "Sistemas y Producto", type: "PPS", modality: "Híbrida", location: "San Miguel de Tucuman", vacancies: 2, description: "Sumate al equipo de backend a construir y mantener APIs REST.", requirements: "Conocimientos de JavaScript, SQL y Node.js." },
    { companyEmail: "nortit@test.com", title: "Data Analyst Jr.", area: "Sistemas y Producto", type: "PPS", modality: "Híbrida", location: "San Miguel de Tucuman", vacancies: 2, description: "Analisis de datos comerciales y armado de reportes para clientes del NOA.", requirements: "Excel avanzado, nociones de SQL y Python." },
    { companyEmail: "deltalogica@test.com", title: "Contador/a Jr.", area: "Administracion y Legal", type: "Primer empleo", modality: "Presencial", location: "Yerba Buena", vacancies: 1, description: "Liquidacion de sueldos y gestion contable para una empresa de logistica en crecimiento.", requirements: "Contador Publico recien recibido o proximo a recibirse, conocimientos de facturacion." },
    { companyEmail: "coral@test.com", title: "Community Manager", area: "Comercial y Marketing", type: "Pasantía", modality: "Remota", location: "Remoto (NOA)", vacancies: 1, description: "Gestion de redes sociales y contenido para marcas de indumentaria.", requirements: "Manejo de redes sociales, marketing digital y SEO." },
    { companyEmail: "coral@test.com", title: "Disenador/a UX/UI Jr.", area: "Sistemas y Producto", type: "Pasantía", modality: "Remota", location: "Remoto (Argentina)", vacancies: 1, description: "Wireframes y prototipos de alta fidelidad para clientes de e-commerce.", requirements: "Manejo de Figma y nociones de UX/UI." },
    { companyEmail: "rumbonorte@test.com", title: "Analista de Operaciones", area: "Operaciones", type: "PPS", modality: "Presencial", location: "San Miguel de Tucuman", vacancies: 1, description: "Seguimiento de flotas y coordinacion de envios en tiempo real.", requirements: "Excel, atencion al detalle, disponibilidad full-time." },
  ];
  const offers = {};
  for (const o of offerDefs) {
    const token = companies[o.companyEmail];
    const { companyEmail, ...payload } = o;
    const result = await api("POST", "/offers", token, payload);
    if (result.ok) {
      offers[o.title] = result.data.id;
      console.log(`  ${o.title} (${companyEmail})`);
    } else {
      console.log(`  (omitida) ${o.title}: ${JSON.stringify(result.error)}`);
    }
  }

  console.log("== Postulaciones ==");
  const applicationDefs = [
    { studentEmail: "ana@test.com", offerTitle: "Analista de Sistemas Jr.", message: "Me interesa mucho sumar experiencia en un equipo de backend." },
    { studentEmail: "bruno@test.com", offerTitle: "Analista de Sistemas Jr.", message: "Vengo trabajando con Java y bases de datos en proyectos de la facultad." },
    { studentEmail: "martina@test.com", offerTitle: "Data Analyst Jr.", message: "Uso Python y Excel a diario en mis proyectos de facultad." },
    { studentEmail: "diego@test.com", offerTitle: "Community Manager", message: "Manejo redes sociales de un emprendimiento familiar hace 2 anios." },
    { studentEmail: "camila@test.com", offerTitle: "Disenador/a UX/UI Jr.", message: "Adjunto portfolio con proyectos de UX para apps moviles." },
    { studentEmail: "lucas@test.com", offerTitle: "Contador/a Jr.", message: "Estoy por recibirme y busco mi primera experiencia formal." },
    { studentEmail: "sofia@test.com", offerTitle: "Analista de Operaciones", message: "Tengo experiencia en atencion al cliente y quiero sumar el lado operativo." },
  ];
  const applicationIds = {};
  for (const a of applicationDefs) {
    const token = students[a.studentEmail];
    const offerId = offers[a.offerTitle];
    if (!offerId) continue;
    const result = await api("POST", "/applications", token, { offerId, message: a.message });
    if (result.ok) {
      applicationIds[`${a.studentEmail}|${a.offerTitle}`] = result.data.id;
      console.log(`  ${a.studentEmail} -> ${a.offerTitle} (match ${result.data.matchScore}%)`);
    } else {
      console.log(`  (omitida) ${a.studentEmail} -> ${a.offerTitle}: ${JSON.stringify(result.error)}`);
    }
  }

  console.log("== Variar estados de postulaciones ==");
  const statusChanges = [
    { key: "bruno@test.com|Analista de Sistemas Jr.", companyEmail: "empresa@test.com", status: "Entrevista" },
    { key: "martina@test.com|Data Analyst Jr.", companyEmail: "nortit@test.com", status: "Contratado" },
    { key: "diego@test.com|Community Manager", companyEmail: "coral@test.com", status: "En revisión" },
    { key: "sofia@test.com|Analista de Operaciones", companyEmail: "rumbonorte@test.com", status: "Rechazado" },
  ];
  for (const s of statusChanges) {
    const appId = applicationIds[s.key];
    if (!appId) continue;
    const token = companies[s.companyEmail];
    const result = await api("PATCH", `/applications/${appId}/status`, token, { status: s.status });
    console.log(`  ${s.key} -> ${s.status}: ${result.ok ? "ok" : JSON.stringify(result.error)}`);
  }

  console.log("== Convenios ==");
  const companiesList = await api("GET", "/companies", Object.values(universities)[0]);
  const companyIdByName = {};
  if (companiesList.ok) {
    for (const c of companiesList.data) companyIdByName[c.name] = c.id;
  }
  const agreementDefs = [
    { uniEmail: "uni@test.com", companyName: "Vantia Software", type: "Convenio marco", sign: true },
    { uniEmail: "uni@test.com", companyName: "NortIT Consulting", type: "Convenio PPS", sign: false },
    { uniEmail: "unt@test.com", companyName: "Deltalogica", type: "Convenio PPS", sign: true },
    { uniEmail: "unt@test.com", companyName: "Coral Studio", type: "Convenio pasantias", sign: false },
    { uniEmail: "siglo21@test.com", companyName: "Rumbo Norte Logistica", type: "Convenio marco", sign: true },
  ];
  for (const a of agreementDefs) {
    const token = universities[a.uniEmail];
    const companyId = companyIdByName[a.companyName];
    if (!companyId) {
      console.log(`  (omitido) ${a.uniEmail} - ${a.companyName}: empresa no encontrada`);
      continue;
    }
    const result = await api("POST", "/agreements", token, { companyId, type: a.type });
    if (result.ok) {
      console.log(`  ${a.uniEmail} <-> ${a.companyName} (${a.type})${a.sign ? " [firmado]" : ""}`);
      if (a.sign) await api("PATCH", `/agreements/${result.data.id}/sign`, token);
    } else {
      console.log(`  (omitido) ${a.uniEmail} - ${a.companyName}: ${JSON.stringify(result.error)}`);
    }
  }

  console.log("== Planes pagos ==");
  const planUpgrades = [
    { email: "empresa@test.com", token: companies["empresa@test.com"], role: "empresa", planName: "Profesional" },
    { email: "unt@test.com", token: universities["unt@test.com"], role: "universidad", planName: "Convenio Plus" },
  ];
  for (const p of planUpgrades) {
    const plans = await api("GET", "/plans", p.token);
    if (!plans.ok) continue;
    const plan = plans.data.find((pl) => pl.name === p.planName);
    if (!plan) continue;
    const result = await api("POST", "/plans/subscribe", p.token, { planId: plan.id });
    console.log(`  ${p.email} -> ${p.planName}: ${result.ok ? "ok" : JSON.stringify(result.error)}`);
  }

  console.log("\n== Listo ==");
  console.log("Todas las cuentas usan la contraseña:", PASSWORD);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
