// OtpChallenge.purpose values. Login OTPs (AUTH-01) and claim OTPs
// (CLAIM-01) share the OtpChallenge table but must never satisfy each
// other — proving you control a listing number must not sign you in as
// a User bound to that number.
export const OTP_PURPOSE_LOGIN = "login";
export const OTP_PURPOSE_CLAIM = "claim";

export type OtpPurpose = typeof OTP_PURPOSE_LOGIN | typeof OTP_PURPOSE_CLAIM;
