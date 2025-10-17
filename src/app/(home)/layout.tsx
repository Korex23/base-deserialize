import React from "react";
import Tabs, { TabItem } from "@/components/tabs/Tabs";

const tabItems: TabItem[] = [
  { label: "Swap", href: "/" },
  { label: "Limit-Order", href: "/limit-order" },
  // { label: "DCA", href: "#", status: "inactive" },
];

export default function HomeTabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="pt-8">
      {/* <Tabs items={tabItems}> */}
      {children}
      {/* </Tabs> */}
    </main>
  );
}
