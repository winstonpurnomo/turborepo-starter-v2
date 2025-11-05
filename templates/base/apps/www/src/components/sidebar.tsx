import {
  CaretUpDownIcon,
  GlobeHemisphereWestIcon,
  MoonIcon,
  SunIcon,
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
import { cn } from "@repo/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { useTheme } from "tanstack-theme-kit";

const sidebarItems = [
  {
    name: "Home",
    href: "/",
    icon: GlobeHemisphereWestIcon,
  },
];

export function AppSidebar() {
  const { signOut, user } = useAuth();
  const { theme, setTheme } = useTheme();

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
                  <DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center justify-between gap-4 focus:bg-accent/60"
                      onSelect={(e) => {
                        e.preventDefault(); // keep menu open behavior consistent
                        setTheme(theme === "light" ? "dark" : "light");
                      }}
                    >
                      <span className="text-sm">Theme</span>

                      <button
                        aria-label="Toggle theme"
                        aria-pressed={theme === "dark"}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors",
                          theme === "dark"
                            ? "border-zinc-700 bg-zinc-900"
                            : "border-zinc-300 bg-zinc-200"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          setTheme(theme === "light" ? "dark" : "light");
                        }}
                        type="button"
                      >
                        {/* Track icons */}
                        <SunIcon
                          className={cn(
                            "absolute left-1 h-3.5 w-3.5 text-amber-500 transition-opacity",
                            theme === "dark" ? "opacity-0" : "opacity-100"
                          )}
                        />
                        <MoonIcon
                          className={cn(
                            "absolute right-1 h-3.5 w-3.5 text-indigo-400 transition-opacity",
                            theme === "dark" ? "opacity-100" : "opacity-0"
                          )}
                        />

                        {/* Knob */}
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                            theme === "dark" ? "translate-x-5" : "translate-x-1"
                          )}
                        />
                      </button>
                    </DropdownMenuItem>
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
