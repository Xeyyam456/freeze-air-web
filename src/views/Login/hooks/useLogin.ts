import { useActionState, useState } from "react";
import { login } from "@/app/login/actions";
import { toast } from "@/lib/toast";

// Giriş: xəta tostla göstərilir (eyni xəta təkrar olanda da)
export function useLogin() {
  const [show, setShow] = useState(false);
  const [, formAction, pending] = useActionState(async (prev: string | null, formData: FormData) => {
    const error = await login(prev, formData);
    if (error) toast.error(error);
    return error;
  }, null);

  return { show, toggleShow: () => setShow((v) => !v), formAction, pending };
}
