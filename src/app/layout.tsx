import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const mplusRounded = M_PLUS_Rounded_1c({
  variable: "--font-mplus-rounded",
  weight: ["400", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "やわらかアクション v1.0",
  description: "自己肯定感が上がる専用Webアプリ。小さな一歩を、思いきり褒めよう。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${mplusRounded.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
