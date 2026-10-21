import type { GuideHighlight } from "@/content/types";

const WASH = new Set<GuideHighlight>(["hands", "mouth", "nose", "face", "arms", "feet"]);

export function WuduScene({ highlight }: { highlight: GuideHighlight }) {
  return (
    <svg
      viewBox="0 0 360 470"
      className="wudu-svg h-auto w-full text-ink"
      data-highlight={highlight}
      data-water={WASH.has(highlight) ? "on" : "off"}
      role="img"
      aria-label="Diagram marking the part of wudu this step names"
    >
      <path className="gold-line" d="M46 430 V168 C46 72 314 72 314 168 V430" />
      <path className="gold-line" d="M62 430 V176 C62 92 298 92 298 176 V430" />
      <path data-part="ring" className="gold-line" d="M150 120 h130 v250 h-130 z" strokeDasharray="5 6" />

      <g className="text-ink">
        <path className="ink" d="M54 292c18-8 28-2 32 16 8 28-6 48-22 54" />
        <path className="ink" d="M40 250c8 18 8 36-2 52" />
        <ellipse className="ink" cx="70" cy="318" rx="24" ry="32" />
        <path className="ink" d="M86 292c28-18 48-8 62 6" />
        <path className="stream" d="M146 300c18 28 8 70 22 108" />
      </g>

      <text
        data-part="tasmiya"
        x="214"
        y="78"
        textAnchor="middle"
        className="fill-gold"
        style={{ fontFamily: "var(--font-amiri), serif", fontSize: 28 }}
      >
        بسم الله
      </text>

      <g>
        <circle data-part="head" className="ink" cx="214" cy="156" r="34" />
        <path data-part="wipe" className="gold-line" d="M184 140q30-28 60 0" />
        <ellipse data-part="ear" className="ink" cx="176" cy="158" rx="6" ry="10" />
        <ellipse data-part="ear" className="ink" cx="252" cy="158" rx="6" ry="10" />
        <ellipse data-part="face" className="ink" cx="214" cy="162" rx="18" ry="20" />
        <path data-part="nose" className="ink" d="M214 156 v12" />
        <path data-part="mouth" className="ink" d="M204 174 h20" />
        <path data-part="siwak" className="gold-line" d="M226 176 268 198" strokeWidth="3" />
        <path className="ink" d="M196 190 v18 M232 190 v18" />
        <path className="ink" d="M168 226 Q214 208 260 226 L276 352 Q214 376 152 352 Z" />
        <path data-part="heart" className="gold-line" d="M214 250 l10 10 -10 14 -10-14 z" fill="rgb(var(--gold) / 0.35)" />
        <path data-part="arm-right" className="ink" d="M176 236 C150 270 142 310 156 340" />
        <path data-part="arm-left" className="ink" d="M252 236 C286 268 300 312 286 342" />
        <circle data-part="hand" className="ink" cx="156" cy="348" r="10" />
        <circle data-part="hand" className="ink" cx="286" cy="348" r="10" />
        <ellipse data-part="foot" className="ink" cx="188" cy="392" rx="18" ry="9" />
        <ellipse data-part="foot" className="ink" cx="240" cy="392" rx="18" ry="9" />
      </g>

      <ellipse className="basin" cx="214" cy="430" rx="74" ry="12" />
    </svg>
  );
}
