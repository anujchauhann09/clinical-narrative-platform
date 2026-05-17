const DURATION_PATTERN = /^(\d+)([smhd])$/;

const UNIT_TO_MS = Object.freeze({
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
});

export const durationToMs = (duration) => {
  const match = DURATION_PATTERN.exec(duration);

  if (!match) {
    throw new Error(`Unsupported duration format: ${duration}`);
  }

  const [, amount, unit] = match;
  return Number(amount) * UNIT_TO_MS[unit];
};
