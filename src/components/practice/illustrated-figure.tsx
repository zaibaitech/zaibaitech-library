import type { GuideHighlight, GuideKind } from "@/content/types";

const WASH = new Set<GuideHighlight>([
  "hands",
  "mouth",
  "nose",
  "face",
  "arms",
  "feet",
  "head",
  "upper",
  "body",
  "right-side",
  "cover",
  "najasa",
]);

const RUB = new Set<GuideHighlight>(["face", "arms", "feet", "hands", "head", "upper", "body", "dalk", "cover", "right-side"]);

const POSE: Partial<Record<GuideHighlight, string>> = {
  standing: "stand",
  takbir: "takbir",
  ruku: "ruku",
  rise: "rise",
  sujud: "sujud",
  sitting: "sit",
  "lean-stand": "lean",
  "sit-free": "sit",
  "sit-lean": "sit-lean",
  "lie-right": "lie-right",
  "lie-left": "lie-left",
  "lie-back": "lie-back",
};

export function IllustratedFigure({
  highlight,
  kind,
}: {
  highlight: GuideHighlight;
  kind: GuideKind;
}) {
  const pose = POSE[highlight] ?? "stand";
  const water = kind !== "tayammum" && WASH.has(highlight);
  const rub = RUB.has(highlight) || highlight === "wipe-face" || highlight === "wipe-hands";
  const dust = kind === "tayammum";
  return (
    <svg
      viewBox="0 0 320 420"
      className="figure-svg h-full w-full"
      data-highlight={highlight}
      data-pose={pose}
      data-water={water ? "on" : "off"}
      data-rub={rub ? "on" : "off"}
      data-dust={dust ? "on" : "off"}
      role="img"
      aria-label="Illustrated figure marking the act this step names"
    >
      <ellipse className="mat" cx="160" cy="392" rx="108" ry="16" />
      <g data-pose="stand">
        <Standing highlight={highlight} />
      </g>
      <g data-pose="takbir">
        <Standing arms="up" highlight={highlight} />
      </g>
      <g data-pose="ruku">
        <Bow />
      </g>
      <g data-pose="rise">
        <Standing highlight={highlight} />
      </g>
      <g data-pose="sujud">
        <Prostrate />
      </g>
      <g data-pose="sit">
        <Seated lean={false} />
      </g>
      <g data-pose="sit-lean">
        <Seated lean />
      </g>
      <g data-pose="lean">
        <Standing highlight={highlight} />
        <path className="staff" d="M78 150 V370" />
      </g>
      <g data-pose="lie-right">
        <Lying side="right" />
      </g>
      <g data-pose="lie-left">
        <Lying side="left" />
      </g>
      <g data-pose="lie-back">
        <Lying side="back" />
      </g>
      <g className="rub-anchor" aria-hidden="true">
        <g className="rub-hand">
          <path d="M18 8c8-10 16-8 18 2 6 2 10 8 8 14-8 2-16 0-22-4-6 6-16 8-22 2 2-8 8-12 18-14z" />
        </g>
      </g>
      {dust ? (
        <g className="dust" aria-hidden="true">
          <circle cx="64" cy="300" r="3" />
          <circle cx="78" cy="312" r="2" />
          <circle cx="248" cy="304" r="3" />
          <circle cx="236" cy="318" r="2" />
          <circle cx="150" cy="118" r="2" />
        </g>
      ) : null}
    </svg>
  );
}

function Face({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g className="skin" data-part="face">
      <circle cx={cx} cy={cy} r="34" />
      <circle className="eye" cx={cx - 12} cy={cy - 4} r="2.2" />
      <circle className="eye" cx={cx + 12} cy={cy - 4} r="2.2" />
      <path className="brow" d={`M${cx - 18} ${cy - 12} q6-4 12 0`} />
      <path className="brow" d={`M${cx + 6} ${cy - 12} q6-4 12 0`} />
      <path data-part="nose" d={`M${cx} ${cy - 2} v14`} />
      <path data-part="mouth" d={`M${cx - 10} ${cy + 16} q10 6 20 0`} />
    </g>
  );
}

