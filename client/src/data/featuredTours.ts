export interface StaticTour {
  id: number;
  title: string;
  description: string;
  destination: string;
  duration: string;
  price: string;
  currency: string;
  imageUrl: string;
  galleryImages: string[];
  rating: string;
  reviewCount: number;
  activityType: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  maxTravelers: number;
  minTravelers: number;
  operatorName: string;
  operatorEmail: string;
  operatorPhone: string;
  availableDates: string[];
  recommendationReason?: string;
  tier?: "featured" | "recommended";
}

// 6 premium, top-rated curated tours for the "Featured Tours" section
export const FEATURED_TOURS: StaticTour[] = [
  {
    id: 1,
    title: "Bali Tropical Paradise Retreat",
    description:
      "Experience the magic of Bali with this 7-day retreat. From lush rice terraces of Ubud to pristine beaches of Seminyak, immerse yourself in authentic Balinese culture, cuisine, and breathtaking landscapes.",
    destination: "Bali, Indonesia",
    duration: "7 Days",
    price: "1299.00",
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1200",
    galleryImages: [
      "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&q=80&w=1200",
    ],
    rating: "4.9",
    reviewCount: 124,
    activityType: "relaxation",
    highlights: ["Ubud Monkey Forest", "Rice Terraces", "Uluwatu Sunset", "Cooking Class"],
    inclusions: ["6 Nights Hotel", "Breakfast", "Airport Transfers", "Guide"],
    exclusions: ["Flights", "Insurance"],
    maxTravelers: 12,
    minTravelers: 2,
    operatorName: "Bali Wonders Travel",
    operatorEmail: "contact@baliwonders.com",
    operatorPhone: "+62 361 123456",
    availableDates: ["2026-07-15", "2026-08-01", "2026-09-01"],
    tier: "featured",
  },
  {
    id: 2,
    title: "Swiss Alps Adventure Explorer",
    description:
      "Conquer the majestic Swiss Alps on an adrenaline-pumping 5-day adventure. World-class hiking, glacier views, and charming alpine villages.",
    destination: "Swiss Alps, Switzerland",
    duration: "5 Days",
    price: "2450.00",
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=1200",
    galleryImages: [
      "https://images.unsplash.com/photo-1469522854307-e81a0b35cd31?auto=format&fit=crop&q=80&w=1200",
    ],
    rating: "4.8",
    reviewCount: 89,
    activityType: "adventure",
    highlights: ["Matterhorn Hike", "Glacier Express", "Paragliding", "Cheese Tasting"],
    inclusions: ["4 Nights Lodge", "Transport", "Gear", "Mountain Guide"],
    exclusions: ["Flights", "Dinners"],
    maxTravelers: 8,
    minTravelers: 4,
    operatorName: "Alpine Adventures Hub",
    operatorEmail: "hello@alpineadventures.ch",
    operatorPhone: "+41 44 123 4567",
    availableDates: ["2026-06-20", "2026-07-10"],
    tier: "featured",
  },
  {
    id: 3,
    title: "Kyoto Cultural Immersion",
    description:
      "Step back in time in Japan's ancient capital. A 6-day cultural journey through golden temples, zen gardens, and historic geisha districts.",
    destination: "Kyoto, Japan",
    duration: "6 Days",
    price: "1850.00",
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1200",
    galleryImages: [
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&q=80&w=1200",
    ],
    rating: "4.95",
    reviewCount: 210,
    activityType: "cultural",
    highlights: ["Fushimi Inari", "Tea Ceremony", "Bamboo Grove", "Gion Walk"],
    inclusions: ["5 Nights Ryokan", "Bullet Train Pass", "Temple Fees", "Guide"],
    exclusions: ["Flights", "Lunches"],
    maxTravelers: 15,
    minTravelers: 2,
    operatorName: "Japan Heritage Tours",
    operatorEmail: "booking@japanheritage.jp",
    operatorPhone: "+81 75 123 4567",
    availableDates: ["2026-09-10", "2026-10-05"],
    tier: "featured",
  },
  {
    id: 4,
    title: "Santorini Sunset Escapade",
    description:
      "Discover the romance of the Greek Isles. Sail the caldera, wander whitewashed villages with blue domes, and witness famous sunsets.",
    destination: "Santorini, Greece",
    duration: "4 Days",
    price: "1150.00",
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&q=80&w=1200",
    galleryImages: [
      "https://images.unsplash.com/photo-1570077188670-e3a535def5a6?auto=format&fit=crop&q=80&w=1200",
    ],
    rating: "4.7",
    reviewCount: 156,
    activityType: "beach",
    highlights: ["Oia Sunset Cruise", "Hot Springs", "Wine Tasting", "Akrotiri Tour"],
    inclusions: ["3 Nights Hotel", "Breakfast", "Ferry", "Wine Tasting"],
    exclusions: ["Flights", "City Taxes"],
    maxTravelers: 10,
    minTravelers: 2,
    operatorName: "Aegean Dreams",
    operatorEmail: "info@aegeandreams.gr",
    operatorPhone: "+30 2286 12345",
    availableDates: ["2026-06-01", "2026-07-01"],
    tier: "featured",
  },
  {
    id: 5,
    title: "Patagonia Wilderness Expedition",
    description:
      "Trek the legendary Torres del Paine, paddle glacial lakes, and explore the raw beauty of Patagonia on a 9-day adventure.",
    destination: "Patagonia, Chile",
    duration: "9 Days",
    price: "3200.00",
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=1200",
    galleryImages: [
      "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&q=80&w=1200",
    ],
    rating: "4.9",
    reviewCount: 67,
    activityType: "adventure",
    highlights: ["Torres del Paine W Trek", "Grey Glacier", "Kayaking", "Wildlife"],
    inclusions: ["8 Nights Lodging", "All Meals", "Gear", "Guides"],
    exclusions: ["Flights", "Park Fees"],
    maxTravelers: 10,
    minTravelers: 4,
    operatorName: "Patagonia Trails",
    operatorEmail: "hello@patagoniatrails.cl",
    operatorPhone: "+56 2 1234 5678",
    availableDates: ["2026-11-01", "2026-12-05"],
    tier: "featured",
  },
  {
    id: 6,
    title: "Marrakech & Sahara Desert Journey",
    description:
      "A 6-day Moroccan odyssey through the souks of Marrakech, the Atlas Mountains, and a magical night under the stars in the Sahara.",
    destination: "Marrakech, Morocco",
    duration: "6 Days",
    price: "1490.00",
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&q=80&w=1200",
    galleryImages: [
      "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&q=80&w=1200",
    ],
    rating: "4.8",
    reviewCount: 142,
    activityType: "cultural",
    highlights: ["Jemaa el-Fnaa", "Atlas Mountains", "Camel Trek", "Desert Camp"],
    inclusions: ["5 Nights Stay", "Breakfast & Dinner", "Transport", "Local Guide"],
    exclusions: ["Flights", "Tips"],
    maxTravelers: 12,
    minTravelers: 2,
    operatorName: "Sahara Soul Tours",
    operatorEmail: "info@saharasoul.ma",
    operatorPhone: "+212 524 123456",
    availableDates: ["2026-10-15", "2026-11-10"],
    tier: "featured",
  },
];

