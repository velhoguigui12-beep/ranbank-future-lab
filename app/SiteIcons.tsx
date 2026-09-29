// Ícones simples em linha usados no site institucional.
const paths = {
  pix: "M12 3l4.2 4.2a2 2 0 010 2.8L12 14.2 7.8 10a2 2 0 010-2.8L12 3zM12 14.2l4.2 4.2M12 14.2l-4.2 4.2M12 21l-4.2-2.6M12 21l4.2-2.6",
  bill: "M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6M9 16h3",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  vault: "M4 7a3 3 0 013-3h10a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3zM12 9v6M9 12h6",
  shield: "M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6l8-3zM8.5 12l2.5 2.5 4.5-5",
  lock: "M6 10h12v10H6zM8.5 10V7a3.5 3.5 0 017 0v3M12 14v2.5",
  check: "M5 12.5l4.5 4.5L19 7.5",
  arrow: "M5 12h14M13 6l6 6-6 6",
  chat: "M4 5h16v11H9l-5 4V5zM8 9.5h8M8 12.5h5",
  leaf: "M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19l7-7",
  card: "M3 6h18v12H3zM3 10h18M7 15h4",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  key: "M14 10a4 4 0 11-2.9-3.85M14 10l7 7M18 14l-2 2M20 16l-2 2",
  users: "M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20c.6-3.4 3.3-5.5 6.5-5.5s5.9 2.1 6.5 5.5M16 4.3a3.5 3.5 0 010 6.4M18 14.8c1.9.7 3.2 2.5 3.5 5.2",
  book: "M4 5a2 2 0 012-2h13v15H6a2 2 0 00-2 2V5zM4 20a2 2 0 002 1h13",
  alert: "M12 3l9.5 17h-19L12 3zM12 10v4.5M12 17.5h.01",
  eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 100-6 3 3 0 000 6z",
  cloud: "M7 18h10a4 4 0 00.5-8A6 6 0 006 9.5 4.3 4.3 0 007 18z",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6L6 18",
  phone: "M8 2.5h8a1.5 1.5 0 011.5 1.5v16a1.5 1.5 0 01-1.5 1.5H8A1.5 1.5 0 016.5 20V4A1.5 1.5 0 018 2.5zM11 18.5h2",
  sprout: "M12 21v-9M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 14c0-4 3-6.5 7-6.5 0 4-3 6.5-7 6.5",
  access: "M12 5.5a1.8 1.8 0 100-3.6 1.8 1.8 0 000 3.6zM5 8l7 1.5L19 8M12 9.5V14l-3 7M12 14l3 7",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  return (
    <svg className="rs-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}
