import { createClient } from "@/lib/supabase/client";
import type { ReturnArgs } from "@/types/myTools";

// Usta əməliyyatları (rpc() köməkçisi nəticəni tost + revalidate ilə işləyir)
export const confirmAssignment = (id: number, received: boolean) => createClient().rpc("assignment_confirm", { p_id: id, p_received: received });
export const cancelDepotRequest = (id: number) => createClient().rpc("depot_request_cancel", { p_id: id });
export const createReturnRequest = (args: ReturnArgs) => createClient().rpc("depot_return_create", args);
