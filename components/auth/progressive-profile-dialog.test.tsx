import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProgressiveProfileDialog } from "./progressive-profile-dialog";

describe("ProgressiveProfileDialog", () => {
  const onDismiss = vi.fn();

  beforeEach(() => {
    onDismiss.mockReset();
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the heading with both Save and Skip for now enabled immediately", () => {
    render(<ProgressiveProfileDialog open onDismiss={onDismiss} />);

    expect(screen.getByText("What should we call you?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
    expect(screen.getByRole("link", { name: "Skip for now" })).not.toBeDisabled();
  });

  it("clicking Save with a non-empty name calls the profile endpoint with that name, then dismisses", async () => {
    render(<ProgressiveProfileDialog open onDismiss={onDismiss} />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Nimal" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/profile",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Nimal", email: null }),
        }),
      );
    });
    await waitFor(() => expect(onDismiss).toHaveBeenCalledTimes(1));
  });

  it("clicking Skip for now dismisses without sending a name, but still marks the prompt seen via the same endpoint", async () => {
    render(<ProgressiveProfileDialog open onDismiss={onDismiss} />);

    fireEvent.click(screen.getByRole("link", { name: "Skip for now" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/profile",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: null, email: null }),
        }),
      );
    });
    await waitFor(() => expect(onDismiss).toHaveBeenCalledTimes(1));
  });

  it("never navigates the URL — renders only as an overlay dialog, not a route", () => {
    render(<ProgressiveProfileDialog open onDismiss={onDismiss} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("clicking Save with an optional email includes it in the profile payload", async () => {
    render(<ProgressiveProfileDialog open onDismiss={onDismiss} />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Nimal" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "nimal@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/profile",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Nimal", email: "nimal@example.com" }),
        }),
      );
    });
  });
});
