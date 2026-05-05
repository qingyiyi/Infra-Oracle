import fortuneYaml from "../data/fortune/fortunes.yaml?raw";
import { load } from "js-yaml";

export interface FortuneEntry {
  id: string;
  tier: string;
  tone: string;
  theme: string;
  headline: string;
  summary: string;
  do: string[];
  dont: string[];
  lucky_color: {
    name: string;
    value: string;
  };
  lucky_symbol: string;
  energy: number;
  quote: {
    text: string;
    author: string;
    source: string;
    source_url: string;
    note?: string;
  };
  tags: string[];
  disclaimer: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid fortune entry: missing string field "${key}"`);
  }

  return value;
}

function readStringArray(record: Record<string, unknown>, key: string): string[] {
  const value = record[key];

  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== "string")) {
    throw new Error(`Invalid fortune entry: missing string array field "${key}"`);
  }

  return value as string[];
}

function normalizeFortune(entry: unknown): FortuneEntry {
  if (!isRecord(entry)) {
    throw new Error("Invalid fortune entry: expected object");
  }

  const luckyColor = entry.lucky_color;
  const quote = entry.quote;

  if (!isRecord(luckyColor)) {
    throw new Error(`Invalid fortune entry ${entry.id ?? ""}: missing lucky_color`);
  }

  if (!isRecord(quote)) {
    throw new Error(`Invalid fortune entry ${entry.id ?? ""}: missing quote`);
  }

  const energy = entry.energy;

  if (typeof energy !== "number" || energy < 0 || energy > 100) {
    throw new Error(`Invalid fortune entry ${entry.id ?? ""}: energy must be 0-100`);
  }

  return {
    id: readString(entry, "id"),
    tier: readString(entry, "tier"),
    tone: readString(entry, "tone"),
    theme: readString(entry, "theme"),
    headline: readString(entry, "headline"),
    summary: readString(entry, "summary"),
    do: readStringArray(entry, "do"),
    dont: readStringArray(entry, "dont"),
    lucky_color: {
      name: readString(luckyColor, "name"),
      value: readString(luckyColor, "value"),
    },
    lucky_symbol: readString(entry, "lucky_symbol"),
    energy,
    quote: {
      text: readString(quote, "text"),
      author: readString(quote, "author"),
      source: readString(quote, "source"),
      source_url: readString(quote, "source_url"),
      note: typeof quote.note === "string" ? quote.note : undefined,
    },
    tags: readStringArray(entry, "tags"),
    disclaimer: readString(entry, "disclaimer"),
  };
}

const parsedFortunes = load(fortuneYaml);

if (!Array.isArray(parsedFortunes)) {
  throw new Error("Fortune data must be a YAML array");
}

export const fortuneEntries = parsedFortunes.map(normalizeFortune);

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getFortuneIndexForDate(dateKey: string, total = fortuneEntries.length): number {
  if (total <= 0) {
    return 0;
  }

  let hash = 2166136261;

  for (let index = 0; index < dateKey.length; index += 1) {
    hash ^= dateKey.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) % total;
}

export function getFortuneForDate(dateKey = getLocalDateKey()): FortuneEntry {
  return fortuneEntries[getFortuneIndexForDate(dateKey)];
}
