// Ana səhifənin idarə olunan hissələri (lib/site-settings.ts → getHomeContent)
export type HomeContent = {
  heroImage: string | null;
  heroFormEnabled: boolean;
  about: {
    title: string;
    text: string[];
    points: string[];
    cardTitle: string;
    cardText: string;
    cardColor: "night" | "cold" | "ice" | "white";
    mainImage: string | null;
    sideImage: string | null;
  };
};
