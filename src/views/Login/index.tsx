import { LoginBrand } from "./components/LoginBrand";
import { LoginCard } from "./components/LoginCard";

export function LoginView() {
  return (
    // login-app: giriş səhifəsi tünd temada (globals.css)
    <main className="login-app grid min-h-screen bg-bg lg:grid-cols-[1.1fr_1fr]">
      <LoginBrand />
      <LoginCard />
    </main>
  );
}
