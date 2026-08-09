import type { NextAuthOptions } from "next-auth";
import LineProvider from "next-auth/providers/line";

export const authOptions: NextAuthOptions = {
  providers: [
    LineProvider({
      clientId: process.env.LINE_CHANNEL_ID!,
      clientSecret: process.env.LINE_CHANNEL_SECRET!,
    }),
  ],
  callbacks: {
    // LINEのユーザーID（account.providerAccountId）をトークン/セッションに引き継ぐ
    async jwt({ token, account, profile }) {
      if (account?.providerAccountId) {
        token.lineUserId = account.providerAccountId;
      }
      if (profile) {
        token.name = profile.name;
        token.picture = (profile as { picture?: string }).picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.lineUserId && typeof token.lineUserId === "string") {
        session.lineUserId = token.lineUserId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
