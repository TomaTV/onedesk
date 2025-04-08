"use client";
import React from "react";
import SidebarCore from "./SidebarCore";

const Sidebar = ({ activeWorkspaceId, activeChannelId }) => {
  return (
    <SidebarCore
      activeWorkspaceId={activeWorkspaceId}
      activeChannelId={activeChannelId}
    />
  );
};

export default Sidebar;
