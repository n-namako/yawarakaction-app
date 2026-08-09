import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    lineUserId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    lineUserId?: string;
  }
}
