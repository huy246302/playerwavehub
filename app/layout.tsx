import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Football Legends Archive",
  description: "A home for the stories and records of football legends.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-full font-sans">
        <div className="app-layout">
          <Sidebar />
          <div className="main-column">{children}</div>
        </div>
      </body>
    </html>
  );
}
