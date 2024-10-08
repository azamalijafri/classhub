import { startSession, ClientSession } from "mongoose";
import { Request, Response } from "express";

export const asyncTransactionWrapper = (
  handler: (req: Request, res: Response, session: ClientSession) => Promise<any>
) => {
  return async (req: Request, res: Response) => {
    const session = await startSession();
    session.startTransaction();
    try {
      await handler(req, res, session);

      await session.commitTransaction();
    } catch (error: any) {
      console.error(error);
      await session.abortTransaction();
      res.status(error.status || 500).json({
        message: error.message || "Internal Server Error",
      });
    } finally {
      session.endSession();
    }
  };
};
