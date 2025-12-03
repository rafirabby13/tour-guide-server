import { z } from "zod";

export const UserRoleEnum = z.enum(["TOURIST", "GUIDE", "ADMIN"]);
export const UserStatusEnum = z.enum(["ACTIVE", "INACTIVE", "DELETED"]);
export const GenderEnum = z.enum(["MALE", "FEMALE"]);
export const ExperienceLevelEnum = z.enum(["BEGINNER", "INTERMEDIATE", "EXPERT"]);


export const UserBaseSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6),

  role: UserRoleEnum,
});


export const TouristSchema = z.object({
  name: z.string().min(2),
  contactNumber: z
    .string()
    .regex(/^\+?[0-9]+$/, "Invalid phone number"),

  profilePhoto: z.string().url().optional(),

  category: z.array(z.string()).nonempty(),
  languages: z.array(z.string()).nonempty(),

  gender: GenderEnum,
});


export const AdminSchema = z.object({
  name: z.string().min(2),
  contactNumber: z
    .string()
    .regex(/^\+?[0-9]+$/),

  profilePhoto: z.string().url().optional(),
});
export const CreateAdminSchema = UserBaseSchema.extend({
  role: z.literal("ADMIN"),
}).extend(AdminSchema.shape);

export type CreateAdminInput = z.infer<typeof CreateAdminSchema>;


export const CreateTouristSchema = UserBaseSchema.extend({
  role: z.literal("TOURIST"), // force tourist role
}).extend(TouristSchema.shape);

export type CreateTouristInput = z.infer<typeof CreateTouristSchema>;
