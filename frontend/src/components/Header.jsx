import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useSiteContent } from "../hooks/useSiteContent";

const navItems = [
  { to: "/", key: "header.nav.home" },
  { to: "/services", key: "header.nav.services" },
  { to: "/articles", key: "header.nav.articles" },
  { to: "/about", key: "header.nav.about" },
  { to: "/contact", key: "header.nav.contact" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useSiteContent("global");

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
            alt={t("header.logoAlt")}
            className="h-16 w-auto mb-1 border-0 shadow-none"
          />
          <span className="text-xs tracking-[0.24em] uppercase text-[#0f1a0f]">
            {t("header.taglineLine1")}
          </span>
          <span className="text-xs tracking-[0.24em] uppercase text-[#0f1a0f]">
            {t("header.taglineLine2")}
          </span>
        </div>

        <nav className="hidden md:flex gap-6 text-sm font-semibold items-center">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {t(item.key)}
            </NavLink>
          ))}
          <Link
            to="/contact#form"
            className="inline-flex items-center gap-2 rounded-full bg-[#2fb3d5] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2295b2] transition"
          >
            {t("header.navCtaLabel")}
          </Link>
        </nav>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-md border border-black/30 px-3 py-2 text-sm font-semibold shadow-sm bg-white/70 hover:bg-white"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? t("header.mobile.closeLabel") : t("header.mobile.openLabel")}
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
                {t(item.key)}
              </NavLink>
            ))}
            <Link
              to="/contact#form"
              className="inline-flex items-center justify-center rounded-full bg-[#2fb3d5] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2295b2] transition text-center"
              onClick={closeMenu}
            >
              {t("header.navCtaLabel")}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Header;
