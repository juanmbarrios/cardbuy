import Link from "next/link";

const GAMES = [
  {
    name: "Pokémon",
    href: "/listings?game=pokemon",
    gradient: "from-red-900/50 to-yellow-900/30",
    border: "hover:border-red-500/50",
    icon: "⚡",
    color: "text-red-400",
  },
  {
    name: "Magic: The Gathering",
    href: "/listings?game=magic",
    gradient: "from-purple-900/50 to-blue-900/30",
    border: "hover:border-purple-500/50",
    icon: "✦",
    color: "text-purple-400",
  },
  {
    name: "Yu-Gi-Oh!",
    href: "/listings?game=yugioh",
    gradient: "from-yellow-900/50 to-slate-900/30",
    border: "hover:border-yellow-500/50",
    icon: "★",
    color: "text-yellow-400",
  },
  {
    name: "One Piece",
    href: "/listings?game=onepiece",
    gradient: "from-blue-900/50 to-red-900/30",
    border: "hover:border-blue-500/50",
    icon: "☠",
    color: "text-blue-400",
  },
  {
    name: "Lorcana",
    href: "/listings?game=lorcana",
    gradient: "from-indigo-900/50 to-purple-900/30",
    border: "hover:border-indigo-500/50",
    icon: "✦",
    color: "text-indigo-400",
  },
  {
    name: "Dragon Ball",
    href: "/listings?game=dragonball",
    gradient: "from-orange-900/50 to-yellow-900/30",
    border: "hover:border-orange-500/50",
    icon: "◉",
    color: "text-orange-400",
  },
  {
    name: "Flesh and Blood",
    href: "/listings?game=flesh-and-blood",
    gradient: "from-red-950/60 to-slate-900/30",
    border: "hover:border-red-400/50",
    icon: "⚔",
    color: "text-red-300",
  },
  {
    name: "Digimon",
    href: "/listings?game=digimon",
    gradient: "from-cyan-900/50 to-blue-900/30",
    border: "hover:border-cyan-500/50",
    icon: "◈",
    color: "text-cyan-400",
  },
  {
    name: "Vanguard",
    href: "/listings?game=vanguard",
    gradient: "from-blue-900/50 to-slate-800/30",
    border: "hover:border-blue-400/50",
    icon: "◆",
    color: "text-blue-300",
  },
];

export function GamesGrid() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9">
      {GAMES.map((game) => (
        <Link
          key={game.href}
          href={game.href}
          className={[
            "flex flex-col items-center gap-2 rounded-xl border border-surface-border",
            `bg-gradient-to-br ${game.gradient}`,
            "p-4 text-center transition-all duration-200",
            game.border,
            "hover:shadow-glow-card hover:-translate-y-0.5",
          ].join(" ")}
        >
          <span className={`text-2xl font-bold leading-none ${game.color}`}>
            {game.icon}
          </span>
          <span className="text-xs font-medium text-slate-300 leading-tight">
            {game.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
