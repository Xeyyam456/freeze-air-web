import type { Metadata } from "next";
import { pageTitle } from "@/lib/site-texts";
import { TeamView } from "@/views/Site/Team/TeamView";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("team.title") };
}

export default function TeamPage() {
  return <TeamView />;
}
