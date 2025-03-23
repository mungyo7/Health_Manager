import type { Metadata } from "next";
import { Rajdhani } from "next/font/google";
import "./globals.css";

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
        <div className="min-h-screen bg-black">
          <header className="bg-black border-b border-primary/30 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <div className="w-8 h-8 bg-primary mr-3"></div>
                    <h1 className="text-xl font-bold text-primary neon-text">CYBER-GYM</h1>
                  </div>
                  <nav className="ml-8 flex space-x-8">
                    <a href="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-white hover:text-primary">
                      CALENDAR
                    </a>
                    <a href="/workouts" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-white hover:text-primary">
                      WORKOUTS
                    </a>
                  </nav>
                </div>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="cyber-container">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
