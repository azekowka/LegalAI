import { config } from 'dotenv';
import path from 'node:path';

config({ path: path.resolve(__dirname, '.env') });

import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: path.join(__dirname, 'src', 'prisma', 'schema.prisma'),
});
