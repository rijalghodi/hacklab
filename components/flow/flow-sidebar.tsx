import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "../ui/sidebar";

type Props = {};

export function FlowSidebar({}: Props) {
  return (
    <Sidebar className="w-96">
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Inputs & Output</SidebarGroupLabel>
          <SidebarGroupContent>Hello World</SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Built-in Chips</SidebarGroupLabel>
          <SidebarGroupContent>Hello World</SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Saved Chips</SidebarGroupLabel>
          <SidebarGroupContent>Hello World</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
