/**
 * Express async route handler wrapper.
 * Eliminates try/catch boilerplate — catches rejected promises
 * and forwards to Express error handler.
 *
 * Usage:
 *   app.get("/api/foo", wrapAsync(async (req, res) => {
 *     const data = await getData();
 *     res.json({ data });
 *   }));
 *
 * Sprint 138 — closes P2 audit finding (68+ duplicated catch blocks)
 */
import type { Request, Response, NextFunction } from "express";
import { log } from "./logger";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export function wrapAsync(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err: any) => {
      log.error(`Unhandled route error: ${req.method} ${req.path}`, err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || "Internal Server Error" });
      }
    });
  };
}
