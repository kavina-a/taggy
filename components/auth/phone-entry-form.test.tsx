import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PhoneEntryForm } from "./phone-entry-form";

describe("PhoneEntryForm", () => {
  const onSent = vi.fn();

  beforeEach(() => {
    onSent.mockReset();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects submission of an empty phone field client-side before ever calling fetch", async () => {
    render(<PhoneEntryForm onSent={onSent} />);

    fireEvent.click(screen.getByRole("button", { name: "Send code" }));

    await waitFor(() => {
      expect(screen.getByText("Log in or sign up")).toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalled();
    expect(onSent).not.toHaveBeenCalled();
  });

  it("advances to onSent(phone, devCode) on a successful /api/auth/otp/send call", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, devCode: "123456" }),
    });

    render(<PhoneEntryForm onSent={onSent} />);

    fireEvent.change(screen.getByLabelText("Phone number"), {
      target: { value: "+94771234567" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send code" }));

    await waitFor(() => {
      expect(onSent).toHaveBeenCalledWith("+94771234567", "123456");
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/auth/otp/send",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("calls onSent with no devCode when the response omits it", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });

    render(<PhoneEntryForm onSent={onSent} />);

    fireEvent.change(screen.getByLabelText("Phone number"), {
      target: { value: "+94771234567" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send code" }));

    await waitFor(() => {
      expect(onSent).toHaveBeenCalledWith("+94771234567", undefined);
    });
  });
});
