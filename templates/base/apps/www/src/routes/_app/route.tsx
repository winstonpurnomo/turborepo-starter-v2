import {
	SidebarInset,
	SidebarRail,
	SidebarTrigger,
} from "@repo/ui/components/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Provider as HeaderProvider, useTitle } from "@/components/header";
import { AppSidebar } from "@/components/sidebar";

export const Route = createFileRoute("/_app")({
	component: RouteComponent,
});

function HeaderBar() {
	const { title } = useTitle();

	return (
		<header className="mb-2 flex shrink-0 items-center gap-3 rounded-md px-4 py-2">
			<SidebarTrigger />
			<h1 className="text-sm">{title}</h1>
		</header>
	);
}

function RouteComponent() {
	return (
		<>
			<AppSidebar />

			<div className="flex flex-1 flex-col p-4 min-h-0">
				<HeaderProvider>
					<HeaderBar />

					<SidebarInset className="flex flex-1 min-h-0 rounded-xl bg-background shadow-sm">
						<SidebarRail />
						<div className="flex-1 overflow-auto p-6 min-h-0">
							<Outlet />
						</div>
					</SidebarInset>
				</HeaderProvider>
			</div>
		</>
	);
}
