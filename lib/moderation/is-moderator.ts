// Moderators are listed phones in MODERATOR_PHONES (comma-separated E.164).
// Empty/unset means nobody is a moderator — the queue 404s rather than
// becoming an accidental public inbox.

export function parseModeratorPhones(raw: string | undefined = process.env.MODERATOR_PHONES): string[] {
  return (raw ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function isModeratorPhone(
  phone: string | undefined | null,
  raw: string | undefined = process.env.MODERATOR_PHONES,
): boolean {
  if (!phone) return false;
  return parseModeratorPhones(raw).includes(phone);
}
