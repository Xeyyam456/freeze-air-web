import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Sessiyanı yeniləyir. Landing (/) hamıya açıqdır; panel səhifələri yalnız girişlə.
// Daxil olmayan panelə girmək istəsə /login-ə, daxil olan /login-ə girsə /panel-ə yönləndirilir.
const PUBLIC_PATHS = ["/", "/login", "/avadanliq", "/xidmetler", "/nece-isleyirik", "/ustalarimiz", "/elaqe"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = !!data?.claims;
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname.startsWith("/login");

  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/xidmetler/") || pathname.startsWith("/xidmet/");
  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/panel", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
