import { revalidate } from "@/lib/revalidate";
import { toast } from "@/lib/toast";

export async function rpc(fn: () => PromiseLike<{ error: { message: string } | null }>, ok: string) {
  const { error } = await fn();
  if (error) {
    toast.error(error.message);
    return false;
  }
  toast.success(ok);
  revalidate();
  return true;
}
