const adminOnly = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" || req.user.role === "superadmin")
  ) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Admin access only",
  });
};

export default adminOnly;
