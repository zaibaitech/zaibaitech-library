import test from "node:test";
import assert from "node:assert/strict";
import { emphasisRuns, isInvocation } from "../src/lib/emphasis";
import { getReadableContent } from "../src/content/library";
import type { ProseBookContent } from "../src/content/types";

test("plain text is upright; only marked runs are italic or bold", () => {
  assert.deepEqual(emphasisRuns("The Prophet ﷺ said: *“Make things easy.”* (Agreed upon.)"), [
    { text: "The Prophet ﷺ said: ", bold: false, italic: false },
    { text: "“Make things easy.”", bold: false, italic: true },
    { text: " (Agreed upon.)", bold: false, italic: false },
  ]);
  assert.deepEqual(emphasisRuns("1. **The concept of modesty.** Modesty is"), [
    { text: "1. ", bold: false, italic: false },
    { text: "The concept of modesty.", bold: true, italic: false },
    { text: " Modesty is", bold: false, italic: false },
  ]);
  assert.deepEqual(emphasisRuns("***Sidy Ahmad Gassama***"), [{ text: "Sidy Ahmad Gassama", bold: true, italic: true }]);
  assert.deepEqual(emphasisRuns("No marks at all."), [{ text: "No marks at all.", bold: false, italic: false }]);
});

test("the invocation is recognised on its own and nowhere else", () => {
  assert.ok(isInvocation("*In the name of Allah, the Most Gracious, the Most Merciful.*"));
  assert.ok(!isInvocation("All praise is due to Allah, who sent down religion as guidance."));
  assert.ok(!isInvocation("*In the name of Allah* he began, and then *went on*."));
});

test("no passage of the English books is italic beyond its marked runs", () => {
  for (const id of ["reviving-religion", "knowing-the-self", "balance-of-stations"]) {
    const book = getReadableContent(id) as ProseBookContent;
    let invocations = 0;
    for (const chapter of book.chapters) {
      for (const unit of chapter.units) {
        if (unit.rows) continue;
        for (const line of unit.text.split("\n")) {
          const runs = emphasisRuns(line);
          // Every mark is consumed: nothing a reader would see as a stray asterisk.
          for (const run of runs) assert.ok(!run.text.includes("*"), `${unit.id}: stray mark`);
          // What is shown is exactly the text without its marks.
          assert.equal(runs.map((r) => r.text).join(""), line.replace(/\*+/g, ""), unit.id);
        }
        if (isInvocation(unit.text)) invocations++;
      }
    }
    assert.equal(invocations, 1, `${id}: one opening invocation`);
  }
});
