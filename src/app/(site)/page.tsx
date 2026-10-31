import type { Metadata } from "next";
import { getTexts } from "@/lib/site-texts";
import { HomeView } from "@/views/Site/Home/HomeView";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTexts())["brand.name"] };
}

export default function HomePage() {
  return <HomeView />;
}
