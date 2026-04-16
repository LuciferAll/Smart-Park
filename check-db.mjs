import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const p = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin', 10);
  
  // Reset all user passwords to "admin"
  const result = await p.user.updateMany({
    data: { password: hash }
  });
  
  console.log(`Updated ${result.count} users - all passwords set to "admin"`);
  
  const users = await p.user.findMany();
  for (const u of users) {
    console.log(`  ✓ ${u.username} (${u.role})`);
  }
}

main().catch(console.error).finally(() => p.$disconnect());
