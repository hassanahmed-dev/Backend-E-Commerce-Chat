import "reflect-metadata";
import dataSource from "../data-source";
import { User } from "../entities/user.entity";
import * as bcrypt from "bcryptjs";

async function seedAdmin() {
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const email = "admin1@example.com";
  const password = "admin1@";
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await userRepo.findOne({ where: { email } });

  if (existing) {
    existing.name = "Admin";
    existing.role = "admin";
    existing.isActive = true;
    existing.passwordHash = passwordHash;
    await userRepo.save(existing);
    console.log(`Updated existing admin: ${email}`);
  } else {
    const admin = userRepo.create({
      email,
      name: "Admin",
      role: "admin",
      isActive: true,
      passwordHash
    });
    await userRepo.save(admin);
    console.log(`Created admin user: ${email}`);
  }

  await dataSource.destroy();
}

void seedAdmin().catch(async (error) => {
  console.error("Failed to seed admin user:", error);
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(1);
});

