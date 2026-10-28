import type { deriveMine } from "@/views/MyTools/utils/deriveMine";
import type { MyToolsState } from "./MyToolsState";

// Alətlərim səhifəsinin vəziyyəti + hesablanmış siyahılar (bölmələrə ötürülür)
export type MyToolsView = MyToolsState & ReturnType<typeof deriveMine>;
