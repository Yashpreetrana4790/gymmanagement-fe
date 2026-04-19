import { type RouteConfig, layout, route, index } from "@react-router/dev/routes";

export default [
  // Sign out (no layout)
  route("logout", "routes/logout.tsx"),

  // Auth screens (no sidebar)
  layout("routes/_auth.tsx", [
    route("signup",          "routes/_auth.signup.tsx"),
    route("login",           "routes/_auth.login.tsx"),
    route("verify",          "routes/_auth.verify.tsx"),
    route("onboarding",      "routes/_auth.onboarding.tsx"),
    route("forgot-password", "routes/_auth.forgot-password.tsx"),
    route("reset-password",  "routes/_auth.reset-password.tsx"),
  ]),

  // Protected app (with sidebar)
  layout("routes/_app.tsx", [
    index("routes/_app._index.tsx"),
    route("members", "routes/_app.members.tsx"),
    route("members/:id", "routes/_app.members.$id.tsx"),
    route("staff", "routes/_app.staff.tsx"),
    route("staff/:id", "routes/_app.staff.$id.tsx"),
    route("plans", "routes/_app.plans.tsx"),
    route("payments", "routes/_app.payments.tsx"),
    route("attendance", "routes/_app.attendance.tsx"),
    route("zombies", "routes/_app.zombies.tsx"),
    route("feedback", "routes/_app.feedback.tsx"),
    route("gallery", "routes/_app.gallery.tsx"),
  ]),
  // Public gym join form (no auth)
  route("join/:qrToken", "routes/join.$qrToken.tsx"),
  // Public staff application form (no auth)
  route("staff-apply/:qrToken", "routes/staff-apply.$qrToken.tsx"),

  // 404 catch-all
  route("*", "routes/$.tsx"),
] satisfies RouteConfig;
