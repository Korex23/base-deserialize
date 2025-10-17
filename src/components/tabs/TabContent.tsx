import React from "react";

interface TabPanelProps {
  children: React.ReactNode;
}

const TabContent: React.FC<TabPanelProps> = ({ children }) => {
  return <div className="text-sm text-white">{children}</div>;
};

export default TabContent;
