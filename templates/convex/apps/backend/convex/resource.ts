import { query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    console.log("user", user);
    return {
      user,
      hello: "world",
    };
  },
});
