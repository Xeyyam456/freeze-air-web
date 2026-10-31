// Bu ayın iş qeydi: ya şirkətə birbaşa (sabit məkan), ya da filialına yazılır
export type WorkStub = { id: number; company_id: number | null; s: { company_id: number } | null };
