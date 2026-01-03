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

async function main() {
  console.log('データベースのシードを開始...\n');

  try {
    // NOTE:
    // 現在のスキーマでは users/search_conditions を削除しているため、seedは何もしない。

    console.log('すべてのシードが正常に完了しました！');
  } catch (error) {
    console.error('シード実行中にエラーが発生しました:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
