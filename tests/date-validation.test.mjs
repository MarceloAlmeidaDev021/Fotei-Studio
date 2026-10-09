import test from "node:test";
import assert from "node:assert/strict";
import {
  isValidCalendarDate,
  dateErrorMessage,
  maskDate,
  toISODate,
  toDisplayDate,
} from "../src/date-validation.js";
import { makeBrief } from "../.sites-runtime/render.mjs";

test("accepts real calendar dates, including Gregorian leap years", () => {
  for (const date of [
    "2026-10-08",
    "2026-02-28",
    "2028-02-29",
    "2000-02-29",
    "2026-04-30",
    "0001-01-01",
    "9999-12-31",
  ]) {
    assert.equal(isValidCalendarDate(date), true, date);
    assert.match(
      makeBrief({ name: "Cliente", service: "Ensaio Fotográfico", date }),
      /Data prevista:/,
    );
  }
});

test("rejects nonexistent days, months, malformed dates and oversized years in both flows", () => {
  for (const date of [
    "2026-02-29",
    "2026-02-31",
    "2026-04-31",
    "1900-02-29",
    "2100-02-29",
    "2026-00-10",
    "2026-13-10",
    "2026-01-00",
    "2026-01-32",
    "0000-01-01",
    "10000-01-01",
    "999999-01-01",
    "2026-2-3",
    "31/02/2026",
    "29/02/2026",
    "31/04/2026",
    "08/13/2026",
    "08/10/026",
    "08/10/20266",
  ]) {
    assert.equal(isValidCalendarDate(date), false, date);
    for (const service of ["Ensaio Fotográfico", "Gestão de Redes Sociais"]) {
      assert.throws(
        () => makeBrief({ name: "Cliente", service, date }),
        { message: dateErrorMessage },
        date,
      );
    }
  }
});

test("formats day/month/year during typing and accepts valid Brazilian dates", () => {
  for (const [input, expected] of [
    ["", ""],
    ["0", "0"],
    ["08", "08"],
    ["081", "08/1"],
    ["0810", "08/10"],
    ["08102026", "08/10/2026"],
    ["08/10/2026", "08/10/2026"],
  ]) {
    assert.equal(maskDate(input), expected);
  }
  assert.equal(toISODate("08/10/2026"), "2026-10-08");
  assert.equal(toDisplayDate("2026-10-08"), "08/10/2026");
  assert.match(
    makeBrief({
      name: "Cliente",
      service: "Ensaio Fotográfico",
      date: "29/02/2028",
    }),
    /Data prevista: 29\/02\/2028/,
  );
});

test("keeps an unspecified date optional and preserves the entered valid day", () => {
  assert.doesNotMatch(
    makeBrief({ name: "Cliente", service: "Ensaio Fotográfico", date: "" }),
    /Data prevista:/,
  );
  assert.match(
    makeBrief({
      name: "Cliente",
      service: "Ensaio Fotográfico",
      date: "2028-02-29",
    }),
    /Data prevista: 29\/02\/2028/,
  );
});
