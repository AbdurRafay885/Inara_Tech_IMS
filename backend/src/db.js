import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL environment variable is missing.");
}

const adapter = new PrismaMariaDb(url);

export const prisma = new PrismaClient({ adapter });
