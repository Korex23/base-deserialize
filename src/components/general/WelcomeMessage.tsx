"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { BadgeIcon2 } from "./Icons";
import { FiX } from "react-icons/fi";

interface allDomains {
  nameAccount: string;
  domain: string;
}

const WelcomeMessage = () => {
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [allDomains, setAllDomains] = useState<allDomains[]>([]);
  const [user, setUser] = useState<string>("");

  const checkNewUser = async () => {
    try {
      const res = await fetch(
        `https://point-api.deserialize.xyz/api/check-wallet-address`
      );
      const response = await res.json();

      response.userAlldomain && setAllDomains(response.userAlldomain);
      console.log(response);

      console.log(allDomains);

      if (response.exists === true) {
        setIsNewUser(false);
        const randomNumber = Math.floor(Math.random() * 20);
        if (randomNumber % 6 === 0) {
          setShowModal(true);
        }
      } else {
        setIsNewUser(true);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Failed to check new user:", error);
    }
  };

  useEffect(() => {
    if (allDomains && allDomains.length > 0) {
      const domain = allDomains[0];
      const username = domain.domain.replace(/\.turbo$/, "");
      setUser(username);
      console.log(user);
    } else {
      setUser("");
    }
  }, [allDomains]);

  if (!showModal) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
        <div className="rounded-2xl shadow-lg w-[90%] max-w-lg">
          <div className="welcome p-4 max-w-[28rem] mx-auto border-[0.5px] border-[#97EF96] rounded-2xl shadow-md">
            <div className="relative">
              <button
                className="absolute top-2 right-4 text-gray-400 text-xl"
                onClick={() => {
                  setShowModal(false);
                }}
              >
                <FiX color="#75A46B" />
              </button>
              <div className="flex">
                <div className="w-[100px] h-[80px] rounded-br-2xl bg-transparent flex justify-center items-center relative">
                  <Image
                    src={"/images/logo2.png"}
                    alt="logo"
                    width={40}
                    height={30}
                  />
                  <div className="absolute top-[48px] border-b-8 border-r-8 border-[#1E511E] -right-[8px] w-[40px] h-[40px] bg-transparent rounded-br-3xl" />
                </div>
                <div className="h-[80px] w-full rounded-t-2xl bg-[#1E511E] flex flex-col items-center justify-center">
                  <p className="flex items-center">
                    <Image
                      src={"/images/logo3.png"}
                      alt="logo"
                      width={130}
                      height={20}
                    />
                  </p>
                  <p className="text-[#75A46B] text-[12px] capitalize">
                    Best dex aggregator on eclipse
                  </p>
                </div>
              </div>
              <div className="w-full rounded-tl-2xl rounded-br-2xl bg-[#1E511E] text-[12px] text-white capitalize">
                <div className="p-4 flex flex-col gap-3">
                  <p>Gsvm {user}</p>

                  {!isNewUser && showModal && (
                    <div className="flex flex-col gap-3">
                      <p>
                        Welcome back, it genuinely means a lot that you're here
                        again. You're seeing this message because we care about
                        your experience, & I want to know if we&apos;ve made
                        things smoother for you since your last visit.
                      </p>
                      <p>
                        Making your life easier has always been our mission. If
                        there's anything we can improve or do differently, just
                        say the word — I&apos;m always open to feedback
                      </p>
                      <p>
                        I don&apos;t want to build in isolation. I want
                        Deserialize to feel like something we&apos;re building
                        together. Maybe even as friends.
                      </p>
                      <p>
                        You can always reach out to me on X or hop into our
                        Discord. Let&apos;s keep building this community,
                        together
                      </p>
                    </div>
                  )}

                  {isNewUser && showModal && (
                    <div className="flex flex-col gap-3">
                      <p>
                        Thank you for checking out deserialize. You're seeing
                        this message because we genuinely care. I want to know
                        if we succeeded in making your trading experience
                        easier. That has been our goal with deserialize.
                      </p>
                      <p>
                        If there's any way I can make it better for you, just
                        let me know- I'll gladly do it. I dont want to build in
                        the dark, i want to solve your problems & make your life
                        easier, Maybe even become friends while we&apos;re at
                        it.
                      </p>
                      <p>
                        Feel free to reach me directly on X or join our Discord,
                        let's build our community together.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex">
                {/* Main background */}
                <div className="h-[80px] w-full rounded-b-2xl bg-[#1E511E] relative">
                  <p className="px-4 text-[12px] text-white">
                    Demitchy, CEO of Deserialize
                  </p>

                  <div className="px-4 flex gap-1 items-center absolute bottom-3">
                    <BadgeIcon2 />
                    <a href="https://x.com/demitchy_" target="blank">
                      <span className="text-[#75A46B] text-[12px]">
                        demitchy's twitter
                      </span>
                    </a>
                    <span className="text-white">|</span>
                    <a
                      href="https://discord.gg/mbN7FGmXdF"
                      target="blank"
                      className="text-[#75A46B] text-[12px]"
                    >
                      deserialize discord
                    </a>
                  </div>
                </div>

                {/* Logo area */}
                <div className="w-[100px] h-[80px] bg-transparent flex justify-center items-center relative">
                  <Image
                    src={"/images/logo2.png"}
                    alt="logo"
                    width={40}
                    height={35}
                  />
                  <div className="absolute bottom-[48px] border-t-8 border-l-8 border-[#1E511E] -left-[8px] w-[40px] h-[40px] bg-transparent rounded-tl-3xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomeMessage;
