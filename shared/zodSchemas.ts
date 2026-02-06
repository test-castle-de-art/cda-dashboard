import { z } from "zod";

export const loginSchema = z.object({
	username: z.string()
		.min(3, "Username must be at least 3 characters")
		.max(50, "Username must be at most 50 characters")
		.regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, underscore, hyphen"),
	password: z.string()
		.min(8, "Password must be at least 8 characters")
		.max(128, "Password must be at most 128 characters")
		.regex(/^\S+$/, "Password cannot contain spaces")
		.regex(/[A-Z]/, "Must contain uppercase letter")
		.regex(/[a-z]/, "Must contain lowercase letter")
		.regex(/[0-9]/, "Must contain number")
		.regex(/[!@#$%^&*]/, "Must contain special character")
});

export type LoginFormData = z.infer<typeof loginSchema>;