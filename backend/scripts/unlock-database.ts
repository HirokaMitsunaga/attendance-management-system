import { PrismaClient } from '@prisma/client';

// DATABASE_URLが未設定の場合はデフォルト値を設定
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://postgres:postgres@localhost:5433/app?schema=public';
  console.log(
    `DATABASE_URL環境変数を設定しました: ${process.env.DATABASE_URL}`,
  );
}

const prisma = new PrismaClient();

async function unlockDatabase() {
  try {
    // すべてのアドバイザリロックを解除
    await prisma.$executeRawUnsafe(`SELECT pg_advisory_unlock_all();`);
    console.log('データベースのロックを解除しました');
  } catch (error) {
    console.error('ロック解除中にエラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

unlockDatabase().catch((error) => {
  console.error(error);
  process.exit(1);
});
