import { describe, expect, it } from "vitest";
import { toReporterConfirmation } from "./reporter-response";

describe("toReporterConfirmation", () => {
  it("returns only { ok: true } — never status, outcome, or report id", () => {
    expect(toReporterConfirmation()).toEqual({ ok: true });
    expect(Object.keys(toReporterConfirmation())).toEqual(["ok"]);
  });
});
