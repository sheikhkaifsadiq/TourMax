import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers.js";
import type { TrpcContext } from "./_core/context.js";

// Mock context for testing
function createMockContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Tour API Tests", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    caller = appRouter.createCaller(createMockContext());
  });

  describe("tours.list", () => {
    it("should return a list of tours", async () => {
      const result = await caller.tours.list({ limit: 10, offset: 0 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should respect limit parameter", async () => {
      const result = await caller.tours.list({ limit: 3, offset: 0 });
      expect(result.length).toBeLessThanOrEqual(3);
    });

    it("should return tours with required fields", async () => {
      const result = await caller.tours.list({ limit: 1, offset: 0 });
      if (result.length > 0) {
        const tour = result[0];
        expect(tour).toHaveProperty("id");
        expect(tour).toHaveProperty("title");
        expect(tour).toHaveProperty("destination");
        expect(tour).toHaveProperty("price");
        expect(tour).toHaveProperty("rating");
      }
    });
  });

  describe("tours.getById", () => {
    it("should return a single tour by ID", async () => {
      const tours = await caller.tours.list({ limit: 1, offset: 0 });
      if (tours.length > 0) {
        const tourId = tours[0].id;
        const result = await caller.tours.getById({ id: tourId });
        expect(result).toBeDefined();
        expect(result?.id).toBe(tourId);
      }
    });

    it("should return null for non-existent tour", async () => {
      const result = await caller.tours.getById({ id: 99999 });
      expect(result).toBeNull();
    });
  });

  describe("tours.nlSearch", () => {
    it("should search tours with natural language query", async () => {
      const result = await caller.tours.nlSearch({
        query: "adventure in mountains",
        sessionId: "test-session",
      });
      expect(result).toHaveProperty("results");
      expect(Array.isArray(result.results)).toBe(true);
    });

    it("should handle empty search results gracefully", async () => {
      const result = await caller.tours.nlSearch({
        query: "xyz123nonexistent",
        sessionId: "test-session",
      });
      expect(result.results).toBeDefined();
    });
  });

  describe("reviews.getByTourId", () => {
    it("should return reviews for a tour", async () => {
      const tours = await caller.tours.list({ limit: 1, offset: 0 });
      if (tours.length > 0) {
        const tourId = tours[0].id;
        const result = await caller.reviews.getByTourId({
          tourId,
          limit: 5,
        });
        expect(Array.isArray(result)).toBe(true);
      }
    });

    it("should respect limit parameter for reviews", async () => {
      const tours = await caller.tours.list({ limit: 1, offset: 0 });
      if (tours.length > 0) {
        const tourId = tours[0].id;
        const result = await caller.reviews.getByTourId({
          tourId,
          limit: 2,
        });
        expect(result.length).toBeLessThanOrEqual(2);
      }
    });
  });

  describe("recommendations.getPersonalized", () => {
    it("should return personalized recommendations", async () => {
      const result = await caller.recommendations.getPersonalized({
        sessionId: "test-session",
        limit: 5,
      });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should respect limit parameter", async () => {
      const result = await caller.recommendations.getPersonalized({
        sessionId: "test-session",
        limit: 3,
      });
      expect(result.length).toBeLessThanOrEqual(3);
    });
  });

  describe("newsletter.subscribe", () => {
    it("should subscribe email to newsletter", async () => {
      const result = await caller.newsletter.subscribe({
        email: "test@example.com",
      });
      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
    });

    it("should return success message", async () => {
      const result = await caller.newsletter.subscribe({
        email: "subscriber@test.com",
      });
      expect(result).toHaveProperty("message");
      expect(result.message).toContain("subscribed");
    });
  });

  describe("newsletter.unsubscribe", () => {
    it("should unsubscribe email from newsletter", async () => {
      // First subscribe
      await caller.newsletter.subscribe({
        email: "unsubscribe@test.com",
      });

      // Then unsubscribe
      const result = await caller.newsletter.unsubscribe({
        email: "unsubscribe@test.com",
      });
      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
    });
  });
});
