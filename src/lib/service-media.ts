/** One image per service, shared by overview, detail and video placements. */
const images = import.meta.glob<{ default: string }>("/src/assets/imported/src/assets/hd/service-*.jpg", { eager: true });

export const serviceNames = [
  "Life ID & Digital Identity", "Banking Services", "Digital Payments",
  "Bill Pay & Mobile Recharge", "Remittance", "Savings & Financial Goals",
  "Insurance Services", "Healthcare & Hospitals", "Telemedicine",
  "Pharmacy & Medicine", "Diagnostics & Lab Tests", "Emergency Assistance",
  "Education & E-Learning", "Skills & Professional Training", "Jobs & Career",
  "Travel & Tourism", "Flights & Ticketing", "Hotels & Accommodation",
  "Transport & Mobility", "Shopping & Marketplace", "Groceries & Daily Needs",
  "Food Delivery", "Home & Utility Services", "Government Services",
  "Agriculture & Rural Services", "AI Personal Assistant",
] as const;

const byName = new Map<string, string>();
const byNumber = new Map<number, string>();
serviceNames.forEach((name, index) => {
  const image = images[`/src/assets/imported/src/assets/hd/service-${String(index + 1).padStart(2, "0")}.jpg`]?.default;
  if (image) { byName.set(name.toLowerCase(), image); byNumber.set(index + 1, image); }
});

export function serviceImage(number: number, alt = ""): string | undefined {
  const name = alt.replace(/&amp;/g, "&").replace(/ (service experience|video preview)$/i, "").trim().toLowerCase();
  return byName.get(name) ?? byNumber.get(((number - 1) % serviceNames.length) + 1);
}