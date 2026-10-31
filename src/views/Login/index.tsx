import { LoginBrand } from "./components/LoginBrand";
import { LoginCard } from "./components/LoginCard";

export function LoginView() {
  return (
    <main className="grid min-h-screen bg-[#f4f7fc] lg:grid-cols-[1.1fr_1fr]">
      <LoginBrand />
      <LoginCard />
    </main>
  );
}
