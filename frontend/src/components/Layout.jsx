import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import { useSiteContent } from "../hooks/useSiteContent";

const Layout = () => {
  const { t } = useSiteContent("global");
  const year = new Date().getFullYear();
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const target = document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash, location.pathname]);

  return (
    <div className="min-h-screen flex flex-col text-[#0f1a0f]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-white/40 bg-gradient-to-b from-white/70 to-white/90 backdrop-blur-lg">
        <div className="px-4 py-8">
          <div className="max-w-6xl ml-auto">
            <div className="grid gap-6 md:grid-cols-[auto_1fr] items-start">
              <div className="flex flex-col items-start gap-3">
                <img
                  src="/SDVOSB-logo.png"
                  alt={t("footer.sdvLogoAlt")}
                  className="h-14 w-auto"
                  loading="lazy"
                />
                <p className="text-xs uppercase tracking-[0.18em] text-gray-600">{t("footer.sdvLabel")}</p>
              </div>

              <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
                <p className="font-semibold text-[#0f1a0f]">{t("footer.companyName")}</p>
                <p>{t("footer.line1")}</p>
                <p>{t("footer.line2")}</p>
                <p>{t("footer.line3")}</p>
                <p>
                  <a
                    href="https://thesystemsthinkerdwc.substack.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#0f1a0f] hover:text-[#2fb3d5]"
                  >
                    {t("footer.systemsThinkerLabel")}
                  </a>
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200/70 grid gap-2 md:grid-cols-[auto_1fr] text-xs text-gray-600">
              <div className="hidden md:block" />
              <p>
                (c) {year} {t("footer.copyrightSuffix")}
              </p>
              <p className="md:text-right">
                <Link to="/contact" className="hover:text-[#2fb3d5]">{t("footer.contactLabel")}</Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
