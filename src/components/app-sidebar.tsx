"use client";

import {
  CircleUserRoundIcon,
  CommandIcon,
  LayoutDashboardIcon,
  ListIcon,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Organisation, User } from "@/generated/prisma/client";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Sites",
      url: "/sites",
      icon: ListIcon,
    },
    {
      title: "Admin",
      url: "/users",
      icon: CircleUserRoundIcon,
    },
  ],
};

interface Props {
  user: User & { organisation: Organisation };
}

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar> & Props) {
  const navItems = data.navMain.filter((item) => {
    if (item.title === "Admin") {
      return props.user.role === "admin";
    }
    return true;
  });

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">energyi</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={props.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
