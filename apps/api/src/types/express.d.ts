import type { ProjectRole } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
      projectRole?: ProjectRole;
    }
  }
}

export {};
