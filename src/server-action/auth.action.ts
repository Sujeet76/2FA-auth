"use server";
import User from "@/database/user.model";
import {
  SignInValidatorType,
  signUpValidator,
  SignUpValidatorType,
} from "@/validator/auth.validator";
import speakeasy from "speakeasy";

import bcrypt from "bcryptjs";

import qrCode from "qrcode";

import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { connectToDB } from "@/lib/mongoose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

connectToDB();

const decrypt = async (input: string) => {
  const { payload } = await jwtVerify(input, JWT_SECRET, {
    algorithms: ["HS256"],
  });

  return payload as { userId: string } & JWTPayload;
};

export const getServerSession = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token) {
    return null;
  }
  const payload = await decrypt(token.value);

  const user = await User.findById(payload.userId)
    .select("-password")
    .lean()
    .exec();

  return {
    email: user?.email,
    _id: user?._id.toString(),
    image: user?.avatar,
    twoFactorSecret: user?.twoFactorSecret,
    isTwoFactorEnabled: user?.isTwoFactorEnabled,
  };
};

export const signUp = async (data: SignUpValidatorType) => {
  const parsedData = signUpValidator.safeParse(data);
  if (!parsedData.success) {
    return {
      success: false,
      error: parsedData.error.flatten().fieldErrors,
      message: parsedData.error.errors.map((error) => error.message).join(", "),
    };
  }

  const user = await User.findOne({ email: parsedData.data.email });
  if (user) {
    return {
      success: false,
      error: "User already exists",
      message: "User already exists",
    };
  }

  const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);
  const twoFactorSecret = speakeasy.generateSecret();

  const newUser = await User.create({
    email: parsedData.data.email,
    password: hashedPassword,
    avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${
      parsedData.data.email.split("@")[0]
    }`,
    twoFactorSecret: twoFactorSecret.base32,
  });

  const url = speakeasy.otpauthURL({
    secret: twoFactorSecret.base32,
    label: "2FA for " + parsedData.data.email,
    issuer: "Issue by Shivam",
    encoding: "base32",
  });

  const qrCodeUrl = await qrCode.toDataURL(url);

  return {
    success: true,
    message: "User created successfully",
    user: JSON.stringify(newUser),
    qrCode: qrCodeUrl,
  };
};

export const signIn = async (data: SignInValidatorType) => {
  try {
    const parseData = signUpValidator.safeParse(data);

    if (!parseData.success) {
      return {
        success: false,
        error: parseData.error.flatten().fieldErrors,
        message: parseData.error.errors
          .map((error) => error.message)
          .join(", "),
      };
    }

    const { email, password } = parseData.data;

    const user = await User.findOne({ email });
    if (!user) {
      return {
        error: "Invalid credentials",
        message: "Invalid credentials",
        success: false,
      };
    }

    // Check if account is locked
    if (user.isLocked && user.lockUntil && user.lockUntil > new Date()) {
      return {
        error: "Account is locked. Please try again later",
        success: false,
      };
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      // Increment login attempts
      user.loginAttempts += 1;

      if (user.loginAttempts >= 3) {
        user.isLocked = true;
        user.lockUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      }

      await user.save();

      return {
        error: "Invalid credentials",
        message: "Invalid credentials",
        success: false,
      };
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.isLocked = false;
    user.lockUntil = undefined;
    await user.save();

    const res = {
      success: true,
      message: "Login successful",
      data: {
        userId: user._id.toString(),
        requiredTwoFactorAuth: user.isTwoFactorEnabled,
      },
    };

    return res;
  } catch (_e) {
    return { error: "Server error", success: false };
  }
};

export const verifyTwoFactorAuth = async (data: {
  userId: string;
  code: string;
}) => {
  try {
    const { userId, code } = data;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return { error: "User not found", success: false };
    }
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: code,
      window: 1,
    });
    if (!verified) {
      return {
        error: "Invalid code",
        message: "Invalid code",
        success: false,
      };
    }

    const Jwt = await new SignJWT({ userId: user._id })
      .setProtectedHeader({
        alg: "HS256",
      })
      .setExpirationTime("1d")
      .sign(JWT_SECRET);

    const cookiesStore = await cookies();
    cookiesStore.set("token", Jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return { message: "Login successful", success: true };
  } catch (_e) {
    return { error: "Server error", success: false };
  }
};

export const logout = async () => {
  const cookiesStore = await cookies();
  cookiesStore.delete("token");
  return { message: "Logout successful", success: true };
};

export const resetPassword = async (data: { newPassword: string }) => {
  try {
    const user = await getServerSession();

    if (!user) {
      return {
        error: "User not found",
        message: "User not found",
        success: false,
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.newPassword, salt);

    await User.findOneAndUpdate(
      { _id: user._id },
      {
        password: hashedPassword,
      },
      { new: true }
    );

    if (!user) {
      return {
        error: "Error while updating password",
        message: "Error while updating password",
        success: false,
      };
    }

    return {
      message: "Password updated successfully",
      success: true,
    };
  } catch (error) {
    return { error: "Server error", message: "Server error", success: false };
  }
};
