import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const passwordService = {
  hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  comparePassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
  },
};
