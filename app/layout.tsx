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
  title: "Alphi",
  description:
    "Alphi is a learning platform that uses games to help you learn french grammar fast.",
  metadataBase: new URL("https://alphi-app.netlify.app"),
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
            <div className="fixed top-0 z-30 flex w-full justify-center border-b border-gray-200 bg-white/75" />
            <Suspense fallback="...">
              <Navbar />
            </Suspense>
            <main className="relative z-10 flex min-h-screen w-full flex-col items-center pb-20 pt-20 md:py-16">
              {children}
            </main>
            <Footer />
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#333",
                  color: "#fff",
                  fontSize: "16px",
                  borderRadius: "10px",
                  padding: "12px 16px",
                },
              }}
            />
            <VercelAnalytics />
          </body>
        </html>
      </ReduxProvider>
    </ClerkProvider>
  );
}
