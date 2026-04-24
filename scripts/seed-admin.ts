import "reflect-metadata";
import * as dotenv from "dotenv";
import * as bcrypt from "bcryptjs";
import dataSource from "../src/data-source";
import { User } from "../src/entities/user.entity";

dotenv.config();

async function seedAdmin() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin1@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin1@";
  const adminName = process.env.SEED_ADMIN_NAME ?? "Admin User";

  await dataSource.initialize();
  const userRepo = dataSource.getRepository(User);

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const existing = await userRepo.findOne({ where: { email: adminEmail } });

  if (existing) {
    existing.name = adminName;
    existing.role = "admin";
    existing.isActive = true;
    existing.passwordHash = passwordHash;
    await userRepo.save(existing);
    console.log(`Updated existing admin: ${adminEmail}`);
  } else {
    const admin = userRepo.create({
      email: adminEmail,
      name: adminName,
      role: "admin",
      isActive: true,
      passwordHash
    });
    await userRepo.save(admin);
    console.log(`Created new admin: ${adminEmail}`);
  }

  await dataSource.destroy();
}

seedAdmin()
  .then(() => {
    console.log("Admin seed completed.");
  })
  .catch(async (error) => {
    console.error("Admin seed failed:", error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  });

