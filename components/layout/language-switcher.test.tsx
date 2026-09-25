import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LanguageSwitcher } from "./language-switcher";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.releasePointerCapture = vi.fn();
});

function openAndSelect(optionLabel: string) {
  fireEvent.click(screen.getByRole("combobox", { name: "Language" }));
  fireEvent.click(screen.getByText(optionLabel));
}

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    document.cookie = "lang_pref=; path=/; max-age=0";
    refreshMock.mockReset();
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("selecting English persists the choice and does not show a coming-soon note", () => {
    render(<LanguageSwitcher isLoggedIn={false} initialValue="si" />);

    openAndSelect("English");

    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
    expect(document.cookie).toContain("lang_pref=en");
  });

  it("selecting Sinhala persists the cookie and refreshes so translated strings can load", async () => {
    render(<LanguageSwitcher isLoggedIn={false} initialValue="en" />);

    openAndSelect("සිංහල");

    expect(document.cookie).toContain("lang_pref=si");
    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
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
