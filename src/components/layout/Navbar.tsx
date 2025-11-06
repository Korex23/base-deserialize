"use client";
import React, { useEffect, useState } from "react";
import Logo from "@/components/general/Logo";
import mixpanel from "@/lib/mixpanel";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MaxWidth from "@/components/general/MaxWidth";
import { NavLinks, MobileNavLinks } from "@/data/navlinks";
// import { Button } from "../ui/button";
// import { useTheme } from "next-themes";
import Footer from "../Footer";
import SwitchDeserialize from "../general/SwitchDeserialize";
import CustomButton from "./CustomButton";

const Navbar = () => {
  // const { setTheme, theme } = useTheme();
  const pathName = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showBottomNav, setShowBottomNav] = useState(true);

  // HDR: PREVENT SCROLL WHEN OPEN OR VISIBLE
  useEffect(() => {
    if (showMobileMenu) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [showMobileMenu]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        setShowBottomNav(false); // Scrolling down
      } else {
        setShowBottomNav(true); // Scrolling up
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // HDR:CLOSE DROPDOWN AND MENU
  const closeMenu = () => {
    setShowMobileMenu(false);
  };
  const announcements = [
    {
      announcement: "Deserialize secret points? 👀",
      href: "https://points.deserialize.xyz",
    },
    {
      announcement: "🎉 Deserialize Eclipse Boost Is Live!",
      href: "https://tap.eclipse.xyz/",
    },
  ];

  return (
    <>
      <header className="bg-zinc-900 pb-3 fixed z-[20] w-full top-0">
        {/* <AnnouncementBanner announcements={announcements} /> */}

        <MaxWidth>
          <nav className="flex items-center lg:gap-x-8 md:gap-x-6 gap-x-4">
            <div className="hidden md:invisible visible">
              <button onClick={() => setShowMobileMenu(true)}>
                <Menu size={30} />
              </button>
            </div>

            <div
              className={cn(
                "flex items-center justify-between gap-x-5 gap-y-10  py-2 flex-1 md:justify-start"
              )}
            >
              {/* SUB: LOGO */}
              <div
                onClick={() => {
                  setShowMobileMenu(false);
                }}
              >
                <Logo />
              </div>
              {/* SUB: NAVLINKS */}
              <div
                className={cn(
                  "my-5 flex flex-col gap-x-2 gap-y-6 z-[300] md:my-0 md:flex-row md:items-center md:gap-x-4 fixed md:static bg-zinc-900 inset-0 -top-5 -left-[120%] transition-all duration-500 ease-in-out md:w-auto w-full h-screen md:h-fit pb-12 pt-14 md:pt-0 md:pb-0 md:py-0 md:px-0 px-6 ",
                  showMobileMenu && "left-0"
                )}
              >
                <div className="flex absolute right-4 top-6 md:invisible visible">
                  <button onClick={() => setShowMobileMenu(false)}>
                    <X size={25} />
                  </button>
                </div>
                {NavLinks.map(({ name, links, tag }) => {
                  const isActive = links.includes(pathName);
                  const isDisabled = tag === "Soon";

                  return (
                    <Link
                      href={isDisabled ? "#" : links[0] ?? "#"}
                      key={name}
                      aria-disabled={isDisabled}
                      onClick={(e) => {
                        if (isDisabled) {
                          e.preventDefault(); // Prevent navigation
                          return; // Skip analytics and closeMenu
                        }

                        closeMenu();

                        mixpanel.track("Navigation Link Clicked", {
                          name,
                          link: links[0] ?? "#",
                          pathname: window.location.pathname,
                        });

                        console.log({
                          name,
                          links,
                          tag: tag ?? null,
                          pathname: window.location.pathname,
                        });
                      }}
                      className={cn(
                        "flex items-center gap-1 md:text-[10px] lg:text-[16px] font-medium transition-all duration-300 ease-in-out hover:opacity-75 text-white",
                        isActive && "text-[#3FFF3D]",
                        isDisabled &&
                          "cursor-not-allowed opacity-50 hover:opacity-50"
                      )}
                    >
                      <span>{name}</span>
                      {tag && (
                        <span
                          className={cn(
                            "text-[6px] lg:text-[8px] px-1 py-0.5 rounded-md font-semibold uppercase tracking-wider text-white backdrop-blur-sm",
                            "border border-white/10 shadow-md animate-pulse flex items-center",
                            tag === "New" &&
                              "bg-[#10B981] drop-shadow-[0_0_3px_#10B981]",
                            tag === "Hot" &&
                              "bg-[#F97316] drop-shadow-[0_0_3px_#F97316]",
                            tag === "Beta" &&
                              "bg-amber-500 drop-shadow-[0_0_3px_#fbbf24]",
                            tag === "Soon" &&
                              "bg-[#6366F1] drop-shadow-[0_0_3px_#6366F1]"
                          )}
                        >
                          {tag}
                        </span>
                      )}
                    </Link>
                  );
                })}

                {/* <Button
                  className="p-1.5 md:hidden roundd-full w-fit"
                  variant="secondary"
                  onClick={() => {
                    setTheme((prev) => {
                      if (prev === "dark") {
                        return "light";
                      } else {
                        return "dark";
                      }
                    });
                  }}
                  aria-label="Switch theme"
                >
                  {theme === "dark" ? (
                    <Sun className="!size-5" />
                  ) : (
                    <Moon className="!size-5" />
                  )}
                </Button> */}
                <div className="w-full sm:hidden flex">
                  <Footer />
                </div>
              </div>

              {/* SUB: Search */}
              {/* <div className="md:ml-auto -order-1 md:order-none">Search</div> */}

              {/* SUB: SUB BUTTON */}
              <div className="flex items-center gap-2 md:ml-auto">
                {/* <Button
                  className="p-1.5 h-fit md:inline-block hidden"
                  variant="secondary"
                  onClick={() => {
                    setTheme((prev) => {
                      if (prev === "dark") {
                        return "light";
                      } else {
                        return "dark";
                      }
                    });
                  }}
                  aria-label="Switch theme"
                >
                  {theme === "dark" ? (
                    <Sun className="!size-5" />
                  ) : (
                    <Moon className="!size-5" />
                  )}
                </Button> */}
                {/* <PointsBadge /> */}
                <SwitchDeserialize />
                {/* <CustomConnectButton /> */}
                <CustomButton />
                {/* <ConnectButton /> */}
              </div>
            </div>
            <div
              className={cn(
                "fixed bottom-0 w-[100vw] overflow-hidden z-30 md:hidden bg-zinc-900 border-zinc-800 px-4 py-2 flex justify-between items-center translate-x-[-10px] transition-transform duration-300",
                showBottomNav ? "translate-y-0" : "translate-y-full"
              )}
            >
              {MobileNavLinks.map(({ name, links, icon: Icon, tag }) => {
                const isExternal = links[0].startsWith("http");
                const isActive = links.includes(pathName);
                const isDisabled = tag === "Soon";

                const tagClasses = cn(
                  "text-[4px] px-[2px] py-[1px] rounded-md font-semibold uppercase tracking-wider text-white backdrop-blur-sm",
                  "border border-white/10 shadow-md animate-pulse flex items-center",
                  tag === "New" && "bg-[#10B981] drop-shadow-[0_0_3px_#10B981]",
                  tag === "Hot" && "bg-[#F97316] drop-shadow-[0_0_3px_#F97316]",
                  tag === "Beta" &&
                    "bg-amber-500 drop-shadow-[0_0_3px_#fbbf24]",
                  tag === "Soon" && "bg-[#6366F1] drop-shadow-[0_0_3px_#6366F1]"
                );

                const sharedClassNames = cn(
                  "flex flex-col items-center text-white gap-1 text-xs font-medium hover:opacity-80 transition-all duration-300",
                  isActive && "text-[#85eeab]",
                  isDisabled && "cursor-not-allowed opacity-50 hover:opacity-50"
                );

                const handleClick = (e) => {
                  if (isDisabled) {
                    e.preventDefault();
                    return;
                  }
                };

                if (isExternal) {
                  return (
                    <a
                      href={isDisabled ? "#" : links[0]}
                      key={name}
                      aria-disabled={isDisabled}
                      target={isDisabled ? "_self" : "_blank"}
                      rel="noopener noreferrer"
                      onClick={handleClick}
                      className={sharedClassNames}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="flex items-center gap-1">
                        <span>{name}</span>
                        {tag && <span className={tagClasses}>{tag}</span>}
                      </div>
                    </a>
                  );
                }

                return (
                  <Link
                    href={isDisabled ? "#" : links[0]}
                    key={name}
                    aria-disabled={isDisabled}
                    onClick={handleClick}
                    className={sharedClassNames}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="flex items-center gap-1">
                      <span>{name}</span>
                      {tag && <span className={tagClasses}>{tag}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>
        </MaxWidth>
      </header>
    </>
  );
};

export default React.memo(Navbar);
