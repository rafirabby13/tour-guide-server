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

export const GuideSchema = z.object({
  name: z.string().min(2),
  contactNumber: z
    .string()
    .regex(/^\+?[0-9]+$/),

  bio: z.string().max(2000).optional(),
  profilePhoto: z.string().url().optional(),

  experience: z.number().int().min(0),
  experienceLevel: ExperienceLevelEnum,

  languages: z.array(z.string()).nonempty(),
  category: z.array(z.string()).nonempty(),

  country: z.string().optional(),
  city: z.string().optional(),

  gender: GenderEnum,

  isAvailable: z.boolean().default(true),
});

export const CreateGuideSchema = UserBaseSchema.extend({
  role: z.literal("GUIDE"),
}).extend(GuideSchema.shape);

export type CreateGuideInput = z.infer<typeof CreateGuideSchema>;

export type CreateAdminInput = z.infer<typeof CreateAdminSchema>;


export const CreateTouristSchema = UserBaseSchema.extend({
  role: z.literal("TOURIST"), // force tourist role
}).extend(TouristSchema.shape);

export type CreateTouristInput = z.infer<typeof CreateTouristSchema>;
