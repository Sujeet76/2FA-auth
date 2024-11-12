import { z } from "zod";

export const signUpValidator = z.object({
  email: z.string().email(),
  password: z
    .string({ message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]+$/, {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
});

export const signInValidator = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const resetPasswordValidator = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]+$/, {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
  token: z.string(),
});

export const generateResetPasswordLink = z.object({
  email: z.string().email(),
});

export type SignInValidatorType = z.infer<typeof signInValidator>;
export type SignUpValidatorType = z.infer<typeof signUpValidator>;
export type ResetPasswordValidatorType = z.infer<typeof resetPasswordValidator>;
export type GenerateResetPasswordLinkValidatorType = z.infer<
  typeof generateResetPasswordLink
>;
