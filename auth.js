import { User } from "../models/userModel.js";

export const requireAuth = async (req, res, next) => {
  if (!req.session.userId) return res.redirect("/login");

  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      req.session.userId = null;
      return res.redirect("/login");
    }

    req.user = user;
    res.locals.currentUser = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (role) => [
  requireAuth,
  (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).send("You do not have permission to perform this action.");
    }
    next();
  },
];
 