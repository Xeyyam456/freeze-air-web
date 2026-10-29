export type MyDayStats = {
  today: number;
  month: number;
  tasks: { total: number; done: number }; // bugünkü tapşırıqlarım (geri alınanlar yox)
  tools: number; // məndə olan alətlərin ədədi
  materials: number; // məndə olan materialın növ sayı
};
