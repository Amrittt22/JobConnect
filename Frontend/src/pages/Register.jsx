import RegisterForm from "../components/auth/RegisterForm";

function Register() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              J
            </div>

            <span className="text-xl font-bold tracking-tight text-slate-900">
              JobConnect
            </span>
          </a>

          <a
            href="/login"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
          >
            Already have an account?{" "}
            <span className="text-blue-600">Login</span>
          </a>

        </div>
      </nav>

      {/* Main */}
      <main className="relative flex min-h-[calc(100vh-73px)] items-center justify-center overflow-hidden px-6 py-12">
        
        {/* Background accents */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(203 213 225 / 0.4) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-200/40 blur-3xl" />

        <div className="w-full max-w-md">

          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Create your account
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Find your next role or your next hire — in one place.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/50">
            <RegisterForm />
          </div>

        </div>
      </main>
    </div>
  );
}

export default Register;