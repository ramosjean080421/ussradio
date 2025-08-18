import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FloatingSocial from "@/components/FloatingSocial";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "USS Radio – En vivo",
  description: "Escucha en vivo las emisoras de Radio USS. Tu gente, tu música al instante.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-[#0b0f12] text-white">
        {/* ... tu navbar / contenido ... */}
        {children}

        {/* Botones flotantes */}
        <FloatingSocial />
      </body>
    </html>
  );
}


