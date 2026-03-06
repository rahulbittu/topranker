import { db } from "./db";
import { businesses, challengers, members } from "@shared/schema";
import { sql } from "drizzle-orm";
import bcrypt from "bcrypt";

const SEED_BUSINESSES = [
  { name: "Spice Garden", slug: "spice-garden-dallas", neighborhood: "Uptown", category: "restaurant", weightedScore: "4.720", rawAvgScore: "4.60", rankPosition: 1, rankDelta: 0, totalRatings: 312, description: "Thirty years of perfecting North Indian cuisine. The lamb biryani here has a cult following.", tags: "Biryani,Curry,Fine Dining", priceRange: "$$$", hours: "11:30am – 10:30pm", phone: "(214) 555-0192", address: "3821 Cedar Springs Rd, Uptown, Dallas", featuredDish: "Dum Pukht Lamb Biryani", isVerified: true },
  { name: "The Yard Kitchen", slug: "the-yard-kitchen-dallas", neighborhood: "Bishop Arts", category: "restaurant", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 2, rankDelta: 1, totalRatings: 287, description: "Farm-to-table restaurant in Bishop Arts District.", tags: "Farm-to-Table,Brunch,Seasonal", priceRange: "$$", hours: "8am – 10pm", phone: "(214) 555-0234", address: "402 N Bishop Ave, Bishop Arts, Dallas", featuredDish: "Heritage Pork Chop", isVerified: true },
  { name: "Lucky Cat Ramen", slug: "lucky-cat-ramen-dallas", neighborhood: "Deep Ellum", category: "restaurant", weightedScore: "4.510", rawAvgScore: "4.38", rankPosition: 3, rankDelta: -1, totalRatings: 198, description: "Authentic Japanese ramen with house-made noodles.", tags: "Ramen,Japanese,Noodles", priceRange: "$$", hours: "11am – 11pm", phone: "(214) 555-0345", address: "2815 Main St, Deep Ellum, Dallas", featuredDish: "Tonkotsu Ramen", isVerified: true },
  { name: "Smoke & Vine", slug: "smoke-and-vine-dallas", neighborhood: "Oak Lawn", category: "restaurant", weightedScore: "4.350", rawAvgScore: "4.20", rankPosition: 4, rankDelta: 2, totalRatings: 156, description: "Texas BBQ meets fine wine in this Oak Lawn gem.", tags: "BBQ,Wine,Texas", priceRange: "$$$", hours: "11am – 10pm", phone: "(214) 555-0456", address: "4011 Lemmon Ave, Oak Lawn, Dallas", featuredDish: "Brisket Board", isVerified: false },
  { name: "Abuela's Kitchen", slug: "abuelas-kitchen-dallas", neighborhood: "Oak Cliff", category: "restaurant", weightedScore: "4.280", rawAvgScore: "4.15", rankPosition: 5, rankDelta: 0, totalRatings: 234, description: "Three generations of Mexican recipes from Oaxaca.", tags: "Mexican,Authentic,Family", priceRange: "$", hours: "7am – 9pm", phone: "(214) 555-0567", address: "1234 Jefferson Blvd, Oak Cliff, Dallas", featuredDish: "Mole Negro", isVerified: true },
  { name: "Seoul Brothers", slug: "seoul-brothers-dallas", neighborhood: "Carrollton", category: "restaurant", weightedScore: "4.150", rawAvgScore: "4.00", rankPosition: 6, rankDelta: -2, totalRatings: 143, description: "Korean fusion with bold flavors in Carrollton.", tags: "Korean,Fusion,Grill", priceRange: "$$", hours: "11:30am – 10pm", phone: "(214) 555-0678", address: "2570 Old Denton Rd, Carrollton, Dallas", featuredDish: "Bulgogi Tacos", isVerified: false },

  { name: "Cultivar Coffee", slug: "cultivar-coffee-dallas", neighborhood: "East Dallas", category: "cafe", weightedScore: "4.650", rawAvgScore: "4.50", rankPosition: 1, rankDelta: 0, totalRatings: 189, description: "Single-origin pour-overs and house-roasted beans.", tags: "Pour-Over,Single Origin,Pastries", priceRange: "$$", hours: "6am – 6pm", phone: "(214) 555-0789", address: "313 N Bishop Ave, East Dallas, Dallas", featuredDish: "Ethiopian Yirgacheffe", isVerified: true },
  { name: "Houndstooth Coffee", slug: "houndstooth-coffee-dallas", neighborhood: "Henderson", category: "cafe", weightedScore: "4.520", rawAvgScore: "4.40", rankPosition: 2, rankDelta: 0, totalRatings: 167, description: "Specialty coffee bar with minimalist aesthetic.", tags: "Espresso,Latte Art,Minimal", priceRange: "$$", hours: "7am – 7pm", phone: "(214) 555-0890", address: "1900 N Henderson Ave, Henderson, Dallas", featuredDish: "Cortado", isVerified: true },
  { name: "The Brew Room", slug: "the-brew-room-dallas", neighborhood: "Uptown", category: "cafe", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 3, rankDelta: 1, totalRatings: 132, description: "Cozy Uptown cafe with craft coffee and pastries.", tags: "Coffee,Pastries,Cozy", priceRange: "$", hours: "6:30am – 5pm", phone: "(214) 555-0901", address: "2901 Thomas Ave, Uptown, Dallas", featuredDish: "Maple Oat Latte", isVerified: false },
  { name: "Mudleaf Coffee", slug: "mudleaf-coffee-dallas", neighborhood: "Oak Cliff", category: "cafe", weightedScore: "4.200", rawAvgScore: "4.10", rankPosition: 4, rankDelta: -1, totalRatings: 98, description: "Community-focused coffee shop in Oak Cliff.", tags: "Community,Local,Cold Brew", priceRange: "$", hours: "7am – 4pm", phone: "(214) 555-1012", address: "1621 W Davis St, Oak Cliff, Dallas", featuredDish: "Nitro Cold Brew", isVerified: false },
  { name: "Merit Coffee", slug: "merit-coffee-dallas", neighborhood: "Design District", category: "cafe", weightedScore: "4.100", rawAvgScore: "4.00", rankPosition: 5, rankDelta: 0, totalRatings: 76, description: "Texas-based specialty coffee roasters.", tags: "Specialty,Roastery,Matcha", priceRange: "$$", hours: "7am – 6pm", phone: "(214) 555-1123", address: "1445 Hi Line Dr, Design District, Dallas", featuredDish: "Oat Milk Matcha", isVerified: true },

  { name: "Taco Stop", slug: "taco-stop-dallas", neighborhood: "Oak Cliff", category: "street_food", weightedScore: "4.710", rawAvgScore: "4.55", rankPosition: 1, rankDelta: 0, totalRatings: 456, description: "Legendary street tacos — the al pastor is unreal.", tags: "Tacos,Al Pastor,Late Night", priceRange: "$", hours: "8am – 2am", phone: "(214) 555-1234", address: "2811 Greenville Ave, Oak Cliff, Dallas", featuredDish: "Al Pastor Taco", isVerified: true },
  { name: "Fuel City Tacos", slug: "fuel-city-tacos-dallas", neighborhood: "Riverfront", category: "street_food", weightedScore: "4.540", rawAvgScore: "4.40", rankPosition: 2, rankDelta: 0, totalRatings: 378, description: "Gas station tacos that are famous citywide.", tags: "Tacos,Gas Station,Iconic", priceRange: "$", hours: "24 hours", phone: "(214) 555-1345", address: "801 S Riverfront Blvd, Riverfront, Dallas", featuredDish: "Barbacoa Taco", isVerified: true },
  { name: "Elote Man", slug: "elote-man-dallas", neighborhood: "Pleasant Grove", category: "street_food", weightedScore: "4.320", rawAvgScore: "4.20", rankPosition: 3, rankDelta: 1, totalRatings: 189, description: "Mexican street corn done right.", tags: "Elote,Mexican,Street Cart", priceRange: "$", hours: "4pm – 10pm", phone: "(214) 555-1456", address: "Mobile - Pleasant Grove area", featuredDish: "Elote en Vaso", isVerified: false },
  { name: "Kabob King", slug: "kabob-king-dallas", neighborhood: "Richardson", category: "street_food", weightedScore: "4.180", rawAvgScore: "4.05", rankPosition: 4, rankDelta: -1, totalRatings: 145, description: "Pakistani-style seekh kabobs grilled fresh.", tags: "Kabobs,Pakistani,Grill", priceRange: "$", hours: "11am – 11pm", phone: "(214) 555-1567", address: "750 W Arapaho Rd, Richardson, Dallas", featuredDish: "Seekh Kabob Plate", isVerified: false },
  { name: "Chimmy's Churros", slug: "chimmys-churros-dallas", neighborhood: "Deep Ellum", category: "street_food", weightedScore: "4.050", rawAvgScore: "3.95", rankPosition: 5, rankDelta: 0, totalRatings: 112, description: "Fresh churros with creative dipping sauces.", tags: "Churros,Dessert,Sweet", priceRange: "$", hours: "12pm – 10pm", phone: "(214) 555-1678", address: "2737 Main St, Deep Ellum, Dallas", featuredDish: "Dulce de Leche Churro", isVerified: false },

  { name: "Midnight Rambler", slug: "midnight-rambler-dallas", neighborhood: "Downtown", category: "bar", weightedScore: "4.680", rawAvgScore: "4.55", rankPosition: 1, rankDelta: 0, totalRatings: 234, description: "Sophisticated cocktail bar in the Joule Hotel basement.", tags: "Cocktails,Speakeasy,Upscale", priceRange: "$$$", hours: "5pm – 2am", phone: "(214) 555-1789", address: "1530 Main St, Downtown, Dallas", featuredDish: "The Rambler Old Fashioned", isVerified: true },
  { name: "Atwater Alley", slug: "atwater-alley-dallas", neighborhood: "Deep Ellum", category: "bar", weightedScore: "4.450", rawAvgScore: "4.30", rankPosition: 2, rankDelta: 1, totalRatings: 198, description: "Craft beer and creative cocktails in Deep Ellum.", tags: "Craft Beer,Cocktails,Live Music", priceRange: "$$", hours: "4pm – 2am", phone: "(214) 555-1890", address: "2815 Elm St, Deep Ellum, Dallas", featuredDish: "Smoked Pineapple Mezcal", isVerified: true },
  { name: "The Grapevine Bar", slug: "the-grapevine-bar-dallas", neighborhood: "Greenville", category: "bar", weightedScore: "4.280", rawAvgScore: "4.15", rankPosition: 3, rankDelta: -1, totalRatings: 167, description: "Oldest bar in Dallas with classic dive bar vibes.", tags: "Dive Bar,Classic,Cheap Drinks", priceRange: "$", hours: "2pm – 2am", phone: "(214) 555-1901", address: "3902 Maple Ave, Greenville, Dallas", featuredDish: "Ice Cold Lone Star", isVerified: false },
  { name: "Javier's Cigar Bar", slug: "javiers-cigar-bar-dallas", neighborhood: "Knox-Henderson", category: "bar", weightedScore: "4.120", rawAvgScore: "4.00", rankPosition: 4, rankDelta: 0, totalRatings: 134, description: "Upscale cigar lounge with premium spirits.", tags: "Cigars,Spirits,Lounge", priceRange: "$$$", hours: "5pm – 1am", phone: "(214) 555-2012", address: "4912 Cole Ave, Knox-Henderson, Dallas", featuredDish: "Añejo Tequila Flight", isVerified: true },
  { name: "Lee Harvey's", slug: "lee-harveys-dallas", neighborhood: "Cedars", category: "bar", weightedScore: "3.950", rawAvgScore: "3.85", rankPosition: 5, rankDelta: 0, totalRatings: 189, description: "Iconic outdoor patio bar in the Cedars.", tags: "Patio,Live Music,Iconic", priceRange: "$", hours: "11am – 2am", phone: "(214) 555-2123", address: "1807 Gould St, Cedars, Dallas", featuredDish: "Frozen Margarita", isVerified: false },

  { name: "Village Baking Co.", slug: "village-baking-co-dallas", neighborhood: "Greenville", category: "bakery", weightedScore: "4.730", rawAvgScore: "4.60", rankPosition: 1, rankDelta: 0, totalRatings: 267, description: "Artisan sourdough and French pastries.", tags: "Sourdough,French,Artisan", priceRange: "$$", hours: "7am – 5pm", phone: "(214) 555-2234", address: "2009 Greenville Ave, Greenville, Dallas", featuredDish: "Country Sourdough", isVerified: true },
  { name: "La Casita Bakeshop", slug: "la-casita-bakeshop-dallas", neighborhood: "Oak Cliff", category: "bakery", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 2, rankDelta: 0, totalRatings: 198, description: "Mexican-inspired pastries and traditional conchas.", tags: "Mexican,Conchas,Pan Dulce", priceRange: "$", hours: "6am – 3pm", phone: "(214) 555-2345", address: "1522 W Davis St, Oak Cliff, Dallas", featuredDish: "Tres Leches Concha", isVerified: true },
  { name: "Bisous Bisous Pâtisserie", slug: "bisous-bisous-patisserie-dallas", neighborhood: "Knox-Henderson", category: "bakery", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 3, rankDelta: 1, totalRatings: 156, description: "French macaron specialists with seasonal flavors.", tags: "Macarons,French,Dessert", priceRange: "$$", hours: "8am – 6pm", phone: "(214) 555-2456", address: "3809 McKinney Ave, Knox-Henderson, Dallas", featuredDish: "Lavender Macaron", isVerified: false },
  { name: "Empire Baking Co.", slug: "empire-baking-co-dallas", neighborhood: "East Dallas", category: "bakery", weightedScore: "4.200", rawAvgScore: "4.10", rankPosition: 4, rankDelta: -1, totalRatings: 132, description: "Dallas staple for bread and celebration cakes.", tags: "Bread,Cakes,Classic", priceRange: "$$", hours: "7am – 6pm", phone: "(214) 555-2567", address: "5450 W Lovers Lane, East Dallas, Dallas", featuredDish: "Rosemary Olive Oil Loaf", isVerified: true },
  { name: "Haute Sweets Patisserie", slug: "haute-sweets-patisserie-dallas", neighborhood: "Bishop Arts", category: "bakery", weightedScore: "4.050", rawAvgScore: "3.95", rankPosition: 5, rankDelta: 0, totalRatings: 89, description: "Avant-garde desserts and sculptural pastries.", tags: "Desserts,Art,Modern", priceRange: "$$$", hours: "10am – 7pm", phone: "(214) 555-2678", address: "414 W Davis St, Bishop Arts, Dallas", featuredDish: "Galaxy Mirror Glaze Cake", isVerified: false },

  { name: "Raising Cane's", slug: "raising-canes-dallas", neighborhood: "Greenville", category: "fast_food", weightedScore: "4.420", rawAvgScore: "4.30", rankPosition: 1, rankDelta: 0, totalRatings: 523, description: "One love — chicken fingers, crinkle fries, Texas toast, and that sauce.", tags: "Chicken,Drive-Thru,Quick", priceRange: "$", hours: "10am – 12am", phone: "(214) 555-2789", address: "5809 Greenville Ave, Greenville, Dallas", featuredDish: "The Box Combo", isVerified: true },
  { name: "Whataburger", slug: "whataburger-dallas", neighborhood: "Multiple", category: "fast_food", weightedScore: "4.280", rawAvgScore: "4.15", rankPosition: 2, rankDelta: 0, totalRatings: 678, description: "Texas institution. The honey butter chicken biscuit is legendary.", tags: "Burgers,Texas,24hr", priceRange: "$", hours: "24 hours", phone: "(214) 555-2890", address: "Multiple locations, Dallas", featuredDish: "Honey Butter Chicken Biscuit", isVerified: true },
  { name: "In-N-Out Burger", slug: "in-n-out-burger-dallas", neighborhood: "Uptown", category: "fast_food", weightedScore: "4.150", rawAvgScore: "4.00", rankPosition: 3, rankDelta: 1, totalRatings: 445, description: "California import that Dallas can't get enough of.", tags: "Burgers,Fresh,Secret Menu", priceRange: "$", hours: "10:30am – 1am", phone: "(214) 555-2901", address: "3500 McKinney Ave, Uptown, Dallas", featuredDish: "Double-Double Animal Style", isVerified: true },
  { name: "Wingstop", slug: "wingstop-dallas-hq", neighborhood: "Addison", category: "fast_food", weightedScore: "3.980", rawAvgScore: "3.85", rankPosition: 4, rankDelta: -1, totalRatings: 312, description: "Dallas-born wing chain — the original HQ location.", tags: "Wings,Dallas Original,Flavors", priceRange: "$", hours: "11am – 12am", phone: "(214) 555-3012", address: "5501 LBJ Freeway, Addison, Dallas", featuredDish: "Lemon Pepper Wings", isVerified: true },
  { name: "Taco Bell Cantina", slug: "taco-bell-cantina-dallas", neighborhood: "Deep Ellum", category: "fast_food", weightedScore: "3.820", rawAvgScore: "3.70", rankPosition: 5, rankDelta: 0, totalRatings: 201, description: "The elevated Taco Bell experience with booze.", tags: "Tacos,Late Night,Cantina", priceRange: "$", hours: "10am – 2am", phone: "(214) 555-3123", address: "2649 Main St, Deep Ellum, Dallas", featuredDish: "Crunchwrap Supreme", isVerified: false },
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
        weightedScore: biz.weightedScore,
        rawAvgScore: biz.rawAvgScore,
        rankPosition: biz.rankPosition,
        rankDelta: biz.rankDelta,
        totalRatings: biz.totalRatings,
        description: biz.description,
        tags: biz.tags,
        priceRange: biz.priceRange,
        hours: biz.hours,
        featuredDish: biz.featuredDish,
        isVerified: biz.isVerified,
        isActive: true,
      })
      .returning();
    insertedBusinesses.push(inserted);
  }

  console.log(`Seeded ${insertedBusinesses.length} businesses`);

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
    credibilityTier: "regular",
    totalRatings: 8,
    totalCategories: 2,
    isFoundingMember: false,
    joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  });

  console.log("Seeded demo member: alex@demo.com / demo123");
  console.log("Database seeding complete!");
}
