import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc.js";
import * as s from "./socialDb.js";
import { invokeLLM } from "./_core/llm.js";
import * as db from "./db.js";

const usernameRe = /^[a-z0-9_]{3,32}$/i;

export const socialRouter = router({
  profiles: router({
    me: protectedProcedure.query(async ({ ctx }) => {
      const p = await s.getProfileByUserId(ctx.user.id);
      return p ?? null;
    }),
    getByUsername: publicProcedure
      .input(z.object({ username: z.string() }))
      .query(async ({ input }) => {
        const p = await s.getProfileByUsername(input.username);
        if (!p) return null;
        const [followers, following, stories] = await Promise.all([
          s.countFollowers(p.userId),
          s.countFollowing(p.userId),
          s.listStories(20, p.userId),
        ]);
        return { profile: p, followers, following, stories };
      }),
    upsert: protectedProcedure
      .input(z.object({
        username: z.string().regex(usernameRe, "3–32 chars: letters, numbers, underscores"),
        displayName: z.string().max(255).optional(),
        avatarUrl: z.string().url().optional().or(z.literal("")),
        bio: z.string().max(1000).optional(),
        location: z.string().max(255).optional(),
        languages: z.array(z.string()).max(20).optional(),
        travelStyle: z.array(z.string()).max(20).optional(),
        countriesVisited: z.number().int().min(0).max(300).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Ensure username uniqueness (allow keeping own)
        const existing = await s.getProfileByUsername(input.username);
        if (existing && existing.userId !== ctx.user.id) throw new Error("Username taken");
        const profile = await s.upsertProfile(ctx.user.id, {
          username: input.username,
          displayName: input.displayName || ctx.user.name,
          avatarUrl: input.avatarUrl || null,
          bio: input.bio,
          location: input.location,
          languages: input.languages,
          travelStyle: input.travelStyle,
          countriesVisited: input.countriesVisited,
        });
        return profile;
      }),
  }),

  follows: router({
    toggle: protectedProcedure
      .input(z.object({ followeeUserId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const already = await s.isFollowing(ctx.user.id, input.followeeUserId);
        if (already) {
          await s.unfollow(ctx.user.id, input.followeeUserId);
          return { following: false };
        }
        await s.follow(ctx.user.id, input.followeeUserId);
        await s.logActivity(ctx.user.id, "followed", "profile", input.followeeUserId);
        return { following: true };
      }),
    is: protectedProcedure
      .input(z.object({ followeeUserId: z.number().int().positive() }))
      .query(({ input, ctx }) => s.isFollowing(ctx.user.id, input.followeeUserId)),
  }),

  forums: router({
    categories: publicProcedure.query(() => s.listCategories()),
    threads: publicProcedure
      .input(z.object({ categoryId: z.number().int().positive().optional(), limit: z.number().int().max(100).default(30) }))
      .query(async ({ input }) => {
        const threads = input.categoryId
          ? await s.listThreadsByCategory(input.categoryId, input.limit)
          : await s.listRecentThreads(input.limit);
        const authors = await s.hydrateAuthors(threads);
        return threads.map((t) => ({ ...t, author: authors.get(t.authorId) ?? null }));
      }),
    thread: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const thread = await s.getThread(input.id);
        if (!thread) throw new Error("Thread not found");
        await s.bumpThreadView(input.id);
        const replies = await s.listReplies(input.id);
        const authors = await s.hydrateAuthors([thread, ...replies]);
        return {
          thread: { ...thread, author: authors.get(thread.authorId) ?? null },
          replies: replies.map((r) => ({ ...r, author: authors.get(r.authorId) ?? null })),
        };
      }),
    createThread: protectedProcedure
      .input(z.object({
        categoryId: z.number().int().positive(),
        title: z.string().min(5).max(255),
        body: z.string().min(10).max(8000),
        destination: z.string().max(255).optional(),
        tourId: z.number().int().positive().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const t = await s.createThread({ ...input, authorId: ctx.user.id });
        await s.logActivity(ctx.user.id, "posted", "thread", t.id, { title: t.title });
        return t;
      }),
    reply: protectedProcedure
      .input(z.object({
        threadId: z.number().int().positive(),
        body: z.string().min(1).max(8000),
        parentReplyId: z.number().int().positive().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const r = await s.createReply({ ...input, authorId: ctx.user.id });
        await s.logActivity(ctx.user.id, "replied", "thread", input.threadId);
        return r;
      }),
  }),

  stories: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().int().max(100).default(30), tourId: z.number().int().positive().optional(), authorId: z.number().int().positive().optional() }))
      .query(async ({ input }) => {
        const items = await s.listStories(input.limit, input.authorId, input.tourId);
        const authors = await s.hydrateAuthors(items);
        return items.map((i) => ({ ...i, author: authors.get(i.authorId) ?? null }));
      }),
    get: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const story = await s.getStory(input.id);
        if (!story) throw new Error("Story not found");
        const authors = await s.hydrateAuthors([story]);
        const comments = await s.listComments("story", input.id);
        const commentAuthors = await s.hydrateAuthors(comments);
        return {
          story: { ...story, author: authors.get(story.authorId) ?? null },
          comments: comments.map((c) => ({ ...c, author: commentAuthors.get(c.authorId) ?? null })),
        };
      }),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(5).max(255),
        body: z.string().min(20).max(20000),
        coverImageUrl: z.string().url().optional().or(z.literal("")),
        imageUrls: z.array(z.string().url()).max(20).optional(),
        destination: z.string().max(255).optional(),
        tourId: z.number().int().positive().optional(),
        rating: z.number().int().min(1).max(5).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Auto-create stub profile if missing so author can be displayed
        let profile = await s.getProfileByUserId(ctx.user.id);
        if (!profile) {
          const baseHandle = (ctx.user.name || ctx.user.email || `user${ctx.user.id}`).toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 28) || `user${ctx.user.id}`;
          let candidate = baseHandle;
          let i = 0;
          while (await s.getProfileByUsername(candidate)) {
            i++; candidate = `${baseHandle}${i}`;
          }
          profile = await s.upsertProfile(ctx.user.id, { username: candidate, displayName: ctx.user.name });
        }
        const story = await s.createStory({
          authorId: ctx.user.id,
          title: input.title,
          body: input.body,
          coverImageUrl: input.coverImageUrl || null,
          imageUrls: input.imageUrls ?? [],
          destination: input.destination,
          tourId: input.tourId,
          rating: input.rating,
        });
        await s.logActivity(ctx.user.id, "posted", "story", story.id, { title: story.title });
        return story;
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        await s.deleteStory(input.id, ctx.user.id);
        return { ok: true };
      }),
  }),

  social: router({
    like: protectedProcedure
      .input(z.object({ targetType: z.enum(["story", "thread", "reply"]), targetId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        await s.like(ctx.user.id, input.targetType, input.targetId);
        await s.logActivity(ctx.user.id, "liked", input.targetType, input.targetId);
        return { ok: true };
      }),
    unlike: protectedProcedure
      .input(z.object({ targetType: z.enum(["story", "thread", "reply"]), targetId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        await s.unlike(ctx.user.id, input.targetType, input.targetId);
        return { ok: true };
      }),
    hasLiked: protectedProcedure
      .input(z.object({ targetType: z.enum(["story", "thread", "reply"]), targetId: z.number().int().positive() }))
      .query(({ input, ctx }) => s.hasLiked(ctx.user.id, input.targetType, input.targetId)),
    comment: protectedProcedure
      .input(z.object({ targetType: z.enum(["story", "thread"]), targetId: z.number().int().positive(), body: z.string().min(1).max(2000) }))
      .mutation(async ({ input, ctx }) => {
        const c = await s.addComment(ctx.user.id, input.targetType, input.targetId, input.body);
        return c;
      }),
    feed: protectedProcedure.query(async ({ ctx }) => {
      const stories = await s.feedStoriesFor(ctx.user.id, 30);
      const events = await s.feedActivity(ctx.user.id, 50);
      const ids = Array.from(new Set([
        ...stories.map((x) => x.authorId),
        ...events.map((x) => x.actorId),
      ]));
      const profs = await s.getProfilesByUserIds(ids);
      const map = new Map(profs.map((p) => [p.userId, p]));
      return {
        stories: stories.map((x) => ({ ...x, author: map.get(x.authorId) ?? null })),
        events: events.map((e) => ({ ...e, actor: map.get(e.actorId) ?? null })),
      };
    }),
    report: protectedProcedure
      .input(z.object({
        targetType: z.enum(["story", "thread", "reply", "comment", "profile"]),
        targetId: z.number().int().positive(),
        reason: z.string().min(2).max(80),
        details: z.string().max(2000).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await s.createReport({ ...input, reporterId: ctx.user.id });
        return { ok: true };
      }),
  }),

  visualSearch: router({
    fromImage: publicProcedure
      .input(z.object({ imageUrl: z.string() })) // data URL or http URL
      .mutation(async ({ input }) => {
        try {
          const res = await invokeLLM({
            messages: [
              { role: "system", content: "You analyze travel photos. Return a valid JSON object describing the scene to power a tour search. Include keys: destination (string), activityType (string), keywords (array of strings), summary (string)." },
              {
                role: "user",
                content: [
                  { type: "text", text: "Identify the destination/region (if recognizable), the activity type, and 3-6 short keywords (landscape, climate, vibe). Be concise." },
                  { type: "image_url", image_url: { url: input.imageUrl } },
                ],
              },
            ],
            response_format: { type: "json_object" },
          });
          const content = res.choices[0]?.message.content;
          const parsed = JSON.parse(typeof content === "string" ? content : "{}");
          const results = await db.searchTours({
            destination: parsed.destination || undefined,
            activityType: parsed.activityType || undefined,
            limit: 24,
          });
          return { analysis: parsed, results };
        } catch (e) {
          console.error("[visualSearch] failed:", e);
          throw new Error("Could not analyze image. Try a clearer photo.");
        }
      }),
  }),
});
