import { type Response, type Request } from "express";
import { ResponseServer } from "../../libs/util.js";
import prisma from "../../libs/prisma.js";

export const GETREQUEST = async (req: Request, res: Response) => {
  const { path } = req.query;
  const client = req.client;
  if (!client) return ResponseServer(res, 401, { msg: "Unauthorized" });

  const data = await prisma.logActivities.findMany({
    where: {
      ...(client &&
        client.Role.data_status === "PRIVATE" && { clientAppId: client?.id }),
      status: { in: ["200", "201"] },
      method: "POST",
      ...(path && { path: path as string }),
    },
  });

  return ResponseServer(res, 200, { msg: "OK", data });
};

export const GETACTIVITIES = async (req: Request, res: Response) => {
  const { path, status, method } = req.query;
  const client = req.client;
  if (!client) return ResponseServer(res, 401, { msg: "Unauthorized" });

  const data = await prisma.logActivities.findMany({
    where: {
      ...(client &&
        client.Role.data_status === "PRIVATE" && { clientAppId: client?.id }),
      ...(path && { path: path as string }),
      ...(method && { method: method as string }),
      ...(status && { status: { in: status as string[] } }),
    },
  });

  return ResponseServer(res, 200, { msg: "OK", data });
};
