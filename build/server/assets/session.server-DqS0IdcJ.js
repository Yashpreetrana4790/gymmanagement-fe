import { redirect, createCookieSessionStorage } from "react-router";
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__gym_session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET ?? "gym-dev-secret-change-in-prod"],
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7
    // 7 days
  }
});
async function getSession(request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}
const commitSession = sessionStorage.commitSession;
const destroySession = sessionStorage.destroySession;
async function requireSession(request) {
  const session = await getSession(request);
  if (!session.get("token")) throw redirect("/login");
  return session;
}
async function redirectIfAuthenticated(request) {
  const session = await getSession(request);
  const token = session.get("token");
  const stage = session.get("stage");
  if (!token) return null;
  if (stage === "registered") throw redirect("/verify");
  if (stage === "verified") throw redirect("/onboarding");
  if (stage === "onboarded") throw redirect("/");
  return null;
}
export {
  commitSession,
  destroySession,
  getSession,
  redirectIfAuthenticated,
  requireSession
};
