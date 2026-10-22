# Reviewer notes: English draft of Mukhtasar al-Akhdari

Translation id: `en-zaibaitech-draft` · File: `src/content/translations/akhdari/en-zaibaitech-draft.json` · Status: **unreviewed, not shown to readers**

## What this draft is

- An AI-assisted translation made **directly from the Arabic** in this library (OpenITI JK009285-ara1, with the corrections in `CORRECTIONS.md`). It is not based on, and does not reproduce, any published English translation.
- Licence: CC BY-NC-SA 4.0, because it adapts the CC BY-NC-SA Arabic (ShareAlike).
- All 110 passages are translated, keyed to the same passage ids as the Arabic.
- It has **not** been checked by a scholar. It stays hidden until a qualified Maliki teacher reviews it (see "Publishing" below).

## Conventions

- Plain modern English, short sentences, for learners at every level.
- Technical terms are kept, with a short gloss the first time they appear in a chapter: wudu, ghusl, tayammum, janaba, sunna, fard, ʿawra, qibla, rakʿa, salam, and others.
- **Square brackets** mark words the English needs that the Arabic implies, e.g. a passage that continues its chapter heading: "[The obligations of wudu are seven:] …".
- **Parentheses** hold glosses and transliterations, never added rulings.
- The Arabic uses the masculine as a general form; the English uses "they" unless the ruling is specific to men or women.
- Honorifics are written out: "(may Allah bless him and give him peace)".
- Passages that end mid-sentence in the Arabic end mid-sentence in English too, so that each translation stays on its own passage.

## Places where the witness reads differently

In each of these the translation follows the standard reading, and **the Arabic text was not changed**. A reviewer should confirm each one and decide whether it belongs in `CORRECTIONS.md`.

| Passage | Witness reads | Translated as if | Note |
| --- | --- | --- | --- |
| `tahara_purification.1` | الماء الطاهر **المطر** ("rain") | الطاهر **المطهر** ("pure and purifying") | The definition that follows is of purifying water. |
| `tahara_purification.1` | ولا بأس التراب | ولا بأس **ب**التراب | Missing preposition. |
| `obligations_of_the_mukallaf.7` | والأكل الشفاعة أو الدين | والأكل **ب**الشفاعة أو **ب**الدين | Rendered "making a living from interceding for people or from [a show of] religion". |
| `obligations_of_the_mukallaf.8` | لسنة صلى الله عليه وسلم | لسنة **النبي** صلى الله عليه وسلم | The noun before the blessing is missing; rendered "the Sunna of the Prophet". |
| `salah_conditions.2` | حتى يغسله خروج الوقت | حتى يغسله **وخاف** خروج الوقت | Rendered "and fears the time will run out". |
| `salah_seven_states.2` | العاجز عن هذه **الثلاثة** المذكورة | the four positions | Four positions were just listed; rendered "the positions mentioned". |
| `sahw_forgetfulness.17` | أو نظر محرما **في** عاص | **فهو** عاص | Rendered "is sinful". |
| `sahw_forgetfulness.24` | سجد **أن** طمع | سجد **إن** طمع | "if he hopes". |
| `sahw_forgetfulness.36` | **ويجد** بعد السلام | **ويسجد** بعد السلام | "and prostrate after the salam". |
| `sahw_forgetfulness.37` | أو **تكر منا** ركعة | أو **ترك منها** ركعة | "or leaves out a rakʿa from it". |

## Rulings a reviewer should check carefully

These are translated as the Arabic states them. Each needs a teacher's eye before the translation is published.

1. **`wudu_faraid_sunan.4`, running the fingers between the toes.** The witness says it is obligatory (يجب تخليل أصابع الرجلين). Many Maliki presentations make it obligatory for the fingers and recommended for the toes. Check against a reliable edition.
2. **`acts_requiring_wudu.2`, "Whoever prays without wudu deliberately is a disbeliever."** This is the literal wording. Commentaries explain the conditions under which this applies. A reviewer may want a footnote; the translation does not soften the text.
3. **`tayammum.1`** assumes the chapter's context, that water is unavailable or cannot be used. Nothing was added to the English.
4. **`salah_times.1`, "preferred" (mukhtar) and "necessary" (daruri) times.** These are glossed only by name; the glossary may need an entry explaining the necessary time.
5. **`sahw_forgetfulness.17`, silk and gold.** The text does not say "men"; the ruling is generally understood to apply to men. Nothing was added.
6. **`sahw_forgetfulness.19`.** The witness reads منكر ("disapproved") for clearing the throat to get attention; other copies read مكروه ("disliked"). Rendered "disapproved".
7. **`sahw_forgetfulness.41`.** "If the first sits and the second stands" is rendered "If one of the first group sits, or one of the second stands", reading it as applying to each person who does the opposite of what they should.
8. **`qada_missed_prayers.1`, "five days' worth each day".** Left as the witness has it, as recorded in `CORRECTIONS.md`.
9. **Sexual and bodily matters** (`ghusl_causes`, `hayd_menstruation.3`, `wudu_nullifiers`) are translated plainly and modestly, without euphemism that would blur the ruling.

## Publishing

A translation is shown only when its metadata passes `isPublishable`. After review, set in `src/content/books.ts`:

```ts
reviewStatus: "verified",
review: { reviewer: "<name and role>", reviewedOn: "YYYY-MM-DD", scope: "full", notes: "<anything changed>" },
```

Then run `npm run translations:check` and `npm test`. The reader then offers "Arabic + English" and "English only".
