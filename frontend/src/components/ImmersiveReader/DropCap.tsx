interface Props {
  letter: string;
}

export default function DropCap({ letter }: Props) {
  return (
    <span
      className="float-left font-display text-6xl leading-none mr-3 mt-1"
      style={{
        color: "var(--color-gold)",
        textShadow: "0 0 20px rgba(196, 162, 101, 0.3)",
      }}
    >
      {letter}
    </span>
  );
}
