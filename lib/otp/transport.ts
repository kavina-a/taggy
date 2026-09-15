// D-03: dev-mode stub only. No real SMS provider (Notify.lk/Dialog per
// spec Section 15) is wired or paid for in this phase — consistent with
// the bootstrap-budget constraint. A future `NotifyLkTransport` or
// `DialogTransport` implements this exact same interface, so wiring a
// real provider later is a one-file swap, not a rewrite of any call site.
export interface OtpTransport {
  send(phone: string, code: string): Promise<void>;
}

export class ConsoleOtpTransport implements OtpTransport {
  async send(phone: string, code: string): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[dev-otp] Code for ${phone}: ${code}`);
  }
}
