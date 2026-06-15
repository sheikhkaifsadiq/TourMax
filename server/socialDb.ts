import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "./db.js";
import {
  profiles,
  follows,
  forumCategories,
  forumThreads,
  forumReplies,
  tripStories,
  postLikes,
  postComments,
  activityEvents,
  reports,
} from "../drizzle/schema.js";

// ---------- profiles ----------
export async function getProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return r[0];
}
export async function getProfileByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(profiles).where(eq(profiles.username, username)).limit(1);
  return r[0];
}
export async function getProfilesByUserIds(ids: number[]) {
  const db = await getDb();
  if (!db || ids.length === 0) return [];
  return db.select().from(profiles).where(inArray(profiles.userId, ids));
}
export async function upsertProfile(userId: number, data: Partial<typeof profiles.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await getProfileByUserId(userId);
  if (existing) {
    await db.update(profiles).set({ ...data, updatedAt: new Date() }).where(eq(profiles.userId, userId));
    return getProfileByUserId(userId);
  }
  if (!data.username) throw new Error("username required");
  await db.insert(profiles).values({ userId, username: data.username, ...data });
  return getProfileByUserId(userId);
}

// ---------- follows ----------
export async function follow(followerId: number, followeeId: number) {
  if (followerId === followeeId) throw new Error("Cannot follow yourself");
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(follows).values({ followerId, followeeId }).onConflictDoNothing();
}
export async function unfollow(followerId: number, followeeId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.followeeId, followeeId)));
}
export async function isFollowing(followerId: number, followeeId: number) {
  const db = await getDb();
  if (!db) return false;
  const r = await db.select().from(follows).where(and(eq(follows.followerId, followerId), eq(follows.followeeId, followeeId))).limit(1);
  return r.length > 0;
}
export async function countFollowers(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const r = await db.select({ c: sql<number>`count(*)::int` }).from(follows).where(eq(follows.followeeId, userId));
  return r[0]?.c || 0;
}
export async function countFollowing(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const r = await db.select({ c: sql<number>`count(*)::int` }).from(follows).where(eq(follows.followerId, userId));
  return r[0]?.c || 0;
}
export async function listFollowingIds(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const r = await db.select({ id: follows.followeeId }).from(follows).where(eq(follows.followerId, userId));
  return r.map((x) => x.id);
}

// ---------- forums ----------
export async function listCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(forumCategories).orderBy(forumCategories.sortOrder);
}
export async function listThreadsByCategory(categoryId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(forumThreads).where(eq(forumThreads.categoryId, categoryId))
    .orderBy(desc(forumThreads.isPinned), desc(forumThreads.lastReplyAt), desc(forumThreads.createdAt)).limit(limit);
}
export async function listRecentThreads(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(forumThreads).orderBy(desc(forumThreads.createdAt)).limit(limit);
}
export async function getThread(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(forumThreads).where(eq(forumThreads.id, id)).limit(1);
  return r[0];
}
export async function createThread(data: typeof forumThreads.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const r = await db.insert(forumThreads).values(data).returning();
  return r[0];
}
export async function bumpThreadView(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(forumThreads).set({ views: sql`COALESCE(${forumThreads.views},0)+1` }).where(eq(forumThreads.id, id));
}
export async function listReplies(threadId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(forumReplies).where(eq(forumReplies.threadId, threadId)).orderBy(forumReplies.createdAt);
}
export async function createReply(data: typeof forumReplies.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const r = await db.insert(forumReplies).values(data).returning();
  await db.update(forumThreads).set({
    replyCount: sql`COALESCE(${forumThreads.replyCount},0)+1`,
    lastReplyAt: new Date(),
  }).where(eq(forumThreads.id, data.threadId));
  return r[0];
}

// ---------- stories ----------
export async function listStories(limit = 30, authorId?: number, tourId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conds = [];
  if (authorId) conds.push(eq(tripStories.authorId, authorId));
  if (tourId) conds.push(eq(tripStories.tourId, tourId));
  const q = db.select().from(tripStories);
  const filtered = conds.length ? q.where(and(...conds)) : q;
  return filtered.orderBy(desc(tripStories.createdAt)).limit(limit);
}
export async function getStory(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(tripStories).where(eq(tripStories.id, id)).limit(1);
  return r[0];
}
export async function createStory(data: typeof tripStories.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const r = await db.insert(tripStories).values(data).returning();
  return r[0];
}
export async function deleteStory(id: number, authorId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(tripStories).where(and(eq(tripStories.id, id), eq(tripStories.authorId, authorId)));
}
export async function feedStoriesFor(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  const ids = await listFollowingIds(userId);
  if (ids.length === 0) return [];
  return db.select().from(tripStories).where(inArray(tripStories.authorId, ids)).orderBy(desc(tripStories.createdAt)).limit(limit);
}

// ---------- likes / comments ----------
export async function like(userId: number, targetType: string, targetId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(postLikes).values({ userId, targetType, targetId }).onConflictDoNothing();
  if (targetType === "story") {
    await db.update(tripStories).set({ likeCount: sql`COALESCE(${tripStories.likeCount},0)+1` }).where(eq(tripStories.id, targetId));
  }
}
export async function unlike(userId: number, targetType: string, targetId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const del = await db.delete(postLikes).where(and(
    eq(postLikes.userId, userId), eq(postLikes.targetType, targetType), eq(postLikes.targetId, targetId),
  )).returning();
  if (del.length && targetType === "story") {
    await db.update(tripStories).set({ likeCount: sql`GREATEST(COALESCE(${tripStories.likeCount},0)-1, 0)` }).where(eq(tripStories.id, targetId));
  }
}
export async function hasLiked(userId: number, targetType: string, targetId: number) {
  const db = await getDb();
  if (!db) return false;
  const r = await db.select().from(postLikes).where(and(
    eq(postLikes.userId, userId), eq(postLikes.targetType, targetType), eq(postLikes.targetId, targetId),
  )).limit(1);
  return r.length > 0;
}
export async function addComment(authorId: number, targetType: string, targetId: number, body: string) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const r = await db.insert(postComments).values({ authorId, targetType, targetId, body }).returning();
  if (targetType === "story") {
    await db.update(tripStories).set({ commentCount: sql`COALESCE(${tripStories.commentCount},0)+1` }).where(eq(tripStories.id, targetId));
  }
  return r[0];
}
export async function listComments(targetType: string, targetId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(postComments).where(and(
    eq(postComments.targetType, targetType), eq(postComments.targetId, targetId),
  )).orderBy(postComments.createdAt);
}

// ---------- activity ----------
export async function logActivity(actorId: number, verb: string, objectType: string, objectId: number, metadata?: unknown) {
  const db = await getDb();
  if (!db) return;
  await db.insert(activityEvents).values({ actorId, verb, objectType, objectId, metadata: metadata as any });
}
export async function feedActivity(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  const ids = await listFollowingIds(userId);
  if (ids.length === 0) return [];
  return db.select().from(activityEvents).where(inArray(activityEvents.actorId, ids)).orderBy(desc(activityEvents.createdAt)).limit(limit);
}

// ---------- reports ----------
export async function createReport(data: typeof reports.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(reports).values(data);
}
export async function listOpenReports() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reports).where(eq(reports.status, "open")).orderBy(desc(reports.createdAt));
}

// ---------- helper: hydrate authors ----------
export async function hydrateAuthors(items: Array<{ authorId: number }>) {
  const ids = Array.from(new Set(items.map((i) => i.authorId)));
  const profs = await getProfilesByUserIds(ids);
  const map = new Map(profs.map((p) => [p.userId, p]));
  return map;
}
