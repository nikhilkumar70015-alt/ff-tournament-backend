const permissionCheck = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions?.[permission]) {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
      });
    }
    next();
  };
};

export default permissionCheck;
