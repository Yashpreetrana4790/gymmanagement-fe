import { redirect } from "react-router";
import type { Route } from "./+types/logout";

export async function action({ request }: Route.ActionArgs) {
  const { getSession, destroySession } = await import("~/lib/session.server");
  const session = await getSession(request);
  return redirect("/login", {
    headers: { "Set-Cookie": await destroySession(session) },
  });
}

// GET /logout → redirect to login
export async function loader() {
  return redirect("/login");
}

export default function Logout() {
  return null;
}
