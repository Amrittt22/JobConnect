import LoginForm from "../components/auth/LoginForm";

function Login() {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <a
            href="/"
            className="text-2xl font-bold text-indigo-600"
          >
            JobConnect
          </a>

          {/* Register */}
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:block">
              Don't have an account?
            </span>

            <a
              href="/register"
              className="rounded-lg border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
            >
              Register
            </a>
          </div>
        </div>
      </header>

      {/* Login Section */}
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome Back
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Login to your JobConnect account
              </p>
            </div>

            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;