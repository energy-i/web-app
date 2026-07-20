"use client";

import { CommandIcon } from "lucide-react";
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
import { Organisation, User } from "@/lib/types";

interface Props {
  user: User & { organisation: Organisation };
}

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar> & Props) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link className="flex items-center gap-2" href="/">
              <img src="/logo.svg" alt="Energyi Logo" className="h-12 w-auto" />
              <span className="text-lg font-semibold">Energy-i</span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={props.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
