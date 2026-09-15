import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LanguageSwitcher } from "./language-switcher";

// Radix Select's item-aligned content positioning scrolls the currently
// selected item into view when it opens, and jsdom doesn't implement
// scrollIntoView/pointer-capture — polyfill just enough for open/select to
// run without throwing. Opening/selecting itself works via fireEvent.click
// alone: Radix's trigger/item onClick handlers fire whenever pointerType
// isn't "mouse", which is the jsdom fireEvent.click default.
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.releasePointerCapture = vi.fn();
});

function openAndSelect(optionLabel: string) {
  fireEvent.click(screen.getByRole("combobox", { name: "Language" }));
  fireEvent.click(screen.getByText(optionLabel));
}

const COMING_SOON_NOTE = "Sinhala/Tamil UI coming soon — your preference is saved";

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    document.cookie = "lang_pref=; path=/; max-age=0";
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("selecting English persists the choice and shows no coming-soon note", () => {
    render(<LanguageSwitcher isLoggedIn={false} initialValue="si" />);

    openAndSelect("English");

    expect(screen.queryByText(COMING_SOON_NOTE)).not.toBeInTheDocument();
  });

  it("selecting Sinhala shows the coming-soon note while every other string stays in English", () => {
    render(
      <div>
        <p>Search businesses</p>
        <LanguageSwitcher isLoggedIn={false} initialValue="en" />
      </div>,
    );

    openAndSelect("සිංහල");

    expect(screen.getByText(COMING_SOON_NOTE)).toBeInTheDocument();
    expect(screen.getByText("Search businesses")).toBeInTheDocument();
  });

  it("selecting Tamil shows the coming-soon note", () => {
    render(<LanguageSwitcher isLoggedIn={false} initialValue="en" />);

    openAndSelect("தமிழ்");

    expect(screen.getByText(COMING_SOON_NOTE)).toBeInTheDocument();
  });

  it("when logged in, selecting a language calls the language endpoint with the new lang", async () => {
    render(<LanguageSwitcher isLoggedIn initialValue="en" />);

    openAndSelect("සිංහල");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/language",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ lang: "si" }),
        }),
      );
    });
  });

  it("when a guest, selecting a language sets the lang_pref cookie directly with no server round trip", () => {
    render(<LanguageSwitcher isLoggedIn={false} initialValue="en" />);

    openAndSelect("සිංහල");

    expect(document.cookie).toContain("lang_pref=si");
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
