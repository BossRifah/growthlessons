// Lightweight hand-drawn-style line-art, inline SVG so there are no image
// requests. Swap these for your real illustrations whenever you like.

export function ChatIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M4 5h16v11H9l-4 4v-4H4z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function DoodleBird({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none">
      <path
        d="M30 70c-6-18 8-38 28-38 14 0 26 9 30 22 8 1 14 6 14 13 0 8-7 14-16 14H40c-8 0-13-5-13-12"
        stroke="#ff6a35"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="52" r="3" fill="#ff6a35" />
      <path d="M58 56l10 3-9 4" stroke="#ff6a35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 92l6-10M58 92l4-9" stroke="#ff6a35" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function DoodleCreature({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 140" fill="none">
      <path
        d="M44 120c-14-4-22-18-20-34 1-9 6-16 6-24 0-10 8-18 24-18s24 9 24 20c0 7 5 13 6 22 2 17-7 31-22 34"
        stroke="#6b46ff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="56" r="2.5" fill="#6b46ff" />
      <circle cx="66" cy="56" r="2.5" fill="#6b46ff" />
      <path d="M50 68c4 4 12 4 16 0" stroke="#6b46ff" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M40 40l-6-12M76 40l8-12" stroke="#6b46ff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
