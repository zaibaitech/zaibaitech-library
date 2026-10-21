# Arabic corrections for scholarly review

These are mechanical repairs to the OpenITI witness used by the reader (`content/sources/akhdari.structured.json` and `content/sources/akhdari.diacritized.txt`). Each one is an evident copy error: a split word, a duplicated word, or a letter that does not form the word the sentence requires. The rebuild (`npm run content`) then recopied them into `src/content/books/akhdari.json`.

Nothing here is a fiqh edit. Wording that is merely unusual, and every number, was left as the witness has it. `خمسة أيام` in the makeup chapter is one of those: it was not changed.

The corrected token is stored without new vowel marks. A reviewer who wants the vowel restored on that word should mark it on the line below.

| # | Was | Now | Where | Why it is a copy error |
| --- | --- | --- | --- | --- |
| 1 | الإجرام | الإحرام | Inside the prayer, the list of obligations | The same chapter already writes تكبيرة الإحرام for the opening takbir. ج/ح. |
| 2 | الفرئض | الفرائض | Wudu, the sunan line, الترتيب بين | ئ for ا. The heading of the chapter is فرائض. |
| 3 | فليس فليس | فليس | Making up missed prayers | The word is written twice. |
| 4 | ا لنظر | النظر | The accountable person, the eyes | A space was inserted inside the word. |
| 5 | بطلب صلاته | بطلت صلاته | Seven ways of praying; forgetfulness (opening on someone other than one’s imam); the latecomer who prostrates with the imam | Three times. Final ب for ت. The sentences are the invalidation formula. |
| 6 | الداءه | البدء | Wudu, the virtues, بمقدم الرأس | Not a word. The virtue is beginning at the front of the head. |
| 7 | السيرى | اليسرى | Wudu, تقديم اليمنى على | س for ي. The pair is right and left. |
| 8 | طهارة الحديث | طهارة الحدث | Conditions of the prayer | The purification chapter spells حدث. An extra ي. |
| 9 | يسمل | يسلم | Forgetfulness, the prostration after the salam | م transposed. The object is تسليمة. |
| 10 | النوافق | النوافل | Tayammum, what a fard tayammum allows after it | ق for ل. |
| 11 | صحفة | صفحة | Ghusl, the outer ear | ح/ف transposed. The line is the outer ear, washed on both sides. |
| 12 | وإن آخره بعد ذكره | وإن أخره بعد ذكره | Ghusl, delaying a missed spot | Extra alif. The verb is “he delayed it,” which the next clause (the ghusl is invalid) requires. |
| 13 | إلى آخره القامة | إلى آخر القامة | Prayer times, zuhr | An extra pronoun. The measure is one qama. |
| 14 | إيمان الطلاق | أيمان الطلاق | The accountable person, the tongue | Faith versus oaths. The line is a list of what the tongue is kept from. |
| 15 | واشتعل | واشتغل | Humility in the prayer | ع/غ. The line says to occupy oneself with watchfulness. |
| 16 | موالاك | مولاك | Humility in the prayer | An extra alif. |
| 17 | بسخط الخالد | بسخط الخالق | The accountable person | د for ق. The sentence is the displeasure of the Creator, beside رضا المخلوقين. |
| 18 | ويا يطول | ويا طول | The accountable person, the closing | An extra ي. |
| 19 | يبن الحاضرتين | بين الحاضرتين | Making up missed prayers | The preposition is بين. |
| 20 | قد ما تصلى | قدر ما تصلى | Prayer times, maghrib | A missing ر. |
| 21 | في النقل | في النفل | Inside the prayer, basmala and taʿawwudh | ق for ف. The contrast is the fard and the voluntary prayer. |
| 22 | واقتران رجليه | وإقران رجليه | Inside the prayer, what is disliked | The disliked act in this list is standing with the feet joined. |
| 23 | المتعلم فه | للمتعلم فيه | Acts that require wudu | فه is not a word here. The exception is the learner’s portion. |
| 24 | إلى غسل حين | إلى غسلها حين | Ghusl, a missed spot | The pronoun referring to the spot was missing. |
| 25 | مناوله له | من ناوله له | Acts that require wudu, the child | One word was run together. The sin is on the person who handed it over. |
| 26 | وقله الماء | وقلة الماء | Wudu, the virtues | The ة was missing. |
| 27 | وبعد والجمعة | وبعد الجمعة | Prayer times, when a voluntary prayer is not prayed | An extra و. |
| 28 | وكل آله | وآله | Inside the prayer, the prayer on the Prophet | An extra ك in وعلى آله. |
| 29 | سواه كان | سواء كان | Forgetfulness, twice (the prayer on the Prophet; the missed silent or aloud) | ه for ء. The phrase is “whether… or…”. |
| 30 | تنهد في صلاته في شيء عليه | تنهد في صلاته فلا شيء عليه | Forgetfulness, sighing | لا was lost, so the sentence said the opposite of the exception that follows (unless a letter is pronounced). |
