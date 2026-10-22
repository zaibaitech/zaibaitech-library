import type { LineWalk } from "../types";

/**
 * Steps were written against the chapter's earlier 42-line split. Each now points at the
 * passage where its line begins (see legacyIds in akhdari.json). Rewrite the steps to the
 * current paragraphing before study tools are enabled.
 */

/**
 * Pointers name the case the line is on. They are not a translation.
 * The walker moves through the lines in order. The entries only choose where to start.
 */
export const sahwWalk: LineWalk = {
  id: "sahw",
  title: "Sujud al-sahw, line by line",
  intro:
    "The chapter's lines, in order. An entry opens the line that states that case. Next and Previous follow the book. Nothing here collapses a line into a ruling the line does not state.",
  entries: [
    { label: "From the first line", unitId: "sahw_forgetfulness.p01" },
    { label: "A deficiency", unitId: "sahw_forgetfulness.p01" },
    { label: "An addition", unitId: "sahw_forgetfulness.p01" },
    { label: "Both", unitId: "sahw_forgetfulness.p01" },
    { label: "One sunnah", unitId: "sahw_forgetfulness.p06" },
    { label: "Doubt", unitId: "sahw_forgetfulness.p07" },
    { label: "Waswasa", unitId: "sahw_forgetfulness.p08" },
    { label: "Laughing", unitId: "sahw_forgetfulness.p15" },
    { label: "Someone who joined late", unitId: "sahw_forgetfulness.p39" },
    { label: "A voluntary prayer", unitId: "sahw_forgetfulness.p45" },
  ],
  steps: [
    {
      unitId: "sahw_forgetfulness.p01",
      pointer:
        "The prostration is a sunnah. A deficiency: two sujud before the salam, after both tashahhuds, then another tashahhud. An addition: two after the salam, then a tashahhud and another salam. Both: before the salam. The before-salam sujud, if missed until the salam, is done when still close; a long gap or leaving the mosque drops it.",
    },
    {
      unitId: "sahw_forgetfulness.p03",
      pointer:
        "If that before-salam sujud lapses, the prayer is invalid when it rested on three sunan or more, and not otherwise. The after-salam sujud is done even a year later. A missed obligation is not repaired by the sujud. Missed virtues: no sujud. The before-salam sujud is for leaving two sunan or more.",
    },
    {
      unitId: "sahw_forgetfulness.p06",
      pointer:
        "A single sunnah has no sujud, except the silent and the aloud. Silent in a loud prayer: before the salam. Aloud in a silent prayer: after. Speaking by forgetfulness, and the salam after two rakʿas by forgetfulness, are after the salam.",
    },
    {
      unitId: "sahw_forgetfulness.p07",
      pointer:
        "One or two extra rakʿas: sujud after the salam. Adding the like of the prayer invalidates it. Doubt about whether the prayer is complete: he does what he doubts, and a doubted deficiency counts as one. A doubted rakʿah or sujud is done, with sujud after the salam.",
    },
    {
      unitId: "sahw_forgetfulness.p08",
      pointer:
        "Doubt about the salam: he says it if still close, with no sujud; if a long time passed, the prayer is invalid. The person of waswasa sets the whispering aside and does not build on it.",
    },
    {
      unitId: "sahw_forgetfulness.p10",
      pointer:
        "Qunut aloud: no sujud, and doing it on purpose is disliked. A surah added in the last two rakʿas: no sujud. Sending prayers on the Prophet when one hears his name in the prayer: the line says nothing is due.",
    },
    {
      unitId: "sahw_forgetfulness.p11",
      pointer: "This fragment finishes that last case: whether by forgetfulness or on purpose, standing or sitting.",
    },
    {
      unitId: "sahw_forgetfulness.p12",
      pointer:
        "Two surahs or more in one rakʿah, moving from surah to surah, or bowing before the surah ends: nothing is due. A gesture with the hand or the head: nothing is due.",
    },
    {
      unitId: "sahw_forgetfulness.p13",
      pointer:
        "Repeating the Fatiha by forgetfulness: sujud after the salam. On purpose, the line says the apparent ruling is that the prayer is invalid. Remembering the surah after bending into ruku: he does not go back. Remembering the silent or the aloud before ruku: he repeats the recitation.",
    },
    {
      unitId: "sahw_forgetfulness.p14",
      pointer:
        "If that repeat was only the surah, he repeats it and does not prostrate. If it was the Fatiha, he repeats it and prostrates after the salam. If ruku has already passed: before the salam for leaving the aloud, after the salam for leaving the silent, whether it was the Fatiha or only the surah.",
    },
    {
      unitId: "sahw_forgetfulness.p15",
      pointer:
        "Laughing invalidates the prayer, by forgetfulness or on purpose. The line says only a heedless, playful person laughs in it, and that the believer, when he stands, turns his heart from everything but Allah and leaves the world.",
    },
    {
      unitId: "sahw_forgetfulness.p16",
      pointer:
        "Until his heart is present to Allah’s majesty. The line calls that the prayer of the God-fearing. A smile has nothing due. The crying of a humble person in the prayer is overlooked.",
    },
    {
      unitId: "sahw_forgetfulness.p17",
      pointer:
        "Listening briefly: nothing is due. Rising from two rakʿas before the sitting: if he remembers before his hands and knees leave the ground, he sits again and does not prostrate. If he has left the ground, he continues, does not return, and prostrates before the salam. If he returns after leaving it and after standing, by forgetfulness or on purpose, the prayer is valid and he prostrates after the salam.",
    },
    {
      unitId: "sahw_forgetfulness.p19",
      pointer: "Blowing in the prayer by forgetfulness: sujud after the salam. On purpose, the prayer is invalid.",
    },
    {
      unitId: "sahw_forgetfulness.p20",
      pointer:
        "A sneeze: he does not occupy himself with praise, does not answer someone who blesses him, and does not bless a person who sneezed. If he praises Allah, nothing is due.",
    },
    {
      unitId: "sahw_forgetfulness.p21",
      pointer:
        "A yawn: he covers his mouth, and he does not spit except into his garment, without pronouncing letters. A short thought about hadath or impurity, then certainty of purity: nothing is due. Turning aside by forgetfulness: nothing is due.",
    },
    {
      unitId: "sahw_forgetfulness.p23",
      pointer:
        "Doing that turn on purpose is disliked. Turning his back to the qibla cuts the prayer. Silk, gold, stealing in the prayer, or a forbidden look: the line calls him disobedient and says the prayer is valid. A word that is not Quran, by mistake: sujud after the salam.",
    },
    {
      unitId: "sahw_forgetfulness.p25",
      pointer:
        "If the slip is still from the Quran, no sujud, unless the wording changes or the meaning breaks, in which case the sujud is after the salam. Dozing: no sujud, unless he slept heavily.",
    },
    {
      unitId: "sahw_forgetfulness.p27",
      pointer:
        "Clearing the throat to be understood is disliked and does not invalidate the prayer. Answering a call with “subhan Allah”: disliked, and the prayer stands. Stuck in the recitation with no one to prompt him: he leaves that verse. If he cannot, he bows.",
    },
    {
      unitId: "sahw_forgetfulness.p29",
      pointer:
        "He does not look at a mushaf in front of him, except that the Fatiha must be completed from a mushaf or otherwise. Leaving one verse of it: sujud before the salam. Leaving more: the prayer is invalid. Prompting someone who is not his imam: the prayer is invalid.",
    },
    {
      unitId: "sahw_forgetfulness.p30",
      pointer:
        "He does not prompt his imam unless the imam is waiting or the meaning would break. A short worldly thought lessens the reward and does not invalidate the prayer.",
    },
    {
      unitId: "sahw_forgetfulness.p32",
      pointer:
        "Vomiting or qalas that overcomes him: nothing is due. The imam carries the follower’s forgetfulness, except a missed obligation. The follower who forgets, dozes, or is crowded out of ruku, other than in the first rakʿah, is the next line.",
    },
    {
      unitId: "sahw_forgetfulness.p34",
      pointer:
        "If he can still catch the imam before the rise from the second sujud, he bows and catches him. If not, he leaves the bow, follows, and makes up a rakʿah.",
    },
    {
      unitId: "sahw_forgetfulness.p35",
      pointer:
        "Missing the sujud, or being crowded or drowsy until the imam stands for another rakʿah: he prostrates if he can catch the imam before ruku. Otherwise he leaves it and follows.",
    },
    {
      unitId: "sahw_forgetfulness.p36",
      pointer:
        "Killing a scorpion or a snake: nothing is due, unless the act goes on or he turns his back to the qibla, in which case he stops. Doubt whether he is in witr or in the second of shafʿ: he makes it the second of shafʿ, prostrates after the salam, then prays witr.",
    },
    {
      unitId: "sahw_forgetfulness.p38",
      pointer: "Speech between shafʿ and witr by forgetfulness: nothing is due. On purpose it is disliked, and nothing further is due.",
    },
    {
      unitId: "sahw_forgetfulness.p39",
      pointer:
        "Someone who caught less than a rakʿah does not prostrate with the imam, before or after. If he does, the prayer is invalid. Someone who caught a rakʿah or more does the before-salam sujud with the imam and delays the after-salam sujud until he finishes, then prostrates after his own salam.",
    },
    {
      unitId: "sahw_forgetfulness.p39",
      pointer:
        "If that latecomer prostrates the after-salam one with the imam on purpose, the prayer is invalid. By forgetfulness, he prostrates after the salam. His own forgetfulness after the imam’s salam is like someone praying alone.",
    },
    {
      unitId: "sahw_forgetfulness.p41",
      pointer:
        "He forgot ruku and remembers in sujud: he returns to standing. It is recommended that he repeat a little of the recitation, then bow, and prostrate after the salam.",
    },
    {
      unitId: "sahw_forgetfulness.p43",
      pointer:
        "He forgot two prostrations: he goes down, and does not sit, and in all of these the sujud is after the salam. Remembering the sujud after rising from the next rakʿah is the following line.",
    },
    {
      unitId: "sahw_forgetfulness.p44",
      pointer:
        "The line places the sujud after the salam when the missed prostration was not from the first two rakʿas, or was from them and he remembered before contracting the third, because the surah and the sitting have not yet been missed.",
    },
    {
      unitId: "sahw_forgetfulness.p45",
      pointer:
        "The salam while unsure the prayer is complete invalidates it. Forgetfulness in a makeup prayer is like forgetfulness in a prayer on time. Forgetfulness in a nafl is like a fard, except six matters: the Fatiha, the surah, the silent, and the aloud.",
    },
    {
      unitId: "sahw_forgetfulness.p47",
      pointer:
        "An extra rakʿah, and forgetting some of the integrals if a long time passed, are among those exceptions. Forgetting the Fatiha in a nafl and remembering after ruku: he continues and prostrates before the salam, unlike the fard.",
    },
    {
      unitId: "sahw_forgetfulness.p48",
      pointer: "His prostration is as the chapter already said for someone who leaves a prostration.",
    },
    {
      unitId: "sahw_forgetfulness.p49",
      pointer:
        "Forgetting the surah, or the silent, or the aloud, in a nafl, and remembering after ruku: he continues and does not prostrate, unlike the fard.",
    },
    {
      unitId: "sahw_forgetfulness.p50",
      pointer:
        "Standing for a third rakʿah in a nafl: if he remembers before contracting the ruku he returns and prostrates after the salam. If he contracted the third he continues, adds a fourth, and the line states the sujud.",
    },
    {
      unitId: "sahw_forgetfulness.p51",
      pointer:
        "Forgetting an integral of a nafl, such as ruku or sujud, and not remembering until the salam, and a long time has passed: he does not repeat it, unlike a fard, which he repeats.",
    },
    {
      unitId: "sahw_forgetfulness.p53",
      pointer:
        "A sigh: nothing is due unless he pronounces a letter. The follower alerts the imam with “subhan Allah.” If the imam stands from two rakʿas, he alerts him; once the imam has left the ground, he follows. If the imam sits in the first or the third, the follower stands and does not sit with him.",
    },
    {
      unitId: "sahw_forgetfulness.p56",
      pointer:
        "If the imam prostrates once and leaves the second, the follower alerts him and does not stand unless he fears the imam will contract the ruku. He does not sit with him after that, in the second or the fourth.",
    },
    {
      unitId: "sahw_forgetfulness.p57",
      pointer:
        "If they are a group, the better course the line names is to put one of them forward to finish. An imam who adds a third prostration is alerted, and they do not prostrate it with him. An imam who stands for a fifth is the next line.",
    },
    {
      unitId: "sahw_forgetfulness.p59",
      pointer:
        "If one follower sits and another stands, the prayer of the one who stood is invalid. An imam who says the salam before the prayer is complete is alerted. If he accepts it, he completes the prayer and prostrates after the salam. If he doubts the report, he asks two upright people, and they may speak for that.",
    },
    {
      unitId: "sahw_forgetfulness.p60",
      pointer:
        "If he is certain the prayer is complete, he acts on his certainty and leaves the two, unless the people behind him are many, in which case he leaves his certainty and goes back to them.",
    },
  ],
};
