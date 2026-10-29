import type { fetchMyTasks } from "@/services/myTasks/fetchMyTasks";

// Günün bütün tapşırıqları (qrup üzrə fayl sayı, "Geri alınıb → Ad") və aktiv ustalar
export type MyTasksData = Awaited<ReturnType<typeof fetchMyTasks>>;
