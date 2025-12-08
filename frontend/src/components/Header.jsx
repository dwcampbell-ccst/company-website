import { useState } from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/articles", label: "Articles" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact Us" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    [
      "transition-colors hover:text-[#2fb3d5]",
      isActive ? "text-[#2fb3d5]" : "text-[#0f1a0f]",
    ].join(" ");

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="border-b border-white/50 bg-white/80 backdrop-blur text-[#1d1d1d] sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex flex-col items-center text-center">
          <img
            src="/logo.png"
            alt="Company Logo"
            className="h-16 w-auto mb-1 border-0 shadow-none"
          />
          <span className="text-xs tracking-[0.24em] uppercase text-[#0f1a0f]">
            Business Analysis and Systems Engineering
          </span>
          <span className="text-xs tracking-[0.24em] uppercase text-[#0f1a0f]">
            Done Right
          </span>
        </div>

        <nav className="hidden md:flex gap-6 text-sm font-semibold items-center">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-md border border-black/30 px-3 py-2 text-sm font-semibold shadow-sm bg-white/70 hover:bg-white"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      {menuOpen ? (
        <div className="md:hidden border-t border-black/15 bg-white/85 backdrop-blur fade-in">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3 text-sm font-semibold">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                onClick={closeMenu}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Header;
