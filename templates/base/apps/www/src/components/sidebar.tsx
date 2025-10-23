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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@repo/ui/components/sidebar";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";

export function AppSidebar() {
  const { signOut } = useAuth();
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={(props) => (
                <SidebarMenuButton {...props} size="lg">
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate font-medium">Hello</span>
                    <span className="truncate text-muted-foreground text-sm">
                      Welcome back
                    </span>
                  </div>
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
    </Sidebar>
  );
}
