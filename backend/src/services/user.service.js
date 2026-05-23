import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError, AuthError } from '../errors/index.js';
import { userRepository } from '../repositories/user.repository.js';
import { serializeUser } from '../utils/userSerializer.js';
import { passwordService } from './password.service.js';

const buildProfileUpdate = (payload) => {
  const data = {};

  if (payload.name !== undefined) data.name = payload.name;
  if (payload.bio !== undefined) data.bio = payload.bio;
  if (payload.sex !== undefined) data.sex = payload.sex;
  if (payload.phone !== undefined) data.phone = payload.phone;
  if (payload.dateOfBirth !== undefined) {
    data.dateOfBirth = payload.dateOfBirth ? new Date(payload.dateOfBirth) : null;
  }

  return data;
};

export const userService = {
  async getProfile(userPublicId) {
    const user = await userRepository.findByPublicId(userPublicId);

    if (!user) {
      throw new ApiError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    return serializeUser(user);
  },

  async updateProfile(userPublicId, payload) {
    const user = await userRepository.findByPublicId(userPublicId);

    if (!user) {
      throw new ApiError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    const data = buildProfileUpdate(payload);
    const updated = await userRepository.updateProfileByUserPublicId(userPublicId, data);

    return serializeUser(updated);
  },

  async deleteAccount(userPublicId, password) {
    const user = await userRepository.findByPublicId(userPublicId);

    if (!user) {
      throw new ApiError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    const isPasswordValid = await passwordService.comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AuthError('Password is incorrect');
    }

    await userRepository.deleteByPublicId(userPublicId);
  },
};
