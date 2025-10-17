import {
	type FetchCreateContextFn,
	fetchRequestHandler,
} from "@trpc/server/adapters/fetch";
import { appRouter } from "./index";

export function fetchRequestHandlerForAppRouter({
	endpoint,
	createContext,
}: {
	endpoint: string;
	createContext: FetchCreateContextFn<typeof appRouter> | undefined;
}) {
	return async ({ request }: { request: Request }) =>
		fetchRequestHandler({
			endpoint,
			req: request,
			router: appRouter,
			createContext,
		});
}
