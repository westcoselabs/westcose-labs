export interface MailtoFields {
  readonly to: string;
  readonly subject?: string;
  readonly body?: string;
  readonly cc?: readonly string[];
  readonly bcc?: readonly string[];
}

const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/u;
const PHONE_PATTERN = /^\+[1-9]\d{6,14}$/u;

export function normalizePhoneNumber(phone: string): string {
  const normalized = phone.trim().replace(/[\s().-]/gu, "");

  if (!PHONE_PATTERN.test(normalized)) {
    throw new TypeError("Phone numbers must use international +countrycode format.");
  }

  return normalized;
}

export function isValidEmailAddress(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim()) && !/[\r\n]/u.test(email);
}

const requireEmail = (email: string): string => {
  const normalized = email.trim();

  if (!isValidEmailAddress(normalized)) {
    throw new TypeError("A valid email address is required.");
  }

  return normalized;
};

const encodeQueryValue = (value: string): string => encodeURIComponent(value);

export function createTelHref(phone: string): string {
  return `tel:${normalizePhoneNumber(phone)}`;
}

export function createSmsHref(phone: string, body?: string): string {
  const href = `sms:${normalizePhoneNumber(phone)}`;
  return body ? `${href}?body=${encodeQueryValue(body)}` : href;
}

export function createMailtoHref(fields: MailtoFields): string {
  const to = requireEmail(fields.to);
  const query: string[] = [];

  if (fields.subject) {
    query.push(`subject=${encodeQueryValue(fields.subject)}`);
  }

  if (fields.body) {
    query.push(`body=${encodeQueryValue(fields.body)}`);
  }

  if (fields.cc?.length) {
    query.push(`cc=${encodeQueryValue(fields.cc.map(requireEmail).join(","))}`);
  }

  if (fields.bcc?.length) {
    query.push(`bcc=${encodeQueryValue(fields.bcc.map(requireEmail).join(","))}`);
  }

  return `mailto:${to}${query.length ? `?${query.join("&")}` : ""}`;
}

