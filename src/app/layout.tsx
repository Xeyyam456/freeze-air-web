import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/Toaster";
import { SITE_URL } from "@/lib/site-url";

// latin-ext: Azərbaycan hərfləri (ə, ğ, ş, ı) üçün
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Freeze Air Service",
  description: "Ustalar, şirkətlər, depo və xəta kodları",
  openGraph: { type: "website", locale: "az_AZ", siteName: "Freeze Air Service" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="az" className={`${jakarta.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* JS işləyəndə bölmə animasiyaları aktiv olur (globals.css `.js .reveal`) */}
        {/* Usta panelində yığılmış sol menyu ilk boyamadan əvvəl bərpa olunur (components/panel/Sidebar.tsx) */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js');try{if(localStorage.getItem('panel-nav')==='mini')document.documentElement.dataset.nav='mini'}catch(e){}" }} />
      </head>
      <body className="min-h-full">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
