import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';

const email = process.argv[2]?.toLowerCase()?.trim();
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log('Uso: node --experimental-sqlite src/scripts/reset_password.js <email> <nova_senha>');
  console.log('\nUsuários cadastrados no banco:');
  const users = db.$client.prepare('SELECT id, name, email FROM users').all();
  console.table(users);
  process.exit(0);
}

const user = db.$client.prepare('SELECT id, name, email FROM users WHERE email = ?').get(email);

if (!user) {
  console.error(`❌ Usuário com o e-mail "${email}" não foi encontrado no banco.`);
  process.exit(1);
}

const salt = await bcrypt.genSalt(10);
const passwordHash = await bcrypt.hash(newPassword, salt);

db.$client.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, user.id);

console.log(`✅ Senha do usuário "${user.name}" (${user.email}) foi redefinida com sucesso para: "${newPassword}"`);
