import { prisma } from '../src/database/prisma.js';
import { USER_ROLES } from '../src/constants/roles.js';

const roles = [
  {
    name: USER_ROLES.PATIENT,
    description: 'Default patient account role',
  },
  {
    name: USER_ROLES.ADMIN,
    description: 'Administrative platform role',
  },
];

try {
  await Promise.all(
    roles.map((role) =>
      prisma.role.upsert({
        where: { name: role.name },
        update: { description: role.description },
        create: role,
      }),
    ),
  );
} finally {
  await prisma.$disconnect();
}
