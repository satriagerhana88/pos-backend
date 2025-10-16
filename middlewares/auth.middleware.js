const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });

  const token = auth.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Invalid Authorization header' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const permit = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Access denied' });
  next();
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // simpan payload ke req
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Require SUPER_ADMIN role" });
  }
  next();
};

const isAdminOrSuperAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "ADMIN_STORE") {
    return res.status(403).json({ error: "Require ADMIN_STORE or SUPER_ADMIN role" });
  }
  next();
};

const verifyTokenWithBranch = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id, role, branch_id }

    // Ambil branch_name dari DB jika ada branch_id
    if (decoded.branch_id) {
      const branchRes = await pool.query(
        "SELECT name FROM branches WHERE id = $1",
        [decoded.branch_id]
      );
      decoded.branch_name = branchRes.rows[0]?.name || null;
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};


module.exports = { authenticate, permit, verifyToken, isSuperAdmin, isAdminOrSuperAdmin, verifyTokenWithBranch };
