import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/config/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: './data/black_rose.db',
  },
});
