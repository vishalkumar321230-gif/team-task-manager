import type { Request, Response } from "express";
import { prisma } from "../../config/prisma.js";
import { asyncHandler } from "../../utils/async-handler.js";

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const search = typeof req.query.search === "string" ? req.query.search : "";
  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } }
          ]
        }
      : undefined,
    select: {
      id: true,
      name: true,
      email: true
    },
    orderBy: { name: "asc" },
    take: 20
  });

  res.json({ users });
});
