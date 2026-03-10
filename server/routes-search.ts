/**
 * Search Routes — Sprint 256
 *
 * Endpoints for search suggestions / autocomplete and popular searches.
 * Wired into routes.ts via registerSearchRoutes.
 *
 * Owner: Cole Anderson (Search Infrastructure)
 */

import { Router } from "express";
import { log } from "./logger";
import { getSuggestions, getPopularSearches, getCitySuggestionCount, getAllIndexedCities } from "./search-suggestions";
import { trackSearchQuery, getPopularQueries, getQueryTrackerStats } from "./search-query-tracker";
import { sanitizeString } from "./sanitize";

const searchRouteLog = log.tag("SearchRoutes");

export function registerSearchRoutes(app: Router): void {
  // GET /api/search/suggestions — typeahead autocomplete
  app.get("/api/search/suggestions", (req, res) => {
    const query = sanitizeString(req.query.q, 200) || "";
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));

    if (!query) {
      return res.json({ data: [] });
    }

    const suggestions = getSuggestions(query, city, limit);
    searchRouteLog.info(`Suggestions for "${query}" in ${city}: ${suggestions.length} results`);
    return res.json({ data: suggestions });
  });

  // GET /api/search/popular — top searches for a city
  app.get("/api/search/popular", (req, res) => {
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit as string) || 5));

    const popular = getPopularSearches(city, limit);
    return res.json({ data: popular });
  });

  // POST /api/search/track — record a search query for popularity tracking
  app.post("/api/search/track", (req, res) => {
    const query = sanitizeString(req.body?.query, 200) || "";
    const city = sanitizeString(req.body?.city, 100) || "Dallas";
    if (query.length >= 2) {
      trackSearchQuery(query, city);
    }
    return res.json({ data: { tracked: true } });
  });

  // GET /api/search/popular-queries — top searched queries by frequency
  app.get("/api/search/popular-queries", (req, res) => {
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit as string) || 8));
    const queries = getPopularQueries(city, limit);
    return res.json({ data: queries });
  });

  // GET /api/admin/search/index-stats — admin endpoint for index health
  app.get("/api/admin/search/index-stats", (req, res) => {
    const cities = getAllIndexedCities();
    const stats = cities.map(city => ({
      city,
      count: getCitySuggestionCount(city),
    }));
    return res.json({ data: { cities: stats, totalCities: cities.length } });
  });

  // GET /api/admin/search/query-stats — query popularity tracking stats
  app.get("/api/admin/search/query-stats", (req, res) => {
    const stats = getQueryTrackerStats();
    return res.json({ data: stats });
  });
}
