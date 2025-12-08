import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, hasSupabaseEnv } from "../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already authenticated, go straight to admin.
  useEffect(() => {
    if (!hasSupabaseEnv || !supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/admin");
    });
  }, [navigate, hasSupabaseEnv]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasSupabaseEnv || !supabase) {
      setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Make sure the profile exists with an admin role so the guard lets you in.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .single();

      if (!profile) {
        await supabase.from("profiles").upsert({
          id: user.id,
          full_name: user.email || "",
          role: "admin",
        });
      }
    }

    navigate("/admin");
  };

  return (
    <section className="max-w-md mx-auto px-4 py-12">
      <div className="glass-panel p-6 md:p-8 space-y-6 fade-in">
        <div className="space-y-2">
          <p className="pill bg-white px-3 py-1 text-xs uppercase tracking-[0.18em] text-gray-700 w-fit">
            Admin
          </p>
          <h1 className="text-2xl font-bold text-[#0f1a0f]">Admin Login</h1>
          <p className="text-sm text-gray-700">
            Sign in with the admin account configured in Supabase.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2fb3d5]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2fb3d5]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0f1a0f] text-white py-2 rounded-md font-semibold hover:bg-black transition disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </section>
  );
}
