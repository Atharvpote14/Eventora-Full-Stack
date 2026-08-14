export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateString: string | Date, time?: string): string {
  const date = formatDate(dateString);
  if (time) return `${date} · ${time}`;
  return date;
}

export function formatTime(time?: string): string {
  if (!time) return "";
  const [hourStr, minuteStr] = time.split(":");
  const hour = Number(hourStr);
  const minute = minuteStr ?? "00";
  if (Number.isNaN(hour)) return time;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${period}`;
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function availabilityLabel(sold: number, capacity: number): string | null {
  if (!capacity || capacity <= 0) return null;
  const remaining = capacity - sold;
  if (remaining <= 0) return "Sold out";
  const pct = (sold / capacity) * 100;
  if (pct >= 90) return "Almost sold out";
  if (pct >= 70) return "Selling fast";
  return null;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export type CategoryRef = string | { _id: string; name: string; slug: string } | null;

export function categoryName(category: CategoryRef): string {
  if (!category) return "";
  if (typeof category === "string") return category;
  return category.name;
}