import type { Subject, SubjectId } from "./types";

export const subjects: Subject[] = [
  {
    id: "foundations",
    label: "Foundational knowledge",
    labelAr: "أصول العلم",
    blurb: "What a Muslim owes before anything else, and where to begin.",
  },
  {
    id: "purification",
    label: "Purification",
    labelAr: "الطهارة",
    blurb: "Wudu, ghusl, tayammum, and the rules around them.",
  },
  {
    id: "prayer",
    label: "Prayer",
    labelAr: "الصلاة",
    blurb: "Times, conditions, obligations, and forgetfulness in the prayer.",
  },
  {
    id: "creed",
    label: "Creed",
    labelAr: "العقيدة",
    blurb: "What a Muslim believes.",
  },
  {
    id: "manners",
    label: "Islamic manners",
    labelAr: "الآداب",
    blurb: "Character and conduct.",
  },
  {
    id: "self",
    label: "The self and the heart",
    labelAr: "تزكية النفس",
    blurb: "Knowing the self, uprightness, and living the religion.",
  },
  {
    id: "fiqh",
    label: "Fiqh reference",
    labelAr: "الفقه",
    blurb: "Longer reference works for later study.",
  },
];

export function getSubject(id: SubjectId) {
  return subjects.find((subject) => subject.id === id)!;
}
