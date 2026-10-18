import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Football Legends Archive",
  description: "A home for the stories and records of football legends.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
