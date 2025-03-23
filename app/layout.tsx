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
  title: "Health Manager",
  description: "헬스 운동 기록 및 관리 앱",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#c2ff00",
  icons: {
    icon: '/icon22.png', // public 폴더의 경로
    apple: '/icon22.png',
    shortcut: '/icon22.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#c2ff00" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${rajdhani.variable} antialiased`}>
        <AuthProvider>
          <div className="min-h-screen bg-black">
            <NavBar />
            <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8">
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
