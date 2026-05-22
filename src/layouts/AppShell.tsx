import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import ModusNavbar from "../components/ModusNavbar";
import ModusLogo from "../components/ModusLogo";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "home", route: "/dashboard" },
  { label: "Job Hub", icon: "gears", route: "/job-hub" },
  { label: "Expenses", icon: "costs", route: "/expenses" },
  { label: "Job Billing", icon: "monetarization", route: "/job-billing" },
  { label: "Reports", icon: "bar_graph_line", route: "/reports" },
];

const PAYROLL_ITEM = {
  label: "Payroll",
  icon: "earnings_statement",
  route: "/payroll",
};

const PAYROLL_SUBITEMS = [
  { label: "Home", route: "/payroll" },
  { label: "Payroll setup", route: "/payroll/setup" },
  { label: "Employees", route: "/payroll/employees" },
  { label: "Timesheets", route: "/payroll/timesheets" },
  { label: "Tax Settings", route: "/payroll/tax-settings" },
  { label: "Documents", route: "/payroll/documents" },
  { label: "Labor Classes", route: "/payroll/labor-classes" },
];

const SETTINGS_ITEM = {
  label: "Settings",
  icon: "settings",
  route: "/settings",
};

const ONBOARDING_DEMO_ITEM = {
  label: "Onboarding Demo",
  icon: "play",
  route: "/onboarding",
};

const ONBOARDING_DEMO_V2_ITEM = {
  label: "Onboarding Demo V2",
  icon: "play",
  route: "/onboarding-v2",
};

