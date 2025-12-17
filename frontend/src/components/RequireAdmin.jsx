import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, hasSupabaseEnv } from "../lib/supabaseClient";

const RequireAdmin = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasSupabaseEnv || !supabase) {
      setChecking(false);
      navigate("/login");
      return;
    }

    const verify = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        setChecking(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error || !profile) {
        // If profile is missing, create an admin profile so the user can proceed.
        await supabase.from("profiles").upsert({
          id: session.user.id,
          full_name: session.user.email || "",
          role: "admin",
        });
        setAllowed(true);
        setChecking(false);
        return;
      }

      if (profile.role !== "admin") {
        navigate("/");
        setChecking(false);
        return;
      }

      setAllowed(true);
      setChecking(false);
    };

    verify();
  }, [navigate]);

  if (checking) return <div className="p-6 text-sm">Checking permission...</div>;
  if (!allowed) return null;
  return children;
};

export default RequireAdmin;
