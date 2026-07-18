import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "AdegaOS Admin",
  description: "Painel administrativo do AdegaOS",
  icons: {
    icon: "/icon.svg",
    shortcut: "/favicon.ico"
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
