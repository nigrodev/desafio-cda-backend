import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

function csv_to_array(csv: string): string[][] {
  const lines = csv.split('\n');
  const csv_array: string[][] = [];

  // Usando slice(1) para ignorar a primeira linha
  lines.slice(1).forEach(function (line) {
    const values = line.split(',');
    csv_array.push(values);
  });

  return csv_array;
}

async function main() {
  const csv = fs.readFileSync('badges.csv', 'utf8');
  const csv_array = csv_to_array(csv);

  // Do jeito que eu fiz, a posição dos valores no csv estão hardcoded
  // Para fins desse desafio, isso não impacta em nada
  csv_array.forEach(async function (value) {
    await prisma.badges.upsert({
      where: { id: parseInt(value[0]) },
      update: {},
      create: {
        id: parseInt(value[0]),
        slug: value[1],
        name: value[2],
        image: value[3],
      },
    });
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
