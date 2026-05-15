import { z } from "zod";

export const userSearchQuerySchema = z.object({
  search: z.string().trim().optional()
});
