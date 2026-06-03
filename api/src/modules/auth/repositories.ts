import { type Response, type Request, type NextFunction } from "express";
import { ResponseServer } from "../../libs/util.js";
import prisma from "../../libs/prisma.js";
import { signIn, comparaPassword } from "../../libs/auth.js";

// MY INFO
export const GET = async (req: Request, res: Response, next: NextFunction) => {
  const client = req.client;
  if (!client) return ResponseServer(res, 401, { msg: "Unauthorized" });
  const token = await signIn(client);

  return ResponseServer(res, 200, { msg: "OK", data: client, token: token });
};

// LOGIN
export const POST = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  if (!username || !password)
    return ResponseServer(res, 401, {
      msg: "Mohon isi username dan password!",
    });

  const find = await prisma.clientApp.findFirst({
    where: { username, status: true },
    include: {
      Role: true,
      ClientOrigins: true,
      ClientSubscriptions: true,
    },
  });
  if (!find)
    return ResponseServer(res, 401, { msg: "Username atau password salah!" });

  if (!find.status) {
    return ResponseServer(res, 401, { msg: "User non aktif!" });
  }
  const isValidPassword = await comparaPassword(password, find.password);
  if (!isValidPassword) {
    return ResponseServer(res, 401, { msg: "Username atau password salah!" });
  }

  const tokens = await signIn({
    id: find.id,
    username: find.username,
    email: find.email,
    Role: { id: find.roleId },
  });

  return ResponseServer(res, 200, {
    msg: "Berhasil login",
    token: tokens,
    data: find,
  });
};
