export function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none">
      <polygon points="36,4 6,36 36,68 36,4" fill="#5B82FF" opacity="0.95" />
      <polygon points="36,4 66,36 36,68 36,4" fill="#5B82FF" opacity="0.40" />
      <path d="M10,56 Q36,24 62,14" fill="none" stroke="#3ED9B8" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="62" cy="14" r="5.5" fill="#3ED9B8" />
    </svg>
  );
}
