import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => (
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
                alt="Service-Disabled Veteran-Owned Small Business (SDVOSB)"
                className="h-14 w-auto"
                loading="lazy"
              />
              <p className="text-xs uppercase tracking-[0.18em] text-gray-600">SDVOSB</p>
            </div>

            <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
              <p className="font-semibold text-[#0f1a0f]">Campbell Consulting Services of Tallahassee LLC (CCST)</p>
              <p>Service-Disabled Veteran-Owned Small Business (SDVOSB) • Founded 2019</p>
              <p>Supporting Florida DOEA, NYS ITS, and commercial organizations</p>
              <p>Experienced in HIPAA, CMMC, and state-level compliance environment</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200/70 grid gap-2 md:grid-cols-[auto_1fr] text-xs text-gray-600">
            <div className="hidden md:block" />
            <p>(c) {new Date().getFullYear()} Campbell Consulting Services of Tallahassee LLC. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
);

export default Layout;