function Standing({
  arms = "down",
  highlight,
}: {
  arms?: "down" | "up";
  highlight: GuideHighlight;
}) {
  const up = arms === "up";
  return (
    <g>
      <path className="robe" data-part="body" d="M118 168 Q160 158 202 168 L228 348 Q160 372 92 348 Z" />
      <path className="robe-fold" d="M160 176 V352" />
      <path data-part="upper" d="M124 176 Q160 166 196 176 L190 230 Q160 240 130 230 Z" />
      <path data-part="right-side" d="M160 176 L196 176 L214 348 Q160 362 160 352 Z" />
      <path className="hem" d="M96 340 Q160 366 224 340" />
      <Face cx={160} cy={78} />
      <path data-part="head" className="hair" d="M128 70 Q160 28 192 70 Q184 48 160 46 Q136 48 128 70" />
      <ellipse data-part="ear" cx="124" cy="82" rx="7" ry="11" />
      <ellipse data-part="ear" cx="196" cy="82" rx="7" ry="11" />
      <path data-part="wipe" d="M132 62 Q160 40 188 62" />
      <text data-part="tasmiya" x="160" y="28" textAnchor="middle">
        بسم الله
      </text>
      <path data-part="siwak" d="M176 96 214 118" />
      <path data-part="heart" d="M160 210 l8 8 -8 12 -8-12 z" />
      {up ? (
        <>
          <path data-part="arm-left" className="sleeve" d="M118 176 C90 140 70 100 78 72" />
          <path data-part="arm-right" className="sleeve" d="M202 176 C230 140 250 100 242 72" />
          <circle data-part="hand" cx="78" cy="66" r="11" />
          <circle data-part="hand" cx="242" cy="66" r="11" />
        </>
      ) : (
        <>
          <path data-part="arm-left" className="sleeve" d="M116 184 C78 220 62 270 74 312" />
          <path data-part="arm-right" className="sleeve" d="M204 184 C242 220 258 270 246 312" />
          <circle data-part="hand" cx="74" cy="322" r="12" />
          <circle data-part="hand" cx="246" cy="322" r="12" />
        </>
      )}
      <ellipse data-part="foot" cx="132" cy="366" rx="22" ry="10" />
      <ellipse data-part="foot" cx="188" cy="366" rx="22" ry="10" />
      <g className="stream">
        <path d="M74 300 c8 28 4 48 12 70" />
        <path d="M246 300 c-8 28 -4 48 -12 70" />
      </g>
      {highlight === "private" ? (
        <text className="modest-note" x="160" y="250" textAnchor="middle">
          named, not drawn
        </text>
      ) : null}
      <ellipse className="basin" cx="160" cy="390" rx="70" ry="12" />
    </g>
  );
}

function Bow() {
  return (
    <g transform="translate(0 20)">
      <path className="robe" d="M70 250 Q160 230 250 250 L236 300 Q160 318 84 300 Z" />
      <Face cx={250} cy={210} />
      <path className="sleeve" d="M90 260 C80 300 70 320 90 340" />
      <path className="sleeve" d="M150 268 C150 310 140 330 160 348" />
      <circle className="skin" cx="92" cy="348" r="10" />
      <circle className="skin" cx="162" cy="354" r="10" />
      <ellipse className="skin" cx="120" cy="360" rx="18" ry="8" />
      <ellipse className="skin" cx="180" cy="360" rx="18" ry="8" />
    </g>
  );
}

function Prostrate() {
  return (
    <g>
      <path className="robe" d="M70 300 Q160 276 250 300 L240 336 Q160 352 80 336 Z" />
      <circle className="skin" data-part="face" cx="78" cy="292" r="22" />
      <path className="sleeve" d="M100 310 H150" />
      <path className="sleeve" d="M170 310 H220" />
      <ellipse className="skin" cx="150" cy="348" rx="16" ry="8" />
      <ellipse className="skin" cx="200" cy="348" rx="16" ry="8" />
    </g>
  );
}

function Seated({ lean }: { lean: boolean }) {
  return (
    <g>
      <path className="robe" d="M96 250 Q160 236 224 250 L236 330 Q160 360 84 330 Z" />
      <Face cx={160} cy={168} />
      <path className="sleeve" d="M120 250 C100 280 110 310 130 318" />
      <path className="sleeve" d="M200 250 C220 280 210 310 190 318" />
      <ellipse className="skin" cx="130" cy="348" rx="26" ry="12" />
      <ellipse className="skin" cx="190" cy="348" rx="26" ry="12" />
      {lean ? <path className="staff" d="M70 160 V360" /> : null}
    </g>
  );
}

function Lying({ side }: { side: "right" | "left" | "back" }) {
  const flip = side === "left" ? "translate(320 0) scale(-1 1)" : undefined;
  if (side === "back") {
    return (
      <g>
        <path className="robe" d="M60 250 H260 Q270 300 250 320 H70 Q50 300 60 250 Z" />
        <circle className="skin" cx="78" cy="270" r="22" />
        <ellipse className="skin" cx="250" cy="310" rx="18" ry="8" />
      </g>
    );
  }
  return (
    <g transform={flip}>
      <path className="robe" d="M70 280 Q180 250 250 290 L240 330 Q160 350 80 320 Z" />
      <circle className="skin" cx="86" cy="276" r="22" />
      <ellipse className="skin" cx="230" cy="336" rx="16" ry="8" />
    </g>
  );
}
