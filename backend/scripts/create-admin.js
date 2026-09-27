/**
 * Crea (o resetea la contraseña de) la cuenta de administrador.
 * Uso: node scripts/create-admin.js <email> <password>
 * No pasa por el registro público a propósito: los administradores no se
 * autogestionan, los crea quien mantiene el servidor.
 */
require("dotenv").config();
const { Client } = require("pg");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

async function main() {
  const email = process.argv[2] || "admin@praxislink.com";
  const password = process.argv[3] || "admin123456";

  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "praxislink",
    password: process.env.DB_PASSWORD || "praxislink",
    database: process.env.DB_NAME || "praxislink",
  });
  await client.connect();

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);

  if (existing.rows.length > 0) {
    await client.query('UPDATE users SET "passwordHash" = $1, role = $2 WHERE email = $3', [
      passwordHash,
      "admin",
      email,
    ]);
    console.log(`Contraseña actualizada para el admin existente: ${email}`);
  } else {
    const id = crypto.randomUUID();
    await client.query(
      'INSERT INTO users (id, email, "passwordHash", role, "createdAt") VALUES ($1, $2, $3, $4, now())',
      [id, email, passwordHash, "admin"],
    );
    console.log(`Admin creado: ${email} / ${password}`);
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
