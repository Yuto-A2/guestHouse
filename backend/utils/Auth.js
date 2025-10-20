exports.requireAuth = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ error: "Unauthorized" });
};

exports.requireAdmin = (req, res, next) => {
  if (!(req.isAuthenticated && req.isAuthenticated())) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: admin only" });
  }
  return next();
};

exports.requireSelfOrAdmin = (paramKey = "id") => (req, res, next) => {
  if (!(req.isAuthenticated && req.isAuthenticated())) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const targetId = req.params[paramKey];
  const isSelf = req.user?._id?.equals?.(targetId);
  const isAdmin = req.user?.role === "admin";
  if (!isSelf && !isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }
  return next();
};
