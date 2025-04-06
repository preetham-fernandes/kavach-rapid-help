'use client';

// import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import Sidebar from "@/components/sidebar";
import { usePathname } from "next/navigation";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// export const metadata: Metadata = {
//   title: "Kavach",
//   description: "Kavach Admin Webapp",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const hideSidebarRoutes = ['/login', '/unauthorized'];
  const shouldHideSidebar = hideSidebarRoutes.includes(pathname);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <div className="flex min-h-screen bg-slate-100">
            {!shouldHideSidebar && <Sidebar />}
            <main className={`flex-1 ${!shouldHideSidebar ? 'ml-[260px]' : ''}`}>
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
