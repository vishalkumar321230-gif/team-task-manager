import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { signToken } from "../../utils/auth.js";

function sanitizeUser(user: { id: string; name: string; email: string; createdAt: Date }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
}

export async function signup(input: { name: string; email: string; password: string }) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ApiError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true
    }
  });

  return {
    user: sanitizeUser(user),
    token: signToken({ id: user.id, email: user.email })
  };
}

export async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValidPassword) {
    throw new ApiError(401, "Invalid email or password");
  }

  return {
    user: sanitizeUser(user),
    token: signToken({ id: user.id, email: user.email })
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true
    }
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return sanitizeUser(user);
}
