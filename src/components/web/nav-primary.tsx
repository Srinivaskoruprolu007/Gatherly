import type { NavPrimaryProps } from '@/lib/types'
import { Link } from '@tanstack/react-router'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar'

const NavPrimary = ({ projects }: NavPrimaryProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {projects.map((item, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton>
                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                <Link
                  activeProps={{ 'data-active': true }}
                  activeOptions={item.activeOptions}
                  to={item.to}
                >
                  {item.title}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default NavPrimary
