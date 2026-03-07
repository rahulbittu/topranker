import { db } from "./db";
import { businesses, challengers, members, dishes, businessPhotos } from "@shared/schema";
import { sql } from "drizzle-orm";
import bcrypt from "bcrypt";

const SEED_BUSINESSES = [
  { name: "Spice Garden", slug: "spice-garden-dallas", neighborhood: "Uptown", category: "restaurant", weightedScore: "4.720", rawAvgScore: "4.60", rankPosition: 1, rankDelta: 0, totalRatings: 312, description: "Thirty years of perfecting North Indian cuisine.", priceRange: "$$$", phone: "(214) 555-0192", address: "3821 Cedar Springs Rd, Uptown, Dallas", lat: "32.8087452", lng: "-96.8024537", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop" },
  { name: "The Yard Kitchen", slug: "the-yard-kitchen-dallas", neighborhood: "Bishop Arts", category: "restaurant", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 2, rankDelta: 1, totalRatings: 287, description: "Farm-to-table restaurant in Bishop Arts District.", priceRange: "$$", phone: "(214) 555-0234", address: "402 N Bishop Ave, Bishop Arts, Dallas", lat: "32.7505612", lng: "-96.8267483", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop" },
  { name: "Lucky Cat Ramen", slug: "lucky-cat-ramen-dallas", neighborhood: "Deep Ellum", category: "restaurant", weightedScore: "4.510", rawAvgScore: "4.38", rankPosition: 3, rankDelta: -1, totalRatings: 198, description: "Authentic Japanese ramen with house-made noodles.", priceRange: "$$", phone: "(214) 555-0345", address: "2815 Main St, Deep Ellum, Dallas", lat: "32.7833148", lng: "-96.7836459", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop" },
  { name: "Smoke & Vine", slug: "smoke-and-vine-dallas", neighborhood: "Oak Lawn", category: "restaurant", weightedScore: "4.350", rawAvgScore: "4.20", rankPosition: 4, rankDelta: 2, totalRatings: 156, description: "Texas BBQ meets fine wine in this Oak Lawn gem.", priceRange: "$$$", phone: "(214) 555-0456", address: "4011 Lemmon Ave, Oak Lawn, Dallas", lat: "32.8118523", lng: "-96.8200134", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
  { name: "Abuela's Kitchen", slug: "abuelas-kitchen-dallas", neighborhood: "Oak Cliff", category: "restaurant", weightedScore: "4.280", rawAvgScore: "4.15", rankPosition: 5, rankDelta: 0, totalRatings: 234, description: "Three generations of Mexican recipes from Oaxaca.", priceRange: "$", phone: "(214) 555-0567", address: "1234 Jefferson Blvd, Oak Cliff, Dallas", lat: "32.7453102", lng: "-96.8312487", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1653005753991-22a8bf831f89?w=600&h=400&fit=crop" },
  { name: "Seoul Brothers", slug: "seoul-brothers-dallas", neighborhood: "Carrollton", category: "restaurant", weightedScore: "4.150", rawAvgScore: "4.00", rankPosition: 6, rankDelta: -2, totalRatings: 143, description: "Korean fusion with bold flavors in Carrollton.", priceRange: "$$", phone: "(214) 555-0678", address: "2570 Old Denton Rd, Carrollton, Dallas", lat: "32.9537482", lng: "-96.8903456", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&h=400&fit=crop" },
  { name: "Pecan Lodge", slug: "pecan-lodge-dallas", neighborhood: "Deep Ellum", category: "restaurant", weightedScore: "4.050", rawAvgScore: "3.95", rankPosition: 7, rankDelta: 0, totalRatings: 523, description: "The most decorated BBQ joint in Dallas history.", priceRange: "$$", phone: "(214) 555-0948", address: "2702 Main St, Deep Ellum, Dallas", lat: "32.7844523", lng: "-96.7842178", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
  { name: "Lucia", slug: "lucia-dallas", neighborhood: "Bishop Arts", category: "restaurant", weightedScore: "3.920", rawAvgScore: "3.85", rankPosition: 8, rankDelta: 1, totalRatings: 167, description: "Chef David Uygur's intimate Italian-inspired dining room.", priceRange: "$$$$", phone: "(214) 555-0666", address: "408 W 8th St, Bishop Arts, Dallas", lat: "32.7494123", lng: "-96.8276789", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop" },
  { name: "Khao Noodle Shop", slug: "khao-noodle-dallas", neighborhood: "Lowest Greenville", category: "restaurant", weightedScore: "3.800", rawAvgScore: "3.75", rankPosition: 9, rankDelta: -1, totalRatings: 154, description: "Northern Thai street food with zero compromise.", priceRange: "$$", phone: "(214) 555-0887", address: "4812 Bryan St, Lowest Greenville, Dallas", lat: "32.7908432", lng: "-96.7712345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1552611052-33e04de1b100?w=600&h=400&fit=crop" },
  { name: "Fearing's", slug: "fearings-dallas", neighborhood: "Uptown", category: "restaurant", weightedScore: "3.680", rawAvgScore: "3.60", rankPosition: 10, rankDelta: 0, totalRatings: 178, description: "Dean Fearing's flagship inside the Ritz-Carlton.", priceRange: "$$$$", phone: "(214) 555-0220", address: "2121 McKinney Ave, Uptown, Dallas", lat: "32.7978432", lng: "-96.8012345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=600&h=400&fit=crop" },

  { name: "Cultivar Coffee", slug: "cultivar-coffee-dallas", neighborhood: "East Dallas", category: "cafe", weightedScore: "4.650", rawAvgScore: "4.50", rankPosition: 1, rankDelta: 0, totalRatings: 189, description: "Single-origin pour-overs and house-roasted beans.", priceRange: "$$", phone: "(214) 555-0789", address: "313 N Bishop Ave, East Dallas, Dallas", lat: "32.7932145", lng: "-96.7645321", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop" },
  { name: "Houndstooth Coffee", slug: "houndstooth-coffee-dallas", neighborhood: "Henderson", category: "cafe", weightedScore: "4.520", rawAvgScore: "4.40", rankPosition: 2, rankDelta: 0, totalRatings: 167, description: "Specialty coffee bar with minimalist aesthetic.", priceRange: "$$", phone: "(214) 555-0890", address: "1900 N Henderson Ave, Henderson, Dallas", lat: "32.7998765", lng: "-96.7789012", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop" },
  { name: "The Brew Room", slug: "the-brew-room-dallas", neighborhood: "Uptown", category: "cafe", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 3, rankDelta: 1, totalRatings: 132, description: "Cozy Uptown cafe with craft coffee and pastries.", priceRange: "$", phone: "(214) 555-0901", address: "2901 Thomas Ave, Uptown, Dallas", lat: "32.8012345", lng: "-96.7976543", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=600&h=400&fit=crop" },
  { name: "Mudleaf Coffee", slug: "mudleaf-coffee-dallas", neighborhood: "Oak Cliff", category: "cafe", weightedScore: "4.200", rawAvgScore: "4.10", rankPosition: 4, rankDelta: -1, totalRatings: 98, description: "Community-focused coffee shop in Oak Cliff.", priceRange: "$", phone: "(214) 555-1012", address: "1621 W Davis St, Oak Cliff, Dallas", lat: "32.7489012", lng: "-96.8345678", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop" },
  { name: "Merit Coffee", slug: "merit-coffee-dallas", neighborhood: "Design District", category: "cafe", weightedScore: "4.100", rawAvgScore: "4.00", rankPosition: 5, rankDelta: 0, totalRatings: 76, description: "Texas-based specialty coffee roasters.", priceRange: "$$", phone: "(214) 555-1123", address: "1445 Hi Line Dr, Design District, Dallas", lat: "32.7856789", lng: "-96.8123456", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop" },

  { name: "Taco Stop", slug: "taco-stop-dallas", neighborhood: "Oak Cliff", category: "street_food", weightedScore: "4.710", rawAvgScore: "4.55", rankPosition: 1, rankDelta: 0, totalRatings: 456, description: "Legendary street tacos — the al pastor is unreal.", priceRange: "$", phone: "(214) 555-1234", address: "2811 Greenville Ave, Oak Cliff, Dallas", lat: "32.7423456", lng: "-96.8378901", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
  { name: "Fuel City Tacos", slug: "fuel-city-tacos-dallas", neighborhood: "Riverfront", category: "street_food", weightedScore: "4.540", rawAvgScore: "4.40", rankPosition: 2, rankDelta: 0, totalRatings: 378, description: "Gas station tacos that are famous citywide.", priceRange: "$", phone: "(214) 555-1345", address: "801 S Riverfront Blvd, Riverfront, Dallas", lat: "32.7701234", lng: "-96.8178901", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop" },
  { name: "Elote Man", slug: "elote-man-dallas", neighborhood: "Pleasant Grove", category: "street_food", weightedScore: "4.320", rawAvgScore: "4.20", rankPosition: 3, rankDelta: 1, totalRatings: 189, description: "Mexican street corn done right.", priceRange: "$", phone: "(214) 555-1456", address: "Mobile - Pleasant Grove area", lat: "32.7234567", lng: "-96.7456789", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=600&h=400&fit=crop" },
  { name: "Kabob King", slug: "kabob-king-dallas", neighborhood: "Richardson", category: "street_food", weightedScore: "4.180", rawAvgScore: "4.05", rankPosition: 4, rankDelta: -1, totalRatings: 145, description: "Pakistani-style seekh kabobs grilled fresh.", priceRange: "$", phone: "(214) 555-1567", address: "750 W Arapaho Rd, Richardson, Dallas", lat: "32.9512345", lng: "-96.7534567", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop" },
  { name: "Chimmy's Churros", slug: "chimmys-churros-dallas", neighborhood: "Deep Ellum", category: "street_food", weightedScore: "4.050", rawAvgScore: "3.95", rankPosition: 5, rankDelta: 0, totalRatings: 112, description: "Fresh churros with creative dipping sauces.", priceRange: "$", phone: "(214) 555-1678", address: "2737 Main St, Deep Ellum, Dallas", lat: "32.7834567", lng: "-96.7823456", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&h=400&fit=crop" },

  { name: "Midnight Rambler", slug: "midnight-rambler-dallas", neighborhood: "Downtown", category: "bar", weightedScore: "4.680", rawAvgScore: "4.55", rankPosition: 1, rankDelta: 0, totalRatings: 234, description: "Sophisticated cocktail bar in the Joule Hotel basement.", priceRange: "$$$", phone: "(214) 555-1789", address: "1530 Main St, Downtown, Dallas", lat: "32.7812345", lng: "-96.7967890", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop" },
  { name: "Atwater Alley", slug: "atwater-alley-dallas", neighborhood: "Deep Ellum", category: "bar", weightedScore: "4.450", rawAvgScore: "4.30", rankPosition: 2, rankDelta: 1, totalRatings: 198, description: "Craft beer and creative cocktails in Deep Ellum.", priceRange: "$$", phone: "(214) 555-1890", address: "2815 Elm St, Deep Ellum, Dallas", lat: "32.7823456", lng: "-96.7834567", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop" },
  { name: "The Grapevine Bar", slug: "the-grapevine-bar-dallas", neighborhood: "Greenville", category: "bar", weightedScore: "4.280", rawAvgScore: "4.15", rankPosition: 3, rankDelta: -1, totalRatings: 167, description: "Oldest bar in Dallas with classic dive bar vibes.", priceRange: "$", phone: "(214) 555-1901", address: "3902 Maple Ave, Greenville, Dallas", lat: "32.8134567", lng: "-96.8123456", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&h=400&fit=crop" },
  { name: "Javier's Cigar Bar", slug: "javiers-cigar-bar-dallas", neighborhood: "Knox-Henderson", category: "bar", weightedScore: "4.120", rawAvgScore: "4.00", rankPosition: 4, rankDelta: 0, totalRatings: 134, description: "Upscale cigar lounge with premium spirits.", priceRange: "$$$", phone: "(214) 555-2012", address: "4912 Cole Ave, Knox-Henderson, Dallas", lat: "32.8212345", lng: "-96.7912345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=600&h=400&fit=crop" },
  { name: "Lee Harvey's", slug: "lee-harveys-dallas", neighborhood: "Cedars", category: "bar", weightedScore: "3.950", rawAvgScore: "3.85", rankPosition: 5, rankDelta: 0, totalRatings: 189, description: "Iconic outdoor patio bar in the Cedars.", priceRange: "$", phone: "(214) 555-2123", address: "1807 Gould St, Cedars, Dallas", lat: "32.7723456", lng: "-96.7923456", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1538488881038-e252a119ace7?w=600&h=400&fit=crop" },

  { name: "Village Baking Co.", slug: "village-baking-co-dallas", neighborhood: "Greenville", category: "bakery", weightedScore: "4.730", rawAvgScore: "4.60", rankPosition: 1, rankDelta: 0, totalRatings: 267, description: "Artisan sourdough and French pastries.", priceRange: "$$", phone: "(214) 555-2234", address: "2009 Greenville Ave, Greenville, Dallas", lat: "32.8012345", lng: "-96.7712345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" },
  { name: "La Casita Bakeshop", slug: "la-casita-bakeshop-dallas", neighborhood: "Oak Cliff", category: "bakery", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 2, rankDelta: 0, totalRatings: 198, description: "Mexican-inspired pastries and traditional conchas.", priceRange: "$", phone: "(214) 555-2345", address: "1522 W Davis St, Oak Cliff, Dallas", lat: "32.7489012", lng: "-96.8334567", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop" },
  { name: "Bisous Bisous", slug: "bisous-bisous-patisserie-dallas", neighborhood: "Knox-Henderson", category: "bakery", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 3, rankDelta: 1, totalRatings: 156, description: "French macaron specialists with seasonal flavors.", priceRange: "$$", phone: "(214) 555-2456", address: "3809 McKinney Ave, Knox-Henderson, Dallas", lat: "32.8112345", lng: "-96.7934567", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1612203985729-70726954388c?w=600&h=400&fit=crop" },
  { name: "Empire Baking Co.", slug: "empire-baking-co-dallas", neighborhood: "East Dallas", category: "bakery", weightedScore: "4.200", rawAvgScore: "4.10", rankPosition: 4, rankDelta: -1, totalRatings: 132, description: "Dallas staple for bread and celebration cakes.", priceRange: "$$", phone: "(214) 555-2567", address: "5450 W Lovers Lane, East Dallas, Dallas", lat: "32.8534567", lng: "-96.7812345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&h=400&fit=crop" },
  { name: "Haute Sweets", slug: "haute-sweets-patisserie-dallas", neighborhood: "Bishop Arts", category: "bakery", weightedScore: "4.050", rawAvgScore: "3.95", rankPosition: 5, rankDelta: 0, totalRatings: 89, description: "Avant-garde desserts and sculptural pastries.", priceRange: "$$$", phone: "(214) 555-2678", address: "414 W Davis St, Bishop Arts, Dallas", lat: "32.7494123", lng: "-96.8278901", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop" },

  { name: "Raising Cane's", slug: "raising-canes-dallas", neighborhood: "Greenville", category: "fast_food", weightedScore: "4.420", rawAvgScore: "4.30", rankPosition: 1, rankDelta: 0, totalRatings: 523, description: "One love — chicken fingers, crinkle fries, Texas toast, and that sauce.", priceRange: "$", phone: "(214) 555-2789", address: "5809 Greenville Ave, Greenville, Dallas", lat: "32.8612345", lng: "-96.7712345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop" },
  { name: "Whataburger", slug: "whataburger-dallas", neighborhood: "Multiple", category: "fast_food", weightedScore: "4.280", rawAvgScore: "4.15", rankPosition: 2, rankDelta: 0, totalRatings: 678, description: "Texas institution. The honey butter chicken biscuit is legendary.", priceRange: "$", phone: "(214) 555-2890", address: "Multiple locations, Dallas", lat: "32.7767000", lng: "-96.7970000", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
  { name: "In-N-Out Burger", slug: "in-n-out-burger-dallas", neighborhood: "Uptown", category: "fast_food", weightedScore: "4.150", rawAvgScore: "4.00", rankPosition: 3, rankDelta: 1, totalRatings: 445, description: "California import that Dallas can't get enough of.", priceRange: "$", phone: "(214) 555-2901", address: "3500 McKinney Ave, Uptown, Dallas", lat: "32.8112345", lng: "-96.8012345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop" },
  { name: "Wingstop", slug: "wingstop-dallas-hq", neighborhood: "Addison", category: "fast_food", weightedScore: "3.980", rawAvgScore: "3.85", rankPosition: 4, rankDelta: -1, totalRatings: 312, description: "Dallas-born wing chain — the original HQ location.", priceRange: "$", phone: "(214) 555-3012", address: "5501 LBJ Freeway, Addison, Dallas", lat: "32.9512345", lng: "-96.8312345", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&h=400&fit=crop" },
  { name: "Taco Bell Cantina", slug: "taco-bell-cantina-dallas", neighborhood: "Deep Ellum", category: "fast_food", weightedScore: "3.820", rawAvgScore: "3.70", rankPosition: 5, rankDelta: 0, totalRatings: 201, description: "The elevated Taco Bell experience with booze.", priceRange: "$", phone: "(214) 555-3123", address: "2649 Main St, Deep Ellum, Dallas", lat: "32.7843210", lng: "-96.7854321", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&h=400&fit=crop" },
];

const SEED_DISHES: { businessSlug: string; dishes: { name: string; voteCount: number }[] }[] = [
  { businessSlug: "spice-garden-dallas", dishes: [
    { name: "Dum Pukht Lamb Biryani", voteCount: 87 },
    { name: "Butter Chicken", voteCount: 54 },
    { name: "Garlic Naan", voteCount: 32 },
  ]},
  { businessSlug: "the-yard-kitchen-dallas", dishes: [
    { name: "Heritage Pork Chop", voteCount: 65 },
    { name: "Smoked Brisket Mac", voteCount: 42 },
  ]},
  { businessSlug: "lucky-cat-ramen-dallas", dishes: [
    { name: "Tonkotsu Ramen", voteCount: 78 },
    { name: "Spicy Miso Ramen", voteCount: 45 },
    { name: "Gyoza", voteCount: 29 },
  ]},
  { businessSlug: "taco-stop-dallas", dishes: [
    { name: "Al Pastor Taco", voteCount: 134 },
    { name: "Barbacoa Taco", voteCount: 89 },
    { name: "Carnitas Taco", voteCount: 67 },
  ]},
  { businessSlug: "midnight-rambler-dallas", dishes: [
    { name: "The Rambler Old Fashioned", voteCount: 98 },
    { name: "Mezcal Negroni", voteCount: 56 },
  ]},
  { businessSlug: "village-baking-co-dallas", dishes: [
    { name: "Country Sourdough", voteCount: 112 },
    { name: "Pain au Chocolat", voteCount: 67 },
    { name: "Almond Croissant", voteCount: 45 },
  ]},
  { businessSlug: "cultivar-coffee-dallas", dishes: [
    { name: "Ethiopian Yirgacheffe", voteCount: 76 },
    { name: "Oat Milk Cortado", voteCount: 54 },
  ]},
  { businessSlug: "raising-canes-dallas", dishes: [
    { name: "The Box Combo", voteCount: 156 },
    { name: "Extra Cane's Sauce", voteCount: 89 },
  ]},
];

export async function seedDatabase() {
  console.log("Seeding database...");

  const existingBusinesses = await db.select({ id: businesses.id }).from(businesses).limit(1);
  if (existingBusinesses.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  const insertedBusinesses = [];
  for (const biz of SEED_BUSINESSES) {
    const [inserted] = await db
      .insert(businesses)
      .values({
        name: biz.name,
        slug: biz.slug,
        category: biz.category,
        city: "Dallas",
        neighborhood: biz.neighborhood,
        address: biz.address,
        phone: biz.phone,
        lat: biz.lat,
        lng: biz.lng,
        weightedScore: biz.weightedScore,
        rawAvgScore: biz.rawAvgScore,
        rankPosition: biz.rankPosition,
        rankDelta: biz.rankDelta,
        totalRatings: biz.totalRatings,
        description: biz.description,
        priceRange: biz.priceRange,
        isOpenNow: biz.isOpenNow,
        photoUrl: biz.photoUrl || null,
        isActive: true,
        dataSource: "admin",
      })
      .returning();
    insertedBusinesses.push(inserted);
  }

  console.log(`Seeded ${insertedBusinesses.length} businesses`);

  // Seed businessPhotos table with multiple photos per business
  const photoSets: Record<string, string[]> = {
    "spice-garden-dallas": [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=400&fit=crop",
    ],
    "the-yard-kitchen-dallas": [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop",
    ],
    "lucky-cat-ramen-dallas": [
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=600&h=400&fit=crop",
    ],
    "smoke-and-vine-dallas": [
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=400&fit=crop",
    ],
    "abuelas-kitchen-dallas": [
      "https://images.unsplash.com/photo-1653005753991-22a8bf831f89?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop",
    ],
    "seoul-brothers-dallas": [
      "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&h=400&fit=crop",
    ],
    "pecan-lodge-dallas": [
      "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=400&fit=crop",
    ],
    "lucia-dallas": [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop",
    ],
    "khao-noodle-dallas": [
      "https://images.unsplash.com/photo-1552611052-33e04de1b100?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600&h=400&fit=crop",
    ],
    "fearings-dallas": [
      "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
    ],
    "cultivar-coffee-dallas": [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop",
    ],
    "houndstooth-coffee-dallas": [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=600&h=400&fit=crop",
    ],
    "the-brew-room-dallas": [
      "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop",
    ],
    "mudleaf-coffee-dallas": [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop",
    ],
    "merit-coffee-dallas": [
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop",
    ],
    "taco-stop-dallas": [
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=600&h=400&fit=crop",
    ],
    "fuel-city-tacos-dallas": [
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&h=400&fit=crop",
    ],
    "elote-man-dallas": [
      "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop",
    ],
    "kabob-king-dallas": [
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop",
    ],
    "chimmys-churros-dallas": [
      "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop",
    ],
    "midnight-rambler-dallas": [
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&h=400&fit=crop",
    ],
    "atwater-alley-dallas": [
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=600&h=400&fit=crop",
    ],
    "the-grapevine-bar-dallas": [
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1538488881038-e252a119ace7?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop",
    ],
    "javiers-cigar-bar-dallas": [
      "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&h=400&fit=crop",
    ],
    "lee-harveys-dallas": [
      "https://images.unsplash.com/photo-1538488881038-e252a119ace7?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop",
    ],
    "village-baking-co-dallas": [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1612203985729-70726954388c?w=600&h=400&fit=crop",
    ],
    "la-casita-bakeshop-dallas": [
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop",
    ],
    "bisous-bisous-patisserie-dallas": [
      "https://images.unsplash.com/photo-1612203985729-70726954388c?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop",
    ],
    "empire-baking-co-dallas": [
      "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1612203985729-70726954388c?w=600&h=400&fit=crop",
    ],
    "haute-sweets-patisserie-dallas": [
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1612203985729-70726954388c?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop",
    ],
    "raising-canes-dallas": [
      "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop",
    ],
    "whataburger-dallas": [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&h=400&fit=crop",
    ],
    "in-n-out-burger-dallas": [
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop",
    ],
    "wingstop-dallas-hq": [
      "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop",
    ],
    "taco-bell-cantina-dallas": [
      "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop",
    ],
  };

  let photoCount = 0;
  for (const biz of insertedBusinesses) {
    const photos = photoSets[biz.slug] || (biz.photoUrl ? [biz.photoUrl] : []);
    for (let i = 0; i < photos.length; i++) {
      await db.insert(businessPhotos).values({
        businessId: biz.id,
        photoUrl: photos[i],
        isHero: i === 0,
        sortOrder: i,
      });
      photoCount++;
    }
  }
  console.log(`Seeded ${photoCount} business photos`);

  for (const dishGroup of SEED_DISHES) {
    const biz = insertedBusinesses.find((b) => b.slug === dishGroup.businessSlug);
    if (!biz) continue;
    for (const dish of dishGroup.dishes) {
      await db.insert(dishes).values({
        businessId: biz.id,
        name: dish.name,
        nameNormalized: dish.name.toLowerCase().trim(),
        suggestedBy: "community",
        voteCount: dish.voteCount,
      });
    }
  }

  console.log("Seeded dishes");

  const spiceGarden = insertedBusinesses.find((b) => b.slug === "spice-garden-dallas");
  const yardKitchen = insertedBusinesses.find((b) => b.slug === "the-yard-kitchen-dallas");
  const luckyCat = insertedBusinesses.find((b) => b.slug === "lucky-cat-ramen-dallas");
  const cultivar = insertedBusinesses.find((b) => b.slug === "cultivar-coffee-dallas");

  if (spiceGarden && yardKitchen) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 18);

    await db.insert(challengers).values({
      challengerId: yardKitchen.id,
      defenderId: spiceGarden.id,
      category: "restaurant",
      city: "Dallas",
      entryFeePaid: true,
      startDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      endDate,
      challengerWeightedVotes: "1847.500",
      defenderWeightedVotes: "2234.800",
      totalVotes: 142,
      status: "active",
    });

    await db
      .update(businesses)
      .set({ inChallenger: true })
      .where(sql`${businesses.id} IN (${spiceGarden.id}, ${yardKitchen.id})`);

    console.log("Seeded challenger: Spice Garden vs The Yard Kitchen");
  }

  if (cultivar && luckyCat) {
    const endDate2 = new Date();
    endDate2.setDate(endDate2.getDate() + 25);

    await db.insert(challengers).values({
      challengerId: luckyCat.id,
      defenderId: cultivar.id,
      category: "cafe",
      city: "Dallas",
      entryFeePaid: true,
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: endDate2,
      challengerWeightedVotes: "892.300",
      defenderWeightedVotes: "1156.700",
      totalVotes: 78,
      status: "active",
    });

    console.log("Seeded challenger: Cultivar Coffee vs Lucky Cat Ramen");
  }

  const demoPassword = await bcrypt.hash("demo123", 10);
  await db.insert(members).values({
    displayName: "Alex Chen",
    username: "alexchen",
    email: "alex@demo.com",
    password: demoPassword,
    city: "Dallas",
    credibilityScore: 142,
    credibilityTier: "city",
    totalRatings: 12,
    totalCategories: 3,
    distinctBusinesses: 8,
    ratingVariance: "1.200",
    isFoundingMember: false,
    joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  });

  console.log("Seeded demo member: alex@demo.com / demo123");
  console.log("Database seeding complete!");
}
