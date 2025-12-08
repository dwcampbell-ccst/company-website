import { NavLink } from "react-router-dom";

const AdminNav = () => {
  const base =
    "px-4 py-2 text-sm font-semibold rounded-md border border-transparent transition";
  return (
    <div className="flex gap-3 flex-wrap">
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
    </div>
  );
};

export default AdminNav;
