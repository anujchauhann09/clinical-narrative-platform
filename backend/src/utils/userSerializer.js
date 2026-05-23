export const serializeUser = (user) => ({
  publicId: user.publicId,
  email: user.email,
  role: user.roleName.toLowerCase(),
  profile: user.profile
    ? {
        publicId: user.profile.publicId,
        name: user.profile.name,
        bio: user.profile.bio,
        dateOfBirth: user.profile.dateOfBirth,
        sex: user.profile.sex,
        phone: user.profile.phone,
        updatedAt: user.profile.updatedAt,
      }
    : null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
