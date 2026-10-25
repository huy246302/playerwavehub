import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Football Legends Archive", template: "%s · Football Legends" },
  description: "Admin dashboard for the Football Legends archive.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
