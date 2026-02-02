import "./globals.css";
import React from "react";

export const metadata = {
  title: "Chá rifa do bebê Miguel Gabriel",
  description: "Escolha seu número online",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