const ONBOARDING_DEMO_V3_ITEM = {
  label: "Onboarding Demo V3",
  icon: "play",
  route: "/onboarding-v3",
};

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sideNavExpanded, setSideNavExpanded] = useState(false);
  const [payrollExpanded, setPayrollExpanded] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const userCard = useMemo(
    () => ({
      name: "User Name",
      email: "user@example.com",
      avatarSrc: "",
      avatarAlt: "User Avatar",
    }),
    []
  );

  const navVisibility = useMemo(
    () => ({ mainMenu: true, user: true }),
    []
  );

  const handleNavbarMenuOpenChange = useCallback((isOpen: boolean) => {
    setSideNavExpanded(isOpen);
  }, []);

  const handleLogoClick = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  const handleItemClick = useCallback(
    (route: string) => {
      navigate(route);
      setSideNavExpanded(false);
      setPayrollExpanded(false);
    },
    [navigate]
  );

  const togglePayroll = useCallback(() => {
    setPayrollExpanded((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!sideNavExpanded) return;

    const firstItem = sidebarRef.current?.querySelector<HTMLElement>(
      ".sidebar-nav-item"
    );
    firstItem?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSideNavExpanded(false);
        return;
      }

      if (e.key === "Tab" && sidebarRef.current) {
        const focusable = sidebarRef.current.querySelectorAll<HTMLElement>(
          '[tabindex="0"]'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sideNavExpanded]);

  useEffect(() => {
    if (location.pathname.startsWith("/payroll")) {
      setPayrollExpanded(true);
    } else {
      setPayrollExpanded(false);
    }
  }, [location.pathname]);

  const isActiveRoute = useCallback(
    (route: string) => {
      if (route === "/dashboard") {
        return (
          location.pathname === "/" ||
          location.pathname === "/dashboard" ||
          location.pathname.startsWith("/dashboard/")
        );
      }
      return (
        location.pathname === route ||
        location.pathname.startsWith(route + "/")
      );
    },
    [location.pathname]
  );

  const isExactPayrollSubRoute = useCallback(
    (route: string) => {
      if (route === "/payroll") {
        return location.pathname === "/payroll";
      }
      return location.pathname === route || location.pathname.startsWith(route + "/");
    },
    [location.pathname]
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="border-bottom-default app-navbar" role="banner">
        <ModusNavbar
          userCard={userCard}
          visibility={navVisibility}
          mainMenuOpen={sideNavExpanded}
          onMainMenuOpenChange={handleNavbarMenuOpenChange}
          startContent={
            <div
              onClick={handleLogoClick}
              className="cursor-pointer flex items-center"
            >
              <ModusLogo name="financials" />
            </div>
          }
        />
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div
          ref={sidebarRef}
          role="navigation"
          aria-label="Main navigation"
          aria-hidden={!sideNavExpanded}
          className={`sidebar-nav ${sideNavExpanded ? "sidebar-nav-expanded" : ""}`}
        >
          <div className="flex flex-col h-full">
            <div className="flex-1">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.route}
                  role="button"
                  tabIndex={sideNavExpanded ? 0 : -1}
                  className={`sidebar-nav-item ${isActiveRoute(item.route) ? "sidebar-nav-item-active" : ""}`}
                  onClick={() => handleItemClick(item.route)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleItemClick(item.route);
                    }
                  }}
                >
                  <i className="modus-icons sidebar-nav-icon">{item.icon}</i>
                  <div className="sidebar-nav-label">{item.label}</div>
                </div>
              ))}

              <div>
                <div
                  role="button"
                  tabIndex={sideNavExpanded ? 0 : -1}
                  className={`sidebar-nav-item ${isActiveRoute(PAYROLL_ITEM.route) ? "sidebar-nav-item-active" : ""}`}
                  onClick={togglePayroll}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      togglePayroll();
                    }
                  }}
                >
                  <i className="modus-icons sidebar-nav-icon">
                    {PAYROLL_ITEM.icon}
                  </i>
                  <div className="sidebar-nav-label flex-1">{PAYROLL_ITEM.label}</div>
                  <i className={`modus-icons sidebar-nav-chevron ${payrollExpanded ? "sidebar-nav-chevron-open" : ""}`}>
                    expand_more
                  </i>
                </div>

                {payrollExpanded && (
                  <div className="sidebar-nav-submenu">
                    {PAYROLL_SUBITEMS.map((sub) => (
                      <div
                        key={sub.route}
                        role="button"
                        tabIndex={sideNavExpanded ? 0 : -1}
                        className={`sidebar-nav-subitem ${isExactPayrollSubRoute(sub.route) ? "sidebar-nav-subitem-active" : ""}`}
                        onClick={() => handleItemClick(sub.route)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleItemClick(sub.route);
                          }
                        }}
                      >
                        <div className="sidebar-nav-label">{sub.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div
                role="button"
                tabIndex={sideNavExpanded ? 0 : -1}
                className={`sidebar-nav-item ${isActiveRoute(ONBOARDING_DEMO_ITEM.route) ? "sidebar-nav-item-active" : ""}`}
                onClick={() => handleItemClick(ONBOARDING_DEMO_ITEM.route)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleItemClick(ONBOARDING_DEMO_ITEM.route);
                  }
                }}
              >
                <i className="modus-icons sidebar-nav-icon">{ONBOARDING_DEMO_ITEM.icon}</i>
                <div className="sidebar-nav-label">{ONBOARDING_DEMO_ITEM.label}</div>
              </div>

              <div
                role="button"
                tabIndex={sideNavExpanded ? 0 : -1}
                className={`sidebar-nav-item ${isActiveRoute(ONBOARDING_DEMO_V2_ITEM.route) ? "sidebar-nav-item-active" : ""}`}
                onClick={() => handleItemClick(ONBOARDING_DEMO_V2_ITEM.route)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleItemClick(ONBOARDING_DEMO_V2_ITEM.route);
                  }
                }}
              >
                <i className="modus-icons sidebar-nav-icon">{ONBOARDING_DEMO_V2_ITEM.icon}</i>
                <div className="sidebar-nav-label">{ONBOARDING_DEMO_V2_ITEM.label}</div>
              </div>

              <div
                role="button"
                tabIndex={sideNavExpanded ? 0 : -1}
                className={`sidebar-nav-item ${isActiveRoute(ONBOARDING_DEMO_V3_ITEM.route) ? "sidebar-nav-item-active" : ""}`}
                onClick={() => handleItemClick(ONBOARDING_DEMO_V3_ITEM.route)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleItemClick(ONBOARDING_DEMO_V3_ITEM.route);
                  }
                }}
              >
                <i className="modus-icons sidebar-nav-icon">{ONBOARDING_DEMO_V3_ITEM.icon}</i>
                <div className="sidebar-nav-label">{ONBOARDING_DEMO_V3_ITEM.label}</div>
              </div>

              <div
                role="button"
                tabIndex={sideNavExpanded ? 0 : -1}
                className={`sidebar-nav-item ${isActiveRoute(SETTINGS_ITEM.route) ? "sidebar-nav-item-active" : ""}`}
                onClick={() => handleItemClick(SETTINGS_ITEM.route)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleItemClick(SETTINGS_ITEM.route);
                  }
                }}
              >
                <i className="modus-icons sidebar-nav-icon">
                  {SETTINGS_ITEM.icon}
                </i>
                <div className="sidebar-nav-label">{SETTINGS_ITEM.label}</div>
              </div>
            </div>
          </div>
        </div>

        <div id="main-content" role="main" className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
