/** biome-ignore-all lint/style/noNonNullAssertion: env returns undefined */
import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import {
  AuthenticateWithSessionCookieFailureReason,
  type ListOrganizationMembershipsOptions,
  WorkOS,
} from "@workos-inc/node";
import z from "zod";

export const getWorkOSInstance = createMiddleware().server(({ next }) =>
  next({
    context: {
      workos: new WorkOS(process.env.WORKOS_API_KEY!, {
        clientId: process.env.WORKOS_CLIENT_ID!,
      }),
    },
  })
);

async function getUserIdFromSession(
  workos: WorkOS,
  sealedSessionData: string,
  attempt = 0
) {
  const authenticateResult =
    await workos.userManagement.authenticateWithSessionCookie({
      sessionData: sealedSessionData,
      cookiePassword: process.env.WORKOS_COOKIE_PASSWORD!,
    });
  if (authenticateResult.authenticated) {
    return authenticateResult;
  }

  if (
    attempt > 3 ||
    authenticateResult.reason ===
      AuthenticateWithSessionCookieFailureReason.NO_SESSION_COOKIE_PROVIDED
  ) {
    throw new Error(
      `failReason: ${attempt > 3 ? "Too many attempts" : authenticateResult.reason}`
    );
  }

  const sealedSession = workos.userManagement.loadSealedSession({
    sessionData: sealedSessionData,
    cookiePassword: process.env.WORKOS_COOKIE_PASSWORD!,
  });
  const refreshResult = await sealedSession.refresh();
  if (!refreshResult.authenticated) {
    throw new Error("Refresh failed");
  }

  return getUserIdFromSession(
    workos,
    refreshResult.sealedSession!,
    attempt + 1
  );
}

const getUserId = createMiddleware()
  .middleware([getWorkOSInstance])
  .server(async ({ next, context }) => {
    const data = await getUserIdFromSession(
      context.workos,
      getCookie("wos-session")!
    );

    return next({
      context: {
        ...context,
        authData: data,
      },
    });
  });

const valid = createMiddleware({ type: "function" })
  .middleware([getUserId])
  .inputValidator((data: { userId?: string }) => data)
  .server(({ context, data, next }) => {
    if (data.userId && context.authData.user.id !== data.userId) {
      throw new Error("Unauthorized");
    }
    return next();
  });

export const listOrganizationMemberships = createServerFn()
  .middleware([getWorkOSInstance, getUserId, valid])
  .inputValidator(
    (data: Omit<ListOrganizationMembershipsOptions, "userId">) => data
  )
  .handler(async ({ context, data }) =>
    (
      await context.workos.userManagement.listOrganizationMemberships({
        ...data,
        userId: context.authData.user.id,
      })
    ).autoPagination()
  );

export const getOrganization = createServerFn()
  .middleware([getWorkOSInstance])
  .inputValidator((data: { organizationId: string }) => data)
  .handler(({ context, data }) =>
    context.workos.organizations.getOrganization(data.organizationId)
  );

export const createOrganization = createServerFn()
  .middleware([getWorkOSInstance, valid])
  .inputValidator(
    z.object({ name: z.string().min(3), slug: z.string().min(3) })
  )
  .handler(async ({ context, data }) => {
    const organization = await context.workos.organizations.createOrganization({
      name: data.name,
      externalId: data.slug,
    });
    const organizationMembership =
      await context.workos.userManagement.createOrganizationMembership({
        organizationId: organization.id,
        userId: context.authData.user.id,
        roleSlug: "admin",
      });
    return { organization, organizationMembership };
  });
