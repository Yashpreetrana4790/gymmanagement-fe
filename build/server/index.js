import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, Meta, Links, ScrollRestoration, Scripts, useNavigation, Form, Link, redirect, NavLink } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useState, useEffect } from "react";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    className: "h-full",
    suppressHydrationWarning: true,
    children: [/* @__PURE__ */ jsxs("head", {
      suppressHydrationWarning: true,
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      className: "h-full bg-gray-50 text-gray-900 antialiased",
      suppressHydrationWarning: true,
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  const message = error instanceof Error ? error.message : "Unknown error";
  return /* @__PURE__ */ jsx("div", {
    className: "flex min-h-screen items-center justify-center p-8",
    children: /* @__PURE__ */ jsxs("div", {
      className: "text-center",
      children: [/* @__PURE__ */ jsx("h1", {
        className: "text-2xl font-bold text-red-600",
        children: "Something went wrong"
      }), /* @__PURE__ */ jsx("p", {
        className: "mt-2 text-gray-600",
        children: message
      })]
    })
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root
}, Symbol.toStringTag, { value: "Module" }));
const _auth = UNSAFE_withComponentProps(function AuthLayout() {
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen flex bg-gray-950",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "hidden lg:flex lg:w-[58%] relative overflow-hidden",
      children: [/* @__PURE__ */ jsx("img", {
        src: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1920&q=80",
        alt: "",
        className: "absolute inset-0 w-full h-full object-cover scale-105"
      }), /* @__PURE__ */ jsx("div", {
        className: "absolute inset-0 bg-linear-to-r from-black/95 via-black/75 to-black/40"
      }), /* @__PURE__ */ jsx("div", {
        className: "absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/50"
      }), /* @__PURE__ */ jsx("div", {
        className: "absolute -bottom-20 -left-20 w-120 h-120 bg-blue-600/20 rounded-full blur-3xl"
      }), /* @__PURE__ */ jsx("div", {
        className: "absolute top-10 right-0 w-75 h-75 bg-cyan-500/10 rounded-full blur-3xl"
      }), /* @__PURE__ */ jsxs("div", {
        className: "relative z-10 flex flex-col justify-between p-14 w-full",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "flex items-center gap-3",
          children: [/* @__PURE__ */ jsx("div", {
            className: "w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40",
            children: /* @__PURE__ */ jsx("svg", {
              className: "w-6 h-6 text-white",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              children: /* @__PURE__ */ jsx("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2.5,
                d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              })
            })
          }), /* @__PURE__ */ jsx("span", {
            className: "text-white font-black text-xl tracking-tight",
            children: "GymManager"
          })]
        }), /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsxs("div", {
            className: "inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/25 rounded-full px-4 py-1.5 mb-8",
            children: [/* @__PURE__ */ jsx("span", {
              className: "w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block"
            }), /* @__PURE__ */ jsx("span", {
              className: "text-blue-300 text-sm font-medium",
              children: "Trusted by 50+ gyms worldwide"
            })]
          }), /* @__PURE__ */ jsxs("h1", {
            className: "text-6xl font-black text-white leading-[1.05] tracking-tight mb-5",
            children: ["Run Your", /* @__PURE__ */ jsx("br", {}), /* @__PURE__ */ jsx("span", {
              className: "text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-cyan-300 to-blue-300",
              children: "Gym Empire"
            })]
          }), /* @__PURE__ */ jsx("p", {
            className: "text-slate-400 text-lg leading-relaxed max-w-sm",
            children: "Members, plans, payments — managed from one powerful dashboard built for serious gym owners."
          }), /* @__PURE__ */ jsx("div", {
            className: "mt-12 flex gap-4",
            children: [{
              value: "500+",
              label: "Members managed"
            }, {
              value: "50+",
              label: "Gyms onboarded"
            }, {
              value: "99.9%",
              label: "Uptime"
            }].map((stat) => /* @__PURE__ */ jsxs("div", {
              className: "bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 flex-1",
              children: [/* @__PURE__ */ jsx("p", {
                className: "text-white text-2xl font-black",
                children: stat.value
              }), /* @__PURE__ */ jsx("p", {
                className: "text-slate-500 text-xs mt-0.5",
                children: stat.label
              })]
            }, stat.label))
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5",
          children: /* @__PURE__ */ jsxs("div", {
            className: "flex items-start gap-3",
            children: [/* @__PURE__ */ jsx("div", {
              className: "w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-sm font-black shrink-0",
              children: "R"
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("p", {
                className: "text-slate-300 text-sm leading-relaxed",
                children: '"GymManager completely transformed how I run my gym. Member management is now effortless."'
              }), /* @__PURE__ */ jsx("p", {
                className: "text-slate-500 text-xs mt-2 font-medium",
                children: "Rahul S. — Owner, Iron Paradise Gym"
              })]
            })]
          })
        }), /* @__PURE__ */ jsxs("p", {
          className: "text-slate-700 text-xs",
          suppressHydrationWarning: true,
          children: ["© ", (/* @__PURE__ */ new Date()).getFullYear(), " GymManager. All rights reserved."]
        })]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex-1 flex items-center justify-center relative overflow-hidden",
      children: [/* @__PURE__ */ jsx("div", {
        className: "absolute top-0 right-0 w-150 h-150 bg-blue-600/8 rounded-full blur-3xl pointer-events-none"
      }), /* @__PURE__ */ jsx("div", {
        className: "absolute bottom-0 left-0 w-100 h-100 bg-cyan-500/6 rounded-full blur-3xl pointer-events-none"
      }), /* @__PURE__ */ jsx("div", {
        className: "absolute inset-0 opacity-[0.03] pointer-events-none",
        style: {
          backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
          backgroundSize: "40px 40px"
        }
      }), /* @__PURE__ */ jsxs("div", {
        className: "relative z-10 w-full max-w-md px-6 py-10",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "flex items-center gap-2.5 mb-10 lg:hidden",
          children: [/* @__PURE__ */ jsx("div", {
            className: "w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40",
            children: /* @__PURE__ */ jsx("svg", {
              className: "w-5 h-5 text-white",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              children: /* @__PURE__ */ jsx("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2.5,
                d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              })
            })
          }), /* @__PURE__ */ jsx("span", {
            className: "font-black text-lg text-white tracking-tight",
            children: "GymManager"
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "bg-white/4 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50",
          children: /* @__PURE__ */ jsx(Outlet, {})
        })]
      })]
    })]
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _auth
}, Symbol.toStringTag, { value: "Module" }));
async function loader$9({
  request
}) {
  const {
    redirectIfAuthenticated
  } = await import("./assets/session.server-DqS0IdcJ.js");
  await redirectIfAuthenticated(request);
  return null;
}
async function action$6({
  request
}) {
  const {
    getSession,
    commitSession
  } = await import("./assets/session.server-DqS0IdcJ.js");
  const {
    api
  } = await import("./assets/api.server-CoNHom2L.js");
  const form = await request.formData();
  const data = {
    firstName: form.get("firstName"),
    lastName: form.get("lastName"),
    email: form.get("email"),
    phone: form.get("phone"),
    password: form.get("password"),
    confirmPassword: form.get("confirmPassword")
  };
  if (data.password !== data.confirmPassword) {
    return {
      error: "Passwords do not match."
    };
  }
  if (data.password.length < 6) {
    return {
      error: "Password must be at least 6 characters."
    };
  }
  const result = await api.post("/api/auth/register", {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    password: data.password
  });
  if (!result.success) {
    return {
      error: result.message ?? "Registration failed."
    };
  }
  const session = await getSession(request);
  session.set("token", result.token);
  session.set("stage", result.stage);
  session.set("email", result.user.email);
  session.set("firstName", result.user.firstName);
  return redirect("/verify", {
    headers: {
      "Set-Cookie": await commitSession(session)
    }
  });
}
const inputCls$2 = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/40 transition";
const _auth_signup = UNSAFE_withComponentProps(function Signup({
  actionData
}) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsxs("div", {
      className: "mb-8",
      children: [/* @__PURE__ */ jsx("div", {
        className: "w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-5",
        children: /* @__PURE__ */ jsx("svg", {
          className: "w-6 h-6 text-blue-400",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /* @__PURE__ */ jsx("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          })
        })
      }), /* @__PURE__ */ jsx("h1", {
        className: "text-2xl font-black text-white tracking-tight",
        children: "Create your account"
      }), /* @__PURE__ */ jsx("p", {
        className: "mt-1.5 text-slate-400 text-sm",
        children: "Start managing your gym in minutes."
      })]
    }), (actionData == null ? void 0 : actionData.error) && /* @__PURE__ */ jsxs("div", {
      className: "mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2.5",
      children: [/* @__PURE__ */ jsx("svg", {
        className: "w-4 h-4 shrink-0",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        children: /* @__PURE__ */ jsx("path", {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: 2,
          d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        })
      }), actionData.error]
    }), /* @__PURE__ */ jsxs(Form, {
      method: "post",
      className: "space-y-4",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-2 gap-3",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("label", {
            className: "block text-sm font-medium text-slate-300 mb-1.5",
            children: "First name"
          }), /* @__PURE__ */ jsx("input", {
            name: "firstName",
            required: true,
            type: "text",
            autoComplete: "given-name",
            placeholder: "John",
            className: inputCls$2
          })]
        }), /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("label", {
            className: "block text-sm font-medium text-slate-300 mb-1.5",
            children: "Last name"
          }), /* @__PURE__ */ jsx("input", {
            name: "lastName",
            required: true,
            type: "text",
            autoComplete: "family-name",
            placeholder: "Doe",
            className: inputCls$2
          })]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("label", {
          className: "block text-sm font-medium text-slate-300 mb-1.5",
          children: "Phone number"
        }), /* @__PURE__ */ jsx("input", {
          name: "phone",
          required: true,
          type: "tel",
          autoComplete: "tel",
          placeholder: "+91 98765 43210",
          className: inputCls$2
        })]
      }), /* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("label", {
          className: "block text-sm font-medium text-slate-300 mb-1.5",
          children: "Email address"
        }), /* @__PURE__ */ jsx("input", {
          name: "email",
          required: true,
          type: "email",
          autoComplete: "email",
          placeholder: "john@yourgym.com",
          className: inputCls$2
        })]
      }), /* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("label", {
          className: "block text-sm font-medium text-slate-300 mb-1.5",
          children: "Password"
        }), /* @__PURE__ */ jsx("input", {
          name: "password",
          required: true,
          type: "password",
          autoComplete: "new-password",
          placeholder: "Min. 6 characters",
          className: inputCls$2
        })]
      }), /* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("label", {
          className: "block text-sm font-medium text-slate-300 mb-1.5",
          children: "Confirm password"
        }), /* @__PURE__ */ jsx("input", {
          name: "confirmPassword",
          required: true,
          type: "password",
          autoComplete: "new-password",
          placeholder: "Re-enter password",
          className: inputCls$2
        })]
      }), /* @__PURE__ */ jsx("button", {
        type: "submit",
        disabled: isSubmitting,
        className: "w-full py-3 px-4 mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2",
        children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment, {
          children: [/* @__PURE__ */ jsxs("svg", {
            className: "w-4 h-4 animate-spin",
            fill: "none",
            viewBox: "0 0 24 24",
            children: [/* @__PURE__ */ jsx("circle", {
              className: "opacity-25",
              cx: "12",
              cy: "12",
              r: "10",
              stroke: "currentColor",
              strokeWidth: "4"
            }), /* @__PURE__ */ jsx("path", {
              className: "opacity-75",
              fill: "currentColor",
              d: "M4 12a8 8 0 018-8v8H4z"
            })]
          }), "Creating account…"]
        }) : "Create account"
      })]
    }), /* @__PURE__ */ jsxs("p", {
      className: "mt-6 text-center text-sm text-slate-500",
      children: ["Already have an account?", " ", /* @__PURE__ */ jsx(Link, {
        to: "/login",
        className: "font-semibold text-blue-400 hover:text-blue-300 transition",
        children: "Sign in"
      })]
    })]
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$6,
  default: _auth_signup,
  loader: loader$9
}, Symbol.toStringTag, { value: "Module" }));
async function loader$8({
  request
}) {
  const {
    redirectIfAuthenticated
  } = await import("./assets/session.server-DqS0IdcJ.js");
  await redirectIfAuthenticated(request);
  return null;
}
async function action$5({
  request
}) {
  const {
    getSession,
    commitSession
  } = await import("./assets/session.server-DqS0IdcJ.js");
  const {
    api
  } = await import("./assets/api.server-CoNHom2L.js");
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");
  const result = await api.post("/api/auth/login", {
    email,
    password
  });
  if (!result.success) {
    return {
      error: result.message ?? "Login failed."
    };
  }
  const session = await getSession(request);
  session.set("token", result.token);
  session.set("stage", result.stage);
  session.set("email", result.user.email);
  session.set("firstName", result.user.firstName);
  const stage = result.stage;
  const destination = stage === "registered" ? "/verify" : stage === "verified" ? "/onboarding" : "/";
  return redirect(destination, {
    headers: {
      "Set-Cookie": await commitSession(session)
    }
  });
}
const _auth_login = UNSAFE_withComponentProps(function Login({
  actionData
}) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsxs("div", {
      className: "mb-8",
      children: [/* @__PURE__ */ jsx("div", {
        className: "w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-5",
        children: /* @__PURE__ */ jsx("svg", {
          className: "w-6 h-6 text-blue-400",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /* @__PURE__ */ jsx("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          })
        })
      }), /* @__PURE__ */ jsx("h1", {
        className: "text-2xl font-black text-white tracking-tight",
        children: "Welcome back"
      }), /* @__PURE__ */ jsx("p", {
        className: "mt-1.5 text-slate-400 text-sm",
        children: "Sign in to your GymManager account."
      })]
    }), (actionData == null ? void 0 : actionData.error) && /* @__PURE__ */ jsxs("div", {
      className: "mb-6 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2.5",
      children: [/* @__PURE__ */ jsx("svg", {
        className: "w-4 h-4 shrink-0",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        children: /* @__PURE__ */ jsx("path", {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: 2,
          d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        })
      }), actionData.error]
    }), /* @__PURE__ */ jsxs(Form, {
      method: "post",
      className: "space-y-4",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("label", {
          htmlFor: "email",
          className: "block text-sm font-medium text-slate-300 mb-1.5",
          children: "Email address"
        }), /* @__PURE__ */ jsx("input", {
          id: "email",
          name: "email",
          type: "email",
          required: true,
          autoComplete: "email",
          className: "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/40 transition",
          placeholder: "john@yourgym.com"
        })]
      }), /* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("label", {
          htmlFor: "password",
          className: "block text-sm font-medium text-slate-300 mb-1.5",
          children: "Password"
        }), /* @__PURE__ */ jsx("input", {
          id: "password",
          name: "password",
          type: "password",
          required: true,
          autoComplete: "current-password",
          className: "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/40 transition",
          placeholder: "Enter your password"
        })]
      }), /* @__PURE__ */ jsx("button", {
        type: "submit",
        disabled: isSubmitting,
        className: "w-full py-3 px-4 mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2",
        children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment, {
          children: [/* @__PURE__ */ jsxs("svg", {
            className: "w-4 h-4 animate-spin",
            fill: "none",
            viewBox: "0 0 24 24",
            children: [/* @__PURE__ */ jsx("circle", {
              className: "opacity-25",
              cx: "12",
              cy: "12",
              r: "10",
              stroke: "currentColor",
              strokeWidth: "4"
            }), /* @__PURE__ */ jsx("path", {
              className: "opacity-75",
              fill: "currentColor",
              d: "M4 12a8 8 0 018-8v8H4z"
            })]
          }), "Signing in…"]
        }) : "Sign in"
      })]
    }), /* @__PURE__ */ jsxs("p", {
      className: "mt-6 text-center text-sm text-slate-500",
      children: ["Don't have an account?", " ", /* @__PURE__ */ jsx(Link, {
        to: "/signup",
        className: "font-semibold text-blue-400 hover:text-blue-300 transition",
        children: "Create one free"
      })]
    })]
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$5,
  default: _auth_login,
  loader: loader$8
}, Symbol.toStringTag, { value: "Module" }));
async function loader$7({
  request
}) {
  const {
    requireSession
  } = await import("./assets/session.server-DqS0IdcJ.js");
  const session = await requireSession(request);
  const stage = session.get("stage");
  if (stage === "verified") throw redirect("/onboarding");
  if (stage === "onboarded") throw redirect("/");
  return {
    email: session.get("email") ?? "",
    firstName: session.get("firstName") ?? ""
  };
}
async function action$4({
  request
}) {
  const {
    requireSession,
    commitSession
  } = await import("./assets/session.server-DqS0IdcJ.js");
  const {
    api
  } = await import("./assets/api.server-CoNHom2L.js");
  const session = await requireSession(request);
  const token = session.get("token");
  const form = await request.formData();
  const intent = form.get("intent");
  if (intent === "resend") {
    const result2 = await api.post("/api/auth/resend-otp", {}, token);
    if (!result2.success) return {
      error: result2.message,
      resent: false
    };
    return {
      resent: true,
      error: null
    };
  }
  const code = form.get("code");
  const result = await api.post("/api/auth/verify-otp", {
    code
  }, token);
  if (!result.success) {
    return {
      error: result.message ?? "Invalid OTP.",
      resent: false
    };
  }
  session.set("token", result.token);
  session.set("stage", "verified");
  return redirect("/onboarding", {
    headers: {
      "Set-Cookie": await commitSession(session)
    }
  });
}
const _auth_verify = UNSAFE_withComponentProps(function Verify({
  loaderData,
  actionData
}) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const {
    email,
    firstName
  } = loaderData;
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsxs("div", {
      className: "mb-8",
      children: [/* @__PURE__ */ jsx("div", {
        className: "w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-5",
        children: /* @__PURE__ */ jsx("svg", {
          className: "w-6 h-6 text-blue-400",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /* @__PURE__ */ jsx("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          })
        })
      }), /* @__PURE__ */ jsx("h1", {
        className: "text-2xl font-black text-white tracking-tight",
        children: "Check your email"
      }), /* @__PURE__ */ jsxs("p", {
        className: "mt-1.5 text-slate-400 text-sm",
        children: ["Hi ", firstName, "! We sent a 6-digit code to", " ", /* @__PURE__ */ jsx("span", {
          className: "text-slate-300 font-medium",
          children: email
        }), "."]
      })]
    }), (actionData == null ? void 0 : actionData.resent) && /* @__PURE__ */ jsx("div", {
      className: "mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm",
      children: "A new code has been sent to your email."
    }), (actionData == null ? void 0 : actionData.error) && /* @__PURE__ */ jsxs("div", {
      className: "mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2.5",
      children: [/* @__PURE__ */ jsx("svg", {
        className: "w-4 h-4 shrink-0",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        children: /* @__PURE__ */ jsx("path", {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: 2,
          d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        })
      }), actionData.error]
    }), /* @__PURE__ */ jsxs(Form, {
      method: "post",
      className: "space-y-4",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("label", {
          htmlFor: "code",
          className: "block text-sm font-medium text-slate-300 mb-1.5",
          children: "Verification code"
        }), /* @__PURE__ */ jsx("input", {
          id: "code",
          name: "code",
          type: "text",
          required: true,
          maxLength: 6,
          autoComplete: "one-time-code",
          inputMode: "numeric",
          pattern: "[0-9]{6}",
          className: "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center text-2xl tracking-[0.5em] font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/40 transition",
          placeholder: "000000"
        })]
      }), /* @__PURE__ */ jsx("button", {
        type: "submit",
        disabled: isSubmitting,
        className: "w-full py-3 px-4 mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2",
        children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment, {
          children: [/* @__PURE__ */ jsxs("svg", {
            className: "w-4 h-4 animate-spin",
            fill: "none",
            viewBox: "0 0 24 24",
            children: [/* @__PURE__ */ jsx("circle", {
              className: "opacity-25",
              cx: "12",
              cy: "12",
              r: "10",
              stroke: "currentColor",
              strokeWidth: "4"
            }), /* @__PURE__ */ jsx("path", {
              className: "opacity-75",
              fill: "currentColor",
              d: "M4 12a8 8 0 018-8v8H4z"
            })]
          }), "Verifying…"]
        }) : "Verify account"
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "mt-6 text-center",
      children: /* @__PURE__ */ jsxs("p", {
        className: "text-sm text-slate-500",
        children: ["Didn't receive the code?", " ", /* @__PURE__ */ jsxs(Form, {
          method: "post",
          className: "inline",
          children: [/* @__PURE__ */ jsx("input", {
            type: "hidden",
            name: "intent",
            value: "resend"
          }), /* @__PURE__ */ jsx("button", {
            type: "submit",
            disabled: isSubmitting,
            className: "font-semibold text-blue-400 hover:text-blue-300 disabled:opacity-50 transition",
            children: "Resend code"
          })]
        })]
      })
    })]
  });
});
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$4,
  default: _auth_verify,
  loader: loader$7
}, Symbol.toStringTag, { value: "Module" }));
async function loader$6({
  request
}) {
  const {
    requireSession
  } = await import("./assets/session.server-DqS0IdcJ.js");
  const session = await requireSession(request);
  const stage = session.get("stage");
  if (stage === "registered") throw redirect("/verify");
  if (stage === "onboarded") throw redirect("/");
  return {
    firstName: session.get("firstName") ?? ""
  };
}
async function action$3({
  request
}) {
  const {
    requireSession,
    commitSession
  } = await import("./assets/session.server-DqS0IdcJ.js");
  const {
    api
  } = await import("./assets/api.server-CoNHom2L.js");
  const session = await requireSession(request);
  const token = session.get("token");
  const form = await request.formData();
  const result = await api.post("/api/gym-profile", {
    gymName: form.get("gymName"),
    strength: Number(form.get("strength")),
    city: form.get("city"),
    state: form.get("state"),
    address: form.get("address"),
    pincode: form.get("pincode"),
    phone: form.get("phone"),
    email: form.get("email")
  }, token);
  if (!result.success) {
    return {
      error: result.message ?? "Failed to create gym profile."
    };
  }
  session.set("stage", "onboarded");
  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session)
    }
  });
}
const inputCls$1 = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/40 transition";
const _auth_onboarding = UNSAFE_withComponentProps(function Onboarding({
  loaderData,
  actionData
}) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const {
    firstName
  } = loaderData;
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsxs("div", {
      className: "mb-8",
      children: [/* @__PURE__ */ jsx("div", {
        className: "w-12 h-12 bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center mb-5",
        children: /* @__PURE__ */ jsx("svg", {
          className: "w-6 h-6 text-amber-400",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /* @__PURE__ */ jsx("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          })
        })
      }), /* @__PURE__ */ jsx("h1", {
        className: "text-2xl font-black text-white tracking-tight",
        children: "Set up your gym"
      }), /* @__PURE__ */ jsxs("p", {
        className: "mt-1.5 text-slate-400 text-sm",
        children: ["Great work, ", firstName, "! A few details about your gym to get started."]
      })]
    }), (actionData == null ? void 0 : actionData.error) && /* @__PURE__ */ jsxs("div", {
      className: "mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2.5",
      children: [/* @__PURE__ */ jsx("svg", {
        className: "w-4 h-4 shrink-0",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        children: /* @__PURE__ */ jsx("path", {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: 2,
          d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        })
      }), actionData.error]
    }), /* @__PURE__ */ jsxs(Form, {
      method: "post",
      className: "space-y-4",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsxs("label", {
          className: "block text-sm font-medium text-slate-300 mb-1.5",
          children: ["Gym name ", /* @__PURE__ */ jsx("span", {
            className: "text-red-400",
            children: "*"
          })]
        }), /* @__PURE__ */ jsx("input", {
          name: "gymName",
          required: true,
          type: "text",
          placeholder: "e.g. Iron Paradise Gym",
          className: inputCls$1
        })]
      }), /* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsxs("label", {
          className: "block text-sm font-medium text-slate-300 mb-1.5",
          children: ["Gym capacity (members) ", /* @__PURE__ */ jsx("span", {
            className: "text-red-400",
            children: "*"
          })]
        }), /* @__PURE__ */ jsx("input", {
          name: "strength",
          required: true,
          type: "number",
          min: 1,
          placeholder: "e.g. 200",
          className: inputCls$1
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-2 gap-3",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsxs("label", {
            className: "block text-sm font-medium text-slate-300 mb-1.5",
            children: ["City ", /* @__PURE__ */ jsx("span", {
              className: "text-red-400",
              children: "*"
            })]
          }), /* @__PURE__ */ jsx("input", {
            name: "city",
            required: true,
            type: "text",
            placeholder: "Mumbai",
            className: inputCls$1
          })]
        }), /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("label", {
            className: "block text-sm font-medium text-slate-300 mb-1.5",
            children: "State"
          }), /* @__PURE__ */ jsx("input", {
            name: "state",
            type: "text",
            placeholder: "Maharashtra",
            className: inputCls$1
          })]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("label", {
          className: "block text-sm font-medium text-slate-300 mb-1.5",
          children: "Full address"
        }), /* @__PURE__ */ jsx("input", {
          name: "address",
          type: "text",
          placeholder: "123, Main Street, Andheri West",
          className: inputCls$1
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-2 gap-3",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("label", {
            className: "block text-sm font-medium text-slate-300 mb-1.5",
            children: "Pincode"
          }), /* @__PURE__ */ jsx("input", {
            name: "pincode",
            type: "text",
            placeholder: "400053",
            className: inputCls$1
          })]
        }), /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("label", {
            className: "block text-sm font-medium text-slate-300 mb-1.5",
            children: "Gym contact"
          }), /* @__PURE__ */ jsx("input", {
            name: "phone",
            type: "tel",
            placeholder: "+91 98765 43210",
            className: inputCls$1
          })]
        })]
      }), /* @__PURE__ */ jsx("button", {
        type: "submit",
        disabled: isSubmitting,
        className: "w-full py-3 px-4 mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2",
        children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment, {
          children: [/* @__PURE__ */ jsxs("svg", {
            className: "w-4 h-4 animate-spin",
            fill: "none",
            viewBox: "0 0 24 24",
            children: [/* @__PURE__ */ jsx("circle", {
              className: "opacity-25",
              cx: "12",
              cy: "12",
              r: "10",
              stroke: "currentColor",
              strokeWidth: "4"
            }), /* @__PURE__ */ jsx("path", {
              className: "opacity-75",
              fill: "currentColor",
              d: "M4 12a8 8 0 018-8v8H4z"
            })]
          }), "Creating gym profile…"]
        }) : "Create gym profile →"
      })]
    })]
  });
});
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3,
  default: _auth_onboarding,
  loader: loader$6
}, Symbol.toStringTag, { value: "Module" }));
async function loader$5({
  request
}) {
  const {
    requireSession
  } = await import("./assets/session.server-DqS0IdcJ.js");
  const {
    api
  } = await import("./assets/api.server-CoNHom2L.js");
  const session = await requireSession(request);
  const stage = session.get("stage");
  if (stage === "registered") throw redirect("/verify");
  if (stage === "verified") throw redirect("/onboarding");
  const token = session.get("token");
  const result = await api.get("/api/auth/me", token);
  if (!result.success) throw redirect("/login");
  return {
    user: result.user
  };
}
async function action$2({
  request
}) {
  const {
    getSession,
    destroySession
  } = await import("./assets/session.server-DqS0IdcJ.js");
  const session = await getSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session)
    }
  });
}
const navItems = [{
  to: "/",
  label: "Dashboard",
  icon: /* @__PURE__ */ jsx("svg", {
    className: "w-5 h-5",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    children: /* @__PURE__ */ jsx("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 1.5,
      d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    })
  })
}, {
  to: "/members",
  label: "Members",
  icon: /* @__PURE__ */ jsx("svg", {
    className: "w-5 h-5",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    children: /* @__PURE__ */ jsx("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 1.5,
      d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
    })
  })
}, {
  to: "/staff",
  label: "Staff",
  icon: /* @__PURE__ */ jsx("svg", {
    className: "w-5 h-5",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    children: /* @__PURE__ */ jsx("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 1.5,
      d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    })
  })
}, {
  to: "/plans",
  label: "Plans",
  icon: /* @__PURE__ */ jsx("svg", {
    className: "w-5 h-5",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    children: /* @__PURE__ */ jsx("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 1.5,
      d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    })
  })
}, {
  to: "/payments",
  label: "Payments",
  icon: /* @__PURE__ */ jsx("svg", {
    className: "w-5 h-5",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    children: /* @__PURE__ */ jsx("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 1.5,
      d: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    })
  })
}];
const _app = UNSAFE_withComponentProps(function AppLayout({
  loaderData
}) {
  var _a, _b;
  const {
    user
  } = loaderData;
  return /* @__PURE__ */ jsxs("div", {
    className: "flex h-screen bg-gray-50",
    children: [/* @__PURE__ */ jsxs("aside", {
      className: "w-64 bg-slate-900 flex flex-col",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex items-center gap-3 px-5 py-5",
        children: [/* @__PURE__ */ jsx("div", {
          className: "w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0",
          children: /* @__PURE__ */ jsx("svg", {
            className: "w-5 h-5 text-white",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            children: /* @__PURE__ */ jsx("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            })
          })
        }), /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("span", {
            className: "text-white font-bold text-base tracking-tight leading-none block",
            children: "GymManager"
          }), /* @__PURE__ */ jsx("span", {
            className: "text-slate-500 text-xs",
            children: "Admin panel"
          })]
        })]
      }), /* @__PURE__ */ jsx("p", {
        className: "px-5 pt-2 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-widest",
        children: "Menu"
      }), /* @__PURE__ */ jsx("nav", {
        className: "flex-1 px-3 space-y-0.5",
        children: navItems.map((item) => /* @__PURE__ */ jsxs(NavLink, {
          to: item.to,
          end: item.to === "/",
          className: ({
            isActive
          }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800"}`,
          children: [item.icon, item.label]
        }, item.to))
      }), /* @__PURE__ */ jsx("div", {
        className: "p-3",
        children: /* @__PURE__ */ jsxs("div", {
          className: "bg-slate-800 rounded-xl p-3",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-3 mb-3",
            children: [/* @__PURE__ */ jsx("div", {
              className: "w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0",
              children: ((_b = (_a = user == null ? void 0 : user.firstName) == null ? void 0 : _a[0]) == null ? void 0 : _b.toUpperCase()) ?? "?"
            }), /* @__PURE__ */ jsxs("div", {
              className: "min-w-0 flex-1",
              children: [/* @__PURE__ */ jsxs("p", {
                className: "text-white text-sm font-semibold truncate leading-none mb-0.5",
                children: [user == null ? void 0 : user.firstName, " ", user == null ? void 0 : user.lastName]
              }), /* @__PURE__ */ jsx("p", {
                className: "text-slate-400 text-xs truncate",
                children: user == null ? void 0 : user.email
              })]
            })]
          }), /* @__PURE__ */ jsx(Form, {
            method: "post",
            children: /* @__PURE__ */ jsxs("button", {
              type: "submit",
              className: "w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors",
              children: [/* @__PURE__ */ jsx("svg", {
                className: "w-3.5 h-3.5",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                children: /* @__PURE__ */ jsx("path", {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                })
              }), "Sign out"]
            })
          })]
        })
      })]
    }), /* @__PURE__ */ jsx("main", {
      className: "flex-1 overflow-auto",
      children: /* @__PURE__ */ jsx(Outlet, {})
    })]
  });
});
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2,
  default: _app,
  loader: loader$5
}, Symbol.toStringTag, { value: "Module" }));
async function loader$4({
  request
}) {
  const {
    requireSession
  } = await import("./assets/session.server-DqS0IdcJ.js");
  const {
    api
  } = await import("./assets/api.server-CoNHom2L.js");
  const session = await requireSession(request);
  const token = session.get("token");
  const firstName = session.get("firstName") ?? "there";
  const [membersRes, plansRes] = await Promise.all([api.get("/api/members", token), api.get("/api/plans", token)]);
  const recentMembers = (membersRes.data ?? []).slice(0, 5).map((m) => ({
    name: `${m.user.firstName} ${m.user.lastName}`.trim(),
    plan: m.membershipType,
    joinedAt: m.createdAt
  }));
  return {
    firstName,
    stats: {
      totalMembers: membersRes.count ?? 0,
      activePlans: plansRes.count ?? 0,
      monthlyRevenue: 0,
      attendance: 0
    },
    recentMembers
  };
}
function StatCard({
  label,
  value,
  sub,
  icon,
  accent
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex items-start justify-between",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("p", {
          className: "text-sm font-medium text-gray-500",
          children: label
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-1 text-3xl font-bold text-gray-900 tracking-tight",
          children: value
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: `w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`,
        children: icon
      })]
    }), sub && /* @__PURE__ */ jsx("p", {
      className: "text-xs text-gray-400",
      children: sub
    })]
  });
}
function QuickActionCard({
  label,
  description,
  href,
  accent,
  icon
}) {
  return /* @__PURE__ */ jsxs(Link, {
    to: href,
    className: "group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-start gap-4",
    children: [/* @__PURE__ */ jsx("div", {
      className: `w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent} group-hover:scale-110 transition-transform`,
      children: icon
    }), /* @__PURE__ */ jsxs("div", {
      children: [/* @__PURE__ */ jsx("p", {
        className: "text-sm font-semibold text-gray-800",
        children: label
      }), /* @__PURE__ */ jsx("p", {
        className: "text-xs text-gray-400 mt-0.5",
        children: description
      })]
    })]
  });
}
const _app__index = UNSAFE_withComponentProps(function Dashboard({
  loaderData
}) {
  const {
    stats,
    firstName,
    recentMembers
  } = loaderData;
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const statCards = [{
    label: "Total Members",
    value: stats.totalMembers,
    sub: stats.totalMembers === 0 ? "Add your first member to get started" : "Registered members",
    accent: "bg-blue-50 text-blue-600",
    icon: /* @__PURE__ */ jsx("svg", {
      className: "w-5 h-5",
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      children: /* @__PURE__ */ jsx("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 1.5,
        d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      })
    })
  }, {
    label: "Active Plans",
    value: stats.activePlans,
    sub: stats.activePlans === 0 ? "Create membership plans to sell" : "Membership plans available",
    accent: "bg-emerald-50 text-emerald-600",
    icon: /* @__PURE__ */ jsx("svg", {
      className: "w-5 h-5",
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      children: /* @__PURE__ */ jsx("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 1.5,
        d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      })
    })
  }, {
    label: "Monthly Revenue",
    value: `₹${stats.monthlyRevenue.toLocaleString("en-IN")}`,
    sub: "Track payments to see revenue",
    accent: "bg-amber-50 text-amber-600",
    icon: /* @__PURE__ */ jsx("svg", {
      className: "w-5 h-5",
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      children: /* @__PURE__ */ jsx("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 1.5,
        d: "M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"
      })
    })
  }, {
    label: "Today's Check-ins",
    value: stats.attendance,
    sub: "Attendance tracking coming soon",
    accent: "bg-violet-50 text-violet-600",
    icon: /* @__PURE__ */ jsx("svg", {
      className: "w-5 h-5",
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      children: /* @__PURE__ */ jsx("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 1.5,
        d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      })
    })
  }];
  const quickActions = [{
    label: "Add Member",
    description: "Register a new gym member",
    href: "/members",
    accent: "bg-blue-600 text-white",
    icon: /* @__PURE__ */ jsx("svg", {
      className: "w-5 h-5",
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      children: /* @__PURE__ */ jsx("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
        d: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
      })
    })
  }, {
    label: "Create Plan",
    description: "Define a new membership plan",
    href: "/plans",
    accent: "bg-emerald-600 text-white",
    icon: /* @__PURE__ */ jsx("svg", {
      className: "w-5 h-5",
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      children: /* @__PURE__ */ jsx("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
        d: "M12 6v6m0 0v6m0-6h6m-6 0H6"
      })
    })
  }, {
    label: "Manage Staff",
    description: "Add trainers and front desk",
    href: "/staff",
    accent: "bg-slate-700 text-white",
    icon: /* @__PURE__ */ jsx("svg", {
      className: "w-5 h-5",
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      children: /* @__PURE__ */ jsx("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
        d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      })
    })
  }, {
    label: "Record Payment",
    description: "Log a membership payment",
    href: "/payments",
    accent: "bg-amber-500 text-white",
    icon: /* @__PURE__ */ jsx("svg", {
      className: "w-5 h-5",
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      children: /* @__PURE__ */ jsx("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
        d: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
      })
    })
  }];
  const features = [{
    title: "Member Management",
    description: "Track profiles, contact info, membership status, and attendance history for every member.",
    icon: /* @__PURE__ */ jsx("svg", {
      className: "w-6 h-6 text-blue-600",
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      children: /* @__PURE__ */ jsx("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 1.5,
        d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      })
    }),
    color: "bg-blue-50"
  }, {
    title: "Flexible Plans",
    description: "Create monthly, quarterly, or annual plans. Set pricing, duration, and perks for each tier.",
    icon: /* @__PURE__ */ jsx("svg", {
      className: "w-6 h-6 text-emerald-600",
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      children: /* @__PURE__ */ jsx("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 1.5,
        d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      })
    }),
    color: "bg-emerald-50"
  }, {
    title: "Payment Tracking",
    description: "Record fees collected, dues pending, and generate payment receipts for every transaction.",
    icon: /* @__PURE__ */ jsx("svg", {
      className: "w-6 h-6 text-amber-600",
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      children: /* @__PURE__ */ jsx("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 1.5,
        d: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      })
    }),
    color: "bg-amber-50"
  }, {
    title: "Staff Management",
    description: "Onboard trainers, assign roles, and track staff schedules across departments.",
    icon: /* @__PURE__ */ jsx("svg", {
      className: "w-6 h-6 text-violet-600",
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      children: /* @__PURE__ */ jsx("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 1.5,
        d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      })
    }),
    color: "bg-violet-50"
  }];
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-full",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsxs("h1", {
          className: "text-xl font-bold text-gray-900",
          children: ["Good ", getGreeting(), ", ", firstName]
        }), /* @__PURE__ */ jsx("p", {
          className: "text-sm text-gray-400 mt-0.5",
          suppressHydrationWarning: true,
          children: today
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "flex items-center gap-3",
        children: /* @__PURE__ */ jsxs("span", {
          className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold",
          children: [/* @__PURE__ */ jsx("span", {
            className: "w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"
          }), "System online"]
        })
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "p-8 space-y-8",
      children: [/* @__PURE__ */ jsx("div", {
        className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5",
        children: statCards.map((card) => /* @__PURE__ */ jsx(StatCard, {
          ...card
        }, card.label))
      }), stats.totalMembers === 0 && /* @__PURE__ */ jsxs("div", {
        className: "relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 rounded-2xl p-8 text-white",
        children: [/* @__PURE__ */ jsx("div", {
          className: "absolute inset-0 opacity-10",
          style: {
            backgroundImage: "radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 50%)"
          }
        }), /* @__PURE__ */ jsxs("div", {
          className: "relative",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "inline-flex items-center gap-2 bg-blue-600/30 border border-blue-400/30 rounded-full px-3 py-1 text-blue-300 text-xs font-semibold mb-4",
            children: [/* @__PURE__ */ jsx("svg", {
              className: "w-3.5 h-3.5",
              fill: "currentColor",
              viewBox: "0 0 20 20",
              children: /* @__PURE__ */ jsx("path", {
                fillRule: "evenodd",
                d: "M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z",
                clipRule: "evenodd"
              })
            }), "Getting started"]
          }), /* @__PURE__ */ jsx("h2", {
            className: "text-2xl font-bold mb-2",
            children: "Set up your gym in minutes"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-slate-300 text-sm max-w-xl mb-6",
            children: "Welcome to GymManager. Create your membership plans, add your first members, and start tracking payments — all from one place."
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex flex-wrap gap-3",
            children: [/* @__PURE__ */ jsxs(Link, {
              to: "/plans",
              className: "inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition",
              children: [/* @__PURE__ */ jsx("svg", {
                className: "w-4 h-4",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                children: /* @__PURE__ */ jsx("path", {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M12 6v6m0 0v6m0-6h6m-6 0H6"
                })
              }), "Create first plan"]
            }), /* @__PURE__ */ jsx(Link, {
              to: "/members",
              className: "inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition border border-white/20",
              children: "Add a member"
            })]
          })]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("div", {
          className: "flex items-center justify-between mb-4",
          children: /* @__PURE__ */ jsx("h2", {
            className: "text-base font-semibold text-gray-900",
            children: "Quick actions"
          })
        }), /* @__PURE__ */ jsx("div", {
          className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
          children: quickActions.map((action2) => /* @__PURE__ */ jsx(QuickActionCard, {
            ...action2
          }, action2.label))
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "px-6 py-4 border-b border-gray-100 flex items-center justify-between",
            children: [/* @__PURE__ */ jsx("h2", {
              className: "text-sm font-semibold text-gray-900",
              children: "Recent members"
            }), /* @__PURE__ */ jsx(Link, {
              to: "/members",
              className: "text-xs text-blue-600 hover:text-blue-700 font-medium",
              children: "View all"
            })]
          }), recentMembers.length > 0 ? /* @__PURE__ */ jsxs("table", {
            className: "w-full text-sm",
            children: [/* @__PURE__ */ jsx("thead", {
              children: /* @__PURE__ */ jsxs("tr", {
                className: "bg-gray-50 text-xs text-gray-400 uppercase tracking-wide",
                children: [/* @__PURE__ */ jsx("th", {
                  className: "px-6 py-3 text-left font-medium",
                  children: "Name"
                }), /* @__PURE__ */ jsx("th", {
                  className: "px-6 py-3 text-left font-medium",
                  children: "Plan"
                }), /* @__PURE__ */ jsx("th", {
                  className: "px-6 py-3 text-left font-medium",
                  children: "Joined"
                })]
              })
            }), /* @__PURE__ */ jsx("tbody", {
              className: "divide-y divide-gray-50",
              children: recentMembers.map((m, i) => {
                var _a, _b;
                return /* @__PURE__ */ jsxs("tr", {
                  className: "hover:bg-gray-50/50 transition-colors",
                  children: [/* @__PURE__ */ jsx("td", {
                    className: "px-6 py-3.5",
                    children: /* @__PURE__ */ jsxs("div", {
                      className: "flex items-center gap-3",
                      children: [/* @__PURE__ */ jsx("div", {
                        className: "w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0",
                        children: ((_b = (_a = m.name) == null ? void 0 : _a[0]) == null ? void 0 : _b.toUpperCase()) ?? "?"
                      }), /* @__PURE__ */ jsx("span", {
                        className: "font-medium text-gray-800",
                        children: m.name
                      })]
                    })
                  }), /* @__PURE__ */ jsx("td", {
                    className: "px-6 py-3.5",
                    children: /* @__PURE__ */ jsx("span", {
                      className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700",
                      children: m.plan ?? "—"
                    })
                  }), /* @__PURE__ */ jsx("td", {
                    className: "px-6 py-3.5 text-gray-400 text-xs",
                    children: m.joinedAt ? new Date(m.joinedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    }) : "—"
                  })]
                }, i);
              })
            })]
          }) : /* @__PURE__ */ jsxs("div", {
            className: "flex flex-col items-center justify-center py-14 text-center px-6",
            children: [/* @__PURE__ */ jsx("div", {
              className: "w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4",
              children: /* @__PURE__ */ jsx("svg", {
                className: "w-7 h-7 text-gray-300",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                children: /* @__PURE__ */ jsx("path", {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 1.5,
                  d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                })
              })
            }), /* @__PURE__ */ jsx("p", {
              className: "text-sm font-medium text-gray-500",
              children: "No members yet"
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xs text-gray-400 mt-1",
              children: "Add your first member to see them here."
            }), /* @__PURE__ */ jsxs(Link, {
              to: "/members",
              className: "mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700",
              children: ["Add member", /* @__PURE__ */ jsx("svg", {
                className: "w-3.5 h-3.5",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                children: /* @__PURE__ */ jsx("path", {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M9 5l7 7-7 7"
                })
              })]
            })]
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col gap-4",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-6",
            children: [/* @__PURE__ */ jsx("h3", {
              className: "text-sm font-semibold text-gray-900 mb-1",
              children: "Revenue this month"
            }), /* @__PURE__ */ jsx("p", {
              className: "text-3xl font-bold text-gray-900",
              children: "₹0"
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xs text-gray-400 mt-1",
              children: "Start recording payments to track revenue"
            }), /* @__PURE__ */ jsx("div", {
              className: "mt-4 h-1.5 rounded-full bg-gray-100",
              children: /* @__PURE__ */ jsx("div", {
                className: "h-1.5 rounded-full bg-amber-400 w-0"
              })
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xs text-gray-400 mt-2",
              children: "₹0 of monthly target"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex-1",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "flex items-center gap-2 mb-4",
              children: [/* @__PURE__ */ jsx("svg", {
                className: "w-4 h-4 text-amber-500",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                children: /* @__PURE__ */ jsx("path", {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                })
              }), /* @__PURE__ */ jsx("h3", {
                className: "text-sm font-semibold text-gray-900",
                children: "Expiring soon"
              })]
            }), /* @__PURE__ */ jsx("div", {
              className: "flex flex-col items-center justify-center py-6 text-center",
              children: /* @__PURE__ */ jsx("p", {
                className: "text-xs text-gray-400",
                children: "Memberships expiring in the next 7 days will appear here."
              })
            })]
          })]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("h2", {
          className: "text-base font-semibold text-gray-900 mb-2",
          children: "What you can do with GymManager"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-sm text-gray-400 mb-5",
          children: "Everything you need to run your gym — in one dashboard."
        }), /* @__PURE__ */ jsx("div", {
          className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4",
          children: features.map((f) => /* @__PURE__ */ jsxs("div", {
            className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-5",
            children: [/* @__PURE__ */ jsx("div", {
              className: `w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4`,
              children: f.icon
            }), /* @__PURE__ */ jsx("h3", {
              className: "text-sm font-semibold text-gray-800 mb-1",
              children: f.title
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xs text-gray-400 leading-relaxed",
              children: f.description
            })]
          }, f.title))
        })]
      })]
    })]
  });
});
function getGreeting() {
  const h = (/* @__PURE__ */ new Date()).getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _app__index,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
async function loader$3({
  request
}) {
  const {
    requireSession
  } = await import("./assets/session.server-DqS0IdcJ.js");
  const {
    api
  } = await import("./assets/api.server-CoNHom2L.js");
  const session = await requireSession(request);
  const token = session.get("token");
  const result = await api.get("/api/members", token);
  return {
    members: result.data ?? []
  };
}
async function action$1({
  request
}) {
  const {
    requireSession
  } = await import("./assets/session.server-DqS0IdcJ.js");
  const {
    api
  } = await import("./assets/api.server-CoNHom2L.js");
  const session = await requireSession(request);
  const token = session.get("token");
  const form = await request.formData();
  const intent = form.get("intent");
  if (intent === "create") {
    const result = await api.post("/api/members", {
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      email: form.get("email"),
      phone: form.get("phone"),
      membershipType: form.get("membershipType"),
      membershipEnd: form.get("membershipEnd")
    }, token);
    return {
      intent: "create",
      success: result.success,
      error: result.success ? null : result.message ?? "Failed to add member."
    };
  }
  if (intent === "delete") {
    const id = form.get("id");
    const result = await api.delete(`/api/members/${id}`, token);
    return {
      intent: "delete",
      success: result.success,
      error: result.success ? null : result.message ?? "Failed to delete member."
    };
  }
  return null;
}
const TYPE_BADGE$1 = {
  premium: "bg-amber-100 text-amber-700",
  standard: "bg-blue-100 text-blue-700",
  basic: "bg-gray-100 text-gray-600"
};
const inputCls = "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
const _app_members = UNSAFE_withComponentProps(function Members({
  loaderData,
  actionData
}) {
  const {
    members
  } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [showForm, setShowForm] = useState(false);
  useEffect(() => {
    if ((actionData == null ? void 0 : actionData.intent) === "create" && (actionData == null ? void 0 : actionData.success)) {
      setShowForm(false);
    }
  }, [actionData]);
  const activeCount = members.filter((m) => !isExpired(m.membershipEnd) && m.isActive).length;
  const expiredCount = members.filter((m) => isExpired(m.membershipEnd)).length;
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-full",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("h1", {
          className: "text-xl font-bold text-gray-900",
          children: "Members"
        }), /* @__PURE__ */ jsxs("p", {
          className: "text-sm text-gray-400 mt-0.5",
          children: [members.length, " total member", members.length !== 1 ? "s" : ""]
        })]
      }), /* @__PURE__ */ jsxs("button", {
        onClick: () => setShowForm((v) => !v),
        className: "flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition",
        children: [/* @__PURE__ */ jsx("svg", {
          className: "w-4 h-4",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /* @__PURE__ */ jsx("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"
          })
        }), showForm ? "Cancel" : "Add member"]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "p-8 space-y-6",
      children: [(actionData == null ? void 0 : actionData.error) && /* @__PURE__ */ jsx("div", {
        className: "p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm",
        children: actionData.error
      }), /* @__PURE__ */ jsx("div", {
        className: "grid grid-cols-3 gap-4",
        children: [{
          label: "Active",
          value: activeCount,
          color: "text-emerald-600"
        }, {
          label: "Expired",
          value: expiredCount,
          color: "text-red-500"
        }, {
          label: "Premium",
          value: members.filter((m) => m.membershipType === "premium").length,
          color: "text-amber-500"
        }].map((s) => /* @__PURE__ */ jsxs("div", {
          className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-5",
          children: [/* @__PURE__ */ jsx("p", {
            className: `text-2xl font-bold ${s.color}`,
            children: s.value
          }), /* @__PURE__ */ jsx("p", {
            className: "text-sm text-gray-500 mt-0.5",
            children: s.label
          })]
        }, s.label))
      }), showForm && /* @__PURE__ */ jsxs("div", {
        className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-6",
        children: [/* @__PURE__ */ jsx("h2", {
          className: "text-base font-semibold text-gray-900 mb-5",
          children: "New member details"
        }), /* @__PURE__ */ jsxs(Form, {
          method: "post",
          className: "space-y-4",
          children: [/* @__PURE__ */ jsx("input", {
            type: "hidden",
            name: "intent",
            value: "create"
          }), /* @__PURE__ */ jsxs("div", {
            className: "grid grid-cols-2 gap-4",
            children: [/* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsxs("label", {
                className: "block text-sm font-medium text-gray-700 mb-1.5",
                children: ["First name ", /* @__PURE__ */ jsx("span", {
                  className: "text-red-500",
                  children: "*"
                })]
              }), /* @__PURE__ */ jsx("input", {
                name: "firstName",
                required: true,
                type: "text",
                placeholder: "John",
                className: inputCls
              })]
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsxs("label", {
                className: "block text-sm font-medium text-gray-700 mb-1.5",
                children: ["Last name ", /* @__PURE__ */ jsx("span", {
                  className: "text-red-500",
                  children: "*"
                })]
              }), /* @__PURE__ */ jsx("input", {
                name: "lastName",
                required: true,
                type: "text",
                placeholder: "Doe",
                className: inputCls
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "grid grid-cols-2 gap-4",
            children: [/* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsxs("label", {
                className: "block text-sm font-medium text-gray-700 mb-1.5",
                children: ["Email ", /* @__PURE__ */ jsx("span", {
                  className: "text-red-500",
                  children: "*"
                })]
              }), /* @__PURE__ */ jsx("input", {
                name: "email",
                required: true,
                type: "email",
                placeholder: "john@example.com",
                className: inputCls
              })]
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("label", {
                className: "block text-sm font-medium text-gray-700 mb-1.5",
                children: "Phone"
              }), /* @__PURE__ */ jsx("input", {
                name: "phone",
                type: "tel",
                placeholder: "+91 98765 43210",
                className: inputCls
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "grid grid-cols-2 gap-4",
            children: [/* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("label", {
                className: "block text-sm font-medium text-gray-700 mb-1.5",
                children: "Membership type"
              }), /* @__PURE__ */ jsxs("select", {
                name: "membershipType",
                className: inputCls,
                children: [/* @__PURE__ */ jsx("option", {
                  value: "basic",
                  children: "Basic"
                }), /* @__PURE__ */ jsx("option", {
                  value: "standard",
                  children: "Standard"
                }), /* @__PURE__ */ jsx("option", {
                  value: "premium",
                  children: "Premium"
                })]
              })]
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsxs("label", {
                className: "block text-sm font-medium text-gray-700 mb-1.5",
                children: ["Membership expires ", /* @__PURE__ */ jsx("span", {
                  className: "text-red-500",
                  children: "*"
                })]
              }), /* @__PURE__ */ jsx("input", {
                name: "membershipEnd",
                required: true,
                type: "date",
                className: inputCls,
                min: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-3 pt-1",
            children: [/* @__PURE__ */ jsx("button", {
              type: "submit",
              disabled: isSubmitting,
              className: "px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl transition",
              children: isSubmitting ? "Adding…" : "Add member"
            }), /* @__PURE__ */ jsx("button", {
              type: "button",
              onClick: () => setShowForm(false),
              className: "px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition",
              children: "Cancel"
            })]
          })]
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden",
        children: members.length === 0 ? /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col items-center justify-center py-20 text-gray-400",
          children: [/* @__PURE__ */ jsx("div", {
            className: "w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4",
            children: /* @__PURE__ */ jsx("svg", {
              className: "w-8 h-8 text-gray-300",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              children: /* @__PURE__ */ jsx("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 1.5,
                d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              })
            })
          }), /* @__PURE__ */ jsx("p", {
            className: "font-medium text-gray-500",
            children: "No members yet"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-sm mt-1 text-gray-400",
            children: 'Click "Add member" above to get started.'
          })]
        }) : /* @__PURE__ */ jsxs("table", {
          className: "w-full text-sm",
          children: [/* @__PURE__ */ jsx("thead", {
            children: /* @__PURE__ */ jsxs("tr", {
              className: "border-b border-gray-100 bg-gray-50",
              children: [/* @__PURE__ */ jsx("th", {
                className: "text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide",
                children: "Member"
              }), /* @__PURE__ */ jsx("th", {
                className: "text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide",
                children: "Phone"
              }), /* @__PURE__ */ jsx("th", {
                className: "text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide",
                children: "Plan"
              }), /* @__PURE__ */ jsx("th", {
                className: "text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide",
                children: "Expires"
              }), /* @__PURE__ */ jsx("th", {
                className: "text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide",
                children: "Status"
              }), /* @__PURE__ */ jsx("th", {
                className: "px-6 py-3.5"
              })]
            })
          }), /* @__PURE__ */ jsx("tbody", {
            className: "divide-y divide-gray-50",
            children: members.map((member) => {
              var _a;
              const expired = isExpired(member.membershipEnd);
              const name = `${member.user.firstName} ${member.user.lastName}`.trim();
              return /* @__PURE__ */ jsxs("tr", {
                className: "hover:bg-gray-50/50 transition-colors",
                children: [/* @__PURE__ */ jsx("td", {
                  className: "px-6 py-4",
                  children: /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center gap-3",
                    children: [/* @__PURE__ */ jsx("div", {
                      className: "w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0",
                      children: ((_a = name[0]) == null ? void 0 : _a.toUpperCase()) ?? "?"
                    }), /* @__PURE__ */ jsxs("div", {
                      children: [/* @__PURE__ */ jsx("p", {
                        className: "font-medium text-gray-900",
                        children: name
                      }), /* @__PURE__ */ jsx("p", {
                        className: "text-gray-400 text-xs",
                        children: member.user.email
                      })]
                    })]
                  })
                }), /* @__PURE__ */ jsx("td", {
                  className: "px-6 py-4 text-gray-500 text-sm",
                  children: member.user.phone ?? "—"
                }), /* @__PURE__ */ jsx("td", {
                  className: "px-6 py-4",
                  children: /* @__PURE__ */ jsx("span", {
                    className: `px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${TYPE_BADGE$1[member.membershipType]}`,
                    children: member.membershipType
                  })
                }), /* @__PURE__ */ jsx("td", {
                  className: "px-6 py-4 text-gray-500 text-sm",
                  children: new Date(member.membershipEnd).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })
                }), /* @__PURE__ */ jsx("td", {
                  className: "px-6 py-4",
                  children: /* @__PURE__ */ jsx("span", {
                    className: `px-2.5 py-1 rounded-full text-xs font-semibold ${expired ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`,
                    children: expired ? "Expired" : "Active"
                  })
                }), /* @__PURE__ */ jsx("td", {
                  className: "px-6 py-4 text-right",
                  children: /* @__PURE__ */ jsxs(Form, {
                    method: "post",
                    onSubmit: (e) => {
                      if (!confirm(`Remove ${name}?`)) e.preventDefault();
                    },
                    children: [/* @__PURE__ */ jsx("input", {
                      type: "hidden",
                      name: "intent",
                      value: "delete"
                    }), /* @__PURE__ */ jsx("input", {
                      type: "hidden",
                      name: "id",
                      value: member._id
                    }), /* @__PURE__ */ jsx("button", {
                      type: "submit",
                      className: "text-xs text-gray-400 hover:text-red-600 transition font-medium",
                      children: "Remove"
                    })]
                  })
                })]
              }, member._id);
            })
          })]
        })
      })]
    })]
  });
});
function isExpired(dateStr) {
  return new Date(dateStr) < /* @__PURE__ */ new Date();
}
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: _app_members,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
async function loader$2({
  request
}) {
  const {
    requireSession
  } = await import("./assets/session.server-DqS0IdcJ.js");
  await requireSession(request);
  return {
    staff: []
  };
}
const _app_staff = UNSAFE_withComponentProps(function Staff({
  loaderData
}) {
  const {
    staff
  } = loaderData;
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-full",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "bg-white border-b border-gray-100 px-8 py-5",
      children: [/* @__PURE__ */ jsx("h1", {
        className: "text-xl font-bold text-gray-900",
        children: "Staff"
      }), /* @__PURE__ */ jsx("p", {
        className: "text-sm text-gray-400 mt-0.5",
        children: "Manage your gym staff and trainers."
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "p-8",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm flex items-center gap-2",
        children: [/* @__PURE__ */ jsx("svg", {
          className: "w-4 h-4 flex-shrink-0",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /* @__PURE__ */ jsx("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          })
        }), "Staff management is coming soon. The backend endpoint is under development."]
      }), /* @__PURE__ */ jsx("div", {
        className: "grid grid-cols-3 gap-4 mb-8",
        children: [{
          label: "Trainers",
          count: 0,
          color: "bg-blue-50 text-blue-600"
        }, {
          label: "Managers",
          count: 0,
          color: "bg-purple-50 text-purple-600"
        }, {
          label: "Receptionists",
          count: 0,
          color: "bg-emerald-50 text-emerald-600"
        }].map((r) => /* @__PURE__ */ jsxs("div", {
          className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-5",
          children: [/* @__PURE__ */ jsx("p", {
            className: `text-2xl font-bold ${r.color.split(" ")[1]}`,
            children: r.count
          }), /* @__PURE__ */ jsx("p", {
            className: "text-sm text-gray-500 mt-0.5",
            children: r.label
          })]
        }, r.label))
      }), /* @__PURE__ */ jsx("div", {
        className: "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden",
        children: staff.length === 0 ? /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col items-center justify-center py-20 text-gray-400",
          children: [/* @__PURE__ */ jsx("svg", {
            className: "w-14 h-14 mb-4 opacity-25",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            children: /* @__PURE__ */ jsx("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 1,
              d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            })
          }), /* @__PURE__ */ jsx("p", {
            className: "font-medium",
            children: "No staff added yet"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-sm mt-1",
            children: "Add trainers, managers and receptionists."
          })]
        }) : /* @__PURE__ */ jsxs("table", {
          className: "w-full text-sm",
          children: [/* @__PURE__ */ jsx("thead", {
            children: /* @__PURE__ */ jsxs("tr", {
              className: "border-b border-gray-100 bg-gray-50",
              children: [/* @__PURE__ */ jsx("th", {
                className: "text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide",
                children: "Name"
              }), /* @__PURE__ */ jsx("th", {
                className: "text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide",
                children: "Email"
              }), /* @__PURE__ */ jsx("th", {
                className: "text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide",
                children: "Phone"
              }), /* @__PURE__ */ jsx("th", {
                className: "text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide",
                children: "Role"
              }), /* @__PURE__ */ jsx("th", {
                className: "text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide",
                children: "Status"
              })]
            })
          }), /* @__PURE__ */ jsx("tbody", {
            className: "divide-y divide-gray-50",
            children: staff.map((s) => {
              var _a;
              return /* @__PURE__ */ jsxs("tr", {
                className: "hover:bg-gray-50",
                children: [/* @__PURE__ */ jsx("td", {
                  className: "px-6 py-4",
                  children: /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center gap-3",
                    children: [/* @__PURE__ */ jsx("div", {
                      className: "w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-xs font-bold",
                      children: (_a = s.firstName[0]) == null ? void 0 : _a.toUpperCase()
                    }), /* @__PURE__ */ jsxs("span", {
                      className: "font-medium text-gray-900",
                      children: [s.firstName, " ", s.lastName]
                    })]
                  })
                }), /* @__PURE__ */ jsx("td", {
                  className: "px-6 py-4 text-gray-500",
                  children: s.email
                }), /* @__PURE__ */ jsx("td", {
                  className: "px-6 py-4 text-gray-500",
                  children: s.phone ?? "—"
                }), /* @__PURE__ */ jsx("td", {
                  className: "px-6 py-4",
                  children: /* @__PURE__ */ jsx("span", {
                    className: "px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold capitalize",
                    children: s.role
                  })
                }), /* @__PURE__ */ jsx("td", {
                  className: "px-6 py-4",
                  children: /* @__PURE__ */ jsx("span", {
                    className: `px-2.5 py-1 rounded-full text-xs font-semibold ${s.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`,
                    children: s.isActive ? "Active" : "Inactive"
                  })
                })]
              }, s._id);
            })
          })]
        })
      })]
    })]
  });
});
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _app_staff,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
async function loader$1({
  request
}) {
  const {
    requireSession
  } = await import("./assets/session.server-DqS0IdcJ.js");
  const {
    api
  } = await import("./assets/api.server-CoNHom2L.js");
  const session = await requireSession(request);
  const token = session.get("token");
  const result = await api.get("/api/plans", token);
  return {
    plans: result.data ?? []
  };
}
async function action({
  request
}) {
  const {
    requireSession
  } = await import("./assets/session.server-DqS0IdcJ.js");
  const {
    api
  } = await import("./assets/api.server-CoNHom2L.js");
  const session = await requireSession(request);
  const token = session.get("token");
  const form = await request.formData();
  const intent = form.get("intent");
  if (intent === "create") {
    const result = await api.post("/api/plans", {
      name: form.get("name"),
      type: form.get("type"),
      durationDays: Number(form.get("durationDays")),
      price: Number(form.get("price")),
      features: form.get("features").split(",").map((f) => f.trim()).filter(Boolean)
    }, token);
    return {
      error: result.success ? null : result.message
    };
  }
  if (intent === "delete") {
    const id = form.get("id");
    const result = await api.delete(`/api/plans/${id}`, token);
    return {
      error: result.success ? null : result.message
    };
  }
  return null;
}
const TYPE_STYLE = {
  premium: "border-amber-200 bg-amber-50",
  standard: "border-blue-200 bg-blue-50",
  basic: "border-gray-200 bg-white"
};
const TYPE_BADGE = {
  premium: "bg-amber-100 text-amber-700",
  standard: "bg-blue-100 text-blue-700",
  basic: "bg-gray-100 text-gray-600"
};
const _app_plans = UNSAFE_withComponentProps(function Plans({
  loaderData,
  actionData
}) {
  const {
    plans
  } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-full",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "bg-white border-b border-gray-100 px-8 py-5",
      children: [/* @__PURE__ */ jsx("h1", {
        className: "text-xl font-bold text-gray-900",
        children: "Plans"
      }), /* @__PURE__ */ jsx("p", {
        className: "text-sm text-gray-400 mt-0.5",
        children: "Manage membership plans for your gym."
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "p-8",
      children: [(actionData == null ? void 0 : actionData.error) && /* @__PURE__ */ jsx("div", {
        className: "mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm",
        children: actionData.error
      }), /* @__PURE__ */ jsx("div", {
        className: "grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10",
        children: plans.length === 0 ? /* @__PURE__ */ jsxs("div", {
          className: "lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-gray-400",
          children: [/* @__PURE__ */ jsx("svg", {
            className: "w-14 h-14 mb-4 opacity-25",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            children: /* @__PURE__ */ jsx("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 1,
              d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            })
          }), /* @__PURE__ */ jsx("p", {
            className: "font-medium",
            children: "No plans yet"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-sm mt-1",
            children: "Create your first membership plan below."
          })]
        }) : plans.map((plan) => /* @__PURE__ */ jsxs("div", {
          className: `rounded-2xl border-2 p-6 ${TYPE_STYLE[plan.type]}`,
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex items-start justify-between mb-4",
            children: [/* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("span", {
                className: `px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${TYPE_BADGE[plan.type]}`,
                children: plan.type
              }), /* @__PURE__ */ jsx("h3", {
                className: "text-lg font-bold text-gray-900 mt-2",
                children: plan.name
              })]
            }), /* @__PURE__ */ jsxs("p", {
              className: "text-2xl font-bold text-gray-900",
              children: ["₹", plan.price.toLocaleString("en-IN")]
            })]
          }), /* @__PURE__ */ jsxs("p", {
            className: "text-sm text-gray-500 mb-3",
            children: [plan.durationDays, " days"]
          }), plan.features.length > 0 && /* @__PURE__ */ jsx("ul", {
            className: "space-y-1 mb-4",
            children: plan.features.map((f) => /* @__PURE__ */ jsxs("li", {
              className: "flex items-center gap-2 text-sm text-gray-600",
              children: [/* @__PURE__ */ jsx("svg", {
                className: "w-4 h-4 text-emerald-500 flex-shrink-0",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                children: /* @__PURE__ */ jsx("path", {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M5 13l4 4L19 7"
                })
              }), f]
            }, f))
          }), /* @__PURE__ */ jsxs(Form, {
            method: "post",
            onSubmit: (e) => {
              if (!confirm(`Deactivate "${plan.name}"?`)) e.preventDefault();
            },
            children: [/* @__PURE__ */ jsx("input", {
              type: "hidden",
              name: "intent",
              value: "delete"
            }), /* @__PURE__ */ jsx("input", {
              type: "hidden",
              name: "id",
              value: plan._id
            }), /* @__PURE__ */ jsx("button", {
              type: "submit",
              className: "text-xs text-gray-400 hover:text-red-600 transition font-medium mt-1",
              children: "Deactivate"
            })]
          })]
        }, plan._id))
      }), /* @__PURE__ */ jsxs("div", {
        className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-6",
        children: [/* @__PURE__ */ jsx("h2", {
          className: "text-base font-semibold text-gray-900 mb-5",
          children: "Create new plan"
        }), /* @__PURE__ */ jsxs(Form, {
          method: "post",
          className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
          children: [/* @__PURE__ */ jsx("input", {
            type: "hidden",
            name: "intent",
            value: "create"
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              className: "block text-sm font-medium text-gray-700 mb-1.5",
              children: "Plan name"
            }), /* @__PURE__ */ jsx("input", {
              name: "name",
              required: true,
              type: "text",
              placeholder: "e.g. Monthly Basic",
              className: "w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              className: "block text-sm font-medium text-gray-700 mb-1.5",
              children: "Type"
            }), /* @__PURE__ */ jsxs("select", {
              name: "type",
              required: true,
              className: "w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white",
              children: [/* @__PURE__ */ jsx("option", {
                value: "basic",
                children: "Basic"
              }), /* @__PURE__ */ jsx("option", {
                value: "standard",
                children: "Standard"
              }), /* @__PURE__ */ jsx("option", {
                value: "premium",
                children: "Premium"
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              className: "block text-sm font-medium text-gray-700 mb-1.5",
              children: "Duration (days)"
            }), /* @__PURE__ */ jsx("input", {
              name: "durationDays",
              required: true,
              type: "number",
              min: "1",
              placeholder: "30",
              className: "w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              className: "block text-sm font-medium text-gray-700 mb-1.5",
              children: "Price (₹)"
            }), /* @__PURE__ */ jsx("input", {
              name: "price",
              required: true,
              type: "number",
              min: "0",
              placeholder: "999",
              className: "w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "sm:col-span-2",
            children: [/* @__PURE__ */ jsxs("label", {
              className: "block text-sm font-medium text-gray-700 mb-1.5",
              children: ["Features ", /* @__PURE__ */ jsx("span", {
                className: "text-gray-400 font-normal",
                children: "(comma-separated)"
              })]
            }), /* @__PURE__ */ jsx("input", {
              name: "features",
              type: "text",
              placeholder: "Unlimited classes, Locker room, Personal trainer",
              className: "w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "sm:col-span-2",
            children: /* @__PURE__ */ jsx("button", {
              type: "submit",
              disabled: isSubmitting,
              className: "px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              children: isSubmitting ? "Creating…" : "Create plan"
            })
          })]
        })]
      })]
    })]
  });
});
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: _app_plans,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
async function loader({
  request
}) {
  const {
    requireSession
  } = await import("./assets/session.server-DqS0IdcJ.js");
  await requireSession(request);
  return {
    payments: [],
    summary: {
      totalCollected: 0,
      pending: 0,
      overdue: 0
    }
  };
}
const STATUS_STYLE = {
  paid: "bg-emerald-50 text-emerald-600",
  pending: "bg-amber-50 text-amber-600",
  overdue: "bg-red-50 text-red-600"
};
const _app_payments = UNSAFE_withComponentProps(function Payments({
  loaderData
}) {
  const {
    payments,
    summary
  } = loaderData;
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-full",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "bg-white border-b border-gray-100 px-8 py-5",
      children: [/* @__PURE__ */ jsx("h1", {
        className: "text-xl font-bold text-gray-900",
        children: "Payments"
      }), /* @__PURE__ */ jsx("p", {
        className: "text-sm text-gray-400 mt-0.5",
        children: "Track membership payments and dues."
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "p-8",
      children: [/* @__PURE__ */ jsx("div", {
        className: "grid grid-cols-3 gap-4 mb-8",
        children: [{
          label: "Collected this month",
          value: `₹${summary.totalCollected.toLocaleString("en-IN")}`,
          icon: /* @__PURE__ */ jsx("svg", {
            className: "w-5 h-5",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            children: /* @__PURE__ */ jsx("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 1.5,
              d: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            })
          }),
          color: "bg-emerald-50 text-emerald-600"
        }, {
          label: "Pending",
          value: `₹${summary.pending.toLocaleString("en-IN")}`,
          icon: /* @__PURE__ */ jsx("svg", {
            className: "w-5 h-5",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            children: /* @__PURE__ */ jsx("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 1.5,
              d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            })
          }),
          color: "bg-amber-50 text-amber-600"
        }, {
          label: "Overdue",
          value: `₹${summary.overdue.toLocaleString("en-IN")}`,
          icon: /* @__PURE__ */ jsx("svg", {
            className: "w-5 h-5",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            children: /* @__PURE__ */ jsx("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 1.5,
              d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            })
          }),
          color: "bg-red-50 text-red-600"
        }].map((card) => /* @__PURE__ */ jsxs("div", {
          className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-5",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex items-center justify-between mb-3",
            children: [/* @__PURE__ */ jsx("p", {
              className: "text-sm text-gray-500",
              children: card.label
            }), /* @__PURE__ */ jsx("div", {
              className: `w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`,
              children: card.icon
            })]
          }), /* @__PURE__ */ jsx("p", {
            className: "text-2xl font-bold text-gray-900",
            children: card.value
          })]
        }, card.label))
      }), /* @__PURE__ */ jsxs("div", {
        className: "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden",
        children: [/* @__PURE__ */ jsx("div", {
          className: "px-6 py-4 border-b border-gray-100 flex items-center justify-between",
          children: /* @__PURE__ */ jsx("h2", {
            className: "text-base font-semibold text-gray-900",
            children: "Transaction history"
          })
        }), payments.length === 0 ? /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col items-center justify-center py-20 text-gray-400",
          children: [/* @__PURE__ */ jsx("svg", {
            className: "w-14 h-14 mb-4 opacity-25",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            children: /* @__PURE__ */ jsx("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 1,
              d: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            })
          }), /* @__PURE__ */ jsx("p", {
            className: "font-medium",
            children: "No payments recorded"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-sm mt-1",
            children: "Payments will appear here once members are added."
          })]
        }) : /* @__PURE__ */ jsxs("table", {
          className: "w-full text-sm",
          children: [/* @__PURE__ */ jsx("thead", {
            children: /* @__PURE__ */ jsxs("tr", {
              className: "border-b border-gray-100 bg-gray-50",
              children: [/* @__PURE__ */ jsx("th", {
                className: "text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide",
                children: "Member"
              }), /* @__PURE__ */ jsx("th", {
                className: "text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide",
                children: "Plan"
              }), /* @__PURE__ */ jsx("th", {
                className: "text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide",
                children: "Amount"
              }), /* @__PURE__ */ jsx("th", {
                className: "text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide",
                children: "Date"
              }), /* @__PURE__ */ jsx("th", {
                className: "text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide",
                children: "Status"
              })]
            })
          }), /* @__PURE__ */ jsx("tbody", {
            className: "divide-y divide-gray-50",
            children: payments.map((p) => /* @__PURE__ */ jsxs("tr", {
              className: "hover:bg-gray-50 transition-colors",
              children: [/* @__PURE__ */ jsxs("td", {
                className: "px-6 py-4",
                children: [/* @__PURE__ */ jsx("p", {
                  className: "font-medium text-gray-900",
                  children: p.member.name
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-gray-400 text-xs",
                  children: p.member.email
                })]
              }), /* @__PURE__ */ jsx("td", {
                className: "px-6 py-4 text-gray-500",
                children: p.plan.name
              }), /* @__PURE__ */ jsxs("td", {
                className: "px-6 py-4 font-semibold text-gray-900",
                children: ["₹", p.amount.toLocaleString("en-IN")]
              }), /* @__PURE__ */ jsx("td", {
                className: "px-6 py-4 text-gray-500",
                children: new Date(p.date).toLocaleDateString("en-IN")
              }), /* @__PURE__ */ jsx("td", {
                className: "px-6 py-4",
                children: /* @__PURE__ */ jsx("span", {
                  className: `px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[p.status]}`,
                  children: p.status
                })
              })]
            }, p._id))
          })]
        })]
      })]
    })]
  });
});
const route11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _app_payments,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-bNIrH7sc.js", "imports": ["/assets/chunk-QFMPRPBF-CYRDN3J4.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": true, "module": "/assets/root-Cjf4hnpA.js", "imports": ["/assets/chunk-QFMPRPBF-CYRDN3J4.js"], "css": ["/assets/root-BYqAUSYH.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_auth": { "id": "routes/_auth", "parentId": "root", "path": void 0, "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/_auth-DtABNya8.js", "imports": ["/assets/chunk-QFMPRPBF-CYRDN3J4.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_auth.signup": { "id": "routes/_auth.signup", "parentId": "routes/_auth", "path": "signup", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/_auth.signup-B51Ol8Zg.js", "imports": ["/assets/chunk-QFMPRPBF-CYRDN3J4.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_auth.login": { "id": "routes/_auth.login", "parentId": "routes/_auth", "path": "login", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/_auth.login-Ct0Cuprh.js", "imports": ["/assets/chunk-QFMPRPBF-CYRDN3J4.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_auth.verify": { "id": "routes/_auth.verify", "parentId": "routes/_auth", "path": "verify", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/_auth.verify-DiYed5aU.js", "imports": ["/assets/chunk-QFMPRPBF-CYRDN3J4.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_auth.onboarding": { "id": "routes/_auth.onboarding", "parentId": "routes/_auth", "path": "onboarding", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/_auth.onboarding-DXup9dwz.js", "imports": ["/assets/chunk-QFMPRPBF-CYRDN3J4.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_app": { "id": "routes/_app", "parentId": "root", "path": void 0, "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/_app-BhoXYoAc.js", "imports": ["/assets/chunk-QFMPRPBF-CYRDN3J4.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_app._index": { "id": "routes/_app._index", "parentId": "routes/_app", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/_app._index-CZyeJvlR.js", "imports": ["/assets/chunk-QFMPRPBF-CYRDN3J4.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_app.members": { "id": "routes/_app.members", "parentId": "routes/_app", "path": "members", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/_app.members-CJsmgsCX.js", "imports": ["/assets/chunk-QFMPRPBF-CYRDN3J4.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_app.staff": { "id": "routes/_app.staff", "parentId": "routes/_app", "path": "staff", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/_app.staff-BJKCU2yr.js", "imports": ["/assets/chunk-QFMPRPBF-CYRDN3J4.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_app.plans": { "id": "routes/_app.plans", "parentId": "routes/_app", "path": "plans", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/_app.plans-fhViiXQZ.js", "imports": ["/assets/chunk-QFMPRPBF-CYRDN3J4.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_app.payments": { "id": "routes/_app.payments", "parentId": "routes/_app", "path": "payments", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/_app.payments-Ciu7ZoVp.js", "imports": ["/assets/chunk-QFMPRPBF-CYRDN3J4.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-bc7d8589.js", "version": "bc7d8589", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_passThroughRequests": false, "unstable_subResourceIntegrity": false, "unstable_trailingSlashAwareDataRequests": false, "unstable_previewServerPrerendering": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/_auth": {
    id: "routes/_auth",
    parentId: "root",
    path: void 0,
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/_auth.signup": {
    id: "routes/_auth.signup",
    parentId: "routes/_auth",
    path: "signup",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/_auth.login": {
    id: "routes/_auth.login",
    parentId: "routes/_auth",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/_auth.verify": {
    id: "routes/_auth.verify",
    parentId: "routes/_auth",
    path: "verify",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/_auth.onboarding": {
    id: "routes/_auth.onboarding",
    parentId: "routes/_auth",
    path: "onboarding",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/_app": {
    id: "routes/_app",
    parentId: "root",
    path: void 0,
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/_app._index": {
    id: "routes/_app._index",
    parentId: "routes/_app",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route7
  },
  "routes/_app.members": {
    id: "routes/_app.members",
    parentId: "routes/_app",
    path: "members",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "routes/_app.staff": {
    id: "routes/_app.staff",
    parentId: "routes/_app",
    path: "staff",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  },
  "routes/_app.plans": {
    id: "routes/_app.plans",
    parentId: "routes/_app",
    path: "plans",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  },
  "routes/_app.payments": {
    id: "routes/_app.payments",
    parentId: "routes/_app",
    path: "payments",
    index: void 0,
    caseSensitive: void 0,
    module: route11
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
