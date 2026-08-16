import bcrypt from "bcryptjs";
import pg from "pg";

const [email, password, role = "member"] = process.argv.slice(2);
if (!email || !password) {
  console.error("Usage: node scripts/create-user.mjs email password [member|editor|admin]");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const hash = await bcrypt.hash(password, 12);
await pool.query("insert into users (email, password_hash, role) values ($1, $2, $3)", [email.toLowerCase(), hash, role]);
await pool.end();
console.log(`Created ${email} with role ${role}`);
