/**
 * TypedIcon — Wrapper around Ionicons that accepts string icon names
 * Owner: Mei Lin (Type Safety Lead)
 *
 * Eliminates the need for `as any` casts on Ionicons `name` prop.
 * Ionicons requires a specific union type for `name`, but we often receive
 * icon names as strings from data models (badges, perks, settings).
 */
import React from "react";
import { Ionicons } from "@expo/vector-icons";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface TypedIconProps {
  name: string;
  size: number;
  color: string;
}

export function TypedIcon({ name, size, color }: TypedIconProps) {
  return <Ionicons name={name as IoniconsName} size={size} color={color} />;
}
