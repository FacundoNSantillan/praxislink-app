# Hostear PraxisLink en un celular con Termux

Esta guía levanta **todo** (backend, base de datos y archivos subidos) en un
único celular Android viejo, usando Termux, y lo expone a internet con un
túnel gratuito de Cloudflare. Todo lo que dice acá ya lo probé en la compu
antes de escribirlo (el backend sirviendo el frontend en un solo puerto, con
rutas relativas), así que solo falta repetir los mismos pasos dentro de Termux.

**Antes de empezar, sé realista con esto:** el celular tiene que quedar
prendido, cargando y con Wi-Fi estable todo el tiempo que quieras que el sitio
esté disponible. Si se queda sin batería, se reinicia, o Android mata la app
en segundo plano, el sitio deja de responder hasta que lo levantes de nuevo a
mano. Para una demo puntual (mostrárselo a la cátedra en el momento) andá
tranquilo; para que esté online todo el cuatrimestre sin tocarlo, vas a tener
que revisar de vez en cuando que siga corriendo.

## 1. Instalar Termux

Instalá Termux desde **F-Droid** (`f-droid.org`), no desde Play Store — la
versión de Play Store está discontinuada y le fallan las instalaciones de
paquetes.

Abrí Termux y corré:

```bash
pkg update && pkg upgrade -y
termux-setup-storage        # te va a pedir permiso, aceptalo
pkg install -y nodejs-lts postgresql git
```

## 2. Levantar PostgreSQL dentro de Termux

Postgres en Termux no arranca solo (no hay `systemd`), así que se inicializa
una sola vez y después se arranca a mano cada vez que abras Termux:

```bash
# Una sola vez:
initdb $PREFIX/var/lib/postgresql

# Cada vez que quieras usarlo (podés poner esto en un script, ver paso 6):
pg_ctl -D $PREFIX/var/lib/postgresql -l $PREFIX/var/lib/postgresql/log start

# También una sola vez: crear el usuario y la base
createuser praxislink -P    # te va a pedir que pongas una contraseña: usá "praxislink" para que coincida con el .env de ejemplo, o la que quieras
createdb -O praxislink praxislink
```

## 3. Traer el proyecto al celular

La forma más simple es subir el proyecto a un repositorio de GitHub desde tu
compu (si no lo tenés ya) y clonarlo en el celular:

```bash
# En tu compu, dentro de praxislink-app/, si todavía no es un repo:
git init && git add . && git commit -m "PraxisLink"
# Subilo a un repo tuyo en GitHub (privado si preferís) y copiá la URL.

# En el celular, dentro de Termux:
git clone https://github.com/tu-usuario/tu-repo.git praxislink-app
cd praxislink-app
```

Si no querés usar GitHub, también podés copiar la carpeta por cable USB a
`Internal storage/Download/` y después, en Termux:
`cp -r /sdcard/Download/praxislink-app ~/praxislink-app`.

## 4. Variables de entorno

```bash
cd ~/praxislink-app/backend
cp .env.example .env
```

Editá `backend/.env` (con `nano .env`) y confirmá que diga:

```
PORT=3000
CORS_ORIGIN=*
DB_HOST=localhost
DB_PORT=5432
DB_USER=praxislink
DB_PASSWORD=praxislink
DB_NAME=praxislink
JWT_SECRET=cambiar-esto-por-algo-largo-y-al-azar
UPLOADS_DIR=./uploads
```

(En el celular usamos el puerto 5432 normal de Postgres, no el 5433 que
usa Docker en tu compu — no hay otro Postgres con el que choque.)

## 5. Compilar el backend y el frontend

```bash
# Backend
cd ~/praxislink-app/backend
npm install
npm run build

# Frontend: se compila apuntando a rutas relativas ("/api"),
# porque va a quedar servido por el mismo backend, en el mismo puerto.
cd ~/praxislink-app/frontend
npm install
VITE_API_URL=/api npm run build

# Copiar el resultado a donde el backend lo sirve:
rm -rf ../backend/public
cp -r dist ../backend/public
```

## 6. Levantar todo

```bash
cd ~/praxislink-app/backend
node dist/main.js
```

Deberías ver `PraxisLink escuchando en http://localhost:3000 (API en /api)`.
Probalo primero desde el navegador del propio celular entrando a
`http://localhost:3000` — tiene que verse la pantalla de login.

Para que Postgres y el backend arranquen solos cada vez que abrís Termux, te
conviene armar un script. Creá `~/start-praxislink.sh`:

```bash
#!/data/data/com.termux/files/usr/bin/bash
pg_ctl -D $PREFIX/var/lib/postgresql -l $PREFIX/var/lib/postgresql/log start
cd ~/praxislink-app/backend
node dist/main.js
```

Y dale permiso de ejecución: `chmod +x ~/start-praxislink.sh`.

**Importante:** si cerrás la app de Termux, Android corta el proceso. Corré el
servidor dentro de `tmux` (`pkg install tmux`, después `tmux new -s praxislink`
y ahí adentro `~/start-praxislink.sh`) para poder salir de la app de Termux sin
matar el proceso, y volver a entrar después con `tmux attach -t praxislink`.
También activá "no optimizar batería" para Termux en los ajustes de Android,
y corré `termux-wake-lock` para que el sistema no lo duerma.

## 7. Exponer el celular a internet

Instalá `cloudflared` (funciona sin necesidad de crear cuenta para un túnel
rápido):

```bash
pkg install cloudflared
```

Con el servidor ya corriendo (paso 6), en **otra** sesión de Termux (o dentro
del mismo `tmux`, en otra ventana):

```bash
cloudflared tunnel --url http://localhost:3000
```

Esto te da una URL pública del estilo `https://algo-al-azar.trycloudflare.com`
que cualquiera puede abrir desde afuera — sin tocar el router, sin IP fija.
Mientras ese comando siga corriendo, el link funciona; si lo cortás, se corta
el acceso. Para un link fijo que no cambie cada vez, hace falta una cuenta
gratuita de Cloudflare y crear un "túnel con nombre" — si querés, te ayudo a
configurar eso también cuando llegues a ese punto.

## Resumen de lo que corre en el celular

- PostgreSQL (Termux) — la base de datos.
- El backend de NestJS (`node dist/main.js`) — la API **y** también sirve el
  sitio web (HTML/CSS/JS) y los archivos subidos (fotos, logos, CVs), todo en
  el puerto 3000.
- `cloudflared` — el túnel que expone ese puerto 3000 a internet.

## Si más adelante te cansás de mantenerlo prendido

Todo lo de esta guía (Postgres, backend sirviendo el frontend en un puerto) es
exactamente lo mismo que necesitarías en un servicio como Railway o Fly.io,
así que migrar más adelante es solo cuestión de subir el mismo proyecto ahí en
vez de a Termux — avisame cuando quieras hacerlo y lo armamos.
