import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import * as dashboardService from "./dashboard.service.js";

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const dashboard = await dashboardService.getDashboard(
    req.params.projectId,
    req.user!.id,
    req.projectRole!
  );
  res.json({ dashboard });
});
