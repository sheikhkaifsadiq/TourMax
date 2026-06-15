import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { tours } from "./drizzle/schema";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in .env");
}

const client = postgres(connectionString);
const db = drizzle(client);

const mockTours = [
  {
    title: "Bali Tropical Paradise Retreat",
    description: "Experience the magic of Bali with this comprehensive 7-day retreat. From the lush rice terraces of Ubud to the pristine beaches of Seminyak, immerse yourself in authentic Balinese culture, cuisine, and breathtaking landscapes.",
    destination: "Bali, Indonesia",
    duration: "7 Days",
    price: "1299.00",
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80"
    ],
    rating: "4.9",
    reviewCount: 124,
    activityType: "relaxation",
    highlights: ["Ubud Monkey Forest", "Tegalalang Rice Terrace", "Uluwatu Temple Sunset Dance", "Traditional Cooking Class"],
    inclusions: ["6 Nights Luxury Accommodation", "Daily Breakfast", "Airport Transfers", "English-speaking Guide"],
    exclusions: ["International Flights", "Travel Insurance", "Personal Expenses"],
    maxTravelers: 12,
    minTravelers: 2,
    operatorName: "Bali Wonders Travel",
    operatorEmail: "contact@baliwonders.com",
    operatorPhone: "+62 361 123456",
    availableDates: ["2026-07-15", "2026-08-01", "2026-08-15", "2026-09-01"]
  },
  {
    title: "Swiss Alps Adventure Explorer",
    description: "Conquer the majestic Swiss Alps on this adrenaline-pumping 5-day adventure. Featuring world-class hiking, breathtaking glacier views, and charming alpine villages. Perfect for nature lovers and adventure seekers.",
    destination: "Swiss Alps, Switzerland",
    duration: "5 Days",
    price: "2450.00",
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1469522854307-e81a0b35cd31?auto=format&fit=crop&q=80"
    ],
    rating: "4.8",
    reviewCount: 89,
    activityType: "adventure",
    highlights: ["Matterhorn Base Camp Hike", "Glacier Express Train Ride", "Interlaken Paragliding", "Swiss Cheese & Chocolate Tasting"],
    inclusions: ["4 Nights Alpine Lodge", "All Transportation within Switzerland", "Adventure Equipment", "Expert Mountain Guide"],
    exclusions: ["Flights", "Dinners", "Optional Activities"],
    maxTravelers: 8,
    minTravelers: 4,
    operatorName: "Alpine Adventures Hub",
    operatorEmail: "hello@alpineadventures.ch",
    operatorPhone: "+41 44 123 4567",
    availableDates: ["2026-06-20", "2026-07-10", "2026-08-05"]
  },
  {
    title: "Kyoto Cultural Immersion",
    description: "Step back in time in Japan's ancient capital. This 6-day cultural journey takes you through golden temples, tranquil zen gardens, and historic geisha districts. Experience the true essence of traditional Japan.",
    destination: "Kyoto, Japan",
    duration: "6 Days",
    price: "1850.00",
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&q=80"
    ],
    rating: "4.95",
    reviewCount: 210,
    activityType: "cultural",
    highlights: ["Fushimi Inari Shrine Tour", "Traditional Tea Ceremony", "Arashiyama Bamboo Grove", "Gion District Evening Walk"],
    inclusions: ["5 Nights Ryokan Stay", "Bullet Train Pass", "Temple Entrance Fees", "Local Cultural Guide"],
    exclusions: ["International Airfare", "Lunches", "Personal Purchases"],
    maxTravelers: 15,
    minTravelers: 2,
    operatorName: "Japan Heritage Tours",
    operatorEmail: "booking@japanheritage.jp",
    operatorPhone: "+81 75 123 4567",
    availableDates: ["2026-09-10", "2026-10-05", "2026-10-20", "2026-11-15"]
  },
  {
    title: "Santorini Sunset Escapade",
    description: "Discover the romance of the Greek Isles. Sail through the caldera, wander through whitewashed villages with blue domes, and witness the world's most famous sunsets while enjoying exquisite Mediterranean cuisine.",
    destination: "Santorini, Greece",
    duration: "4 Days",
    price: "1150.00",
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1570077188670-e3a535def5a6?auto=format&fit=crop&q=80"
    ],
    rating: "4.7",
    reviewCount: 156,
    activityType: "beach",
    highlights: ["Oia Sunset Catamaran Cruise", "Volcanic Hot Springs Visit", "Wine Tasting at Estate Argyros", "Akrotiri Archaeological Tour"],
    inclusions: ["3 Nights Boutique Hotel", "Breakfast & 1 Special Dinner", "Ferry Tickets", "Wine Tasting Fees"],
    exclusions: ["Flights to Athens", "City Taxes", "Gratuities"],
    maxTravelers: 10,
    minTravelers: 2,
    operatorName: "Aegean Dreams",
    operatorEmail: "info@aegeandreams.gr",
    operatorPhone: "+30 2286 12345",
    availableDates: ["2026-06-01", "2026-07-01", "2026-08-01", "2026-09-01"]
  }
];

async function seed() {
  console.log("Seeding Neon database with mock tours...");
  
  try {
    for (const tour of mockTours) {
      await db.insert(tours).values(tour);
    }
    console.log("Successfully seeded 4 premium tours!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

seed();
