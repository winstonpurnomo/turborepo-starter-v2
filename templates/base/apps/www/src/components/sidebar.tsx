import {
  CaretUpDownIcon,
  GlobeHemisphereWestIcon,
} from "@phosphor-icons/react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPositioner,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@repo/ui/components/sidebar";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";

const sidebarItems = [
  {
    name: "Home",
    href: "/",
    icon: GlobeHemisphereWestIcon,
  },
];

export function AppSidebar() {
  const { signOut, user } = useAuth();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={(props) => (
                <SidebarMenuButton {...props} size="lg">
                  <Avatar>
                    <AvatarImage
                      alt={`${user?.firstName} ${user?.lastName}`}
                      src={user?.profilePictureUrl ?? "/avatar.webp"}
                    />
                    <AvatarFallback className="rounded-lg">User</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{`${user?.firstName} ${user?.lastName}`}</span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                  <CaretUpDownIcon />
                </SidebarMenuButton>
              )}
            />
            <DropdownMenuPositioner>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>You</DropdownMenuLabel>
                  <Link to="/account">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                  </Link>
                  <Link to="/switch-organization">
                    <DropdownMenuItem>Switch Organization</DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={() => signOut()}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenuPositioner>
          </DropdownMenu>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {sidebarItems.map((item) => (
            <Link key={item.name} to={item.href}>
              {({ isActive }) => (
                <SidebarMenu>
                  <SidebarMenuButton isActive={isActive}>
                    <item.icon className="h-6 w-6" />
                    <span className="ml-2">{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenu>
              )}
            </Link>
          ))}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
