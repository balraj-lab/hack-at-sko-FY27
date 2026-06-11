import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diagnosis-to-Plan Health Navigator",
  description: "Synthetic-data demo for diagnosis-to-plan care navigation."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
