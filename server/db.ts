import { eq, desc, and, gte, lte, like, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, tours, reviews, bookings, userPreferences, chatbotConversations, newsletterSubscriptions } from "../drizzle/schema.js";
import { ENV } from './_core/env.js';

let _db: ReturnType<typeof drizzle> | null = null;
let queryClient: ReturnType<typeof postgres> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      queryClient = postgres(process.env.DATABASE_URL);
      _db = drizzle(queryClient);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createEmailUser(params: { openId: string; name: string; email: string; passwordHash: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [row] = await db.insert(users).values({
    openId: params.openId,
    name: params.name,
    email: params.email,
    passwordHash: params.passwordHash,
    loginMethod: "email",
    lastSignedIn: new Date(),
  }).returning();
  return row;
}

export async function getAllTours(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tours).limit(limit).offset(offset);
}

export async function getTourById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tours).where(eq(tours.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function searchTours(filters: {
  destination?: string;
  activityType?: string;
  minPrice?: number;
  maxPrice?: number;
  accessibilityFeatures?: string[];
  minHostResponseRate?: number;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters.destination) {
    conditions.push(like(tours.destination, `%${filters.destination}%`));
  }

  if (filters.activityType) {
    conditions.push(eq(tours.activityType, filters.activityType));
  }

  if (filters.minPrice !== undefined) {
    conditions.push(gte(tours.price, filters.minPrice.toString()));
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(lte(tours.price, filters.maxPrice.toString()));
  }

  if (filters.minHostResponseRate !== undefined) {
    conditions.push(gte(tours.hostResponseRate, filters.minHostResponseRate));
  }

  if (filters.accessibilityFeatures && filters.accessibilityFeatures.length > 0) {
    conditions.push(sql`${tours.accessibilityFeatures}::jsonb @> ${JSON.stringify(filters.accessibilityFeatures)}::jsonb`);
  }

  const query = db.select().from(tours);
  
  if (conditions.length > 0) {
    return query.where(and(...conditions)).limit(filters.limit || 50).offset(filters.offset || 0);
  }

  return query.limit(filters.limit || 50).offset(filters.offset || 0);
}

export async function createTour(tourData: typeof tours.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tours).values(tourData);
  return result;
}

export async function getReviewsByTourId(tourId: number, limit = 10, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.tourId, tourId)).orderBy(desc(reviews.createdAt)).limit(limit).offset(offset);
}

export async function createReview(reviewData: typeof reviews.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(reviews).values(reviewData);
  return result;
}

export async function getReviewById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBooking(bookingData: typeof bookings.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bookings).values(bookingData);
  return result;
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBookingByReference(reference: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bookings).where(eq(bookings.bookingReference, reference)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserBookings(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
}

export async function updateBooking(reference: string, updates: Partial<typeof bookings.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bookings).set({ ...updates, updatedAt: new Date() }).where(eq(bookings.bookingReference, reference));
  return getBookingByReference(reference);
}

export async function getToursByIds(ids: number[]) {
  const db = await getDb();
  if (!db || ids.length === 0) return [];
  return db.select().from(tours).where(inArray(tours.id, ids));
}

export async function getToursByOperatorEmail(operatorEmail: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tours).where(eq(tours.operatorEmail, operatorEmail)).orderBy(desc(tours.createdAt));
}

export async function getBookingsByTourIds(tourIds: number[]) {
  const db = await getDb();
  if (!db || tourIds.length === 0) return [];
  return db.select().from(bookings).where(inArray(bookings.tourId, tourIds)).orderBy(desc(bookings.createdAt));
}

export async function updateTour(id: number, updates: Partial<typeof tours.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tours).set({ ...updates, updatedAt: new Date() }).where(eq(tours.id, id));
  return getTourById(id);
}

export async function deleteTour(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tours).where(eq(tours.id, id));
  return true;
}

export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrCreateUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let prefs = await getUserPreferences(userId);
  if (!prefs) {
    await db.insert(userPreferences).values({
      userId,
      viewedTourIds: [],
      favoriteDestinations: [],
      favoriteActivityTypes: [],
    });
    prefs = await getUserPreferences(userId);
  }
  return prefs;
}

export async function updateUserPreferences(userId: number, updates: Partial<typeof userPreferences.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userPreferences).set(updates).where(eq(userPreferences.userId, userId));
  return getUserPreferences(userId);
}

export async function getChatbotConversation(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(chatbotConversations).where(eq(chatbotConversations.sessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createChatbotConversation(sessionId: string, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(chatbotConversations).values({ sessionId, userId, messages: [] });
  return result;
}

export async function updateChatbotConversation(sessionId: string, updates: Partial<typeof chatbotConversations.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(chatbotConversations).set(updates).where(eq(chatbotConversations.sessionId, sessionId));
  return getChatbotConversation(sessionId);
}

export async function subscribeToNewsletter(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(newsletterSubscriptions).where(eq(newsletterSubscriptions.email, email)).limit(1);
  if (existing.length > 0) {
    await db.update(newsletterSubscriptions).set({ subscribed: true, unsubscribedAt: null }).where(eq(newsletterSubscriptions.email, email));
  } else {
    await db.insert(newsletterSubscriptions).values({ email, subscribed: true });
  }
  return true;
}

export async function unsubscribeFromNewsletter(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(newsletterSubscriptions).set({ subscribed: false, unsubscribedAt: new Date() }).where(eq(newsletterSubscriptions.email, email));
  return true;
}
