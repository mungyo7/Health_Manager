import type { Metadata } from "next";
import { Rajdhani } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import NavBar from "./components/NavBar";

const rajdhani = Rajdhani({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-rajdhani",
});

export const metadata: Metadata = {
  title: "사이버펑크 헬스 캘린더",
  description: "사이버펑크 스타일의 헬스 운동 기록 및 관리 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${rajdhani.variable} antialiased`}>
        <AuthProvider>
          <div className="min-h-screen bg-black">
            <NavBar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="cyber-container">
                {children}
              </div>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