// 6 distinct curated tours for "Personalized Recommendations" - different destinations
// and skewed toward unique/personalized experiences (safari, northern lights, etc.)
export const RECOMMENDED_TOURS: StaticTour[] = [
  {
    id: 101,
    title: "Iceland Northern Lights Quest",
    description:
      "Chase the aurora borealis across Iceland's volcanic landscapes, soak in the Blue Lagoon, and explore ice caves on this 5-day winter wonder.",
    destination: "Reykjavik, Iceland",
    duration: "5 Days",
    price: "2199.00",
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80&w=1200",
    galleryImages: [
      "https://images.unsplash.com/photo-1486944936320-044d441619f1?auto=format&fit=crop&q=80&w=1200",
    ],
    rating: "4.9",
    reviewCount: 98,
    activityType: "adventure",
    highlights: ["Aurora Hunt", "Blue Lagoon", "Golden Circle", "Ice Cave"],
    inclusions: ["4 Nights Hotel", "Tours", "Transport", "Guide"],
    exclusions: ["Flights", "Lunches"],
    maxTravelers: 14,
    minTravelers: 2,
    operatorName: "Arctic Wonders",
    operatorEmail: "info@arcticwonders.is",
    operatorPhone: "+354 555 1234",
    availableDates: ["2026-11-20", "2026-12-15"],
    recommendationReason: "Based on your love for unique nature experiences",
    tier: "recommended",
  },
  {
    id: 102,
    title: "Kenya Safari & Maasai Mara",
    description:
      "Witness the Great Migration and Africa's Big Five on a 7-day luxury safari through the Maasai Mara and Amboseli reserves.",
    destination: "Maasai Mara, Kenya",
    duration: "7 Days",
    price: "3450.00",
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1200",
    galleryImages: [
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1200",
    ],
    rating: "4.95",
    reviewCount: 76,
    activityType: "wildlife",
    highlights: ["Big Five Game Drive", "Great Migration", "Maasai Village", "Bush Dinner"],
    inclusions: ["6 Nights Lodge", "All Meals", "Game Drives", "Park Fees"],
    exclusions: ["Flights", "Visa"],
    maxTravelers: 8,
    minTravelers: 2,
    operatorName: "Savanna Soul Safaris",
    operatorEmail: "hello@savannasoul.ke",
    operatorPhone: "+254 700 123456",
    availableDates: ["2026-07-25", "2026-08-20"],
    recommendationReason: "Tailored to wildlife and luxury preferences",
    tier: "recommended",
  },
  {
    id: 103,
    title: "Peru Inca Trail to Machu Picchu",
    description:
      "Hike the classic 4-day Inca Trail to the lost city of Machu Picchu and explore the Sacred Valley of the Incas.",
    destination: "Cusco, Peru",
    duration: "8 Days",
    price: "2680.00",
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&q=80&w=1200",
    galleryImages: [
      "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?auto=format&fit=crop&q=80&w=1200",
    ],
    rating: "4.85",
    reviewCount: 132,
    activityType: "adventure",
    highlights: ["Inca Trail", "Machu Picchu", "Sacred Valley", "Cusco City"],
    inclusions: ["7 Nights Stay", "Permits", "Meals on Trail", "Guides"],
    exclusions: ["Flights", "Tips"],
    maxTravelers: 12,
    minTravelers: 4,
    operatorName: "Andean Roots Expeditions",
    operatorEmail: "info@andeanroots.pe",
    operatorPhone: "+51 84 123456",
    availableDates: ["2026-05-15", "2026-06-10"],
    recommendationReason: "Matches your adventure & history interests",
    tier: "recommended",
  },
  {
    id: 104,
    title: "Maldives Overwater Bliss",
    description:
      "Five days of overwater villa luxury — snorkel coral reefs, dine under the stars, and unwind in turquoise lagoons.",
    destination: "Malé Atoll, Maldives",
    duration: "5 Days",
    price: "2890.00",
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80&w=1200",
    galleryImages: [
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&q=80&w=1200",
    ],
    rating: "4.9",
    reviewCount: 87,
    activityType: "beach",
    highlights: ["Overwater Villa", "Reef Snorkel", "Sunset Dolphin Cruise", "Spa Day"],
    inclusions: ["4 Nights Villa", "Half-Board", "Transfers", "Snorkel Gear"],
    exclusions: ["Flights", "Dinners"],
    maxTravelers: 6,
    minTravelers: 2,
    operatorName: "Atoll Escapes",
    operatorEmail: "stay@atollescapes.mv",
    operatorPhone: "+960 333 1234",
    availableDates: ["2026-08-10", "2026-09-05"],
    recommendationReason: "Perfect getaway based on your romantic preferences",
    tier: "recommended",
  },
  {
    id: 105,
    title: "Tuscany Wine & Countryside",
    description:
      "Savor Italy at its finest — wine tastings in Chianti, cooking classes in Florence, and golden-hour drives through Tuscan villages.",
    destination: "Tuscany, Italy",
    duration: "6 Days",
    price: "1990.00",
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=80&w=1200",
    galleryImages: [
      "https://images.unsplash.com/photo-1499678329028-101435549a4e?auto=format&fit=crop&q=80&w=1200",
    ],
    rating: "4.85",
    reviewCount: 145,
    activityType: "culinary",
    highlights: ["Chianti Wine Tour", "Pasta Class", "San Gimignano", "Florence Walk"],
    inclusions: ["5 Nights Villa", "Breakfast", "2 Wine Tours", "Cooking Class"],
    exclusions: ["Flights", "Dinners"],
    maxTravelers: 10,
    minTravelers: 2,
    operatorName: "Bella Vita Tours",
    operatorEmail: "ciao@bellavita.it",
    operatorPhone: "+39 055 123456",
    availableDates: ["2026-09-20", "2026-10-12"],
    recommendationReason: "Curated for food & wine enthusiasts like you",
    tier: "recommended",
  },
  {
    id: 106,
    title: "New Zealand South Island Road Trip",
    description:
      "Drive through Middle-earth: fjords of Milford Sound, glaciers of the West Coast, and adventure capital Queenstown over 8 spectacular days.",
    destination: "South Island, New Zealand",
    duration: "8 Days",
    price: "2790.00",
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1200",
    galleryImages: [
      "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&q=80&w=1200",
    ],
    rating: "4.9",
    reviewCount: 102,
    activityType: "adventure",
    highlights: ["Milford Sound Cruise", "Franz Josef Glacier", "Queenstown", "Lake Tekapo"],
    inclusions: ["7 Nights Stay", "Rental Car", "Cruise", "Map & Guidebook"],
    exclusions: ["Flights", "Fuel"],
    maxTravelers: 4,
    minTravelers: 2,
    operatorName: "Kiwi Drive Tours",
    operatorEmail: "kiaora@kiwidrive.nz",
    operatorPhone: "+64 3 123 4567",
    availableDates: ["2026-02-10", "2026-03-05"],
    recommendationReason: "Hand-picked for road-trip and nature lovers",
    tier: "recommended",
  },
];
