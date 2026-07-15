import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '../generated/prisma/client';

const ADMIN_SEED = {
  email: 'admin@dks.vn',
  password: 'Admin@123456',
  fullName: 'DKS Admin',
} as const;

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  const passwordHash = await bcrypt.hash(ADMIN_SEED.password, 12);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_SEED.email },
    update: {
      passwordHash,
      fullName: ADMIN_SEED.fullName,
      role: Role.ADMIN,
    },
    create: {
      email: ADMIN_SEED.email,
      passwordHash,
      fullName: ADMIN_SEED.fullName,
      role: Role.ADMIN,
    },
    select: { id: true, email: true, role: true, fullName: true },
  });

  console.log('Admin seed OK:', admin);
  console.log(`Login: ${ADMIN_SEED.email} / ${ADMIN_SEED.password}`);
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
