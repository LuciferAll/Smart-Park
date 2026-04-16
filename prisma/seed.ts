import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('123', 10)

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: hashedPassword, role: Role.ADMIN },
    create: {
      name: 'Super Admin',
      username: 'admin',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  })

  const petugas = await prisma.user.upsert({
    where: { username: 'petugas' },
    update: { password: hashedPassword, role: Role.PETUGAS },
    create: {
      name: 'Budi (Petugas Utama)',
      username: 'petugas',
      password: hashedPassword,
      role: Role.PETUGAS,
    },
  })

  const owner = await prisma.user.upsert({
    where: { username: 'owner' },
    update: { password: hashedPassword, role: Role.OWNER },
    create: {
      name: 'Bapak Owner (Pemilik)',
      username: 'owner',
      password: hashedPassword,
      role: Role.OWNER,
    },
  })

  // Seed default jenis kendaraan
  const defaultJenis = ['Motor', 'Mobil', 'Truk', 'Sepeda', 'Bus']
  for (const nama of defaultJenis) {
    await prisma.jenisKendaraan.upsert({
      where: { nama },
      update: {},
      create: { nama },
    })
  }

  console.log('Seed berhasil. Pengguna berikut siap digunakan:')
  console.log(`Username: ${admin.username} | Role: ${admin.role} | Pass: 123`)
  console.log(`Username: ${petugas.username} | Role: ${petugas.role} | Pass: 123`)
  console.log(`Username: ${owner.username} | Role: ${owner.role} | Pass: 123`)
  console.log(`Jenis kendaraan: ${defaultJenis.join(', ')}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
