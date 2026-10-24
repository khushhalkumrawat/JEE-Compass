const Student = require("../models/Student");
const { authenticateToken } = require("../routes/auth");

async function requireAdmin(req, res, next) {
  try {
    const student = await Student.findById(req.studentId).select("role");

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Student account not found.",
      });
    }

    if (student.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Administrator access is required.",
      });
    }

    return next();
  } catch (error) {
    console.error("Admin authorization error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify administrator access.",
    });
  }
}

module.exports = {
  authenticateToken,
  requireAdmin,
};
