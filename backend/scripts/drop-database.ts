import { PrismaClient } from '@prisma/client';

// DATABASE_URLが未設定の場合はデフォルト値を設定
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://postgres:postgres@localhost:5433/app?schema=public';
  console.log(
    `DATABASE_URL環境変数を設定しました: ${process.env.DATABASE_URL}`,
  );
}

// NODE_ENVが未設定の場合はdevelopmentとみなす
const nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv !== 'development' && nodeEnv !== 'test') {
  throw new Error(
    'drop-database.ts must not be run outside dev/test environments.',
  );
}

const prisma = new PrismaClient();

async function dropDatabase() {
  try {
    // すべてのテーブル、型、スキーマオブジェクトを削除
    await prisma.$executeRawUnsafe(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        -- すべてのテーブルを削除
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
        
        -- すべての型（ENUM）を削除
        FOR r IN (SELECT typname FROM pg_type WHERE typtype = 'e' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) LOOP
          EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
        END LOOP;
        
        -- _prisma_migrationsテーブルも削除
        DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
      END $$;
    `);

    console.log('データベースを完全に削除しました');
  } catch (error) {
    console.error('データベースの削除中にエラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

dropDatabase().catch((error) => {
  console.error(error);
  process.exit(1);
});
