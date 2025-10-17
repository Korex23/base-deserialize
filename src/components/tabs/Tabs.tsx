"use client";

import React, { ReactNode } from "react";
import TabList from "./TabList";

export interface TabItem {
  label: string;
  href: string;
  status?: "active" | "inactive";
}

interface TabsProps {
  items: TabItem[];
  children: ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ items, children }) => {
  return (
    <div className="w-full">
      <TabList tabs={items} />
      <div className="mt-4">{children}</div>
    </div>
  );
};

export default Tabs;
