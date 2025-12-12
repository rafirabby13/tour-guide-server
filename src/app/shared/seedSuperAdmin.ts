
import * as bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { config } from '../../config/index.env';
import { UserRole } from '../../../prisma/generated/prisma/enums';
const superAdminCreds = {
  email: config.superAdmin.email,
  password: config.superAdmin.password,
  name: config.superAdmin.name,
  contactNo: config.superAdmin.contactNo
};
export const seedSuperAdmin = async () => {
  try {
    // 1. Check if Super Admin already exists
    const isSuperAdminExists = await prisma.user.findUnique({
      where: {
        email: superAdminCreds.email,
      },
    });

    if (isSuperAdminExists) {
      console.log('⚠️ Super Admin already exists. Skipping...');
      return;
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(superAdminCreds.password, 12);

    // 3. Create User and Admin Profile in a Transaction
    await prisma.$transaction(async (tx) => {
      // A. Create User Record
      const user = await tx.user.create({
        data: {
          email: superAdminCreds.email,
          password: hashedPassword,
          role: UserRole.ADMIN
        },
      });

      // B. Create Admin Profile Record
      await tx.admin.create({
        data: {
          name: superAdminCreds.name,
          profilePhoto: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
          contactNumber: superAdminCreds.contactNo,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });
    });

    console.log('✅ Super Admin created successfully!');
  } catch (err) {
    console.error('❌ Error seeding Super Admin:', err);
  } finally {
    await prisma.$disconnect();
  }
};