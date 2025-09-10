import { GalleryVerticalEnd } from 'lucide-react'
import type * as React from 'react'

import { NavMain } from '@/components/nav-main'
import { NavSettings } from '@/components/nav-settings'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { WorkspaceSwitcher } from '@/components/workspace-switcher'
import { IsMac } from '@/utils/platform'

// This is sample data.
const data = {
  workspaces: [
    {
      name: 'Global Workspace',
      logo: GalleryVerticalEnd,
      subtitle: 'Coming Soon',
    },
  ],
}

export function AppLayoutSidebar({
  sidebarCollapsibleType,
  setSidebarCollapsibleType,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  sidebarCollapsibleType: React.ComponentProps<typeof Sidebar>['collapsible']
  setSidebarCollapsibleType: React.Dispatch<
    React.SetStateAction<React.ComponentProps<typeof Sidebar>['collapsible']>
  >
}) {
  return (
    <Sidebar collapsible={sidebarCollapsibleType} {...props}>
      <SidebarHeader className={IsMac() ? 'mt-[30px]' : 'mt-0'}>
        <WorkspaceSwitcher workspaces={data.workspaces} />
      </SidebarHeader>
      <SidebarContent id="sidebar-content">
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavSettings />
      </SidebarFooter>
      <SidebarRail
        onMouseDown={() => {
          setSidebarCollapsibleType('icon')
        }}
      />
    </Sidebar>
  )
}
