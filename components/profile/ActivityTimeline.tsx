/**
 * Sprint 437: Unified activity timeline for profile page.
 * Merges ratings, bookmarks, and achievements into a single chronological feed
 * with event-type indicators and date grouping (Today, Yesterday, This Week, Earlier).
 */
import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { formatTimeAgo } from "@/lib/data";

const AMBER = BRAND.colors.amber;
const INITIAL_SHOW = 8;

// ─── Event Types ─────────────────────────────────────────────────
export type TimelineEventType = "rating" | "bookmark" | "achievement";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: number; // epoch ms
  title: string;
  subtitle?: string;
  score?: number;
  slug?: string; // for navigation
  icon: string;
  iconColor: string;
}

export interface ActivityTimelineProps {
  ratings: { id: string; businessName: string; businessSlug?: string; rawScore: string; createdAt: string; note?: string | null }[];
  bookmarks: { id: string; name: string; slug: string; category: string; savedAt: number }[];
  achievements: { id: string; label: string; earnedAt?: number }[];
}

// ─── Event Builders ──────────────────────────────────────────────
function ratingIcon(score: number): { name: string; color: string } {
  if (score >= 8) return { name: "star", color: AMBER };
  if (score >= 6) return { name: "thumbs-up", color: Colors.green };
  if (score >= 4) return { name: "remove-circle-outline", color: Colors.textSecondary };
  return { name: "thumbs-down", color: Colors.red };
}

function buildEvents(props: ActivityTimelineProps): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Ratings
  for (const r of props.ratings) {
    const score = parseFloat(r.rawScore);
    const ic = ratingIcon(score);
    events.push({
      id: `r-${r.id}`,
      type: "rating",
      timestamp: new Date(r.createdAt).getTime(),
      title: r.businessName,
      subtitle: r.note ? `"${r.note}"` : `Rated ${score.toFixed(1)}`,
      score,
      slug: r.businessSlug,
      icon: ic.name,
      iconColor: ic.color,
    });
  }

  // Bookmarks
  for (const b of props.bookmarks) {
    events.push({
      id: `b-${b.id}`,
      type: "bookmark",
      timestamp: b.savedAt,
      title: b.name,
      subtitle: `Saved · ${b.category}`,
      slug: b.slug,
      icon: "bookmark",
      iconColor: BRAND.colors.navy,
    });
  }

  // Achievements
  for (const a of props.achievements) {
    if (!a.earnedAt) continue;
    events.push({
      id: `a-${a.id}`,
      type: "achievement",
      timestamp: a.earnedAt,
      title: a.label,
      subtitle: "Achievement unlocked",
      icon: "trophy",
      iconColor: AMBER,
    });
  }

  // Sort descending by timestamp
  events.sort((a, b) => b.timestamp - a.timestamp);
  return events;
}

// ─── Date Grouping ───────────────────────────────────────────────
type DateGroup = "Today" | "Yesterday" | "This Week" | "Earlier";

function getDateGroup(ts: number): DateGroup {
  const now = Date.now();
  const diff = now - ts;
  const dayMs = 86400000;
  if (diff < dayMs) return "Today";
  if (diff < dayMs * 2) return "Yesterday";
  if (diff < dayMs * 7) return "This Week";
  return "Earlier";
}

