require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const mongoose = require("mongoose");
const Student = require("../models/Student");

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(
      "Usage: node server/scripts/makeAdmin.js your-email@example.com"
    );
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from server/.env");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const student = await Student.findOneAndUpdate(
    { email },
    { $set: { role: "admin" } },
    { new: true, runValidators: true }
  );

  if (!student) {
    throw new Error(
      "No account found with that email. Register this account first."
    );
  }

  console.log(`Admin access granted to ${student.email}`);
}

main()
  .catch((error) => {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
