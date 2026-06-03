import type {
  ClientApp,
  Role,
  ClientOrigin,
  ClientSubscription,
} from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      client?: ClientApp & {
        Role: Role;
        ClientOrigins: ClientOrigin[];
        ClientSubscriptions: ClientSubscription[];
      };
    }
  }
}

export {};
