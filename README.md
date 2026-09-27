# PraxisLink — Prototipo funcional

Aplicación full-stack real (no un mockup estático) de la plataforma PraxisLink:
conecta estudiantes universitarios con empresas para PPS, pasantías y primer empleo,
y a las universidades para el seguimiento de sus convenios.

## Stack

- **Backend**: NestJS + TypeScript, PostgreSQL (TypeORM), autenticación JWT, subida de
  archivos con Multer (guardados en disco, en `backend/uploads/`).
- **Frontend**: React + TypeScript (Vite), React Router, Axios.
- **Base de datos**: PostgreSQL corriendo en Docker.

## Requisitos

- Node.js 18+
- Docker y Docker Compose

## Hostearlo (para que sea accesible fuera de tu compu)

El backend puede servir también el frontend ya compilado desde un único
puerto (útil para hostear todo en un solo lugar): ver
[`TERMUX-DEPLOY.md`](./TERMUX-DEPLOY.md) para la guía paso a paso de cómo
levantarlo en un celular Android con Termux y exponerlo a internet con un
túnel de Cloudflare.

## Puesta en marcha

Desde la raíz del proyecto (`praxislink-app/`):

```bash
# 1) Variables de entorno
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2) Base de datos (Postgres en Docker, puerto 5433 en el host
#    para no chocar con otro Postgres que ya tengas corriendo en el 5432)
docker compose up -d

# 3) Backend
cd backend
npm install
npm run start:dev      # http://localhost:3000/api

# 4) Frontend (en otra terminal)
cd frontend
npm install
npm run dev             # http://localhost:5173
```

Abrí `http://localhost:5173`, creá una cuenta (Empresa, Estudiante o Universidad) y probá el flujo.

### Cargar datos de prueba

```bash
cd backend
node scripts/seed-demo-data.js
```

Crea (o reutiliza si ya existen) un set variado de cuentas — 3 universidades,
5 empresas y 7 estudiantes con habilidades distintas —, publica ofertas,
genera postulaciones con estados distintos (Nuevo, En revisión, Entrevista,
Contratado, Rechazado), convenios entre universidades y empresas, y deja dos
cuentas con un plan pago activo. Todas usan la contraseña **123456**:

| Rol | Cuentas |
|---|---|
| Empresa | empresa@test.com (Vantia Software), nortit@test.com (NortIT Consulting), deltalogica@test.com (Deltalógica), coral@test.com (Coral Studio), rumbonorte@test.com (Rumbo Norte Logística) |
| Estudiante | ana@test.com, martina@test.com, bruno@test.com, camila@test.com, sofia@test.com, diego@test.com, lucas@test.com |
| Universidad | uni@test.com (UTN FRT), unt@test.com (UNT), siglo21@test.com (Siglo 21) |

### Cuenta de administrador

El rol de administrador no se autoregistra (por seguridad, `/auth/register`
rechaza `role: "admin"`). Se crea con un script aparte:

```bash
cd backend
node scripts/create-admin.js admin@praxislink.com admin123456
```

Si el email ya existe, el script le resetea la contraseña. Con esa cuenta
entrás a `/admin`: un panel con estadísticas generales (usuarios, ofertas,
postulaciones, convenios, facturación estimada) y el listado completo de
usuarios de la plataforma con su plan actual.

## Cómo funciona lo importante

- **Login/registro**: JWT real, contraseñas hasheadas con bcrypt. Cada rol (empresa,
  estudiante, universidad, administrador) tiene su propio perfil y sus propias pantallas.
  Los formularios de registro, publicar oferta y edición de perfil validan de verdad
  (formato de email, largo mínimo, campos obligatorios) antes de mandar nada al servidor.
- **Matching de postulaciones**: al subir el CV en PDF, el backend le extrae el texto
  (`pdf-parse`) y detecta ahí mismo palabras clave conocidas — tecnologías, herramientas,
  idiomas, habilidades blandas (`backend/src/applications/cv-keywords.ts`) —, no solo lo
  que el estudiante tipeó a mano en "Habilidades". Esas palabras del CV son las que más
  pesan al calcular el % de compatibilidad con cada oferta
  (`backend/src/applications/match-score.ts`), comparándolas contra el título, área,
  descripción y requisitos de esa oferta puntual. La empresa ve, oferta por oferta, cuáles
  fueron los términos que efectivamente coincidieron. Las coincidencias se buscan por
  palabra completa (no substring), para no confundir por ejemplo "Java" con "JavaScript" o
  "SQL" con "PostgreSQL". No es un modelo de IA: es una heurística explicable a propósito,
  pensada para un prototipo académico.
- **Archivos (fotos y CVs)**: se guardan en el disco de esta computadora, en
  `backend/uploads/{avatars,logos,cvs}/`, y se sirven como archivos estáticos desde el
  backend (`/uploads/...`). No se usa ningún servicio externo.
- **Planes pagos**: las empresas pagan por publicar más ofertas activas a la vez; las
  universidades pagan por ver más ofertas disponibles para sus alumnos. Los estudiantes
  no pagan nada. El "pago" está **simulado**: no hay integración con Mercado Pago, Stripe
  ni ninguna pasarela real — al confirmar, la suscripción se activa al instante. Si más
  adelante querés conectarlo a una pasarela real, avisá para integrarlo.
- **Diseño**: siempre en modo claro, sin selector de tema ni dependencia del modo
  oscuro del sistema operativo.

## Variables de entorno

Ver `backend/.env.example` y `frontend/.env.example`. Las más relevantes:

- `DB_*`: conexión a Postgres (deben coincidir con `docker-compose.yml`).
- `JWT_SECRET` / `JWT_EXPIRES_IN`: firma y expiración de los tokens de sesión.
- `UPLOADS_DIR`, `MAX_IMAGE_SIZE_MB`, `MAX_PDF_SIZE_MB`: dónde y con qué límites se guardan
  las fotos y los CVs.
- `VITE_API_URL` (frontend): URL del backend.

## Notas y limitaciones (a propósito, por ser un prototipo académico)

- La base de datos usa `synchronize: true` en TypeORM (crea las tablas automáticamente a
  partir de las entidades). Es cómodo para desarrollo/demo; en un proyecto productivo se
  reemplaza por migraciones versionadas.
- Al instalar, `npm audit` marca algunas vulnerabilidades moderadas/altas heredadas del
  ecosistema de NestJS 10 (multer, dependencias de `@nestjs/config`, etc.). Son del tipo
  denegación de servicio en paquetes de terceros, no afectan la lógica de la aplicación,
  y se resuelven migrando a NestJS 12 más adelante si el proyecto sigue creciendo.
- No hay tests automatizados: el alcance se priorizó en tener el flujo completo
  (autenticación, ofertas, postulaciones con matching real, convenios, planes, subida de
  archivos) funcionando de punta a punta — se probó a mano, entrando como los tres roles,
  en un navegador real.
- Al registrarse, el estudiante elige su universidad de una lista (las universidades ya
  registradas en PraxisLink), en vez de escribirla libremente. Así, el panel "Alumnos en
  proceso" de la universidad puede identificar con certeza qué postulaciones son de sus
  propios alumnos. Si su universidad no está listada, puede escribirla ("Otra"), pero en
  ese caso no va a aparecer vinculada automáticamente a ninguna cuenta de universidad.
