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

async function add_badges() {
  const csv = fs.readFileSync('badges.csv', 'utf8');
  const csv_array = csv_to_array(csv);

  // Do jeito que eu fiz, a posição dos valores no csv estão hardcoded
  // Para fins desse desafio, isso não impacta em nada
  csv_array.forEach(async function (value) {
    await prisma.badge.upsert({
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

async function add_users() {
  // Esperar 1 segundo para garantir que as badges foram criadas
  console.log(
    'Esperando 1 segundo para garantir que as badges foram criadas...',
  );
  await new Promise((r) => setTimeout(r, 1000));

  // Criação dos usuários
  const users = [
    { steamid: 'garry', name: 'Garry' },
    { steamid: 'gaben', name: 'Gaben' },
    { steamid: 'mineiro', name: 'Mineiro' },
    { steamid: 'paulo', name: 'Paulo' },
    { steamid: 'jorge', name: 'Jorge' },
  ];

  // const users = [
  //   { steamid: '76561197960279927', name: 'Garry' },
  //   { steamid: '76561198085278322', name: 'Gaben' }, // Na verdade, a Steam do Gabe é outra, mas ela é privada e aí não tem graça
  //   { steamid: '76561198105198281', name: 'Mineiro' },
  //   { steamid: '76561198220820238', name: 'Paulo' },
  //   { steamid: '76561197436439556', name: 'Jorge' },
  // ];

  for (const user of users) {
    await prisma.user.create({
      data: user,
    });
  }

  // O ID das badges
  const cdaValleyBadge = await prisma.badge.findUnique({
    where: { slug: 'cda-valley' },
  });
  const hienaBadge = await prisma.badge.findUnique({
    where: { slug: 'hiena' },
  });
  const policiaBadge = await prisma.badge.findUnique({
    where: { slug: 'policia' },
  });
  const cdaBadge = await prisma.badge.findUnique({
    where: { slug: 'cda' },
  });

  const cdaValleyBadgeId = cdaValleyBadge?.id;
  const hienaBadgeId = hienaBadge?.id;
  const policiaBadgeId = policiaBadge?.id;
  const cdaBadgeId = cdaBadge?.id;

  // Verifica todas as badges (por isso esperamos 1 segundo no início)
  if (!cdaValleyBadgeId || !hienaBadgeId || !policiaBadgeId || !cdaBadgeId) {
    console.log(cdaValleyBadgeId, hienaBadgeId, policiaBadgeId, cdaBadgeId);
    console.error('As badges não foram encontradas.');
    return;
  }

  // Todo mundo tem acesso ao cda-valley menos o Jorge
  const usersForCdaValley = ['garry', 'gaben', 'mineiro', 'paulo'];
  for (const steamid of usersForCdaValley) {
    const user = await prisma.user.findUnique({ where: { steamid } });
    if (user) {
      await prisma.userBadge.create({
        data: {
          userId: user.id,
          badgeId: cdaValleyBadgeId,
        },
      });
    }
  }

  // Agora umas badges específicas
  const specificBadges = [
    { steamid: 'garry', badgeId: hienaBadgeId },
    { steamid: 'gaben', badgeId: policiaBadgeId },
    { steamid: 'mineiro', badgeId: policiaBadgeId },
    { steamid: 'paulo', badgeId: cdaBadgeId },
  ];

  for (const { steamid, badgeId } of specificBadges) {
    const user = await prisma.user.findUnique({ where: { steamid } });
    if (user) {
      await prisma.userBadge.create({
        data: {
          userId: user.id,
          badgeId,
        },
      });
    }
  }
}

add_badges()
  .then(add_users)
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
