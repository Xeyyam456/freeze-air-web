import type { MyTask } from "./MyTask";

// Başqalarının qrup tapşırığı: bütün sətirlər və geri alınmamışlar
export type MyTaskTeam = { id: string; rows: MyTask[]; live: MyTask[] };
