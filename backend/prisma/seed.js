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

const symptoms = [
  { name: 'Headache', category: 'Neurological' },
  { name: 'Migraine', category: 'Neurological' },
  { name: 'Dizziness', category: 'Neurological' },
  { name: 'Nausea', category: 'Gastrointestinal' },
  { name: 'Vomiting', category: 'Gastrointestinal' },
  { name: 'Abdominal pain', category: 'Gastrointestinal' },
  { name: 'Fatigue', category: 'General' },
  { name: 'Fever', category: 'General' },
  { name: 'Chills', category: 'General' },
  { name: 'Cough', category: 'Respiratory' },
  { name: 'Shortness of breath', category: 'Respiratory' },
  { name: 'Sore throat', category: 'Respiratory' },
  { name: 'Chest pain', category: 'Cardiovascular' },
  { name: 'Palpitations', category: 'Cardiovascular' },
  { name: 'Joint pain', category: 'Musculoskeletal' },
  { name: 'Back pain', category: 'Musculoskeletal' },
  { name: 'Muscle aches', category: 'Musculoskeletal' },
  { name: 'Anxiety', category: 'Mental health' },
  { name: 'Low mood', category: 'Mental health' },
  { name: 'Insomnia', category: 'Sleep' },
  { name: 'Light sensitivity', category: 'Neurological' },
];

const triggers = [
  'Poor sleep',
  'Stress',
  'Skipped meal',
  'Dehydration',
  'Long screen exposure',
  'Caffeine',
  'Alcohol',
  'Weather change',
  'Travel',
  'Exercise',
  'Strong odors',
  'Loud noises',
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

  await Promise.all(
    symptoms.map((symptom) =>
      prisma.symptom.upsert({
        where: {
          name_category: { name: symptom.name, category: symptom.category },
        },
        update: {},
        create: symptom,
      }),
    ),
  );

  await Promise.all(
    triggers.map((name) =>
      prisma.trigger.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );
} finally {
  await prisma.$disconnect();
}
