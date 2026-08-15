// Run with: npm run seed
// Creates a default admin user so you can log in for the first time.
const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const seed = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || "admin@pos.com";
  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`Admin user already exists: ${email}`);
  } else {
    await User.create({
      name: process.env.ADMIN_NAME || "Admin",
      email,
      password: process.env.ADMIN_PASSWORD || "Admin@123",
      role: "admin",
    });
    console.log(`Admin user created successfully!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD || "Admin@123"}`);
  }

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
