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

export function AppSidebar() {
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
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenuPositioner>
          </DropdownMenu>
        </SidebarMenu>
      </SidebarHeader>
    </Sidebar>
  );
}
