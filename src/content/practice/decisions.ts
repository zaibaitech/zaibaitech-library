import type { CheckCard, DecisionGuide, DecisionNode } from "../types";

function leaf(id: string, prompt: string, result: string, sourceUnitId: string): DecisionNode {
  return { id, prompt, result, sourceUnitId };
}

function ask(
  id: string,
  prompt: string,
  sourceUnitId: string,
  choices: DecisionNode["choices"],
): DecisionNode {
  return { id, prompt, sourceUnitId, choices };
}

export const tawbaCheck: CheckCard = {
  id: "tawba",
  title: "Tawba, as the line states it",
  intro: "Three conditions, from one line. Ticking them does not add a ruling. The line also says tawba is not delayed, and one does not say “until Allah guides me.”",
  sourceUnitId: "obligations_of_the_mukallaf.3",
  items: [
    { id: "regret", label: "Regret for what has passed" },
    { id: "resolve", label: "A resolve not to return to a sin for the rest of one’s life" },
    { id: "leave", label: "Leaving the sin at once, if one is still in it" },
  ],
  closing: "The next words of the line call delaying tawba, and saying “until Allah guides me,” a sign of wretchedness. That sentence is the Arabic below, not this list.",
};

export const akhdariDecisions: DecisionGuide[] = [
  {
    id: "water",
    title: "Water",
    intro: "The purification chapter’s test for the water it requires. One line.",
    start: "changed",
    nodes: [
      ask("changed", "Has the colour, the taste, or the smell changed?", "tahara_purification.1", [
        { label: "No", next: "clear" },
        { label: "Yes", next: "by" },
      ]),
      leaf(
        "clear",
        "Unchanged water",
        "The chapter says none of purification is valid except with the pure water it calls al-maṭar: water whose colour, taste, or smell has not changed.",
        "tahara_purification.1",
      ),
      ask("by", "What changed it?", "tahara_purification.1", [
        { label: "Something that usually separates: oil, ghee, fat, wadḥ, soap, dirt, and the like", next: "out" },
        { label: "Earth, mud, a salt flat, baked brick, and the like", next: "ok" },
      ]),
      leaf(
        "out",
        "Changed by what usually separates",
        "The line defines the water it requires as water that has not been changed by what usually separates from it, and it names oil, ghee, fat, wadḥ, soap, and dirt.",
        "tahara_purification.1",
      ),
      leaf(
        "ok",
        "Earth and the like",
        "The line says there is no harm from earth, mud, a salt flat, baked brick, and the like.",
        "tahara_purification.1",
      ),
    ],
  },
  {
    id: "najasa",
    title: "Impurity on a garment",
    intro: "One line. Each outcome is a clause of that line.",
    start: "spot",
    nodes: [
      ask("spot", "What is known about the impurity?", "najasa_impurity.1", [
        { label: "The spot is known", next: "known" },
        { label: "It is on the garment, and the spot is unclear", next: "all" },
        { label: "I doubt that impurity landed", next: "sprinkle" },
        { label: "Something landed, and I doubt that it is impure", next: "none" },
        { label: "I remembered it during the prayer", next: "during" },
        { label: "I remembered after the salam", next: "after" },
      ]),
      leaf("known", "A known spot", "The line says the spot is washed.", "najasa_impurity.1"),
      leaf("all", "An unclear spot", "The line says the whole garment is washed.", "najasa_impurity.1"),
      leaf("sprinkle", "Doubt that it landed", "The line says he sprinkles.", "najasa_impurity.1"),
      leaf("none", "Doubt that the thing is impure", "The line says there is no sprinkle.", "najasa_impurity.1"),
      leaf(
        "during",
        "Remembered in the prayer",
        "The line says he stops, unless he fears the time will leave.",
        "najasa_impurity.1",
      ),
      leaf(
        "after",
        "Remembered after the salam",
        "The line says he repeats in the time.",
        "najasa_impurity.1",
      ),
    ],
  },
  {
    id: "missed-wudu",
    title: "A missed wudu step",
    intro: "The cases in the wudu chapter after the lists. Each card is one clause.",
    start: "which",
    nodes: [
      ask("which", "What was left out?", "wudu_faraid_sunan.3", [
        { label: "An obligation, and I have only just remembered", next: "soon" },
        { label: "An obligation, and a long time has passed", next: "late" },
        { label: "A sunnah", next: "sunnah" },
        { label: "A spot", next: "spot" },
        { label: "The mouth and the nose, after I had started the face", next: "face" },
      ]),
      leaf(
        "soon",
        "An obligation, remembered soon",
        "The line says he does it and what comes after it.",
        "wudu_faraid_sunan.3",
      ),
      leaf(
        "late",
        "An obligation, after a long gap",
        "The line says he does that limb alone and repeats what he prayed before.",
        "wudu_faraid_sunan.3",
      ),
      leaf(
        "sunnah",
        "A sunnah",
        "The line says he does it, and he does not repeat the prayer.",
        "wudu_faraid_sunan.3",
      ),
      leaf(
        "spot",
        "A spot",
        "The line says he washes it alone, with an intention. If he had prayed before that, he repeats.",
        "wudu_faraid_sunan.3",
      ),
      leaf(
        "face",
        "Mouth and nose, after the face",
        "The line says he does not go back to them until he finishes the wudu.",
        "wudu_faraid_sunan.3",
      ),
    ],
  },
  {
    id: "nullifiers",
    title: "What breaks wudu",
    intro: "The chapter splits events and causes, then doubt, then madhi.",
    start: "kind",
    nodes: [
      ask("kind", "Which is it?", "wudu_nullifiers.1", [
        { label: "An event: urine, stool, wind, madhi, or wadi", next: "event" },
        { label: "A cause", next: "cause" },
        { label: "I doubt that wudu broke", next: "doubt" },
        { label: "Madhi", next: "madhi" },
      ]),
      leaf(
        "event",
        "The events",
        "The line lists urine, stool, wind, madhi, and wadi as the events.",
        "wudu_nullifiers.1",
      ),
      leaf(
        "cause",
        "The causes",
        "The line lists heavy sleep, fainting, drunkenness, insanity, a kiss, touching a woman when pleasure was meant or found, and touching the penis with the inside of the hand or the inside of the fingers.",
        "wudu_nullifiers.2",
      ),
      ask("doubt", "Is this waswasa?", "wudu_nullifiers.3", [
        { label: "No", next: "doubt-yes" },
        { label: "Yes, he is a person of waswasa", next: "waswasa" },
      ]),
      leaf("doubt-yes", "Doubt", "The line says wudu is due.", "wudu_nullifiers.3"),
      leaf("waswasa", "Waswasa", "The line says nothing is due.", "wudu_nullifiers.3"),
      leaf(
        "madhi",
        "Madhi",
        "The line says the whole penis is washed, and the testicles are not. It describes madhi as the fluid that comes with the lesser pleasure, from a thought, a look, or something else.",
        "wudu_nullifiers.3",
      ),
    ],
  },
  {
    id: "requires-wudu",
    title: "Acts that require wudu",
    intro: "What the chapter withholds from a person without wudu, and the exceptions on the same lines.",
    start: "act",
    nodes: [
      ask("act", "Which act?", "acts_requiring_wudu.1", [
        { label: "Prayer, tawaf, or touching a copy of the Quran or its cover", next: "withheld" },
        { label: "A portion of it, for the learner", next: "portion" },
        { label: "A board, for a learner or a teacher correcting it", next: "board" },
        { label: "A child touching the Quran", next: "child" },
        { label: "Praying without wudu on purpose", next: "deliberate" },
      ]),
      leaf(
        "withheld",
        "Prayer, tawaf, a copy",
        "The line says these are not lawful without wudu, by the hand or by a stick and the like.",
        "acts_requiring_wudu.1",
      ),
      leaf(
        "portion",
        "A learner’s portion",
        "The line excepts the portion for the learner.",
        "acts_requiring_wudu.1",
      ),
      leaf(
        "board",
        "A board",
        "The line excepts a learner using it, or a teacher correcting it.",
        "acts_requiring_wudu.1",
      ),
      leaf(
        "child",
        "A child",
        "The line says a child is like an adult in touching the Quran, and the sin is on the person who handed it over.",
        "acts_requiring_wudu.2",
      ),
      leaf(
        "deliberate",
        "On purpose",
        "The line states its own wording for someone who prays without wudu on purpose, and it seeks refuge in Allah. Read the Arabic. This card does not restate a ruling past that sentence.",
        "acts_requiring_wudu.2",
      ),
    ],
  },
  {
    id: "ghusl-due",
    title: "When ghusl is due",
    intro: "Three causes, then the two forms of janaba, then two cases the chapter answers with “nothing” or with ghusl.",
    start: "cause",
    nodes: [
      ask("cause", "Which cause is in question?", "ghusl_causes.1", [
        { label: "Janaba, hayd, or nifas — the three the line names", next: "three" },
        { label: "How the lines divide janaba", next: "forms" },
        { label: "A dream of intercourse, and no maniy came", next: "dream" },
        { label: "Dry maniy on the garment, and the time is unknown", next: "dry" },
      ]),
      leaf(
        "three",
        "The three",
        "The line says ghusl is due from janaba, hayd, and nifas.",
        "ghusl_causes.1",
      ),
      ask(
        "forms",
        "This line says janaba has two forms and states the first. The second form is the next line.",
        "ghusl_causes.1",
        [
          { label: "The first form, on this line", next: "form1" },
          { label: "The second form, the next line", next: "form2" },
        ],
      ),
      leaf(
        "form1",
        "The first form",
        "This line: maniy leaving with the usual pleasure, asleep or awake, in intercourse or otherwise.",
        "ghusl_causes.1",
      ),
      leaf(
        "form2",
        "The second form",
        "The next line: the glans disappearing in the vagina.",
        "ghusl_causes.2",
      ),
      leaf("dream", "A dream, no maniy", "The line says nothing is due.", "ghusl_causes.2"),
      leaf(
        "dry",
        "Dry maniy, time unknown",
        "The line says he performs ghusl and repeats what he prayed from the last sleep in which it could have happened.",
        "ghusl_causes.2",
      ),
    ],
  },
  {
    id: "ghusl-spot",
    title: "A missed spot in ghusl",
    intro: "The end of the ghusl chapter.",
    start: "when",
    nodes: [
      ask("when", "What happened after the spot was remembered?", "ghusl_faraid_sunan.3", [
        { label: "He washed it when he remembered", next: "washed" },
        { label: "He delayed after remembering", next: "delayed" },
        { label: "The spot is a wudu limb, and the wudu wash met it", next: "met" },
      ]),
      leaf(
        "washed",
        "Washed when remembered",
        "The line says he goes to wash it when he remembers, even after a month, and he repeats what he prayed before.",
        "ghusl_faraid_sunan.3",
      ),
      leaf(
        "delayed",
        "Delayed",
        "The line says the ghusl is invalid.",
        "ghusl_faraid_sunan.4",
      ),
      leaf(
        "met",
        "A wudu limb the wudu wash met",
        "The line says that suffices.",
        "ghusl_faraid_sunan.4",
      ),
    ],
  },
  {
    id: "tayammum-who",
    title: "Who may use tayammum",
    intro: "The opening line of the tayammum chapter. Surfaces and later rules are the next guides.",
    start: "who",
    nodes: [
      ask("who", "Who is asking, and for which prayer?", "tayammum.1", [
        { label: "A traveller, not in disobedience, for a fard or a nafl", next: "traveller" },
        { label: "Someone ill, for a fard or a nafl", next: "ill" },
        { label: "A healthy resident who fears the time of a fard will leave", next: "resident-fard" },
        { label: "A healthy resident, for a nafl, Jumuʿah, or a funeral", next: "resident-other" },
      ]),
      leaf("traveller", "The traveller", "The line includes him, for a fard or a nafl, when the journey is not disobedience.", "tayammum.1"),
      leaf("ill", "The ill person", "The line includes him, for a fard or a nafl.", "tayammum.1"),
      leaf(
        "resident-fard",
        "A fard whose time would leave",
        "The line says the healthy resident uses tayammum for the obligations when he fears the time will leave.",
        "tayammum.1",
      ),
      leaf(
        "resident-other",
        "Nafl, Jumuʿah, a funeral",
        "The line says the healthy resident does not use tayammum for a nafl, for Jumuʿah, or for a funeral, unless that funeral is assigned to him.",
        "tayammum.1",
      ),
    ],
  },
  {
    id: "tayammum-earth",
    title: "What the tayammum strikes",
    intro: "The lines that define saʿid, and what they exclude.",
    start: "surface",
    nodes: [
      ask("surface", "What would he strike?", "tayammum.3", [
        { label: "Earth, brick, stone, snow, khadkhad, or the like", next: "said" },
        { label: "Cooked gypsum, a mat, wood, grass, or the like", next: "no" },
        { label: "An ill person, a wall of stone or brick, and no one to hand him something else", next: "wall" },
      ]),
      leaf("said", "Saʿid", "The line includes earth, brick, stone, snow, khadkhad, and the like.", "tayammum.3"),
      leaf(
        "no",
        "Not this",
        "The line says tayammum is not allowed with cooked gypsum, a mat, wood, grass, and the like.",
        "tayammum.4",
      ),
      leaf(
        "wall",
        "A wall, for the ill",
        "The line grants that concession when he finds no one to hand him something else.",
        "tayammum.4",
      ),
    ],
  },
  {
    id: "tayammum-after",
    title: "What one tayammum covers",
    intro: "The last two lines of the chapter.",
    start: "cover",
    nodes: [
      ask("cover", "What is he trying to cover?", "tayammum.7", [
        { label: "Two fard prayers with one tayammum", next: "two" },
        { label: "After a fard: nafl, the mushaf, tawaf, or recitation", next: "after-fard" },
        { label: "A tayammum made for a nafl", next: "nafl" },
        { label: "Isha, then shafʿ and witr", next: "witr" },
        { label: "Tayammum from janaba", next: "janaba" },
      ]),
      leaf("two", "Two fards", "The line says two fard prayers are not prayed with one tayammum.", "tayammum.7"),
      leaf(
        "after-fard",
        "After a fard",
        "The line allows the nafl after it, touching the mushaf, tawaf, and recitation, if he intended that, it stayed joined to the prayer, and the time has not left.",
        "tayammum.7",
      ),
      leaf(
        "nafl",
        "Made for a nafl",
        "The line allows everything it just mentioned except the fard.",
        "tayammum.8",
      ),
      leaf(
        "witr",
        "Shafʿ and witr",
        "The line says someone who prayed isha with tayammum stands for shafʿ and witr after it without a delay.",
        "tayammum.8",
      ),
      leaf(
        "janaba",
        "From janaba",
        "The line says that intention is required.",
        "tayammum.8",
      ),
    ],
  },
  {
    id: "hayd",
    title: "Menstruation",
    intro: "Lengths, then what the chapter suspends. The wording stays inside the lines.",
    start: "who",
    nodes: [
      ask("who", "Which length is in question?", "hayd_menstruation.1", [
        { label: "A beginner", next: "beginner" },
        { label: "A woman with a habit", next: "habit" },
        { label: "Pregnant", next: "pregnant" },
        { label: "The blood stops and returns", next: "join" },
        { label: "What hayd suspends", next: "suspends" },
      ]),
      leaf(
        "beginner",
        "A beginner",
        "The line says her maximum is fifteen days.",
        "hayd_menstruation.1",
      ),
      leaf(
        "habit",
        "A habit",
        "The line says her maximum is her habit. If the blood continues she adds three days, as long as that does not pass fifteen.",
        "hayd_menstruation.1",
      ),
      leaf(
        "pregnant",
        "Pregnant",
        "The line says after three months, fifteen days and the like; after six months, twenty and the like.",
        "hayd_menstruation.1",
      ),
      leaf(
        "join",
        "Blood that stops and starts",
        "The line says she adds the days until her habit is complete.",
        "hayd_menstruation.2",
      ),
      leaf(
        "suspends",
        "What it suspends",
        "The line withholds prayer, fasting, tawaf, touching a mushaf, and entering the mosque. The fast is made up. The prayer is not. Recitation, the line says, is allowed. It withholds from the husband her front, and what is between the navel and the knee, until she performs ghusl.",
        "hayd_menstruation.2",
      ),
    ],
  },
  {
    id: "nifas",
    title: "Postnatal bleeding",
    intro: "Two lines. It follows hayd in what it suspends.",
    start: "case",
    nodes: [
      ask("case", "Which case?", "nifas_postnatal.1", [
        { label: "How long, and what it suspends", next: "max" },
        { label: "The blood stopped before that, even on the day of birth", next: "stop" },
        { label: "The blood came back", next: "return" },
      ]),
      leaf(
        "max",
        "The maximum",
        "The line says nifas is like hayd in what it suspends, and its maximum is sixty days.",
        "nifas_postnatal.1",
      ),
      leaf(
        "stop",
        "It stopped",
        "The line says she performs ghusl and prays, even if that is the day of the birth.",
        "nifas_postnatal.1",
      ),
      leaf(
        "return",
        "It returned",
        "If fifteen days or more passed between them, the line calls the second hayd. Otherwise it is joined to the first and is the rest of the nifas.",
        "nifas_postnatal.2",
      ),
    ],
  },
  {
    id: "times",
    title: "Prayer times",
    intro: "Chosen time and necessary time, in the chapter’s qama. These cards do not turn that into clock hours.",
    start: "which",
    nodes: [
      ask("which", "Which time?", "salah_times.1", [
        { label: "Zuhr and asr", next: "zuhr" },
        { label: "Maghrib and isha", next: "maghrib" },
        { label: "Subh", next: "subh" },
        { label: "A voluntary prayer", next: "nafl" },
      ]),
      leaf(
        "zuhr",
        "Zuhr and asr",
        "Chosen zuhr runs from the sun’s decline to the end of one qama. Chosen asr runs from the qama to the yellowing. The necessary time of both runs to sunset.",
        "salah_times.1",
      ),
      leaf(
        "maghrib",
        "Maghrib and isha",
        "Chosen maghrib is the measure of praying it after its conditions. Chosen isha runs from the disappearance of the twilight to the first third of the night. The necessary time of both runs to fajr.",
        "salah_times.1",
      ),
      leaf(
        "subh",
        "Subh",
        "Chosen subh runs from fajr to the higher isfar. Its necessary time runs to sunrise. Makeup, the line says, is whatever falls outside these. Delaying a prayer until its time has left is called a great sin, except for someone who forgot or was asleep.",
        "salah_times.2",
      ),
      leaf(
        "nafl",
        "When a nafl is not prayed",
        "The line says no nafl after subh until the sun is up, after asr until maghrib, and after fajr except the wird of someone who slept through it. Also while the Jumuʿah imam is sitting on the minbar, and after Jumuʿah until he leaves the mosque.",
        "salah_times.3",
      ),
    ],
  },
  {
    id: "qada",
    title: "Making up missed prayers",
    intro: "Order, the form that was missed, and which voluntary prayers the chapter still names.",
    start: "which",
    nodes: [
      ask("which", "Which question?", "qada_missed_prayers.1", [
        { label: "Is makeup due?", next: "due" },
        { label: "In what form?", next: "form" },
        { label: "A few missed prayers, and the current one", next: "order" },
        { label: "Which voluntary prayers remain?", next: "nafl" },
        { label: "He forgot how many", next: "number" },
      ]),
      leaf(
        "due",
        "Makeup",
        "The line says what is owed must be made up, and neglecting it is not lawful. Someone who prays five days’ worth each day, the line says, is not neglecting it.",
        "qada_missed_prayers.1",
      ),
      leaf(
        "form",
        "The form",
        "The line says a missed resident prayer is made up as resident, and a missed travel prayer as travel, whether he is resident or travelling when he makes it up.",
        "qada_missed_prayers.1",
      ),
      leaf(
        "order",
        "A few",
        "The line says order between the two current prayers, and between a few missed ones and the current prayer, is obligatory when remembered. A few is four or fewer. Four or fewer are prayed before the current one even if its time leaves. Makeup is allowed in every time.",
        "qada_missed_prayers.2",
      ),
      leaf(
        "nafl",
        "Voluntary prayers",
        "The line says someone who still owes prayers does not pray duha or the night prayers of Ramadan. It leaves him shafʿ, witr, fajr, the two ids, the eclipse, and istisqa. People who owe the same prayer may pray it together.",
        "qada_missed_prayers.3",
      ),
      leaf(
        "number",
        "A forgotten number",
        "The line says he prays a number that leaves him without doubt.",
        "qada_missed_prayers.3",
      ),
    ],
  },
];
