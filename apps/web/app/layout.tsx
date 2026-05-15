import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Team Task Manager",
  description: "Collaborative project and task management dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
