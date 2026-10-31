import type { Metadata } from "next";
import { pageTitle } from "@/lib/site-texts";
import { ServicesView } from "@/views/Site/Services/ServicesView";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("services.title") };
}

export default function ServicesPage() {
  return <ServicesView />;
}
