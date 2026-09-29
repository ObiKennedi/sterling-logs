import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync(path.resolve('.env.local'), 'utf8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const connectionString = match ? match[1] : process.env.DATABASE_URL;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("=== USERS COUNT:", users.length);
    console.log("=== USERS:", JSON.stringify(users, null, 2));

    const orders = await prisma.order.findMany();
    console.log("=== ORDERS COUNT:", orders.length);
    console.log("=== ORDERS:", JSON.stringify(orders, null, 2));

    const transactions = await prisma.walletTransaction.findMany();
    console.log("=== TRANSACTIONS COUNT:", transactions.length);

    const accounts = await prisma.account.findMany();
    console.log("=== ACCOUNTS COUNT:", accounts.length);
    console.log("=== ACCOUNTS:", JSON.stringify(accounts, null, 2));

    const sessions = await prisma.session.findMany();
    console.log("=== SESSIONS COUNT:", sessions.length);
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
