import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { OtpEntryForm } from "./otp-entry-form";

describe("OtpEntryForm", () => {
  const onVerified = vi.fn();

  beforeEach(() => {
    onVerified.mockReset();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows the (dev mode) caption only when a devCode prop is present", () => {
    const { rerender } = render(
      <OtpEntryForm phone="+94771112222" devCode="998877" onVerified={onVerified} />,
    );
    expect(screen.getByText(/\(dev mode\)/i)).toBeInTheDocument();
    expect(screen.getByText(/998877/)).toBeInTheDocument();

    rerender(<OtpEntryForm phone="+94771112222" onVerified={onVerified} />);
    expect(screen.queryByText(/\(dev mode\)/i)).not.toBeInTheDocument();
  });

  it("disables Verify until exactly 6 digits are entered", () => {
    render(<OtpEntryForm phone="+94771234567" onVerified={onVerified} />);
    const verifyButton = screen.getByRole("button", { name: "Verify" });
    expect(verifyButton).toBeDisabled();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "12345" } });
    expect(verifyButton).toBeDisabled();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "123456" } });
    expect(verifyButton).toBeEnabled();
  });

  it("shows the exact wrong-code copy inline on a 400 response, without navigating away", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "That code didn't work. Check it and try again." }),
    });

    render(<OtpEntryForm phone="+94771234567" onVerified={onVerified} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "000000" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    await waitFor(() => {
      expect(
        screen.getByText("That code didn't work. Check it and try again."),
      ).toBeInTheDocument();
    });
    expect(onVerified).not.toHaveBeenCalled();
    expect(screen.getByText("Enter the code")).toBeInTheDocument();
  });

  it("calls onVerified(user) on a successful verify", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        user: { id: "u1", name: null, hasSeenProfilePrompt: false },
      }),
    });

    render(<OtpEntryForm phone="+94771234567" onVerified={onVerified} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    await waitFor(() => {
      expect(onVerified).toHaveBeenCalledWith({
        id: "u1",
        name: null,
        hasSeenProfilePrompt: false,
      });
    });
  });

  it("disables Resend code with a counting-down label for 30 seconds, then re-enables", () => {
    vi.useFakeTimers();
    render(<OtpEntryForm phone="+94771234567" onVerified={onVerified} />);

    expect(screen.getByText("Resend code in 0:30")).toBeInTheDocument();
    const resendButton = screen.getByRole("button", { name: /Resend code in/ });
    expect(resendButton).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    expect(screen.getByRole("button", { name: "Resend code" })).toBeEnabled();
  });
});