// ─── Timeline Row ────────────────────────────────────────────────
function TimelineRow({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  const timeAgo = formatTimeAgo(new Date(event.timestamp).toISOString());

  const handlePress = () => {
    if (event.slug) {
      router.push({ pathname: "/business/[id]", params: { id: event.slug } });
    }
  };

  const typeLabel = event.type === "rating" ? "Rated" : event.type === "bookmark" ? "Saved" : "Earned";

  return (
    <TouchableOpacity
      style={s.eventRow}
      onPress={handlePress}
      activeOpacity={event.slug ? 0.7 : 1}
      disabled={!event.slug}
      accessibilityRole="button"
      accessibilityLabel={`${typeLabel} ${event.title}, ${timeAgo}`}
    >
      {/* Timeline dot + line */}
      <View style={s.timelineCol}>
        <View style={[s.dot, { backgroundColor: event.iconColor }]}>
          <Ionicons name={event.icon as IoniconsName} size={10} color="#fff" />
        </View>
        {!isLast && <View style={s.line} />}
      </View>

      {/* Content */}
      <View style={s.eventContent}>
        <View style={s.eventHeader}>
          <View style={s.eventTitleRow}>
            <View style={[s.typeBadge, { backgroundColor: `${event.iconColor}15` }]}>
              <Text style={[s.typeBadgeText, { color: event.iconColor }]}>{typeLabel}</Text>
            </View>
            <Text style={s.eventTitle} numberOfLines={1}>{event.title}</Text>
          </View>
          {event.score !== undefined && (
            <Text style={[s.eventScore, { color: event.iconColor }]}>{event.score.toFixed(1)}</Text>
          )}
        </View>
        <View style={s.eventMeta}>
          <Text style={s.eventTime}>{timeAgo}</Text>
          {event.subtitle && (
            <Text style={s.eventSubtitle} numberOfLines={1}>{event.subtitle}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export function ActivityTimeline({ ratings, bookmarks, achievements }: ActivityTimelineProps) {
  const [showAll, setShowAll] = useState(false);

  const allEvents = useMemo(
    () => buildEvents({ ratings, bookmarks, achievements }),
    [ratings, bookmarks, achievements],
  );

  const displayEvents = showAll ? allEvents : allEvents.slice(0, INITIAL_SHOW);

  if (allEvents.length === 0) return null;

  // Group events by date
  const grouped = useMemo(() => {
    const groups: { label: DateGroup; events: TimelineEvent[] }[] = [];
    let currentGroup: DateGroup | null = null;
    for (const ev of displayEvents) {
      const group = getDateGroup(ev.timestamp);
      if (group !== currentGroup) {
        currentGroup = group;
        groups.push({ label: group, events: [] });
      }
      groups[groups.length - 1].events.push(ev);
    }
    return groups;
  }, [displayEvents]);

  const eventCounts = useMemo(() => {
    const counts = { rating: 0, bookmark: 0, achievement: 0 };
    for (const ev of allEvents) counts[ev.type]++;
    return counts;
  }, [allEvents]);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.title}>Activity Timeline</Text>
          <View style={s.countBadge}>
            <Text style={s.countText}>{allEvents.length}</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          {eventCounts.rating > 0 && (
            <View style={s.typeSummary}>
              <Ionicons name="star-outline" size={10} color={AMBER} />
              <Text style={s.typeSummaryText}>{eventCounts.rating}</Text>
            </View>
          )}
          {eventCounts.bookmark > 0 && (
            <View style={s.typeSummary}>
              <Ionicons name="bookmark-outline" size={10} color={BRAND.colors.navy} />
              <Text style={s.typeSummaryText}>{eventCounts.bookmark}</Text>
            </View>
          )}
          {eventCounts.achievement > 0 && (
            <View style={s.typeSummary}>
              <Ionicons name="trophy-outline" size={10} color={AMBER} />
              <Text style={s.typeSummaryText}>{eventCounts.achievement}</Text>
            </View>
          )}
        </View>
      </View>

      {grouped.map((group, gi) => (
        <View key={group.label}>
          <Text style={s.groupLabel}>{group.label}</Text>
          <View style={s.timeline}>
            {group.events.map((ev, i) => (
              <TimelineRow
                key={ev.id}
                event={ev}
                isLast={gi === grouped.length - 1 && i === group.events.length - 1}
              />
            ))}
          </View>
        </View>
      ))}

      {allEvents.length > INITIAL_SHOW && (
        <TouchableOpacity
          style={s.showMoreBtn}
          onPress={() => setShowAll(v => !v)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={showAll ? "Show fewer events" : `Show all ${allEvents.length} events`}
        >
          <Text style={s.showMoreText}>
            {showAll ? "Show Less" : `Show All ${allEvents.length}`}
          </Text>
          <Ionicons name={showAll ? "chevron-up" : "chevron-down"} size={14} color={AMBER} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { gap: 8, marginTop: 8 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: {
    fontSize: 15, fontWeight: "600", color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  countBadge: {
    backgroundColor: `${AMBER}15`, borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  countText: {
    fontSize: 11, fontWeight: "700", color: AMBER,
    fontFamily: "DMSans_700Bold",
  },
  typeSummary: { flexDirection: "row", alignItems: "center", gap: 3 },
  typeSummaryText: {
    fontSize: 10, color: Colors.textTertiary,
    fontFamily: "DMSans_500Medium",
  },
  groupLabel: {
    fontSize: 11, fontWeight: "600", color: Colors.textTertiary,
    fontFamily: "DMSans_600SemiBold", textTransform: "uppercase",
    letterSpacing: 0.5, marginTop: 8, marginBottom: 4,
  },
  timeline: { gap: 0 },
  eventRow: { flexDirection: "row", gap: 12 },
  timelineCol: { alignItems: "center", width: 24 },
  dot: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
  },
  line: {
    width: 2, flex: 1, backgroundColor: Colors.border,
    marginVertical: 2,
  },
  eventContent: { flex: 1, paddingBottom: 14, gap: 3 },
  eventHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  eventTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  typeBadge: {
    paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 9, fontWeight: "700", fontFamily: "DMSans_700Bold",
    textTransform: "uppercase", letterSpacing: 0.3,
  },
  eventTitle: {
    fontSize: 13, fontWeight: "600", color: Colors.text,
    fontFamily: "DMSans_600SemiBold", flex: 1,
  },
  eventScore: {
    fontSize: 14, fontWeight: "700",
    fontFamily: "PlayfairDisplay_700Bold",
  },
  eventMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  eventTime: {
    fontSize: 11, color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  eventSubtitle: {
    fontSize: 11, color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular", fontStyle: "italic", flex: 1,
  },
  showMoreBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 4, paddingVertical: 8,
  },
  showMoreText: {
    fontSize: 12, fontWeight: "600", color: AMBER,
    fontFamily: "DMSans_600SemiBold",
  },
});
