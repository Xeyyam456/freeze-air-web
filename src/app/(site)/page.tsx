import type { Metadata } from "next";
import { getTexts } from "@/services/site/fetchSiteTexts.server";
import { HomeView } from "@/views/Site/Home/HomeView";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTexts())["brand.name"] };
}

export default function HomePage() {
  return <HomeView />;
}
