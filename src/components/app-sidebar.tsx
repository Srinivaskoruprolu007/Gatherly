import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '#/components/ui/sidebar'
import type { NavPrimaryProps, NavUserProps } from '#/lib/types'
import { Link, linkOptions } from '@tanstack/react-router'
import { BookOpen, Bookmark, Lightbulb, Rocket } from 'lucide-react'
import { NavUser } from './ui/nav-user'
import NavPrimary from './web/nav-primary'

const projects: NavPrimaryProps['projects'] = linkOptions([
  {
    title: 'Discover',
    to: '/dashboard/discover',
    activeOptions: { exact: false },
    icon: Rocket,
  },
  {
    title: 'Import',
    to: '/dashboard/import',
    activeOptions: { exact: false },
    icon: Lightbulb,
  },
  {
    title: 'Items',
    to: '/dashboard/items',
    activeOptions: { exact: false },
    icon: BookOpen,
  },
  {
    title: 'Collections',
    to: '/dashboard/collections',
    activeOptions: { exact: false },
    icon: Bookmark,
  },
])

export function AppSidebar({ user }: NavUserProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/" className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center overflow-hidden rounded-md">
                  <img
                    className="size-full object-contain"
                    src="https://res.cloudinary.com/djuvtohxk/image/upload/v1773383518/Gatherly_Logo_lcgt1a.webp"
                    alt="Gatherly Logo"
                  />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-semibold">Gatherly</span>
                  <span className="text-xs text-muted-foreground">
                    Content Manager
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            <NavPrimary projects={projects} />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
