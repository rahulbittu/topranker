import { db } from "./db";
import { businesses, challengers, members, dishes, businessPhotos, dishLeaderboards, dishLeaderboardEntries } from "@shared/schema";
import { sql, eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";

const SEED_BUSINESSES = [
  // ── Indian Restaurants ────────────────────────────────────
  { name: "Spice Garden", slug: "spice-garden-dallas", neighborhood: "Uptown", category: "restaurant", cuisine: "indian", weightedScore: "4.720", rawAvgScore: "4.60", rankPosition: 1, rankDelta: 0, totalRatings: 312, description: "Thirty years of perfecting North Indian cuisine. Legendary biryani and butter chicken.", priceRange: "$$$", phone: "(214) 555-0192", address: "3821 Cedar Springs Rd, Uptown, Dallas", lat: "32.8087452", lng: "-96.8024537", isOpenNow: true, website: "https://spicegardendallas.com", photoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop" },
  { name: "Tandoori Flames", slug: "tandoori-flames-irving", neighborhood: "Irving", category: "restaurant", cuisine: "indian", weightedScore: "4.650", rawAvgScore: "4.52", rankPosition: 2, rankDelta: 1, totalRatings: 278, description: "Authentic Hyderabadi biryani and tandoori specialties. The dum biryani is legendary.", priceRange: "$$", phone: "(972) 555-0301", address: "7600 N MacArthur Blvd, Irving, Dallas", lat: "32.8912345", lng: "-96.9512345", isOpenNow: true, website: "https://tandooriflames.com", photoUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop" },
  { name: "Bawarchi Biryanis", slug: "bawarchi-biryanis-plano", neighborhood: "Plano", category: "restaurant", cuisine: "indian", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 3, rankDelta: 0, totalRatings: 245, description: "South Indian biryani house known for Hyderabadi goat biryani and dosas.", priceRange: "$$", phone: "(469) 555-0401", address: "3320 Coit Rd, Plano, Dallas", lat: "33.0212345", lng: "-96.7712345", isOpenNow: true, website: "https://bawarchibiryanis.com", photoUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=400&fit=crop" },
  { name: "Chennai Cafe", slug: "chennai-cafe-frisco", neighborhood: "Frisco", category: "restaurant", cuisine: "indian", weightedScore: "4.420", rawAvgScore: "4.30", rankPosition: 4, rankDelta: -1, totalRatings: 189, description: "Pure vegetarian South Indian. The masala dosa and filter coffee are perfection.", priceRange: "$", phone: "(469) 555-0501", address: "8200 Preston Rd, Frisco, Dallas", lat: "33.1012345", lng: "-96.8012345", isOpenNow: false, website: "https://chennaicafe.com", photoUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&h=400&fit=crop" },
  { name: "Desi District", slug: "desi-district-richardson", neighborhood: "Richardson", category: "restaurant", cuisine: "indian", weightedScore: "4.350", rawAvgScore: "4.20", rankPosition: 5, rankDelta: 2, totalRatings: 167, description: "Street food-style Indian — chaat, pav bhaji, vada pav. Richardson's desi favorite.", priceRange: "$", phone: "(972) 555-0601", address: "101 S Greenville Ave, Richardson, Dallas", lat: "32.9512345", lng: "-96.7234567", isOpenNow: true, website: "https://desidistrict.com", photoUrl: "https://images.unsplash.com/photo-1606491956689-2ea866880049?w=600&h=400&fit=crop" },

  // ── Mexican Restaurants ───────────────────────────────────
  { name: "Abuela's Kitchen", slug: "abuelas-kitchen-dallas", neighborhood: "Oak Cliff", category: "restaurant", cuisine: "mexican", weightedScore: "4.480", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 234, description: "Three generations of Mexican recipes from Oaxaca. Mole negro is transcendent.", priceRange: "$", phone: "(214) 555-0567", address: "1234 Jefferson Blvd, Oak Cliff, Dallas", lat: "32.7453102", lng: "-96.8312487", isOpenNow: true, website: "https://abuelaskitchendallas.com", photoUrl: "https://images.unsplash.com/photo-1653005753991-22a8bf831f89?w=600&h=400&fit=crop" },
  { name: "El Rincon del Sabor", slug: "el-rincon-del-sabor-dallas", neighborhood: "Pleasant Grove", category: "restaurant", cuisine: "mexican", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 2, rankDelta: 1, totalRatings: 198, description: "Birria tacos, pozole, and menudo. Weekend specials draw lines down the block.", priceRange: "$", phone: "(214) 555-3201", address: "1902 Buckner Blvd, Pleasant Grove, Dallas", lat: "32.7312345", lng: "-96.7112345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
  { name: "Casa Oaxaca", slug: "casa-oaxaca-dallas", neighborhood: "Bishop Arts", category: "restaurant", cuisine: "mexican", weightedScore: "4.250", rawAvgScore: "4.12", rankPosition: 3, rankDelta: -1, totalRatings: 167, description: "Authentic Oaxacan cuisine — tlayudas, mezcal flights, chapulines.", priceRange: "$$", phone: "(214) 555-3301", address: "335 W Davis St, Bishop Arts, Dallas", lat: "32.7489012", lng: "-96.8312345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop" },
  { name: "Taqueria La Ventana", slug: "taqueria-la-ventana-dallas", neighborhood: "Oak Cliff", category: "restaurant", cuisine: "mexican", weightedScore: "4.120", rawAvgScore: "4.00", rankPosition: 4, rankDelta: 0, totalRatings: 312, description: "Al pastor from the trompo, fresh tortillas, legendary salsa verde.", priceRange: "$", phone: "(214) 555-3401", address: "2456 W Illinois Ave, Oak Cliff, Dallas", lat: "32.7312345", lng: "-96.8456789", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&h=400&fit=crop" },

  // ── Japanese Restaurants ──────────────────────────────────
  { name: "Lucky Cat Ramen", slug: "lucky-cat-ramen-dallas", neighborhood: "Deep Ellum", category: "restaurant", cuisine: "japanese", weightedScore: "4.510", rawAvgScore: "4.38", rankPosition: 1, rankDelta: 0, totalRatings: 198, description: "Authentic Japanese ramen with house-made noodles. Tonkotsu is the star.", priceRange: "$$", phone: "(214) 555-0345", address: "2815 Main St, Deep Ellum, Dallas", lat: "32.7833148", lng: "-96.7836459", isOpenNow: false, website: "https://luckycatramen.com", photoUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop" },
  { name: "Uchi Dallas", slug: "uchi-dallas", neighborhood: "Oak Lawn", category: "restaurant", cuisine: "japanese", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 2, rankDelta: 1, totalRatings: 278, description: "Japanese farmhouse dining with innovative sushi and hot tastings.", priceRange: "$$$$", phone: "(214) 855-5454", address: "2817 Maple Ave, Oak Lawn, Dallas", lat: "32.8023000", lng: "-96.8100000", isOpenNow: true, website: "https://uchidallas.com", photoUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop" },
  { name: "Tei-An", slug: "tei-an-dallas", neighborhood: "Arts District", category: "restaurant", cuisine: "japanese", weightedScore: "4.250", rawAvgScore: "4.12", rankPosition: 3, rankDelta: -1, totalRatings: 189, description: "Hand-cut soba noodles and Japanese small plates in the Arts District.", priceRange: "$$$", phone: "(214) 220-2828", address: "1722 Routh St, Arts District, Dallas", lat: "32.7890000", lng: "-96.7990000", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&h=400&fit=crop" },

  // ── Korean Restaurants ────────────────────────────────────
  { name: "Seoul Brothers", slug: "seoul-brothers-dallas", neighborhood: "Carrollton", category: "restaurant", cuisine: "korean", weightedScore: "4.350", rawAvgScore: "4.20", rankPosition: 1, rankDelta: 0, totalRatings: 143, description: "Korean fusion with bold flavors. The bibimbap and Korean fried chicken are must-try.", priceRange: "$$", phone: "(214) 555-0678", address: "2570 Old Denton Rd, Carrollton, Dallas", lat: "32.9537482", lng: "-96.8903456", isOpenNow: false, website: "https://seoulbrothersdallas.com", photoUrl: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&h=400&fit=crop" },
  { name: "Koryo Kalbi", slug: "koryo-kalbi-dallas", neighborhood: "Royal Lane", category: "restaurant", cuisine: "korean", weightedScore: "4.220", rawAvgScore: "4.10", rankPosition: 2, rankDelta: 1, totalRatings: 134, description: "Traditional Korean BBQ with tabletop grills. The galbi and japchae are standouts.", priceRange: "$$", phone: "(214) 555-3501", address: "2638 Royal Lane, Dallas", lat: "32.8812345", lng: "-96.7812345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&h=400&fit=crop" },

  // ── Thai Restaurants ──────────────────────────────────────
  { name: "Khao Noodle Shop", slug: "khao-noodle-dallas", neighborhood: "Lowest Greenville", category: "restaurant", cuisine: "thai", weightedScore: "4.400", rawAvgScore: "4.28", rankPosition: 1, rankDelta: 0, totalRatings: 154, description: "Northern Thai street food with zero compromise. James Beard-recognized.", priceRange: "$$", phone: "(214) 555-0887", address: "4812 Bryan St, Lowest Greenville, Dallas", lat: "32.7908432", lng: "-96.7712345", isOpenNow: true, website: "https://khaonoodleshop.com", photoUrl: "https://images.unsplash.com/photo-1552611052-33e04de1b100?w=600&h=400&fit=crop" },
  { name: "Asian Mint", slug: "asian-mint-dallas", neighborhood: "Knox-Henderson", category: "restaurant", cuisine: "thai", weightedScore: "4.180", rawAvgScore: "4.05", rankPosition: 2, rankDelta: 0, totalRatings: 198, description: "Modern Thai with creative cocktails. The pad thai and green curry are signatures.", priceRange: "$$", phone: "(214) 555-3601", address: "4901 Bryan St, Knox-Henderson, Dallas", lat: "32.7912345", lng: "-96.7712345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=600&h=400&fit=crop" },

  // ── Italian Restaurants ───────────────────────────────────
  { name: "Lucia", slug: "lucia-dallas", neighborhood: "Bishop Arts", category: "restaurant", cuisine: "italian", weightedScore: "4.450", rawAvgScore: "4.32", rankPosition: 1, rankDelta: 0, totalRatings: 167, description: "Chef David Uygur's intimate Italian-inspired dining room. Handmade pasta.", priceRange: "$$$$", phone: "(214) 555-0666", address: "408 W 8th St, Bishop Arts, Dallas", lat: "32.7494123", lng: "-96.8276789", isOpenNow: false, website: "https://luciadallas.com", photoUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop" },
  { name: "Cane Rosso", slug: "cane-rosso-dallas", neighborhood: "Deep Ellum", category: "restaurant", cuisine: "italian", weightedScore: "4.280", rawAvgScore: "4.15", rankPosition: 2, rankDelta: 1, totalRatings: 234, description: "Neapolitan-style pizza with locally sourced ingredients. The honey bastard is iconic.", priceRange: "$$", phone: "(214) 741-1188", address: "2612 Commerce St, Deep Ellum, Dallas", lat: "32.7823000", lng: "-96.7858000", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&h=400&fit=crop" },

  // ── American Restaurants ──────────────────────────────────
  { name: "The Yard Kitchen", slug: "the-yard-kitchen-dallas", neighborhood: "Bishop Arts", category: "restaurant", cuisine: "american", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 1, rankDelta: 0, totalRatings: 287, description: "Farm-to-table restaurant in Bishop Arts District. Hyper-seasonal menus.", priceRange: "$$", phone: "(214) 555-0234", address: "402 N Bishop Ave, Bishop Arts, Dallas", lat: "32.7505612", lng: "-96.8267483", isOpenNow: true, website: "https://theyardkitchen.com", photoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop" },
  { name: "Smoke & Vine", slug: "smoke-and-vine-dallas", neighborhood: "Oak Lawn", category: "restaurant", cuisine: "american", weightedScore: "4.350", rawAvgScore: "4.20", rankPosition: 2, rankDelta: 2, totalRatings: 156, description: "Texas BBQ meets fine wine in this Oak Lawn gem.", priceRange: "$$$", phone: "(214) 555-0456", address: "4011 Lemmon Ave, Oak Lawn, Dallas", lat: "32.8118523", lng: "-96.8200134", isOpenNow: true, website: "https://smokeandvinedallas.com", photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
  { name: "Pecan Lodge", slug: "pecan-lodge-dallas", neighborhood: "Deep Ellum", category: "restaurant", cuisine: "american", weightedScore: "4.250", rawAvgScore: "4.12", rankPosition: 3, rankDelta: 0, totalRatings: 523, description: "The most decorated BBQ joint in Dallas history. Brisket perfection.", priceRange: "$$", phone: "(214) 555-0948", address: "2702 Main St, Deep Ellum, Dallas", lat: "32.7844523", lng: "-96.7842178", isOpenNow: true, website: "https://pecanlodge.com", photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
  { name: "Fearing's", slug: "fearings-dallas", neighborhood: "Uptown", category: "restaurant", cuisine: "american", weightedScore: "4.100", rawAvgScore: "3.98", rankPosition: 4, rankDelta: -1, totalRatings: 178, description: "Dean Fearing's flagship inside the Ritz-Carlton. Bold Texas flavors.", priceRange: "$$$$", phone: "(214) 555-0220", address: "2121 McKinney Ave, Uptown, Dallas", lat: "32.7978432", lng: "-96.8012345", isOpenNow: true, website: "https://fearingsrestaurant.com", photoUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=600&h=400&fit=crop" },

  // ── Vietnamese Restaurant ─────────────────────────────────
  { name: "Pho Empire", slug: "pho-empire-dallas", neighborhood: "Garland", category: "restaurant", cuisine: "vietnamese", weightedScore: "4.320", rawAvgScore: "4.18", rankPosition: 1, rankDelta: 0, totalRatings: 189, description: "Pho simmered for 24 hours. The rare beef pho and bun bo Hue are unmatched.", priceRange: "$", phone: "(972) 555-3701", address: "2345 W Walnut St, Garland, Dallas", lat: "32.9012345", lng: "-96.6512345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&h=400&fit=crop" },
  { name: "Saigon Bites", slug: "saigon-bites-dallas", neighborhood: "East Dallas", category: "restaurant", cuisine: "vietnamese", weightedScore: "4.150", rawAvgScore: "4.02", rankPosition: 2, rankDelta: 1, totalRatings: 145, description: "Banh mi, spring rolls, and broken rice plates. Fast and flavorful.", priceRange: "$", phone: "(214) 555-3801", address: "4523 Bryan St, East Dallas, Dallas", lat: "32.7912345", lng: "-96.7612345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1576577445504-6af96477db52?w=600&h=400&fit=crop" },

  // ── Mediterranean Restaurant ──────────────────────────────
  { name: "Kabob King", slug: "kabob-king-dallas", neighborhood: "Richardson", category: "restaurant", cuisine: "mediterranean", weightedScore: "4.280", rawAvgScore: "4.15", rankPosition: 1, rankDelta: 0, totalRatings: 145, description: "Pakistani-style seekh kabobs grilled fresh. The lamb chops are superb.", priceRange: "$", phone: "(214) 555-1567", address: "750 W Arapaho Rd, Richardson, Dallas", lat: "32.9512345", lng: "-96.7534567", isOpenNow: true, website: "https://kabobkingdallas.com", photoUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop" },

  // ── Chinese Restaurant ────────────────────────────────────
  { name: "Royal China", slug: "royal-china-dallas", neighborhood: "Richardson", category: "restaurant", cuisine: "chinese", weightedScore: "4.300", rawAvgScore: "4.18", rankPosition: 1, rankDelta: 0, totalRatings: 198, description: "Dim sum palace. Weekend carts, Peking duck, and hand-pulled noodles.", priceRange: "$$", phone: "(972) 555-3901", address: "3924 N Central Expy, Richardson, Dallas", lat: "32.9412345", lng: "-96.7412345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&h=400&fit=crop" },
  { name: "Sichuan House", slug: "sichuan-house-dallas", neighborhood: "Plano", category: "restaurant", cuisine: "chinese", weightedScore: "4.180", rawAvgScore: "4.05", rankPosition: 2, rankDelta: 1, totalRatings: 156, description: "Fiery Sichuan specialties — mapo tofu, dan dan noodles, dry pot.", priceRange: "$$", phone: "(469) 555-4001", address: "2500 N Central Expy, Plano, Dallas", lat: "33.0112345", lng: "-96.7212345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&h=400&fit=crop" },

  // ── Sprint 298: Additional restaurants to meet 3-per-cuisine minimum ──
  { name: "Golden Dragon Palace", slug: "golden-dragon-palace-dallas", neighborhood: "Carrollton", category: "restaurant", cuisine: "chinese", weightedScore: "4.050", rawAvgScore: "3.92", rankPosition: 3, rankDelta: 0, totalRatings: 112, description: "Cantonese classics and weekend dim sum carts.", priceRange: "$$", phone: "(972) 555-4101", address: "1820 E Belt Line Rd, Carrollton, Dallas", lat: "32.9612345", lng: "-96.8812345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&h=400&fit=crop" },
  { name: "Nonna's Trattoria", slug: "nonnas-trattoria-dallas", neighborhood: "Greenville", category: "restaurant", cuisine: "italian", weightedScore: "4.080", rawAvgScore: "3.95", rankPosition: 3, rankDelta: 1, totalRatings: 134, description: "Handmade pasta and wood-fired pizza in a cozy trattoria.", priceRange: "$$", phone: "(214) 555-4201", address: "2912 Greenville Ave, Greenville, Dallas", lat: "32.8156789", lng: "-96.7734567", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop" },
  { name: "Seoul BBQ House", slug: "seoul-bbq-house-dallas", neighborhood: "Carrollton", category: "restaurant", cuisine: "korean", weightedScore: "4.100", rawAvgScore: "3.98", rankPosition: 3, rankDelta: 0, totalRatings: 128, description: "Tabletop grills, banchan, and premium beef cuts.", priceRange: "$$", phone: "(972) 555-4301", address: "2625 Old Denton Rd, Carrollton, Dallas", lat: "33.0012345", lng: "-96.8912345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&h=400&fit=crop" },
  { name: "Thai Orchid Garden", slug: "thai-orchid-garden-dallas", neighborhood: "Richardson", category: "restaurant", cuisine: "thai", weightedScore: "4.050", rawAvgScore: "3.90", rankPosition: 3, rankDelta: 1, totalRatings: 109, description: "Authentic Thai curries, pad see ew, and mango sticky rice.", priceRange: "$", phone: "(972) 555-4401", address: "816 W Arapaho Rd, Richardson, Dallas", lat: "32.9534567", lng: "-96.7556789", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=600&h=400&fit=crop" },
  { name: "Pho 95", slug: "pho-95-dallas", neighborhood: "Arlington", category: "restaurant", cuisine: "vietnamese", weightedScore: "4.020", rawAvgScore: "3.88", rankPosition: 3, rankDelta: 0, totalRatings: 95, description: "Straightforward Vietnamese pho and vermicelli bowls.", priceRange: "$", phone: "(817) 555-4501", address: "4250 S Cooper St, Arlington, Dallas", lat: "32.6912345", lng: "-97.1112345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&h=400&fit=crop" },
  { name: "Istanbul Grill", slug: "istanbul-grill-dallas", neighborhood: "Plano", category: "restaurant", cuisine: "mediterranean", weightedScore: "4.150", rawAvgScore: "4.02", rankPosition: 2, rankDelta: 0, totalRatings: 134, description: "Turkish kebabs, hummus, and fresh baked pide.", priceRange: "$$", phone: "(469) 555-4601", address: "3000 Custer Rd, Plano, Dallas", lat: "33.0312345", lng: "-96.7812345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop" },
  { name: "Shawarma Point", slug: "shawarma-point-dallas", neighborhood: "Irving", category: "restaurant", cuisine: "mediterranean", weightedScore: "4.020", rawAvgScore: "3.90", rankPosition: 3, rankDelta: 1, totalRatings: 98, description: "Lebanese-style shawarma wraps and falafel plates.", priceRange: "$", phone: "(972) 555-4701", address: "1234 W Pioneer Dr, Irving, Dallas", lat: "32.8234567", lng: "-96.9434567", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&h=400&fit=crop" },

  // ── Cafes (no cuisine — category-level) ───────────────────
  { name: "Cultivar Coffee", slug: "cultivar-coffee-dallas", neighborhood: "East Dallas", category: "cafe", cuisine: null, weightedScore: "4.650", rawAvgScore: "4.50", rankPosition: 1, rankDelta: 0, totalRatings: 189, description: "Single-origin pour-overs and house-roasted beans.", priceRange: "$$", phone: "(214) 555-0789", address: "313 N Bishop Ave, East Dallas, Dallas", lat: "32.7932145", lng: "-96.7645321", isOpenNow: true, website: "https://cultivarcoffee.com", photoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop" },
  { name: "Houndstooth Coffee", slug: "houndstooth-coffee-dallas", neighborhood: "Henderson", category: "cafe", cuisine: null, weightedScore: "4.520", rawAvgScore: "4.40", rankPosition: 2, rankDelta: 0, totalRatings: 167, description: "Specialty coffee bar with minimalist aesthetic.", priceRange: "$$", phone: "(214) 555-0890", address: "1900 N Henderson Ave, Henderson, Dallas", lat: "32.7998765", lng: "-96.7789012", isOpenNow: true, website: "https://houndstoothcoffee.com", photoUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop" },
  { name: "The Brew Room", slug: "the-brew-room-dallas", neighborhood: "Uptown", category: "cafe", cuisine: null, weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 3, rankDelta: 1, totalRatings: 132, description: "Cozy Uptown cafe with craft coffee and pastries.", priceRange: "$", phone: "(214) 555-0901", address: "2901 Thomas Ave, Uptown, Dallas", lat: "32.8012345", lng: "-96.7976543", isOpenNow: false, website: "https://thebrewroomdallas.com", photoUrl: "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=600&h=400&fit=crop" },
  { name: "Mudleaf Coffee", slug: "mudleaf-coffee-dallas", neighborhood: "Oak Cliff", category: "cafe", cuisine: null, weightedScore: "4.200", rawAvgScore: "4.10", rankPosition: 4, rankDelta: -1, totalRatings: 98, description: "Community-focused coffee shop in Oak Cliff.", priceRange: "$", phone: "(214) 555-1012", address: "1621 W Davis St, Oak Cliff, Dallas", lat: "32.7489012", lng: "-96.8345678", isOpenNow: true, website: "https://mudleafcoffee.com", photoUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop" },
  { name: "Merit Coffee", slug: "merit-coffee-dallas", neighborhood: "Design District", category: "cafe", cuisine: null, weightedScore: "4.100", rawAvgScore: "4.00", rankPosition: 5, rankDelta: 0, totalRatings: 76, description: "Texas-based specialty coffee roasters.", priceRange: "$$", phone: "(214) 555-1123", address: "1445 Hi Line Dr, Design District, Dallas", lat: "32.7856789", lng: "-96.8123456", isOpenNow: false, website: "https://meritcoffee.com", photoUrl: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop" },

  // ── Street Food ───────────────────────────────────────────
  { name: "Taco Stop", slug: "taco-stop-dallas", neighborhood: "Oak Cliff", category: "street_food", cuisine: "mexican", weightedScore: "4.710", rawAvgScore: "4.55", rankPosition: 1, rankDelta: 0, totalRatings: 456, description: "Legendary street tacos — the al pastor is unreal.", priceRange: "$", phone: "(214) 555-1234", address: "2811 Greenville Ave, Oak Cliff, Dallas", lat: "32.7423456", lng: "-96.8378901", isOpenNow: true, website: "https://tacostopdallas.com", photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
  { name: "Fuel City Tacos", slug: "fuel-city-tacos-dallas", neighborhood: "Riverfront", category: "street_food", cuisine: "mexican", weightedScore: "4.540", rawAvgScore: "4.40", rankPosition: 2, rankDelta: 0, totalRatings: 378, description: "Gas station tacos that are famous citywide.", priceRange: "$", phone: "(214) 555-1345", address: "801 S Riverfront Blvd, Riverfront, Dallas", lat: "32.7701234", lng: "-96.8178901", isOpenNow: true, website: "https://fuelcitytacos.com", photoUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop" },
  { name: "Elote Man", slug: "elote-man-dallas", neighborhood: "Pleasant Grove", category: "street_food", cuisine: "mexican", weightedScore: "4.320", rawAvgScore: "4.20", rankPosition: 3, rankDelta: 1, totalRatings: 189, description: "Mexican street corn done right.", priceRange: "$", phone: "(214) 555-1456", address: "Mobile - Pleasant Grove area", lat: "32.7234567", lng: "-96.7456789", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=600&h=400&fit=crop" },
  { name: "Chimmy's Churros", slug: "chimmys-churros-dallas", neighborhood: "Deep Ellum", category: "street_food", cuisine: "mexican", weightedScore: "4.050", rawAvgScore: "3.95", rankPosition: 5, rankDelta: 0, totalRatings: 112, description: "Fresh churros with creative dipping sauces.", priceRange: "$", phone: "(214) 555-1678", address: "2737 Main St, Deep Ellum, Dallas", lat: "32.7834567", lng: "-96.7823456", isOpenNow: true, website: "https://chimmyschurros.com", photoUrl: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&h=400&fit=crop" },

  // ── Bars ──────────────────────────────────────────────────
  { name: "Midnight Rambler", slug: "midnight-rambler-dallas", neighborhood: "Downtown", category: "bar", cuisine: null, weightedScore: "4.680", rawAvgScore: "4.55", rankPosition: 1, rankDelta: 0, totalRatings: 234, description: "Sophisticated cocktail bar in the Joule Hotel basement.", priceRange: "$$$", phone: "(214) 555-1789", address: "1530 Main St, Downtown, Dallas", lat: "32.7812345", lng: "-96.7967890", isOpenNow: true, website: "https://midnightrambler.com", photoUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop" },
  { name: "Atwater Alley", slug: "atwater-alley-dallas", neighborhood: "Deep Ellum", category: "bar", cuisine: null, weightedScore: "4.450", rawAvgScore: "4.30", rankPosition: 2, rankDelta: 1, totalRatings: 198, description: "Craft beer and creative cocktails in Deep Ellum.", priceRange: "$$", phone: "(214) 555-1890", address: "2815 Elm St, Deep Ellum, Dallas", lat: "32.7823456", lng: "-96.7834567", isOpenNow: true, website: "https://atwateralley.com", photoUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop" },
  { name: "The Grapevine Bar", slug: "the-grapevine-bar-dallas", neighborhood: "Greenville", category: "bar", cuisine: null, weightedScore: "4.280", rawAvgScore: "4.15", rankPosition: 3, rankDelta: -1, totalRatings: 167, description: "Oldest bar in Dallas with classic dive bar vibes.", priceRange: "$", phone: "(214) 555-1901", address: "3902 Maple Ave, Greenville, Dallas", lat: "32.8134567", lng: "-96.8123456", isOpenNow: false, website: "https://thegrapevinebar.com", photoUrl: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&h=400&fit=crop" },
  { name: "Javier's Cigar Bar", slug: "javiers-cigar-bar-dallas", neighborhood: "Knox-Henderson", category: "bar", cuisine: null, weightedScore: "4.120", rawAvgScore: "4.00", rankPosition: 4, rankDelta: 0, totalRatings: 134, description: "Upscale cigar lounge with premium spirits.", priceRange: "$$$", phone: "(214) 555-2012", address: "4912 Cole Ave, Knox-Henderson, Dallas", lat: "32.8212345", lng: "-96.7912345", isOpenNow: true, website: "https://javierscigarbar.com", photoUrl: "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=600&h=400&fit=crop" },
  { name: "Lee Harvey's", slug: "lee-harveys-dallas", neighborhood: "Cedars", category: "bar", cuisine: null, weightedScore: "3.950", rawAvgScore: "3.85", rankPosition: 5, rankDelta: 0, totalRatings: 189, description: "Iconic outdoor patio bar in the Cedars.", priceRange: "$", phone: "(214) 555-2123", address: "1807 Gould St, Cedars, Dallas", lat: "32.7723456", lng: "-96.7923456", isOpenNow: true, website: "https://leeharveys.com", photoUrl: "https://images.unsplash.com/photo-1538488881038-e252a119ace7?w=600&h=400&fit=crop" },

  // ── Bakeries ──────────────────────────────────────────────
  { name: "Village Baking Co.", slug: "village-baking-co-dallas", neighborhood: "Greenville", category: "bakery", cuisine: null, weightedScore: "4.730", rawAvgScore: "4.60", rankPosition: 1, rankDelta: 0, totalRatings: 267, description: "Artisan sourdough and French pastries.", priceRange: "$$", phone: "(214) 555-2234", address: "2009 Greenville Ave, Greenville, Dallas", lat: "32.8012345", lng: "-96.7712345", isOpenNow: true, website: "https://villagebakingco.com", photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" },
  { name: "La Casita Bakeshop", slug: "la-casita-bakeshop-dallas", neighborhood: "Oak Cliff", category: "bakery", cuisine: null, weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 2, rankDelta: 0, totalRatings: 198, description: "Mexican-inspired pastries and traditional conchas.", priceRange: "$", phone: "(214) 555-2345", address: "1522 W Davis St, Oak Cliff, Dallas", lat: "32.7489012", lng: "-96.8334567", isOpenNow: true, website: "https://lacasitabakeshop.com", photoUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop" },
  { name: "Bisous Bisous", slug: "bisous-bisous-patisserie-dallas", neighborhood: "Knox-Henderson", category: "bakery", cuisine: null, weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 3, rankDelta: 1, totalRatings: 156, description: "French macaron specialists with seasonal flavors.", priceRange: "$$", phone: "(214) 555-2456", address: "3809 McKinney Ave, Knox-Henderson, Dallas", lat: "32.8112345", lng: "-96.7934567", isOpenNow: false, website: "https://bisousbisous.com", photoUrl: "https://images.unsplash.com/photo-1612203985729-70726954388c?w=600&h=400&fit=crop" },
  { name: "Empire Baking Co.", slug: "empire-baking-co-dallas", neighborhood: "East Dallas", category: "bakery", cuisine: null, weightedScore: "4.200", rawAvgScore: "4.10", rankPosition: 4, rankDelta: -1, totalRatings: 132, description: "Dallas staple for bread and celebration cakes.", priceRange: "$$", phone: "(214) 555-2567", address: "5450 W Lovers Lane, East Dallas, Dallas", lat: "32.8534567", lng: "-96.7812345", isOpenNow: true, website: "https://empirebaking.com", photoUrl: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&h=400&fit=crop" },
  { name: "Haute Sweets", slug: "haute-sweets-patisserie-dallas", neighborhood: "Bishop Arts", category: "bakery", cuisine: null, weightedScore: "4.050", rawAvgScore: "3.95", rankPosition: 5, rankDelta: 0, totalRatings: 89, description: "Avant-garde desserts and sculptural pastries.", priceRange: "$$$", phone: "(214) 555-2678", address: "414 W Davis St, Bishop Arts, Dallas", lat: "32.7494123", lng: "-96.8278901", isOpenNow: false, website: "https://hautesweetspatisserie.com", photoUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop" },

  // ── Fast Food ─────────────────────────────────────────────
  { name: "Raising Cane's", slug: "raising-canes-dallas", neighborhood: "Greenville", category: "fast_food", cuisine: "american", weightedScore: "4.420", rawAvgScore: "4.30", rankPosition: 1, rankDelta: 0, totalRatings: 523, description: "One love — chicken fingers, crinkle fries, Texas toast, and that sauce.", priceRange: "$", phone: "(214) 555-2789", address: "5809 Greenville Ave, Greenville, Dallas", lat: "32.8612345", lng: "-96.7712345", isOpenNow: true, website: "https://raisingcanes.com", photoUrl: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop" },
  { name: "Whataburger", slug: "whataburger-dallas", neighborhood: "Multiple", category: "fast_food", cuisine: "american", weightedScore: "4.280", rawAvgScore: "4.15", rankPosition: 2, rankDelta: 0, totalRatings: 678, description: "Texas institution. The honey butter chicken biscuit is legendary.", priceRange: "$", phone: "(214) 555-2890", address: "Multiple locations, Dallas", lat: "32.7767000", lng: "-96.7970000", isOpenNow: true, website: "https://whataburger.com", photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
  { name: "In-N-Out Burger", slug: "in-n-out-burger-dallas", neighborhood: "Uptown", category: "fast_food", cuisine: "american", weightedScore: "4.150", rawAvgScore: "4.00", rankPosition: 3, rankDelta: 1, totalRatings: 445, description: "California import that Dallas can't get enough of.", priceRange: "$", phone: "(214) 555-2901", address: "3500 McKinney Ave, Uptown, Dallas", lat: "32.8112345", lng: "-96.8012345", isOpenNow: true, website: "https://in-n-out.com", photoUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop" },
  { name: "Wingstop", slug: "wingstop-dallas-hq", neighborhood: "Addison", category: "fast_food", cuisine: "american", weightedScore: "3.980", rawAvgScore: "3.85", rankPosition: 4, rankDelta: -1, totalRatings: 312, description: "Dallas-born wing chain — the original HQ location.", priceRange: "$", phone: "(214) 555-3012", address: "5501 LBJ Freeway, Addison, Dallas", lat: "32.9512345", lng: "-96.8312345", isOpenNow: false, website: "https://wingstop.com", photoUrl: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&h=400&fit=crop" },
  { name: "Taco Bell Cantina", slug: "taco-bell-cantina-dallas", neighborhood: "Deep Ellum", category: "fast_food", cuisine: "mexican", weightedScore: "3.820", rawAvgScore: "3.70", rankPosition: 5, rankDelta: 0, totalRatings: 201, description: "The elevated Taco Bell experience with booze.", priceRange: "$", phone: "(214) 555-3123", address: "2649 Main St, Deep Ellum, Dallas", lat: "32.7843210", lng: "-96.7854321", isOpenNow: true, website: "https://tacobell.com/cantina", photoUrl: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&h=400&fit=crop" },
];

const SEED_DISHES: { businessSlug: string; dishes: { name: string; voteCount: number }[] }[] = [
  // Indian
  { businessSlug: "spice-garden-dallas", dishes: [
    { name: "Dum Pukht Lamb Biryani", voteCount: 87 },
    { name: "Butter Chicken", voteCount: 54 },
    { name: "Garlic Naan", voteCount: 32 },
  ]},
  { businessSlug: "tandoori-flames-irving", dishes: [
    { name: "Hyderabadi Goat Biryani", voteCount: 112 },
    { name: "Tandoori Chicken", voteCount: 78 },
    { name: "Paneer Tikka", voteCount: 45 },
  ]},
  { businessSlug: "bawarchi-biryanis-plano", dishes: [
    { name: "Goat Biryani", voteCount: 98 },
    { name: "Masala Dosa", voteCount: 67 },
    { name: "Chicken 65", voteCount: 43 },
  ]},
  { businessSlug: "chennai-cafe-frisco", dishes: [
    { name: "Masala Dosa", voteCount: 134 },
    { name: "Filter Coffee", voteCount: 89 },
    { name: "Idli Sambar", voteCount: 56 },
  ]},
  { businessSlug: "desi-district-richardson", dishes: [
    { name: "Pav Bhaji", voteCount: 76 },
    { name: "Chaat Platter", voteCount: 65 },
    { name: "Vada Pav", voteCount: 43 },
  ]},
  // Mexican
  { businessSlug: "abuelas-kitchen-dallas", dishes: [
    { name: "Mole Negro", voteCount: 89 },
    { name: "Enchiladas Oaxaqueñas", voteCount: 67 },
    { name: "Tamales", voteCount: 45 },
  ]},
  { businessSlug: "el-rincon-del-sabor-dallas", dishes: [
    { name: "Birria Tacos", voteCount: 134 },
    { name: "Pozole Rojo", voteCount: 78 },
    { name: "Menudo", voteCount: 56 },
  ]},
  { businessSlug: "taco-stop-dallas", dishes: [
    { name: "Al Pastor Taco", voteCount: 134 },
    { name: "Barbacoa Taco", voteCount: 89 },
    { name: "Carnitas Taco", voteCount: 67 },
  ]},
  // Japanese
  { businessSlug: "lucky-cat-ramen-dallas", dishes: [
    { name: "Tonkotsu Ramen", voteCount: 78 },
    { name: "Spicy Miso Ramen", voteCount: 45 },
    { name: "Gyoza", voteCount: 29 },
  ]},
  { businessSlug: "uchi-dallas", dishes: [
    { name: "Hama Chili", voteCount: 98 },
    { name: "Wagyu Sashimi", voteCount: 76 },
  ]},
  // Korean
  { businessSlug: "seoul-brothers-dallas", dishes: [
    { name: "Korean Fried Chicken", voteCount: 89 },
    { name: "Bibimbap", voteCount: 67 },
    { name: "Japchae", voteCount: 34 },
  ]},
  // Thai
  { businessSlug: "khao-noodle-dallas", dishes: [
    { name: "Boat Noodles", voteCount: 98 },
    { name: "Khao Piak Sen", voteCount: 76 },
    { name: "Laab", voteCount: 45 },
  ]},
  // Vietnamese
  { businessSlug: "pho-empire-dallas", dishes: [
    { name: "Rare Beef Pho", voteCount: 112 },
    { name: "Bun Bo Hue", voteCount: 78 },
    { name: "Banh Mi", voteCount: 56 },
  ]},
  // Chinese
  { businessSlug: "royal-china-dallas", dishes: [
    { name: "Dim Sum Platter", voteCount: 98 },
    { name: "Peking Duck", voteCount: 76 },
    { name: "Har Gow", voteCount: 54 },
  ]},
  // Italian
  { businessSlug: "lucia-dallas", dishes: [
    { name: "Handmade Pappardelle", voteCount: 87 },
    { name: "Grilled Branzino", voteCount: 56 },
  ]},
  { businessSlug: "cane-rosso-dallas", dishes: [
    { name: "Honey Bastard Pizza", voteCount: 112 },
    { name: "Margherita Pizza", voteCount: 89 },
  ]},
  // American
  { businessSlug: "the-yard-kitchen-dallas", dishes: [
    { name: "Heritage Pork Chop", voteCount: 65 },
    { name: "Smoked Brisket Mac", voteCount: 42 },
  ]},
  { businessSlug: "pecan-lodge-dallas", dishes: [
    { name: "Brisket", voteCount: 156 },
    { name: "Beef Rib", voteCount: 98 },
    { name: "Banana Pudding", voteCount: 67 },
  ]},
  // Bars / Cafes / Bakeries
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
  // ── Sprint 303: Dish seed expansion — Sprint 298 businesses ──
  { businessSlug: "golden-dragon-palace-dallas", dishes: [
    { name: "Cantonese Roast Duck", voteCount: 67 },
    { name: "Dim Sum Platter", voteCount: 54 },
    { name: "Wonton Noodle Soup", voteCount: 38 },
  ]},
  { businessSlug: "nonnas-trattoria-dallas", dishes: [
    { name: "Cacio e Pepe", voteCount: 78 },
    { name: "Margherita Pizza", voteCount: 65 },
    { name: "Tiramisu", voteCount: 43 },
  ]},
  { businessSlug: "seoul-bbq-house-dallas", dishes: [
    { name: "Korean BBQ Combo", voteCount: 72 },
    { name: "Kimchi Jjigae", voteCount: 56 },
    { name: "Bulgogi", voteCount: 41 },
  ]},
  { businessSlug: "thai-orchid-garden-dallas", dishes: [
    { name: "Green Curry", voteCount: 65 },
    { name: "Pad See Ew", voteCount: 48 },
    { name: "Mango Sticky Rice", voteCount: 34 },
  ]},
  { businessSlug: "pho-95-dallas", dishes: [
    { name: "Pho Dac Biet", voteCount: 58 },
    { name: "Vermicelli Bowl", voteCount: 42 },
    { name: "Banh Mi", voteCount: 31 },
  ]},
  { businessSlug: "istanbul-grill-dallas", dishes: [
    { name: "Adana Kebab", voteCount: 72 },
    { name: "Hummus Platter", voteCount: 54 },
    { name: "Lamb Pide", voteCount: 38 },
  ]},
  { businessSlug: "shawarma-point-dallas", dishes: [
    { name: "Chicken Shawarma Wrap", voteCount: 65 },
    { name: "Falafel Plate", voteCount: 48 },
    { name: "Garlic Toum Fries", voteCount: 29 },
  ]},
  // ── Sprint 303: Additional dishes for existing businesses ──
  { businessSlug: "koryo-kalbi-dallas", dishes: [
    { name: "Galbi", voteCount: 78 },
    { name: "Japchae", voteCount: 45 },
    { name: "Kimchi Pancake", voteCount: 34 },
  ]},
  { businessSlug: "asian-mint-dallas", dishes: [
    { name: "Pad Thai", voteCount: 89 },
    { name: "Green Curry", voteCount: 54 },
    { name: "Tom Kha Gai", voteCount: 38 },
  ]},
  { businessSlug: "saigon-bites-dallas", dishes: [
    { name: "Banh Mi", voteCount: 76 },
    { name: "Spring Rolls", voteCount: 54 },
    { name: "Broken Rice Plate", voteCount: 38 },
  ]},
  { businessSlug: "sichuan-house-dallas", dishes: [
    { name: "Mapo Tofu", voteCount: 87 },
    { name: "Dan Dan Noodles", voteCount: 65 },
    { name: "Dry Pot Chicken", voteCount: 43 },
  ]},
  { businessSlug: "kabob-king-dallas", dishes: [
    { name: "Seekh Kabob", voteCount: 89 },
    { name: "Lamb Chops", voteCount: 67 },
    { name: "Chicken Tikka", voteCount: 45 },
  ]},
  { businessSlug: "smoke-and-vine-dallas", dishes: [
    { name: "Smoked Brisket", voteCount: 98 },
    { name: "Pulled Pork", voteCount: 67 },
    { name: "Mac and Cheese", voteCount: 45 },
  ]},
  { businessSlug: "fearings-dallas", dishes: [
    { name: "Tortilla Soup", voteCount: 87 },
    { name: "Barbecued Shrimp Taco", voteCount: 65 },
    { name: "Rattlesnake Queso", voteCount: 43 },
  ]},
  { businessSlug: "tei-an-dallas", dishes: [
    { name: "Hand-Cut Soba", voteCount: 76 },
    { name: "Tempura Assortment", voteCount: 54 },
  ]},
  { businessSlug: "casa-oaxaca-dallas", dishes: [
    { name: "Tlayuda", voteCount: 78 },
    { name: "Chapulines Taco", voteCount: 56 },
    { name: "Mezcal Flight", voteCount: 34 },
  ]},
  { businessSlug: "taqueria-la-ventana-dallas", dishes: [
    { name: "Al Pastor Taco", voteCount: 112 },
    { name: "Salsa Verde", voteCount: 67 },
    { name: "Fresh Tortillas", voteCount: 45 },
  ]},
  // ── Sprint 315: Expanded dishes for new leaderboards ──
  // Samosa
  { businessSlug: "desi-district-richardson", dishes: [
    { name: "Aloo Samosa", voteCount: 89 },
  ]},
  { businessSlug: "chennai-cafe-frisco", dishes: [
    { name: "Samosa Chaat", voteCount: 54 },
  ]},
  { businessSlug: "tandoori-flames-irving", dishes: [
    { name: "Keema Samosa", voteCount: 67 },
  ]},
  // Burrito
  { businessSlug: "abuelas-kitchen-dallas", dishes: [
    { name: "Carne Asada Burrito", voteCount: 76 },
  ]},
  { businessSlug: "el-rincon-del-sabor-dallas", dishes: [
    { name: "Burrito Mojado", voteCount: 89 },
  ]},
  { businessSlug: "taqueria-la-ventana-dallas", dishes: [
    { name: "Al Pastor Burrito", voteCount: 56 },
  ]},
  // Enchilada (covers enchilada ILIKE match)
  { businessSlug: "casa-oaxaca-dallas", dishes: [
    { name: "Enchilada Suizas", voteCount: 65 },
  ]},
  // Sushi
  { businessSlug: "uchi-dallas", dishes: [
    { name: "Omakase Sushi", voteCount: 112 },
  ]},
  { businessSlug: "tei-an-dallas", dishes: [
    { name: "Chirashi Sushi Bowl", voteCount: 65 },
  ]},
  // Pasta
  { businessSlug: "lucia-dallas", dishes: [
    { name: "Ricotta Gnudi Pasta", voteCount: 78 },
  ]},
  { businessSlug: "nonnas-trattoria-dallas", dishes: [
    { name: "Pasta Bolognese", voteCount: 87 },
  ]},
  { businessSlug: "cane-rosso-dallas", dishes: [
    { name: "Truffle Pasta", voteCount: 56 },
  ]},
  // Wings
  { businessSlug: "the-yard-kitchen-dallas", dishes: [
    { name: "Smoked Wings", voteCount: 78 },
  ]},
  { businessSlug: "raising-canes-dallas", dishes: [
    { name: "Buffalo Wings", voteCount: 65 },
  ]},
  { businessSlug: "fearings-dallas", dishes: [
    { name: "Jalapeño Wings", voteCount: 54 },
  ]},
  // Falafel
  { businessSlug: "istanbul-grill-dallas", dishes: [
    { name: "Crispy Falafel Plate", voteCount: 65 },
  ]},
  { businessSlug: "kabob-king-dallas", dishes: [
    { name: "Falafel Wrap", voteCount: 54 },
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
        cuisine: biz.cuisine || null,
        city: "Dallas",
        neighborhood: biz.neighborhood,
        address: biz.address,
        phone: biz.phone,
        website: (biz as any).website || null,
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
  // Use photoUrl from each business as default; only override when extra photos exist
  const photoSets: Record<string, string[]> = {};

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

  // ── Dish Leaderboards — Sprint 168 seed ────────────────────
  const SEED_DISH_BOARDS = [
    { dishName: "Biryani", dishSlug: "biryani", dishEmoji: "🍛", displayOrder: 1 },
    { dishName: "Ramen", dishSlug: "ramen", dishEmoji: "🍜", displayOrder: 2 },
    { dishName: "Taco", dishSlug: "taco", dishEmoji: "🌮", displayOrder: 3 },
    { dishName: "Burger", dishSlug: "burger", dishEmoji: "🍔", displayOrder: 4 },
    { dishName: "Coffee", dishSlug: "coffee", dishEmoji: "☕", displayOrder: 5 },
    // Sprint 303: Expanded dish leaderboards
    { dishName: "Pizza", dishSlug: "pizza", dishEmoji: "🍕", displayOrder: 6 },
    { dishName: "Pho", dishSlug: "pho", dishEmoji: "🍲", displayOrder: 7 },
    { dishName: "Dosa", dishSlug: "dosa", dishEmoji: "🫓", displayOrder: 8 },
    { dishName: "Kebab", dishSlug: "kebab", dishEmoji: "🥙", displayOrder: 9 },
    { dishName: "Brisket", dishSlug: "brisket", dishEmoji: "🥩", displayOrder: 10 },
    // Sprint 315: Expanded dish leaderboards
    { dishName: "Butter Chicken", dishSlug: "butter-chicken", dishEmoji: "🍗", displayOrder: 11 },
    { dishName: "Samosa", dishSlug: "samosa", dishEmoji: "🥟", displayOrder: 12 },
    { dishName: "Burrito", dishSlug: "burrito", dishEmoji: "🌯", displayOrder: 13 },
    { dishName: "Enchilada", dishSlug: "enchilada", dishEmoji: "🫔", displayOrder: 14 },
    { dishName: "Sushi", dishSlug: "sushi", dishEmoji: "🍣", displayOrder: 15 },
    { dishName: "Pasta", dishSlug: "pasta", dishEmoji: "🍝", displayOrder: 16 },
    { dishName: "Banh Mi", dishSlug: "banh-mi", dishEmoji: "🥖", displayOrder: 17 },
    { dishName: "Wings", dishSlug: "wings", dishEmoji: "🍗", displayOrder: 18 },
    { dishName: "Falafel", dishSlug: "falafel", dishEmoji: "🧆", displayOrder: 19 },
  ];

  for (const board of SEED_DISH_BOARDS) {
    const [lb] = await db.insert(dishLeaderboards).values({
      city: "dallas",
      dishName: board.dishName,
      dishSlug: board.dishSlug,
      dishEmoji: board.dishEmoji,
      status: "active",
      displayOrder: board.displayOrder,
      source: "system",
    }).returning();

    // Populate entries from existing seeded dishes
    // Sprint 315: Match both hyphenated slugs and space-separated names
    const slugPattern = "%" + board.dishSlug + "%";
    const spacePattern = "%" + board.dishSlug.replace(/-/g, " ") + "%";
    const matchingDishes = await db.select({ businessId: dishes.businessId })
      .from(dishes)
      .innerJoin(businesses, eq(dishes.businessId, businesses.id))
      .where(and(
        eq(businesses.city, "Dallas"),
        sql`(${dishes.nameNormalized} ILIKE ${slugPattern} OR ${dishes.nameNormalized} ILIKE ${spacePattern})`,
      ));

    const uniqueBizIds = [...new Set(matchingDishes.map(d => d.businessId))];
    for (let i = 0; i < uniqueBizIds.length; i++) {
      const biz = insertedBusinesses.find(b => b.id === uniqueBizIds[i]);
      if (!biz) continue;
      await db.insert(dishLeaderboardEntries).values({
        leaderboardId: lb.id,
        businessId: biz.id,
        dishScore: (4.5 - i * 0.3).toFixed(2),
        dishRatingCount: Math.max(3, 15 - i * 3),
        rankPosition: i + 1,
        photoUrl: biz.photoUrl,
      });
    }
  }
  console.log("Seeded dish leaderboards (5 boards for Dallas)");

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
