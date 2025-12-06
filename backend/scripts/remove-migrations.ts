import { existsSync, rmSync } from 'fs';
import { join } from 'path';

const migrationsPath = join(__dirname, '..', 'prisma', 'migrations');
if (existsSync(migrationsPath)) {
  try {
    rmSync(migrationsPath, { recursive: true, force: true });
    console.log('Migrations folder removed');
  } catch (error) {
    console.error('Failed to remove migrations folder:', error);
    process.exit(1);
  }
} else {
  console.log('Migrations folder does not exist');
}
