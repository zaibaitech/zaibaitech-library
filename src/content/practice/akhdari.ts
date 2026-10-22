import type { BookPractice } from "../types";
import { akhdariDecisions, tawbaCheck } from "./decisions";
import { ghuslGuide, postureGuide, salahGuide, tayammumGuide } from "./more-guides";
import { sahwWalk } from "./sahw-walk";

/**
 * Practice for Mukhtasar al-Akhdari.
 * English labels the step and the class the Arabic gives it.
 * It does not translate the chapter and does not add a ruling.
 */
export const akhdariPractice: BookPractice = {
  bookId: "akhdari",
  intro:
    "Practice stays inside this book. English names the step and the class the Arabic gives it — fard, sunnah, or fadila. Open the cited line and read the ruling there.",
  guides: [
    {
      id: "wudu",
      kind: "wudu",
      title: "Wudu, step by step",
      intro:
        "The wash follows the wudu chapter: seven obligations, then sunan, then virtues. Rubbing (dalk) and continuity (fawr) are obligations that run through the wash, so they are not extra limbs. Order among the obligations is listed as a sunnah.",
      steps: [
        {
          id: "tasmiya",
          title: "Say the name of Allah",
          titleAr: "التسمية",
          classification: "fadila",
          highlight: "tasmiya",
          sourceUnitId: "wudu_faraid_sunan.p05",
          note: "The virtues list opens with the tasmiya. It is not one of the seven obligations.",
        },
        {
          id: "siwak",
          title: "The siwak",
          titleAr: "السواك",
          classification: "fadila",
          highlight: "siwak",
          sourceUnitId: "wudu_faraid_sunan.p05",
          note: "Listed with the tasmiya among the virtues, before the extra wash and starting at the front of the head.",
        },
        {
          id: "niyyah",
          title: "Intention",
          titleAr: "النية",
          classification: "fard",
          highlight: "niyyah",
          sourceUnitId: "wudu_faraid_sunan.p01",
          note: "Named first of the seven obligations.",
        },
        {
          id: "hands",
          title: "Hands to the wrists, at the start",
          titleAr: "غسل اليدين إلى الكوعين",
          classification: "sunnah",
          highlight: "hands",
          sourceUnitId: "wudu_faraid_sunan.p02",
          note: "A sunnah, and the text places it at the start. Washing on to the elbows comes later and is an obligation.",
        },
        {
          id: "madmada",
          title: "Rinse the mouth",
          titleAr: "المضمضة",
          classification: "sunnah",
          highlight: "mouth",
          sourceUnitId: "wudu_faraid_sunan.p02",
          note: "A sunnah. If you remember it only after starting the face, the next lines say not to go back until wudu is finished.",
        },
        {
          id: "istinshaq",
          title: "Draw water into the nose",
          titleAr: "الاستنشاق",
          classification: "sunnah",
          highlight: "nose",
          sourceUnitId: "wudu_faraid_sunan.p02",
          note: "Listed with the rinse and with expelling the water, among the sunan.",
        },
        {
          id: "istinthar",
          title: "Expel the water",
          titleAr: "الاستنثار",
          classification: "sunnah",
          highlight: "nose",
          sourceUnitId: "wudu_faraid_sunan.p02",
          note: "The third of that sunnah group. The chapter keeps all three ahead of the face.",
        },
        {
          id: "face",
          title: "Wash the face, rubbing",
          titleAr: "غسل الوجه",
          classification: "fard",
          highlight: "face",
          sourceUnitId: "wudu_faraid_sunan.p01",
          note: "Washing the face is an obligation, and rubbing is named as its own obligation. A wash beyond the first, on the face and the arms, is a virtue.",
        },
        {
          id: "arms",
          title: "Arms to the elbows",
          titleAr: "غسل اليدين إلى المرفقين",
          classification: "fard",
          highlight: "arms",
          sourceUnitId: "wudu_faraid_sunan.p01",
          note: "An obligation. Doing the right before the left is listed among the virtues, not among the seven.",
        },
        {
          id: "head",
          title: "Wipe the head",
          titleAr: "مسح الرأس",
          classification: "fard",
          highlight: "head",
          sourceUnitId: "wudu_faraid_sunan.p01",
          note: "Wiping the head is an obligation. Beginning at the front is a virtue. Wiping back again is a sunnah.",
        },
        {
          id: "ears",
          title: "Ears, with new water",
          titleAr: "مسح الأذنين",
          classification: "sunnah",
          highlight: "ears",
          sourceUnitId: "wudu_faraid_sunan.p02",
          note: "The sunan list pairs wiping the ears with taking fresh water for them, after the return wipe of the head.",
        },
        {
          id: "feet",
          title: "Feet to the ankles",
          titleAr: "غسل الرجلين إلى الكعبين",
          classification: "fard",
          highlight: "feet",
          sourceUnitId: "wudu_faraid_sunan.p01",
          note: "An obligation. The virtues unit of the same chapter says the toes must be passed through, and it uses يجب for that — it is not one of the seven in the opening list.",
        },
        {
          id: "dalk",
          title: "Rubbing",
          titleAr: "الدلك",
          classification: "fard",
          highlight: "dalk",
          sourceUnitId: "wudu_faraid_sunan.p01",
          note: "One of the seven obligations. It runs through the wash rather than naming a new limb. The hand on the figure is that rub.",
        },
        {
          id: "fawr",
          title: "One act after another",
          titleAr: "الفور",
          classification: "fard",
          highlight: "fawr",
          sourceUnitId: "wudu_faraid_sunan.p01",
          note: "The last of the seven: the acts stay in sequence. Order among the obligations is listed separately, as a sunnah.",
        },
      ],
    },
    ghuslGuide,
    tayammumGuide,
    salahGuide,
    postureGuide,
  ],
  drills: [
    {
      id: "wudu-order",
      title: "Order the wudu",
      intro:
        "Put these acts in the order the chapter supports: intention, the sunan it places at the start, then the obligations in the order it lists them, with the return wipe and the ears where the sunan place them. Continuity and rubbing belong to the whole wash, so they are not cards.",
      steps: [
        {
          id: "w-niyyah",
          title: "Intention",
          titleAr: "النية",
          classification: "fard",
          sourceUnitId: "wudu_faraid_sunan.p01",
        },
        {
          id: "w-hands",
          title: "Hands to the wrists, at the start",
          titleAr: "غسل اليدين إلى الكوعين عند الشروع",
          classification: "sunnah",
          sourceUnitId: "wudu_faraid_sunan.p02",
        },
        {
          id: "w-mouth",
          title: "Mouth, then the nose in and out",
          titleAr: "المضمضة والاستنشاق والاستنثار",
          classification: "sunnah",
          sourceUnitId: "wudu_faraid_sunan.p02",
        },
        {
          id: "w-face",
          title: "Wash the face",
          titleAr: "غسل الوجه",
          classification: "fard",
          sourceUnitId: "wudu_faraid_sunan.p01",
        },
        {
          id: "w-arms",
          title: "Arms to the elbows",
          titleAr: "غسل اليدين إلى المرفقين",
          classification: "fard",
          sourceUnitId: "wudu_faraid_sunan.p01",
        },
        {
          id: "w-head",
          title: "Wipe the head",
          titleAr: "مسح الرأس",
          classification: "fard",
          sourceUnitId: "wudu_faraid_sunan.p01",
        },
        {
          id: "w-ears",
          title: "Return wipe, then the ears with new water",
          titleAr: "رد المسح ومسح الأذنين",
          classification: "sunnah",
          sourceUnitId: "wudu_faraid_sunan.p02",
        },
        {
          id: "w-feet",
          title: "Feet to the ankles",
          titleAr: "غسل الرجلين إلى الكعبين",
          classification: "fard",
          sourceUnitId: "wudu_faraid_sunan.p01",
        },
      ],
    },
    {
      id: "ghusl-order",
      title: "Order the ghusl",
      intro:
        "The virtues sentence gives this order with “then”: impurity, then the private part where the intention is formed, then the wudu limbs once, then the upper body, tripling the head, and the right side. The obligations named at the start are the intention as you begin, continuity, rubbing, and covering the body.",
      steps: [
        {
          id: "g-najasa",
          title: "Wash impurity first",
          titleAr: "البداية بغسل النجاسة",
          classification: "fadila",
          sourceUnitId: "ghusl_faraid_sunan.p03",
        },
        {
          id: "g-niyyah",
          title: "The private part, forming the intention there",
          titleAr: "ثم الذكر فينوي عنده",
          classification: "fadila",
          sourceUnitId: "ghusl_faraid_sunan.p03",
        },
        {
          id: "g-wudu",
          title: "The wudu limbs, once each",
          titleAr: "أعضاء الوضوء مرة مرة",
          classification: "fadila",
          sourceUnitId: "ghusl_faraid_sunan.p03",
        },
        {
          id: "g-upper",
          title: "The upper body",
          titleAr: "أعلى جسده",
          classification: "fadila",
          sourceUnitId: "ghusl_faraid_sunan.p03",
        },
        {
          id: "g-head",
          title: "Wash the head three times",
          titleAr: "تثليث غسل الرأس",
          classification: "fadila",
          sourceUnitId: "ghusl_faraid_sunan.p03",
        },
        {
          id: "g-right",
          title: "The right side of the body first",
          titleAr: "تقديم شق جسده الأيمن",
          classification: "fadila",
          sourceUnitId: "ghusl_faraid_sunan.p03",
        },
      ],
    },
    {
      id: "tayammum-order",
      title: "Order the tayammum",
      intro:
        "These are acts the tayammum chapter names. Entering the time and joining the prayer are obligations, so they open and close the sequence. The first strike is named apart from the sunnah of taking fresh earth for the hands. Continuity belongs to the whole sequence.",
      steps: [
        {
          id: "t-time",
          title: "The time has entered",
          titleAr: "دخول الوقت",
          classification: "fard",
          sourceUnitId: "tayammum.p03",
        },
        {
          id: "t-niyyah",
          title: "Intention",
          titleAr: "النية",
          classification: "fard",
          sourceUnitId: "tayammum.p03",
        },
        {
          id: "t-name",
          title: "The tasmiya",
          titleAr: "التسمية",
          classification: "fadila",
          sourceUnitId: "tayammum.p07",
        },
        {
          id: "t-strike",
          title: "The first strike, on pure earth",
          titleAr: "ضربة الأرض الأولى على صعيد طاهر",
          classification: "fard",
          sourceUnitId: "tayammum.p03",
        },
        {
          id: "t-face",
          title: "Wipe the face",
          titleAr: "مسح الوجه",
          classification: "fard",
          sourceUnitId: "tayammum.p03",
        },
        {
          id: "t-renew",
          title: "Fresh earth for the hands",
          titleAr: "تجديد الصعيد لليدين",
          classification: "sunnah",
          sourceUnitId: "tayammum.p06",
        },
        {
          id: "t-hands",
          title: "Wipe the hands to the wrists",
          titleAr: "مسح اليدين إلى الكوعين",
          classification: "fard",
          sourceUnitId: "tayammum.p03",
        },
        {
          id: "t-join",
          title: "Join it to the prayer",
          titleAr: "اتصاله بالصلاة",
          classification: "fard",
          sourceUnitId: "tayammum.p03",
        },
      ],
    },
  ],
  quizzes: [
    {
      id: "mukallaf",
      title: "The accountable person",
      chapterId: "obligations_of_the_mukallaf",
      questions: [
        {
          id: "m1",
          prompt:
            "After correcting one’s faith, what does the opening line say a person goes on to know?",
          choices: [
            "What makes his personal obligation sound, such as the rulings of prayer, purification, and fasting",
            "Inheritance, before any act of worship",
            "A single madhhab, chosen only after hajj",
            "The whole manual by heart, before the first prayer",
          ],
          answer: 0,
          explanation:
            "The first unit pairs correcting faith with knowing what one’s personal obligation requires, and it gives prayer, purification, and fasting as the examples.",
          sourceUnitId: "obligations_of_the_mukallaf.p01",
        },
        {
          id: "m2",
          prompt: "Which does the chapter name among the conditions of tawba?",
          choices: [
            "Waiting until one feels guided",
            "Regret for what has passed",
            "A set number of extra fasts",
            "A journey of three days",
          ],
          answer: 1,
          explanation:
            "The conditions unit names regret, a resolve not to return for the rest of one’s life, and leaving the sin at once if one is still in it. It also says not to delay tawba, and not to say “until Allah guides me.”",
          sourceUnitId: "obligations_of_the_mukallaf.p03",
        },
        {
          id: "m3",
          prompt: "The chapter says a person may not do an act until what is true?",
          choices: [
            "A dream has confirmed it",
            "The act is the custom of his city",
            "He knows Allah’s ruling on it, asking people of knowledge who point to obedience",
            "Forty days of silence have passed",
          ],
          answer: 2,
          explanation:
            "That sentence sits with the verse and the report the unit quotes. The English here only points at what the line requires; the Arabic is the wording.",
          sourceUnitId: "obligations_of_the_mukallaf.p09",
        },
      ],
    },
    {
      id: "tahara",
      title: "Purification and impurity",
      chapterId: "tahara_purification",
      questions: [
        {
          id: "t1",
          prompt: "The purification chapter divides tahara into which two?",
          choices: ["Fard and sunnah", "Hadath and khabath", "Men and women", "Wudu and tayammum only"],
          answer: 1,
          explanation:
            "The chapter’s first sentence is the division. Both kinds, it says, need pure water.",
          sourceUnitId: "tahara_purification.p01",
        },
        {
          id: "t2",
          prompt: "Which change does the chapter treat as taking water out of the pure water it requires?",
          choices: [
            "A change of color, taste, or smell by something that usually separates from it, such as oil, soap, or filth",
            "A change of temperature only",
            "Being drawn from a well",
            "Standing overnight in a vessel",
          ],
          answer: 0,
          explanation:
            "The same sentence lists oil, ghee, grease, dung, soap, and dirt. Earth, mud, a salt flat, and baked brick are in the following “no harm” clause.",
          sourceUnitId: "tahara_purification.p01",
        },
        {
          id: "t3",
          prompt: "Something touches the garment, and you doubt that the thing is impure. The impurity chapter says:",
          choices: [
            "Sprinkle",
            "Do not sprinkle",
            "Wash every garment in the house",
            "Repeat the prayer outside its time",
          ],
          answer: 1,
          explanation:
            "Sprinkling is the other doubt: you are unsure the impurity landed. When something has landed and you only doubt that it is impure, the text says there is no sprinkle. A known spot is washed; an unclear spot means the whole garment.",
          sourceUnitId: "najasa_impurity.p02",
        },
      ],
    },
    {
      id: "wudu",
      title: "Wudu",
      chapterId: "wudu_faraid_sunan",
      questions: [
        {
          id: "w1",
          prompt: "How many obligations of wudu does the chapter name?",
          choices: ["Four", "Ten", "Seven", "Three"],
          answer: 2,
          explanation:
            "The heading says seven, and the first unit lists them: intention, face, arms to the elbows, wiping the head, feet to the ankles, rubbing, and continuity.",
          sourceUnitId: "wudu_faraid_sunan.p01",
        },
        {
          id: "w2",
          prompt: "Washing the hands to the wrists at the start is listed under:",
          choices: ["The seven obligations", "The sunan", "The nullifiers", "The virtues only"],
          answer: 1,
          explanation:
            "The sunan unit places that wash at the start, with the mouth rinse, the nose, the return wipe, the ears with new water, and order among the obligations.",
          sourceUnitId: "wudu_faraid_sunan.p02",
        },
        {
          id: "w3",
          prompt: "A sunnah of wudu was left out. The chapter says:",
          choices: [
            "Do the sunnah, and do not repeat the prayer",
            "The wudu is invalid in every case",
            "Repeat every prayer of that day",
            "Replace the wudu with tayammum",
          ],
          answer: 0,
          explanation:
            "The same unit treats a missed obligation differently: done soon, it and what follows are done; after a long gap, it is done alone and the prayers prayed before it are repeated.",
          sourceUnitId: "wudu_faraid_sunan.p03",
        },
        {
          id: "w4",
          prompt: "A thick beard, in wudu, according to this chapter:",
          choices: [
            "Must be passed through, the same as a light beard",
            "Is outside the “must pass water through” rule the chapter states for a light beard",
            "Replaces washing the face",
            "Is never washed in ghusl either",
          ],
          answer: 1,
          explanation:
            "The virtues unit says a light beard must be passed through in wudu, not a thick one, and that in ghusl the beard is passed through even if thick. Passing water between the toes is stated as obligatory in that same unit, and it is not one of the seven.",
          sourceUnitId: "wudu_faraid_sunan.p06",
        },
      ],
    },
    {
      id: "nullifiers",
      title: "What breaks wudu",
      chapterId: "wudu_nullifiers",
      questions: [
        {
          id: "n1",
          prompt: "Which group does the chapter call the events?",
          choices: [
            "Deep sleep, fainting, intoxication, and insanity",
            "Urine, stool, wind, madhi, and wadi",
            "Speech, laughter, and eating",
            "Touching a mushaf and tawaf",
          ],
          answer: 1,
          explanation:
            "The causes are a second list: deep sleep, fainting, intoxication, insanity, a kiss, touching a woman if pleasure was intended or found, and touching the penis with the palm or the inner fingers.",
          sourceUnitId: "wudu_nullifiers.p01",
        },
        {
          id: "n2",
          prompt: "A person of waswasa doubts whether he has broken wudu. The chapter says:",
          choices: [
            "Nothing is due from him",
            "He repeats wudu for every doubt",
            "He repeats the whole day of prayers",
            "He uses tayammum instead",
          ],
          answer: 0,
          explanation:
            "The same unit says that someone who is not in that state, and who doubts an event, must do wudu. It also defines madhi and says the whole penis is washed from it, not the testicles.",
          sourceUnitId: "wudu_nullifiers.p03",
        },
        {
          id: "n3",
          prompt: "Without wudu, the following chapter says a person may not:",
          choices: [
            "Pray, perform tawaf, or touch a copy of the Quran, aside from the exceptions that unit names",
            "Give the salam",
            "Sleep",
            "Sit in the marketplace",
          ],
          answer: 0,
          explanation:
            "The exceptions in that unit are a portion a student is learning, and a board for a learner or a teacher who is correcting it. A child is like an adult in touching the Quran; the blame, the text says, is on the one who handed it over.",
          sourceUnitId: "acts_requiring_wudu.p01",
        },
      ],
    },
    {
      id: "ghusl",
      title: "Ghusl",
      chapterId: "ghusl_causes",
      questions: [
        {
          id: "g1",
          prompt: "The chapter makes ghusl due for which three?",
          choices: [
            "Every nullifier of wudu",
            "Janaba, menstruation, and postnatal bleeding",
            "Friday, a nosebleed, and travel",
            "Sleep, doubt, and a raised voice",
          ],
          answer: 1,
          explanation:
            "Janaba itself has two forms in the next sentences: maniy leaving with the usual pleasure, and the glans disappearing in the vagina.",
          sourceUnitId: "ghusl_causes.p01",
        },
        {
          id: "g2",
          prompt: "Which is named among the obligations of ghusl?",
          choices: [
            "Covering the whole body",
            "Washing the head three times",
            "Starting with the right side",
            "Using as little water as you can",
          ],
          answer: 0,
          explanation:
            "The obligations unit names four: intention at the start, continuity, rubbing, and covering. Tripling the head, the right side, and using little water are in the virtues sentence.",
          sourceUnitId: "ghusl_faraid_sunan.p01",
        },
        {
          id: "g3",
          prompt: "A spot was missed. The person remembers a month later. The chapter says:",
          choices: [
            "The ghusl cannot be repaired after a day",
            "Only a new tayammum helps",
            "Wash it then, and repeat the prayers prayed before that",
            "Nothing is due once the first prayer has ended",
          ],
          answer: 2,
          explanation:
            "The virtues unit says to wash a missed spot or limb when it is remembered, even after a month, and to repeat the prayers. The next unit says that delaying after you remember invalidates the ghusl.",
          sourceUnitId: "ghusl_faraid_sunan.p04",
        },
      ],
    },
    {
      id: "tayammum",
      title: "Tayammum",
      chapterId: "tayammum",
      questions: [
        {
          id: "y1",
          prompt: "A healthy person at home may use tayammum for an obligatory prayer when:",
          choices: [
            "He prefers not to use water",
            "He fears the prayer’s time will leave",
            "He wants to pray a voluntary prayer",
            "He is attending Jumuʿah in the ordinary case",
          ],
          answer: 1,
          explanation:
            "The same unit says he does not use tayammum for a voluntary prayer, for Jumuʿah, or for a funeral unless that funeral is his particular duty. A traveler who is not in disobedience, and a sick person, may use it for an obligatory or a voluntary prayer.",
          sourceUnitId: "tayammum.p02",
        },
        {
          id: "y2",
          prompt: "Which does the chapter count as valid earth for tayammum?",
          choices: ["Cooked gypsum", "Wood", "A mat", "Stone"],
          answer: 3,
          explanation:
            "The definition unit includes dust, brick, stone, snow, and thin mud. The next unit excludes cooked gypsum, a mat, wood, and grass.",
          sourceUnitId: "tayammum.p04",
        },
        {
          id: "y3",
          prompt: "Two obligatory prayers, one tayammum. The chapter says:",
          choices: [
            "Two obligatory prayers are not prayed with one tayammum",
            "One tayammum covers every obligatory prayer until maghrib",
            "It lasts as long as wudu would",
            "Only a funeral is restricted",
          ],
          answer: 0,
          explanation:
            "Someone who made tayammum for an obligatory prayer may, the text says, then pray voluntary prayers, touch a mushaf, do tawaf, and recite, if he intended that, it connects to the prayer, and the time has not left. Tayammum made for a voluntary prayer does not cover an obligatory one.",
          sourceUnitId: "tayammum.p08",
        },
      ],
    },
    {
      id: "hayd",
      title: "Menstruation and nifas",
      chapterId: "hayd_menstruation",
      questions: [
        {
          id: "h1",
          prompt: "The most the chapter allows a beginner’s menstruation to last is:",
          choices: ["Three days", "Ten days", "Fifteen days", "Sixty days"],
          answer: 2,
          explanation:
            "A woman with a habit follows her habit. If the blood continues she adds three days, so long as she does not pass fifteen. Sixty days is the maximum the nifas chapter names, not this one.",
          sourceUnitId: "hayd_menstruation.p02",
        },
        {
          id: "h2",
          prompt: "During menstruation, the chapter says she:",
          choices: [
            "Makes up the fast and does not make up the prayer, and her recitation is permitted",
            "Makes up both the prayer and the fast",
            "Makes up the prayer only",
            "Makes up neither",
          ],
          answer: 0,
          explanation:
            "The same unit suspends prayer, fasting, tawaf, touching a mushaf, and entering the mosque. The ruling is in the Arabic line.",
          sourceUnitId: "hayd_menstruation.p05",
        },
        {
          id: "h3",
          prompt: "The most the nifas chapter names is:",
          choices: ["Fifteen days", "Forty days", "Six months", "Sixty days"],
          answer: 3,
          explanation:
            "If the blood stops sooner, even on the day of birth, she performs ghusl and prays. If blood returns after fifteen days or more, the second stretch is menstruation; otherwise it joins the first as part of nifas.",
          sourceUnitId: "nifas_postnatal.p01",
        },
      ],
    },
    {
      id: "salah",
      title: "The prayer",
      chapterId: "salah_times",
      questions: [
        {
          id: "s1",
          prompt: "The chosen time of Zuhr in this chapter runs from:",
          choices: [
            "The sun’s decline to the end of one qama",
            "Sunset to the disappearance of the twilight",
            "Midmorning to noon",
            "The yellowing of the sun to maghrib",
          ],
          answer: 0,
          explanation:
            "The qama is the chapter’s measure. Asr’s chosen time runs from that qama until the yellowing, and the necessary time of both reaches sunset. This app does not convert the qama into a clock hour.",
          sourceUnitId: "salah_times.p01",
        },
        {
          id: "s2",
          prompt: "The conditions chapter sets a man’s covering in the prayer as:",
          choices: [
            "The whole body except the face and the hands",
            "What is between the navel and the knee",
            "The head only",
            "Whatever is already covered by his shirt",
          ],
          answer: 1,
          explanation:
            "The same sentence sets a woman’s covering as her whole body except the face and the hands. Facing the qibla, leaving speech, and leaving a great deal of extra movement are in that list of conditions too.",
          sourceUnitId: "salah_conditions.p02",
        },
        {
          id: "s3",
          prompt: "Of the seven postures, the four in obligatory order begin with:",
          choices: [
            "Lying on the right side",
            "Lying on the back",
            "Standing without a support",
            "Sitting with a support",
          ],
          answer: 2,
          explanation:
            "Then standing with a support, sitting without one, and sitting with one. The chapter says the order among these four is obligatory. The three it calls recommended are the right side, then the left, then the back.",
          sourceUnitId: "salah_seven_states.p01",
        },
        {
          id: "s4",
          prompt: "The condition the prayer chapter sets on the intention is that it:",
          choices: [
            "Coincides with the opening takbir",
            "Can be made any time before the salam",
            "Replaces the Fatiha",
            "Is spoken aloud",
          ],
          answer: 0,
          explanation:
            "The obligations list names the intention of the particular prayer, the opening takbir and standing for it, the Fatiha and standing for it, bowing, rising, prostration on the forehead, rising, stillness, calm, order among the obligations, the salam, and the sitting that goes with it.",
          sourceUnitId: "salah_faraid_sunan.p02",
        },
      ],
    },
    {
      id: "sahw",
      title: "Forgetfulness",
      chapterId: "sahw_forgetfulness",
      questions: [
        {
          id: "f1",
          prompt: "The prostration of forgetfulness is classed as:",
          choices: [
            "A fard of every prayer, like the salam",
            "A sunnah",
            "A virtue, with no prostration attached",
            "Something only the follower does",
          ],
          answer: 1,
          explanation:
            "The chapter’s opening calls it a sunnah, then splits the case of a missing act from the case of an extra act.",
          sourceUnitId: "sahw_forgetfulness.p01",
        },
        {
          id: "f2",
          prompt: "For a deficiency, where does the chapter place the two prostrations?",
          choices: [
            "Before the salam, after both tashahhuds, with another tashahhud after them",
            "After the salam only",
            "During the bowing",
            "They are omitted whenever the prayer was silent",
          ],
          answer: 0,
          explanation:
            "For an addition, the two prostrations are after the salam. For both a deficiency and an addition, the text says to prostrate before the salam. A missed obligation is not covered by the prostration. A missed virtue does not call for one.",
          sourceUnitId: "sahw_forgetfulness.p01",
        },
        {
          id: "f3",
          prompt: "Someone laughs in the prayer. The chapter says:",
          choices: [
            "The prayer is invalid, whether the laugh was forgetful or on purpose",
            "A prostration after the salam repairs it",
            "Only a deliberate laugh counts",
            "It is discouraged, and the prayer stands",
          ],
          answer: 0,
          explanation:
            "Laughing, forgetful or deliberate, invalidates the prayer. A smile is a later line in this chapter, and that line says nothing is due.",
          sourceUnitId: "sahw_forgetfulness.p15",
        },
      ],
    },
  ],
  decisions: akhdariDecisions,
  walks: [sahwWalk],
  checks: [tawbaCheck],
};

export default akhdariPractice;
