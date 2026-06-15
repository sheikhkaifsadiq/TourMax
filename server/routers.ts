import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies.js";
import { systemRouter } from "./_core/systemRouter.js";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc.js";
import { z } from "zod";
import * as db from "./db.js";
import { nanoid } from "nanoid";
import { invokeLLM } from "./_core/llm.js";
import { getStripe } from "./_core/stripe.js";
import { sendEmail, renderBookingConfirmation, renderBookingStatusUpdate } from "./_core/email.js";
import { socialRouter } from "./socialRouter.js";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * Tours router - browse and search tours
   */
  tours: router({
    // Get all tours with pagination
    list: publicProcedure
      .input(z.object({
        limit: z.number().int().positive().max(100).default(20),
        offset: z.number().int().nonnegative().default(0),
      }))
      .query(async ({ input }) => {
        const tours = await db.getAllTours(input.limit, input.offset);
        return tours;
      }),

    // Get single tour by ID
    getById: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const tour = await db.getTourById(input.id);
        if (!tour) throw new Error("Tour not found");
        
        // Get reviews for this tour
        const tourReviews = await db.getReviewsByTourId(input.id, 10);
        
        return { ...tour, reviews: tourReviews };
      }),

    // Search tours with filters
    search: publicProcedure
      .input(z.object({
        destination: z.string().optional(),
        activityType: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        accessibilityFeatures: z.array(z.string()).optional(),
        minHostResponseRate: z.number().optional(),
        limit: z.number().int().positive().max(100).default(20),
        offset: z.number().int().nonnegative().default(0),
      }))
      .query(async ({ input }) => {
        const results = await db.searchTours({
          destination: input.destination,
          activityType: input.activityType,
          minPrice: input.minPrice,
          maxPrice: input.maxPrice,
          accessibilityFeatures: input.accessibilityFeatures,
          minHostResponseRate: input.minHostResponseRate,
          limit: input.limit,
          offset: input.offset,
        });
        return results;
      }),

    // AI-powered natural language search
    nlSearch: publicProcedure
      .input(z.object({
        query: z.string().min(1).max(500),
        sessionId: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Use LLM to parse natural language query
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are a tour search assistant. Parse the user's natural language query and extract search filters.
                
Return a JSON object with these fields (all optional):
- destination: string (place name)
- activityType: string (adventure, cultural, relaxation, beach, mountain, etc.)
- minPrice: number
- maxPrice: number
- duration: string (e.g., "5 days", "1 week")

Be flexible and infer from context. If not mentioned, omit the field.`,
              },
              {
                role: "user",
                content: input.query,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "search_filters",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    destination: { type: "string" },
                    activityType: { type: "string" },
                    minPrice: { type: "number" },
                    maxPrice: { type: "number" },
                    duration: { type: "string" },
                  },
                  additionalProperties: false,
                },
              },
            },
          });

          const content = response.choices[0]?.message.content;
          const contentStr = typeof content === "string" ? content : "{}";
          const filters = contentStr ? JSON.parse(contentStr) : {};

          // Search with extracted filters
          const results = await db.searchTours({
            destination: filters.destination,
            activityType: filters.activityType,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            limit: 20,
          });

          // Track user preferences if authenticated
          if (ctx.user && input.sessionId) {
            const prefs = await db.getOrCreateUserPreferences(ctx.user.id);
            if (prefs) {
              const updatedPrefs = {
                lastSearchQuery: input.query,
                favoriteDestinations: filters.destination
                  ? Array.from(new Set([...(prefs.favoriteDestinations || []), filters.destination]))
                  : prefs.favoriteDestinations,
                favoriteActivityTypes: filters.activityType
                  ? Array.from(new Set([...(prefs.favoriteActivityTypes || []), filters.activityType]))
                  : prefs.favoriteActivityTypes,
              };
              await db.updateUserPreferences(ctx.user.id, updatedPrefs);
            }
          }

          return {
            filters,
            results,
            count: results.length,
          };
        } catch (error) {
          console.error("NL Search error:", error);
          // Fallback to basic search if LLM fails
          const results = await db.searchTours({
            destination: input.query,
            limit: 20,
          });
          return { filters: {}, results, count: results.length };
        }
      }),
  }),

  /**
   * Reviews router
   */
  reviews: router({
    // Get reviews for a tour
    getByTourId: publicProcedure
      .input(z.object({
        tourId: z.number().int().positive(),
        limit: z.number().int().positive().max(50).default(10),
        offset: z.number().int().nonnegative().default(0),
      }))
      .query(async ({ input }) => {
        return db.getReviewsByTourId(input.tourId, input.limit, input.offset);
      }),

    // Create a review (public - guest reviews allowed)
    create: publicProcedure
      .input(z.object({
        tourId: z.number().int().positive(),
        authorName: z.string().min(1).max(255),
        authorEmail: z.string().email(),
        rating: z.number().int().min(1).max(5),
        title: z.string().min(1).max(255),
        content: z.string().min(10).max(2000),
      }))
      .mutation(async ({ input, ctx }) => {
        const review = await db.createReview({
          tourId: input.tourId,
          userId: ctx.user?.id,
          authorName: input.authorName,
          authorEmail: input.authorEmail,
          rating: input.rating,
          title: input.title,
          content: input.content,
          verifiedPurchase: false,
        });
        return review;
      }),

    // AI-generated highlights / pros & cons summary for a tour
    summarize: publicProcedure
      .input(z.object({
        tourId: z.number().int().positive(),
      }))
      .query(async ({ input }) => {
        const reviews = await db.getReviewsByTourId(input.tourId, 50);
        if (reviews.length === 0) {
          return {
            available: false,
            avgRating: 0,
            totalReviews: 0,
            pros: [] as string[],
            cons: [] as string[],
            summary: "",
          };
        }
        const avg =
          reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
        const corpus = reviews
          .map((r) => `★${r.rating}/5 — ${r.title}: ${r.content}`)
          .join("\n");
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You analyze tour reviews and produce concise traveler highlights.
Return JSON with: summary (one sentence, <=180 chars), pros (3-5 short bullets), cons (1-3 short bullets, may be empty).
Bullets are short noun phrases (e.g. "Knowledgeable guides", "Cramped transport").`,
              },
              {
                role: "user",
                content: `Tour reviews:\n${corpus}`,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "review_summary",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    summary: { type: "string" },
                    pros: { type: "array", items: { type: "string" } },
                    cons: { type: "array", items: { type: "string" } },
                  },
                  required: ["summary", "pros", "cons"],
                  additionalProperties: false,
                },
              },
            },
          });
          const content = response.choices[0]?.message.content;
          const parsed = JSON.parse(typeof content === "string" ? content : "{}");
          return {
            available: true,
            avgRating: Number(avg.toFixed(2)),
            totalReviews: reviews.length,
            pros: parsed.pros || [],
            cons: parsed.cons || [],
            summary: parsed.summary || "",
          };
        } catch (e) {
          console.error("[reviews.summarize] failed:", e);
          return {
            available: false,
            avgRating: Number(avg.toFixed(2)),
            totalReviews: reviews.length,
            pros: [],
            cons: [],
            summary: "",
          };
        }
      }),
  }),

  /**
   * Bookings router
   */
  bookings: router({
    // Create a booking (guest checkout supported)
    create: publicProcedure
      .input(z.object({
        tourId: z.number().int().positive(),
        selectedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        travelerCount: z.number().int().positive(),
        travelers: z.array(z.object({
          name: z.string().min(1),
          age: z.number().int().optional(),
          email: z.string().email().optional(),
        })),
        guestFirstName: z.string().min(1).max(255),
        guestLastName: z.string().min(1).max(255),
        guestEmail: z.string().email(),
        guestPhone: z.string().min(5).max(20),
        specialRequests: z.string().max(1000).optional(),
        selectedAncillaryServices: z.array(z.object({
          type: z.string(),
          name: z.string(),
          price: z.number().min(0),
          quantity: z.number().int().min(1)
        })).optional().default([]),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verify tour exists and get pricing
        const tour = await db.getTourById(input.tourId);
        if (!tour) throw new Error("Tour not found");

        // Calculate total price including ancillary services
        const ancillaryPrice = input.selectedAncillaryServices.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
        const totalPrice = (parseFloat(tour.price.toString()) * input.travelerCount + ancillaryPrice).toFixed(2);

        // Generate booking reference
        const bookingReference = `BK-${Date.now()}-${nanoid(6).toUpperCase()}`;

        const booking = await db.createBooking({
          tourId: input.tourId,
          userId: ctx.user?.id,
          bookingReference,
          guestFirstName: input.guestFirstName,
          guestLastName: input.guestLastName,
          guestEmail: input.guestEmail,
          guestPhone: input.guestPhone,
          selectedDate: input.selectedDate,
          travelerCount: input.travelerCount,
          travelers: input.travelers,
          totalPrice: totalPrice as any,
          currency: tour.currency,
          specialRequests: input.specialRequests,
          status: "pending",
          paymentStatus: "pending",
          selectedAncillaryServices: input.selectedAncillaryServices,
        });

        // Send confirmation email (non-blocking)
        sendEmail({
          to: input.guestEmail,
          subject: `Your TourMax booking ${bookingReference}`,
          html: renderBookingConfirmation({
            reference: bookingReference,
            tourTitle: tour.title,
            destination: tour.destination,
            date: input.selectedDate,
            travelers: input.travelerCount,
            totalPrice,
            currency: tour.currency,
            guestName: `${input.guestFirstName} ${input.guestLastName}`,
          }),
          replyTo: tour.operatorEmail || undefined,
        }).catch((e) => console.error("[booking] email failed:", e));

        // Notify operator if available
        if (tour.operatorEmail) {
          sendEmail({
            to: tour.operatorEmail,
            subject: `New booking ${bookingReference} for ${tour.title}`,
            html: renderBookingConfirmation({
              reference: bookingReference,
              tourTitle: tour.title,
              destination: tour.destination,
              date: input.selectedDate,
              travelers: input.travelerCount,
              totalPrice,
              currency: tour.currency,
              guestName: `${input.guestFirstName} ${input.guestLastName}`,
            }),
          }).catch((e) => console.error("[booking] operator email failed:", e));
        }

        return {
          bookingReference,
          totalPrice,
          message: "Booking created successfully. Please proceed to payment.",
        };
      }),

    // Get booking by reference (for confirmation page)
    getByReference: publicProcedure
      .input(z.object({ reference: z.string() }))
      .query(async ({ input }) => {
        const booking = await db.getBookingByReference(input.reference);
        if (!booking) throw new Error("Booking not found");

        const tour = await db.getTourById(booking.tourId);
        return { booking, tour };
      }),

    // Get user's bookings (authenticated only)
    getMyBookings: protectedProcedure
      .query(async ({ ctx }) => {
        const userBookings = await db.getUserBookings(ctx.user.id);
        if (userBookings.length === 0) return [];
        const tourIds = Array.from(new Set(userBookings.map(b => b.tourId)));
        const tours = await db.getToursByIds(tourIds);
        const tourMap = new Map(tours.map(t => [t.id, t]));
        return userBookings.map(booking => ({
          booking,
          tour: tourMap.get(booking.tourId)
        }));
      }),

    // Cancel a booking by reference + email match (guest checkout safe)
    cancel: publicProcedure
      .input(z.object({
        reference: z.string().min(1),
        email: z.string().email(),
        reason: z.string().max(500).optional(),
      }))
      .mutation(async ({ input }) => {
        const booking = await db.getBookingByReference(input.reference);
        if (!booking) throw new Error("Booking not found");
        if (booking.guestEmail.toLowerCase() !== input.email.toLowerCase()) {
          throw new Error("Email does not match booking record");
        }
        if (booking.status === "cancelled") {
          return { ok: true, message: "Already cancelled" };
        }
        await db.updateBooking(input.reference, {
          status: "cancelled",
          specialRequests: input.reason
            ? `${booking.specialRequests || ""}\n[Cancellation reason]: ${input.reason}`.trim()
            : booking.specialRequests,
        });
        const tour = await db.getTourById(booking.tourId);
        sendEmail({
          to: booking.guestEmail,
          subject: `Booking ${input.reference} cancelled`,
          html: renderBookingStatusUpdate({
            reference: input.reference,
            tourTitle: tour?.title || "your tour",
            status: "Cancelled",
            message: "Your booking has been cancelled. Any eligible refund will be processed within 5–7 business days.",
            guestName: `${booking.guestFirstName} ${booking.guestLastName}`,
          }),
        }).catch(() => undefined);
        return { ok: true, message: "Booking cancelled" };
      }),

    // Modify booking date or traveler count
    modify: publicProcedure
      .input(z.object({
        reference: z.string().min(1),
        email: z.string().email(),
        newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        newTravelerCount: z.number().int().positive().max(50).optional(),
        notes: z.string().max(500).optional(),
      }))
      .mutation(async ({ input }) => {
        const booking = await db.getBookingByReference(input.reference);
        if (!booking) throw new Error("Booking not found");
        if (booking.guestEmail.toLowerCase() !== input.email.toLowerCase()) {
          throw new Error("Email does not match booking record");
        }
        if (booking.status === "cancelled") {
          throw new Error("Cannot modify a cancelled booking");
        }
        const tour = await db.getTourById(booking.tourId);
        if (!tour) throw new Error("Tour no longer available");

        const newTravelers = input.newTravelerCount ?? booking.travelerCount;
        const newTotal = (parseFloat(tour.price.toString()) * newTravelers).toFixed(2);
        await db.updateBooking(input.reference, {
          selectedDate: input.newDate ?? booking.selectedDate,
          travelerCount: newTravelers,
          totalPrice: newTotal as any,
          status: "modified",
          specialRequests: input.notes
            ? `${booking.specialRequests || ""}\n[Modification note]: ${input.notes}`.trim()
            : booking.specialRequests,
        });
        sendEmail({
          to: booking.guestEmail,
          subject: `Booking ${input.reference} updated`,
          html: renderBookingStatusUpdate({
            reference: input.reference,
            tourTitle: tour.title,
            status: "Modified",
            message: `Your booking has been updated. New date: ${input.newDate ?? booking.selectedDate}, travelers: ${newTravelers}, total: ${tour.currency} ${newTotal}.`,
            guestName: `${booking.guestFirstName} ${booking.guestLastName}`,
          }),
        }).catch(() => undefined);
        return { ok: true, newTotalPrice: newTotal };
      }),

    // Create Stripe Checkout session for a booking
    createCheckoutSession: publicProcedure
      .input(z.object({
        reference: z.string().min(1),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      }))
      .mutation(async ({ input }) => {
        const stripe = getStripe();
        if (!stripe) throw new Error("Payments are not configured. Please contact support.");
        const booking = await db.getBookingByReference(input.reference);
        if (!booking) throw new Error("Booking not found");
        const tour = await db.getTourById(booking.tourId);
        if (!tour) throw new Error("Tour not found");

        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          success_url: `${input.successUrl}?ref=${booking.bookingReference}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${input.cancelUrl}?ref=${booking.bookingReference}`,
          customer_email: booking.guestEmail,
          line_items: [
            {
              quantity: booking.travelerCount,
              price_data: {
                currency: (booking.currency || "usd").toLowerCase(),
                unit_amount: Math.round(parseFloat(tour.price.toString()) * 100),
                product_data: {
                  name: tour.title,
                  description: `${tour.destination} • ${tour.duration} • ${booking.selectedDate}`,
                  images: tour.imageUrl ? [tour.imageUrl] : undefined,
                },
              },
            },
            ...booking.selectedAncillaryServices.map((service: any) => ({
              quantity: service.quantity,
              price_data: {
                currency: (booking.currency || "usd").toLowerCase(),
                unit_amount: Math.round(service.price * 100),
                product_data: {
                  name: service.name,
                  description: `Add-on: ${service.type}`,
                },
              },
            })),
          ],
          payment_intent_data: {
            metadata: { bookingReference: booking.bookingReference },
          },
          metadata: {
            bookingReference: booking.bookingReference,
            tourId: String(tour.id),
          },
        });
        return { url: session.url, sessionId: session.id };
      }),
  }),

  /**
   * Recommendations router - AI-powered personalized suggestions
   */
  recommendations: router({
    // Get personalized recommendations
    getPersonalized: publicProcedure
      .input(z.object({
        sessionId: z.string().optional(),
        limit: z.number().int().positive().max(20).default(6),
      }))
      .query(async ({ input, ctx }) => {
        try {
          let preferences = null;

          // Get user preferences if authenticated
          if (ctx.user) {
            preferences = await db.getUserPreferences(ctx.user.id);
          }

          // Build recommendation prompt
          let prompt = "Recommend interesting tour destinations and activities";
          if (preferences?.favoriteDestinations?.length) {
            prompt += ` similar to ${preferences.favoriteDestinations.join(", ")}`;
          }
          if (preferences?.favoriteActivityTypes?.length) {
            prompt += ` with activities like ${preferences.favoriteActivityTypes.join(", ")}`;
          }

          // Use LLM to generate recommendations
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are a travel recommendation expert. Based on user preferences, suggest tour destinations and activity types.
                
Return a JSON array with 3-5 recommendations, each with:
- destination: string
- activityType: string
- reason: string (why this is recommended)`,
              },
              {
                role: "user",
                content: prompt || "Suggest popular tour destinations",
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "recommendations",
                strict: true,
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      destination: { type: "string" },
                      activityType: { type: "string" },
                      reason: { type: "string" },
                    },
                    required: ["destination", "activityType", "reason"],
                  },
                },
              },
            },
          });

          const content = response.choices[0]?.message.content;
          const contentStr = typeof content === "string" ? content : "[]";
          const recommendations = contentStr ? JSON.parse(contentStr) : [];

          // Search for tours matching recommendations
          const recommendedTours = [];
          for (const rec of recommendations.slice(0, input.limit)) {
            const tours = await db.searchTours({
              destination: rec.destination,
              activityType: rec.activityType,
              limit: 1,
            });
            if (tours.length > 0) {
              recommendedTours.push({
                ...tours[0],
                recommendationReason: rec.reason,
              });
            }
          }

          return recommendedTours;
        } catch (error) {
          console.error("Recommendations error:", error);
          // Fallback to popular tours
          return db.getAllTours(input.limit);
        }
      }),
  }),

  /**
   * Chatbot router - AI-powered tour assistant
   */
  chatbot: router({
    // Send message to chatbot
    sendMessage: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        message: z.string().min(1).max(1000),
        currentTourId: z.number().int().optional(),
        language: z.string().min(2).max(10).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Get or create conversation
          let conversation = await db.getChatbotConversation(input.sessionId);
          if (!conversation) {
            await db.createChatbotConversation(input.sessionId, ctx.user?.id);
            conversation = await db.getChatbotConversation(input.sessionId);
          }

          // Build context for the chatbot
          let systemPrompt = `You are a friendly and knowledgeable tour booking assistant. Help users:
- Find and explore tour options
- Answer questions about destinations, activities, and pricing
- Guide them through the booking process
- Provide travel tips and recommendations

Be concise, helpful, and professional. If asked about specific tours, provide relevant information.${input.language && input.language !== "en" ? `\n\nReply ONLY in this language (BCP-47): ${input.language}. If unsure, use the same language the user wrote in.` : ""}`;

          if (input.currentTourId) {
            const tour = await db.getTourById(input.currentTourId);
            if (tour) {
              systemPrompt += `\n\nCurrent tour being viewed:
Title: ${tour.title}
Destination: ${tour.destination}
Duration: ${tour.duration}
Price: $${tour.price}
Activity Type: ${tour.activityType}`;
            }
          }

          // Prepare messages for LLM
          const messages: any[] = [
            { role: "system", content: systemPrompt },
            ...((conversation?.messages || []) as any[]).map((msg: any) => ({
              role: (msg.role === "user" || msg.role === "assistant" ? msg.role : "user"),
              content: typeof msg.content === "string" ? msg.content : "",
            })),
            { role: "user", content: input.message },
          ];

          // Get response from LLM
          const response = await invokeLLM({
            messages: messages.slice(-10) as any,
          });

          const assistantMessage = response.choices[0]?.message.content || "I'm not sure how to help with that. Could you provide more details?";

          // Update conversation with new messages
          const updatedMessages: any = [
            ...((conversation?.messages || []) as any[]).filter((msg: any) => msg.role === "user" || msg.role === "assistant"),
            {
              role: "user",
              content: input.message,
              timestamp: Date.now(),
            },
            {
              role: "assistant",
              content: assistantMessage,
              timestamp: Date.now(),
            },
          ];

          await db.updateChatbotConversation(input.sessionId, {
            messages: updatedMessages,
            context: {
              currentTourId: input.currentTourId,
              lastSearchQuery: input.message,
            } as any,
          });

          return {
            message: assistantMessage,
            timestamp: Date.now(),
          };
        } catch (error) {
          console.error("Chatbot error:", error);
          return {
            message: "I apologize, but I'm having trouble processing your request. Please try again.",
            timestamp: Date.now(),
          };
        }
      }),

    // Get conversation history
    getHistory: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const conversation = await db.getChatbotConversation(input.sessionId);
        return (conversation?.messages || []) as any;
      }),
  }),

  /**
   * Newsletter router
   */
  newsletter: router({
    // Subscribe to newsletter
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        await db.subscribeToNewsletter(input.email);
        return { success: true, message: "Successfully subscribed to our newsletter!" };
      }),

    // Unsubscribe from newsletter
    unsubscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        await db.unsubscribeFromNewsletter(input.email);
        return { success: true, message: "Successfully unsubscribed from our newsletter." };
      }),
  }),

  /**
   * Trip Planner router - AI-generated itineraries
   */
  planner: router({
    generate: publicProcedure
      .input(z.object({
        destination: z.string().min(1).max(120),
        days: z.number().int().positive().max(30),
        travelers: z.number().int().positive().max(20),
        interests: z.array(z.string()).max(10).default([]),
        budget: z.enum(["budget", "comfort", "luxury"]).default("comfort"),
        notes: z.string().max(500).optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const interestStr = input.interests.length
            ? input.interests.join(", ")
            : "general sightseeing";
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are an expert travel planner. Produce a realistic, day-by-day itinerary.
You MUST respond with a valid JSON object containing exactly these keys:
- summary (string): short overview of the trip
- estimatedBudgetUsd (number): total estimated budget in USD
- days (array): array of day objects. Each day object must have: day (number), title (string), morning (string), afternoon (string), evening (string), tip (string).
Keep activities specific (named restaurants, landmarks, neighborhoods) and respect the budget tier.`,
              },
              {
                role: "user",
                content: `Plan a ${input.days}-day trip to ${input.destination} for ${input.travelers} traveler(s).
Interests: ${interestStr}. Budget: ${input.budget}.
${input.notes ? `Extra notes: ${input.notes}` : ""}`,
              },
            ],
            response_format: { type: "json_object" },
          });

          const content = response.choices[0]?.message.content;
          const contentStr = typeof content === "string" ? content : "{}";
          return JSON.parse(contentStr);
        } catch (error) {
          console.error("Planner error:", error);
          throw new Error("Failed to generate itinerary. Please try again.");
        }
      }),
  }),

  /**
   * Compare router - AI side-by-side tour comparison
   */
  compare: router({
    summarize: publicProcedure
      .input(z.object({
        tourIds: z.array(z.number().int().positive()).min(2).max(4),
        priorities: z.array(z.string()).max(8).default([]),
      }))
      .mutation(async ({ input }) => {
        const tours = await db.getToursByIds(input.tourIds);
        if (tours.length < 2) throw new Error("Need at least 2 valid tours to compare");
        const compact = tours.map((t) => ({
          id: t.id,
          title: t.title,
          destination: t.destination,
          duration: t.duration,
          price: t.price,
          currency: t.currency,
          rating: t.rating,
          reviewCount: t.reviewCount,
          activityType: t.activityType,
          highlights: t.highlights,
          inclusions: t.inclusions,
        }));
        const prioritiesStr = input.priorities.length
          ? input.priorities.join(", ")
          : "overall value, experience quality";
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You compare travel tours. Given multiple tour JSON objects, return a JSON object with:
- verdict: one short paragraph explaining which is best overall and why
- bestForBudget: tour id
- bestForExperience: tour id
- bestForFamilies: tour id
- rows: array of comparison rows, each { criterion: string, values: [{ tourId: number, note: string }] }
Provide 5-7 meaningful comparison rows (e.g. Value, Adventure level, Cultural depth, Accessibility, Best season).`,
              },
              {
                role: "user",
                content: `Compare these tours against priorities (${prioritiesStr}):\n${JSON.stringify(compact, null, 2)}`,
              },
            ],
            response_format: { type: "json_object" },
          });
          const content = response.choices[0]?.message.content;
          const parsed = JSON.parse(typeof content === "string" ? content : "{}");
          return { tours: compact, ...parsed };
        } catch (e) {
          console.error("[compare.summarize] failed:", e);
          throw new Error("Failed to generate comparison. Please try again.");
        }
      }),
  }),

  /**
   * Host router - listing management for tour operators (authenticated)
   */
  host: router({
    myListings: protectedProcedure.query(async ({ ctx }) => {
      const email = ctx.user.email;
      if (!email) return [];
      return db.getToursByOperatorEmail(email);
    }),

    createListing: protectedProcedure
      .input(z.object({
        title: z.string().min(3).max(255),
        description: z.string().min(20).max(4000),
        destination: z.string().min(2).max(255),
        duration: z.string().min(1).max(10),
        price: z.number().positive().max(100000),
        currency: z.string().length(3).default("USD"),
        imageUrl: z.string().url(),
        activityType: z.string().min(2).max(100),
        highlights: z.array(z.string().max(200)).max(10).default([]),
        inclusions: z.array(z.string().max(200)).max(20).default([]),
        exclusions: z.array(z.string().max(200)).max(20).default([]),
        maxTravelers: z.number().int().positive().max(500),
        minTravelers: z.number().int().positive().max(500).default(1),
        availableDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).max(60).default([]),
        operatorName: z.string().min(2).max(255).optional(),
        operatorPhone: z.string().max(20).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const email = ctx.user.email;
        if (!email) throw new Error("Your account is missing an email address");
        await db.createTour({
          title: input.title,
          description: input.description,
          destination: input.destination,
          duration: input.duration,
          price: input.price.toFixed(2) as any,
          currency: input.currency,
          imageUrl: input.imageUrl,
          galleryImages: [],
          activityType: input.activityType,
          highlights: input.highlights,
          inclusions: input.inclusions,
          exclusions: input.exclusions,
          maxTravelers: input.maxTravelers,
          minTravelers: input.minTravelers,
          availableDates: input.availableDates,
          operatorName: input.operatorName || ctx.user.name || "TourMax Host",
          operatorEmail: email,
          operatorPhone: input.operatorPhone,
        });
        return { ok: true };
      }),

    updateListing: protectedProcedure
      .input(z.object({
        id: z.number().int().positive(),
        price: z.number().positive().max(100000).optional(),
        availableDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).max(60).optional(),
        maxTravelers: z.number().int().positive().max(500).optional(),
        description: z.string().min(20).max(4000).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const tour = await db.getTourById(input.id);
        if (!tour) throw new Error("Listing not found");
        if (tour.operatorEmail !== ctx.user.email) throw new Error("Not authorized");
        await db.updateTour(input.id, {
          ...(input.price !== undefined ? { price: input.price.toFixed(2) as any } : {}),
          ...(input.availableDates ? { availableDates: input.availableDates } : {}),
          ...(input.maxTravelers !== undefined ? { maxTravelers: input.maxTravelers } : {}),
          ...(input.description ? { description: input.description } : {}),
        });
        return { ok: true };
      }),

    deleteListing: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const tour = await db.getTourById(input.id);
        if (!tour) throw new Error("Listing not found");
        if (tour.operatorEmail !== ctx.user.email) throw new Error("Not authorized");
        await db.deleteTour(input.id);
        return { ok: true };
      }),

    listingBookings: protectedProcedure.query(async ({ ctx }) => {
      const email = ctx.user.email;
      if (!email) return { tours: [], bookings: [] };
      const tours = await db.getToursByOperatorEmail(email);
      const bookings = await db.getBookingsByTourIds(tours.map((t) => t.id));
      return { tours, bookings };
    }),

    analytics: protectedProcedure.query(async ({ ctx }) => {
      const email = ctx.user.email;
      if (!email) return { listings: 0, bookings: 0, revenue: 0, currency: "USD" };
      const tours = await db.getToursByOperatorEmail(email);
      const bookings = await db.getBookingsByTourIds(tours.map((t) => t.id));
      const revenue = bookings
        .filter((b) => b.status !== "cancelled")
        .reduce((s, b) => s + parseFloat(b.totalPrice.toString()), 0);
      return {
        listings: tours.length,
        bookings: bookings.length,
        revenue: Number(revenue.toFixed(2)),
        currency: tours[0]?.currency || "USD",
      };
    }),
  }),

  /**
   * Comms router - guest <-> host messaging (placeholder using booking record)
   */
  comms: router({
    sendToHost: publicProcedure
      .input(z.object({
        bookingReference: z.string().min(1),
        email: z.string().email(),
        message: z.string().min(1).max(2000),
      }))
      .mutation(async ({ input }) => {
        const booking = await db.getBookingByReference(input.bookingReference);
        if (!booking) throw new Error("Booking not found");
        if (booking.guestEmail.toLowerCase() !== input.email.toLowerCase()) {
          throw new Error("Email does not match booking record");
        }
        const tour = await db.getTourById(booking.tourId);
        if (!tour?.operatorEmail) throw new Error("Host contact not available");
        const ok = await sendEmail({
          to: tour.operatorEmail,
          subject: `Message from guest — ${input.bookingReference}`,
          html: `<p>Guest <strong>${booking.guestFirstName} ${booking.guestLastName}</strong> (${booking.guestEmail}) sent a message:</p><blockquote>${input.message.replace(/</g, "&lt;")}</blockquote>`,
          replyTo: booking.guestEmail,
        });
        return ok;
      }),
  }),
  community: socialRouter,
});

export type AppRouter = typeof appRouter;
