import type { NextFunction, Request, Response } from "express";
// import prisma from "../libs/prisma.js";
// import { decode } from "../libs/auth.js";
// import type {
//   ClientApp,
//   ClientOrigin,
//   ClientSubscription,
//   Role,
// } from "@prisma/client";

// interface IClientApp extends ClientApp {
//   ClientOrigins: ClientOrigin[];
//   ClientSubscriptions: ClientSubscription[];
//   Role: Role;
// }

// export const middleware = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   let token = req.headers.authorization?.split(" ")[1]; // Ambil token setelah kata 'Bearer'
//   let origin = req.headers.origin; // Ambil token setelah kata 'Bearer'
//   let key = req.headers["x-api-key"] as string; // Ambil token setelah kata 'Bearer'
//   if (!token || !key) return ResponseServer(res, 401, { msg: "Unauthorized" });

//   try {
//     let client: IClientApp | null = null;
//     if (token) {
//       const decoded = decode(token);
//       if (!decoded) return ResponseServer(res, 401, { msg: "Unauthorized" });
//       const find = await prisma.clientApp.findFirst({
//         where: { id: decoded.id, status: true },
//         include: { Role: true, ClientOrigins: true, ClientSubscriptions: true },
//       });
//       client = find;
//     } else {
//       if (origin) {
//         const find = await prisma.clientApp.findFirst({
//           where: {
//             api_key: key,
//             status: true,
//             ClientOrigins: { some: { origin: origin } },
//           },
//           include: {
//             Role: true,
//             ClientOrigins: true,
//             ClientSubscriptions: true,
//           },
//         });
//         client = find;
//       } else {
//         const find = await prisma.clientApp.findFirst({
//           where: {
//             api_key: key,
//             status: true,
//           },
//           include: {
//             Role: true,
//             ClientOrigins: true,
//             ClientSubscriptions: true,
//           },
//         });
//         client = find;
//       }
//     }

//     (req as any).client = client;

//     // Intercept response to capture status
//     const originalJson = res.json;
//     let statusCode = res.statusCode;

//     res.json = function (body: any) {
//       statusCode = res.statusCode;
//       if (!req.path.includes("/auth/") && req.method !== "GET") {
//         logActivity(
//           client ? client.id : null,
//           req.baseUrl,
//           req.method,
//           statusCode >= 200 && statusCode <= 300 ? "SUCCESS" : "FAILURE",
//           req,
//         ).catch((error) => console.error("Failed to log activity:", error));
//       }

//       return originalJson.call(this, body);
//     };

//     next();
//   } catch (error) {
//     return ResponseServer(res, 401, { msg: "Unauthorized" });
//   }
// };

export const ResponseServer = (
  res: Response,
  status: number,
  response: any,
) => {
  return res.status(status).json({ ...response, status });
};

// async function logActivity(
//   clientAppId: string | null,
//   path: string,
//   method: string,
//   status: string,
//   req: Request,
// ) {
//   try {
//     await prisma.logActivities.create({
//       data: {
//         clientAppId,
//         path,
//         method,
//         status,
//         ip: req.ip || req.socket.remoteAddress || "",
//         userAgent: req.get("User-Agent") || "",
//       },
//     });
//   } catch (error) {
//     console.error("Failed to log activity:", error);
//   }
// }
