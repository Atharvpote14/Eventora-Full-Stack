const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  isActive: user.isActive,
  profileImage: user.profileImage,
  phone: user.phone,
  city: user.city,
  createdAt: user.createdAt,
});

module.exports = { sanitizeUser };