import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase, hasSupabaseEnv } from "../lib/supabaseClient";

const AdminNav = () => {
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const base =
    "px-4 py-2 text-sm font-semibold rounded-md border border-transparent transition";

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      if (hasSupabaseEnv && supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Logout failed:", error);
        }
      }
    } finally {
      setSigningOut(false);
      navigate("/login");
    }
  };

  return (
    <div className="flex gap-3 flex-wrap items-center">
      <NavLink
        to="/admin/posts"
        className={({ isActive }) =>
          `${base} ${isActive ? "bg-[#0f1a0f] text-white" : "bg-white border-gray-300 text-[#0f1a0f] hover:border-black"}`
        }
      >
        Manage Blog Posts
      </NavLink>
      <NavLink
        to="/admin/pages"
        className={({ isActive }) =>
          `${base} ${isActive ? "bg-[#0f1a0f] text-white" : "bg-white border-gray-300 text-[#0f1a0f] hover:border-black"}`
        }
      >
        Manage Page Content
      </NavLink>
      <button
        type="button"
        onClick={handleLogout}
        disabled={signingOut}
        className={`${base} bg-white border-gray-300 text-red-700 hover:border-red-700 hover:bg-red-50 disabled:opacity-60`}
      >
        {signingOut ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
};

export default AdminNav;
