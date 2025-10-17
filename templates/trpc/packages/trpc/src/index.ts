import { procedure, router } from "./trpc";

export const appRouter = router({
	hello: procedure.query(async () => "world"),
});
