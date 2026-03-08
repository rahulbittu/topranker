/**
 * Multi-City Seed Script
 * Owner: Priya Sharma (Backend Architect) + Cole (City Growth Lead)
 *
 * Seeds Austin, Houston, San Antonio, and Fort Worth with realistic businesses.
 * Run this AFTER the main seed has populated Dallas.
 * Usage: npx tsx server/seed-cities.ts
 */

import { db } from "./db";
import { businesses } from "@shared/schema";

interface SeedBusiness {
  name: string;
  slug: string;
  city: string;
  neighborhood: string;
  category: string;
  weightedScore: string;
  rawAvgScore: string;
  rankPosition: number;
  rankDelta: number;
  totalRatings: number;
  description: string;
  priceRange: string;
  phone: string;
  address: string;
  lat: string;
  lng: string;
  isOpenNow: boolean;
  photoUrl: string;
}

const AUSTIN_BUSINESSES: SeedBusiness[] = [
  { name: "Franklin Barbecue", slug: "franklin-barbecue-austin", city: "Austin", neighborhood: "East Austin", category: "restaurant", weightedScore: "4.850", rawAvgScore: "4.75", rankPosition: 1, rankDelta: 0, totalRatings: 678, description: "The most famous BBQ in Texas. Worth the 4-hour wait.", priceRange: "$$", phone: "(512) 653-1187", address: "900 E 11th St, Austin, TX", lat: "30.2701", lng: "-97.7267", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
  { name: "Uchi", slug: "uchi-austin", city: "Austin", neighborhood: "South Lamar", category: "restaurant", weightedScore: "4.720", rawAvgScore: "4.60", rankPosition: 2, rankDelta: 0, totalRatings: 445, description: "James Beard-winning Japanese farmhouse dining.", priceRange: "$$$$", phone: "(512) 916-4808", address: "801 S Lamar Blvd, Austin, TX", lat: "30.2561", lng: "-97.7628", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop" },
  { name: "Torchy's Tacos", slug: "torchys-tacos-austin", city: "Austin", neighborhood: "South Congress", category: "street_food", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 1, rankDelta: 0, totalRatings: 567, description: "Damn good tacos. The Trailer Park is legendary.", priceRange: "$", phone: "(512) 366-0537", address: "1311 S 1st St, Austin, TX", lat: "30.2502", lng: "-97.7540", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
  { name: "Salt Lick BBQ", slug: "salt-lick-bbq-austin", city: "Austin", neighborhood: "Driftwood", category: "restaurant", weightedScore: "4.450", rawAvgScore: "4.30", rankPosition: 3, rankDelta: 1, totalRatings: 389, description: "Open-pit BBQ in the Hill Country since 1967.", priceRange: "$$", phone: "(512) 858-4959", address: "18300 FM 1826, Driftwood, TX", lat: "30.1561", lng: "-97.9410", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
  { name: "Ramen Tatsu-Ya", slug: "ramen-tatsu-ya-austin", city: "Austin", neighborhood: "North Loop", category: "restaurant", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 4, rankDelta: -1, totalRatings: 312, description: "Austin's best ramen. No compromise.", priceRange: "$$", phone: "(512) 893-5561", address: "8557 Research Blvd, Austin, TX", lat: "30.3561", lng: "-97.7310", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop" },
  { name: "Odd Duck", slug: "odd-duck-austin", city: "Austin", neighborhood: "South Lamar", category: "restaurant", weightedScore: "4.250", rawAvgScore: "4.10", rankPosition: 5, rankDelta: 0, totalRatings: 234, description: "Farm-to-table seasonal small plates.", priceRange: "$$$", phone: "(512) 433-6521", address: "1201 S Lamar Blvd, Austin, TX", lat: "30.2501", lng: "-97.7630", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop" },
  { name: "Jo's Coffee", slug: "jos-coffee-austin", city: "Austin", neighborhood: "South Congress", category: "cafe", weightedScore: "4.620", rawAvgScore: "4.50", rankPosition: 1, rankDelta: 0, totalRatings: 456, description: "I Love You So Much wall. Iconic SoCo coffee.", priceRange: "$", phone: "(512) 444-3800", address: "1300 S Congress Ave, Austin, TX", lat: "30.2490", lng: "-97.7491", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop" },
  { name: "Rainey Street Bar District", slug: "rainey-street-austin", city: "Austin", neighborhood: "Rainey Street", category: "bar", weightedScore: "4.500", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 345, description: "Historic bungalows turned into Austin's hottest bar street.", priceRange: "$$", phone: "(512) 555-0001", address: "Rainey Street, Austin, TX", lat: "30.2580", lng: "-97.7380", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop" },
  { name: "Whataburger", slug: "whataburger-austin", city: "Austin", neighborhood: "Multiple", category: "fast_food", weightedScore: "4.200", rawAvgScore: "4.05", rankPosition: 1, rankDelta: 0, totalRatings: 567, description: "Texas institution. Honey butter chicken biscuit.", priceRange: "$", phone: "(512) 555-0002", address: "Multiple locations, Austin, TX", lat: "30.2672", lng: "-97.7431", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
  { name: "Quack's 43rd St Bakery", slug: "quacks-bakery-austin", city: "Austin", neighborhood: "Hyde Park", category: "bakery", weightedScore: "4.350", rawAvgScore: "4.20", rankPosition: 1, rankDelta: 0, totalRatings: 198, description: "Neighborhood bakery with legendary carrot cake.", priceRange: "$", phone: "(512) 453-3399", address: "411 E 43rd St, Austin, TX", lat: "30.3051", lng: "-97.7230", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" },
];

const HOUSTON_BUSINESSES: SeedBusiness[] = [
  { name: "Killen's Barbecue", slug: "killens-bbq-houston", city: "Houston", neighborhood: "Pearland", category: "restaurant", weightedScore: "4.780", rawAvgScore: "4.65", rankPosition: 1, rankDelta: 0, totalRatings: 523, description: "Pitmaster Ronnie Killen's award-winning BBQ.", priceRange: "$$", phone: "(281) 485-2272", address: "3613 E Broadway St, Pearland, TX", lat: "29.5633", lng: "-95.2763", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
  { name: "Pappas Bros. Steakhouse", slug: "pappas-bros-houston", city: "Houston", neighborhood: "Galleria", category: "restaurant", weightedScore: "4.650", rawAvgScore: "4.50", rankPosition: 2, rankDelta: 0, totalRatings: 445, description: "Houston's finest steakhouse. USDA Prime aged beef.", priceRange: "$$$$", phone: "(713) 780-7352", address: "5839 Westheimer Rd, Houston, TX", lat: "29.7372", lng: "-95.4888", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=600&h=400&fit=crop" },
  { name: "Crawfish & Noodles", slug: "crawfish-noodles-houston", city: "Houston", neighborhood: "Chinatown", category: "restaurant", weightedScore: "4.520", rawAvgScore: "4.40", rankPosition: 3, rankDelta: 1, totalRatings: 378, description: "Vietnamese-Cajun fusion that started a revolution.", priceRange: "$$", phone: "(281) 988-8098", address: "11360 Bellaire Blvd, Houston, TX", lat: "29.7045", lng: "-95.5358", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1552611052-33e04de1b100?w=600&h=400&fit=crop" },
  { name: "Tacos Tierra Caliente", slug: "tacos-tierra-caliente-houston", city: "Houston", neighborhood: "Montrose", category: "street_food", weightedScore: "4.600", rawAvgScore: "4.45", rankPosition: 1, rankDelta: 0, totalRatings: 456, description: "Late-night taco truck with the best al pastor in Houston.", priceRange: "$", phone: "(713) 555-0003", address: "1220 Westheimer Rd, Houston, TX", lat: "29.7414", lng: "-95.3917", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
  { name: "Buc-ee's", slug: "buc-ees-houston", city: "Houston", neighborhood: "Baytown", category: "fast_food", weightedScore: "4.400", rawAvgScore: "4.25", rankPosition: 1, rankDelta: 0, totalRatings: 789, description: "Texas-sized gas station with legendary BBQ and beaver nuggets.", priceRange: "$", phone: "(979) 238-6390", address: "4500 I-10 East, Baytown, TX", lat: "29.7827", lng: "-94.9594", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
  { name: "Blacksmith Coffee", slug: "blacksmith-coffee-houston", city: "Houston", neighborhood: "Montrose", category: "cafe", weightedScore: "4.480", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 234, description: "Third-wave coffee in a beautiful Montrose space.", priceRange: "$$", phone: "(713) 555-0004", address: "1018 Westheimer Rd, Houston, TX", lat: "29.7413", lng: "-95.3870", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop" },
  { name: "Julep", slug: "julep-houston", city: "Houston", neighborhood: "Washington Ave", category: "bar", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 1, rankDelta: 0, totalRatings: 198, description: "Southern cocktail bar with craft juleps and live music.", priceRange: "$$$", phone: "(713) 869-4383", address: "1919 Washington Ave, Houston, TX", lat: "29.7643", lng: "-95.3842", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop" },
  { name: "Common Bond Bakery", slug: "common-bond-houston", city: "Houston", neighborhood: "Montrose", category: "bakery", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 1, rankDelta: 0, totalRatings: 312, description: "European-inspired bakery and cafe.", priceRange: "$$", phone: "(713) 529-3535", address: "1706 Westheimer Rd, Houston, TX", lat: "29.7434", lng: "-95.3977", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" },
];

const SAN_ANTONIO_BUSINESSES: SeedBusiness[] = [
  { name: "2M Smokehouse", slug: "2m-smokehouse-san-antonio", city: "San Antonio", neighborhood: "South Side", category: "restaurant", weightedScore: "4.750", rawAvgScore: "4.60", rankPosition: 1, rankDelta: 0, totalRatings: 389, description: "Tex-Mex meets BBQ. The brisket enchiladas are legendary.", priceRange: "$$", phone: "(210) 885-9352", address: "2731 S WW White Rd, San Antonio, TX", lat: "29.3921", lng: "-98.4347", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
  { name: "Mi Tierra Cafe", slug: "mi-tierra-san-antonio", city: "San Antonio", neighborhood: "Market Square", category: "restaurant", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 2, rankDelta: 0, totalRatings: 567, description: "Open 24 hours since 1941. The Riverwalk institution.", priceRange: "$$", phone: "(210) 225-1262", address: "218 Produce Row, San Antonio, TX", lat: "29.4246", lng: "-98.4969", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1653005753991-22a8bf831f89?w=600&h=400&fit=crop" },
  { name: "Garcia's Mexican Food", slug: "garcias-san-antonio", city: "San Antonio", neighborhood: "West Side", category: "street_food", weightedScore: "4.500", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 345, description: "No-frills Tex-Mex. The puffy tacos are life-changing.", priceRange: "$", phone: "(210) 735-4525", address: "842 Fredericksburg Rd, San Antonio, TX", lat: "29.4521", lng: "-98.5121", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop" },
  { name: "Estate Coffee", slug: "estate-coffee-san-antonio", city: "San Antonio", neighborhood: "Southtown", category: "cafe", weightedScore: "4.420", rawAvgScore: "4.30", rankPosition: 1, rankDelta: 0, totalRatings: 178, description: "Specialty coffee in the heart of Southtown arts district.", priceRange: "$$", phone: "(210) 555-0005", address: "1320 S Alamo St, San Antonio, TX", lat: "29.4150", lng: "-98.4901", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop" },
  { name: "Whataburger", slug: "whataburger-san-antonio", city: "San Antonio", neighborhood: "Multiple", category: "fast_food", weightedScore: "4.250", rawAvgScore: "4.10", rankPosition: 1, rankDelta: 0, totalRatings: 678, description: "Born right here in San Antonio. The HQ city.", priceRange: "$", phone: "(210) 555-0006", address: "Multiple locations, San Antonio, TX", lat: "29.4241", lng: "-98.4936", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
  { name: "The Esquire Tavern", slug: "esquire-tavern-san-antonio", city: "San Antonio", neighborhood: "Riverwalk", category: "bar", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 1, rankDelta: 0, totalRatings: 289, description: "The longest bar in Texas, right on the Riverwalk.", priceRange: "$$", phone: "(210) 222-2521", address: "155 E Commerce St, San Antonio, TX", lat: "29.4234", lng: "-98.4876", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop" },
  { name: "Bird Bakery", slug: "bird-bakery-san-antonio", city: "San Antonio", neighborhood: "Alamo Heights", category: "bakery", weightedScore: "4.480", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 234, description: "Cupcakes and cookies by Elizabeth Chambers.", priceRange: "$$", phone: "(210) 804-2473", address: "5912 Broadway, San Antonio, TX", lat: "29.4633", lng: "-98.4623", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop" },
];

const FORT_WORTH_BUSINESSES: SeedBusiness[] = [
  { name: "Heim Barbecue", slug: "heim-bbq-fort-worth", city: "Fort Worth", neighborhood: "Magnolia", category: "restaurant", weightedScore: "4.700", rawAvgScore: "4.55", rankPosition: 1, rankDelta: 0, totalRatings: 445, description: "Bacon burnt ends put Heim on the map. Texas Monthly Top 50.", priceRange: "$$", phone: "(817) 882-6970", address: "1109 W Magnolia Ave, Fort Worth, TX", lat: "32.7185", lng: "-97.3448", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
  { name: "Joe T. Garcia's", slug: "joe-t-garcias-fort-worth", city: "Fort Worth", neighborhood: "Northside", category: "restaurant", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 2, rankDelta: 0, totalRatings: 567, description: "The legendary patio. Enchiladas and fajitas only.", priceRange: "$$", phone: "(817) 626-4356", address: "2201 N Commerce St, Fort Worth, TX", lat: "32.7665", lng: "-97.3292", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1653005753991-22a8bf831f89?w=600&h=400&fit=crop" },
  { name: "Salsa Limon", slug: "salsa-limon-fort-worth", city: "Fort Worth", neighborhood: "Near South", category: "street_food", weightedScore: "4.480", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 345, description: "Mexican street food truck turned brick-and-mortar.", priceRange: "$", phone: "(817) 927-4328", address: "4200 S Freeway, Fort Worth, TX", lat: "32.7100", lng: "-97.3232", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
  { name: "Avoca Coffee", slug: "avoca-coffee-fort-worth", city: "Fort Worth", neighborhood: "Magnolia", category: "cafe", weightedScore: "4.500", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 198, description: "Fort Worth's premier specialty coffee roaster.", priceRange: "$$", phone: "(817) 677-6741", address: "1311 W Magnolia Ave, Fort Worth, TX", lat: "32.7180", lng: "-97.3465", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop" },
  { name: "Whataburger", slug: "whataburger-fort-worth", city: "Fort Worth", neighborhood: "Multiple", category: "fast_food", weightedScore: "4.180", rawAvgScore: "4.05", rankPosition: 1, rankDelta: 0, totalRatings: 456, description: "Texas institution. Always there at 2am.", priceRange: "$", phone: "(817) 555-0007", address: "Multiple locations, Fort Worth, TX", lat: "32.7555", lng: "-97.3308", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
  { name: "The Usual", slug: "the-usual-fort-worth", city: "Fort Worth", neighborhood: "Sundance Square", category: "bar", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 1, rankDelta: 0, totalRatings: 189, description: "Craft cocktail bar in Sundance Square.", priceRange: "$$$", phone: "(817) 810-0114", address: "310 Houston St, Fort Worth, TX", lat: "32.7548", lng: "-97.3313", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop" },
  { name: "Swiss Pastry Shop", slug: "swiss-pastry-fort-worth", city: "Fort Worth", neighborhood: "Camp Bowie", category: "bakery", weightedScore: "4.420", rawAvgScore: "4.30", rankPosition: 1, rankDelta: 0, totalRatings: 267, description: "Fort Worth's oldest bakery. Since 1950.", priceRange: "$", phone: "(817) 732-5661", address: "3936 W Vickery Blvd, Fort Worth, TX", lat: "32.7370", lng: "-97.3698", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" },
];

const ALL_CITY_BUSINESSES = [
  ...AUSTIN_BUSINESSES,
  ...HOUSTON_BUSINESSES,
  ...SAN_ANTONIO_BUSINESSES,
  ...FORT_WORTH_BUSINESSES,
];

export async function seedCities() {
  console.log(`Seeding ${ALL_CITY_BUSINESSES.length} businesses across 4 cities...`);

  let seeded = 0;
  for (const biz of ALL_CITY_BUSINESSES) {
    try {
      await db.insert(businesses).values({
        name: biz.name,
        slug: biz.slug,
        category: biz.category,
        city: biz.city,
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
      });
      seeded++;
    } catch (err: any) {
      if (err.message?.includes("unique") || err.message?.includes("duplicate")) {
        console.log(`  Skipping ${biz.name} (already exists)`);
      } else {
        console.error(`  Failed to seed ${biz.name}:`, err.message);
      }
    }
  }

  console.log(`\nSeeded ${seeded}/${ALL_CITY_BUSINESSES.length} businesses.`);
  console.log("Cities: Austin (10), Houston (8), San Antonio (7), Fort Worth (7)");
}

// Run directly if executed as script
const isDirectRun = process.argv[1]?.includes("seed-cities");
if (isDirectRun) {
  seedCities()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}
