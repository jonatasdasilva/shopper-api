import { promises } from "fs";
import { env } from "../../env";
import { dayjs } from "./dayjs";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

prisma.$on('query', (e) => {
  const date = dayjs(`${new Date()}`).format('LLL');
  promises.writeFile(
    `${env.ROOT}shopper.prisma.log`,
    `[🕰 ${date} - Shopper] - ${e.query}\n`,
    { flag: "a+" }
  );
});