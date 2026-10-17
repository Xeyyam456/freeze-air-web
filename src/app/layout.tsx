import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/Toaster";

// latin-ext: Azərbaycan hərfləri (ə, ğ, ş, ı) üçün
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Freeze Air Service",
  description: "Ustalar, şirkətlər, depo və xəta kodları",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="az" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
