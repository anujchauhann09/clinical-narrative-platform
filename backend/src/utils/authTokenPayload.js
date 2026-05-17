export const buildAuthTokenPayload = (user) => ({
  sub: user.publicId,
  role: user.roleName.toLowerCase(),
});
