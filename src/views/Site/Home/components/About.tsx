import { getHomeContent } from "@/lib/site-settings";
import type { TextsProps } from "@/types/site";
import { AboutImages } from "./AboutImages";
import { AboutText } from "./AboutText";

// "Haqqımızda": mətn və şəkillər bazadan; şəkil yoxdursa illüstrasiya, şəkil kəsilmir
export async function About({ t }: TextsProps) {
  const about = (await getHomeContent()).about;
  return (
    <>
      <AboutImages about={about} />
      <AboutText about={about} t={t} />
    </>
  );
}
