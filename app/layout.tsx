import "./globals.css";
import cx from "classnames";
import { sfPro, inter } from "./fonts";
import Footer from "@/components/layout/footer";
import { Suspense } from "react";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import Navbar from "@/components/layout/navbar";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import { ReduxProvider } from "@/lib/store/provider";

export const metadata = {
  title: "Precedent - Building blocks for your Next.js project",
  description:
    "Precedent is the all-in-one solution for your Next.js project. It includes a design system, authentication, analytics, and more.",
  metadataBase: new URL("https://precedent.dev"),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ReduxProvider>
        <html lang="en">
          <body className={cx(sfPro.variable, inter.variable)}>
            <div className="fixed h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-100 -z-10" />
            <Suspense fallback="...">
              <Navbar />
            </Suspense>
            <main className="relative z-10 flex min-h-screen w-full flex-col items-center py-16">
              {children}
            </main>
          <Footer />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
                fontSize: '16px',
                borderRadius: '10px',
                padding: '12px 16px'
              }
            }}
          />
          <VercelAnalytics />
          </body>
        </html>
      </ReduxProvider>
    </ClerkProvider>
  );
}
