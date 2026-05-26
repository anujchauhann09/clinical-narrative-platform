export const serializeUser = (user) => ({
  publicId: user.publicId,
  email: user.email,
  role: user.roleName.toLowerCase(),
  profile: user.profile
    ? {
        name: user.profile.name,
        bio: user.profile.bio,
        dateOfBirth: user.profile.dateOfBirth,
        sex: user.profile.sex,
        phone: user.profile.phone,
      }
    : null,
  createdAt: user.createdAt,
});
