import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import {
	type ListOrganizationMembershipsOptions,
	WorkOS,
} from "@workos-inc/node";

export const getWorkOSInstance = createMiddleware().server(({ next }) =>
	next({
		context: {
			workos: new WorkOS(process.env.WORKOS_API_KEY!, {
				clientId: process.env.WORKOS_CLIENT_ID!,
			}),
		},
	}),
);

const getUserId = createMiddleware()
	.middleware([getWorkOSInstance])
	.server(async ({ next, context }) => {
		const wosSession = await getCookie("wos-session");
		if (!wosSession) {
			throw new Error("No session cookie found");
		}

		const sesData =
			await context.workos.userManagement.authenticateWithSessionCookie({
				sessionData: wosSession,
				cookiePassword: process.env.WORKOS_COOKIE_PASSWORD!,
			});
		if (sesData.authenticated) {
			return next({
				context: {
					authData: sesData,
				},
			});
		} else {
			await context.workos.userManagement.loadSealedSession({
				sessionData: wosSession,
				cookiePassword: process.env.WORKOS_COOKIE_PASSWORD!,
			});
			console.log({
				session_cookie: wosSession,
				workos_cookie_password: process.env.WORKOS_COOKIE_PASSWORD,
				api_key: process.env.WORKOS_API_KEY,
				client_id: process.env.WORKOS_CLIENT_ID,
			});
			throw new Error(`Session cookie is invalid: ${sesData.reason}`);
		}
	});

const valid = createMiddleware({ type: "function" })
	.middleware([getUserId])
	.inputValidator((data: { userId?: string }) => data)
	.server(async ({ context, data, next }) => {
		if (data.userId && context.authData.user.id !== data.userId) {
			throw new Error("Unauthorized");
		}
		return next();
	});

export const listOrganizationMemberships = createServerFn()
	.middleware([getWorkOSInstance, getUserId, valid])
	.inputValidator(
		(data: Omit<ListOrganizationMembershipsOptions, "userId">) => data,
	)
	.handler(async ({ context, data }) =>
		(
			await context.workos.userManagement.listOrganizationMemberships({
				...data,
				userId: context.authData.user.id,
			})
		).autoPagination(),
	);
