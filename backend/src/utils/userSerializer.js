export const serializeUser = (user) => ({
  publicId: user.publicId,
  email: user.email,
  role: user.roleName.toLowerCase(),
  profile: user.profile
    ? {
        publicId: user.profile.publicId,
        name: user.profile.name,
        bio: user.profile.bio,
      }
    : null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
