import { prisma } from "../../config/prisma.js";

export async function logActivity(input: {
  action: string;
  userId: string;
  projectId: string;
}) {
  await prisma.activityLog.create({
    data: input
  });
}
