// prisma/prisma.config.ts
export default {
  datasources: {
    db: {
      url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
    },
  },
};
