import { z } from "zod";

export const UserRoleEnum = z.enum(["TOURIST", "GUIDE", "ADMIN"]);
export const UserStatusEnum = z.enum(["ACTIVE", "INACTIVE", "DELETED"]);
export const GenderEnum = z.enum(["MALE", "FEMALE"]);
export const ExperienceLevelEnum = z.enum(["BEGINNER", "INTERMEDIATE", "EXPERT"]);


export const UserBaseSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "At least one uppercase")
    .regex(/[a-z]/, "At least one lowercase")
    .regex(/[0-9]/, "At least one number")
    .regex(/[^A-Za-z0-9]/, "At least one special character"),

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
export const CreateTouristSchema = UserBaseSchema.extend({
  role: z.literal("TOURIST"), // force tourist role
}).extend(TouristSchema.shape);

export type CreateTouristInput = z.infer<typeof CreateTouristSchema>;
