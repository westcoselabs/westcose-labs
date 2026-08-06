import { describe, expect, it } from "vitest";

import {
  createMailtoHref,
  createSmsHref,
  createTelHref,
  isValidEmailAddress,
  normalizePhoneNumber,
} from "../../src/lib/native-uri";

describe("native URI helpers", () => {
  it("creates the documented exact SMS and telephone targets", () => {
    expect(createSmsHref("+1 612-741-7277")).toBe("sms:+16127417277");
    expect(createTelHref("+1 (612) 741-7277")).toBe("tel:+16127417277");
  });

  it("encodes optional SMS copy", () => {
    expect(createSmsHref("+16127417277", "Hello WestCose & team")).toBe(
      "sms:+16127417277?body=Hello%20WestCose%20%26%20team",
    );
  });

  it("builds an encoded mail handoff without implying delivery", () => {
    expect(
      createMailtoHref({
        to: "hello@example.com",
        subject: "Project: Estate Sales",
        body: "Hello,\nLet’s talk.",
      }),
    ).toBe(
      "mailto:hello@example.com?subject=Project%3A%20Estate%20Sales&body=Hello%2C%0ALet%E2%80%99s%20talk.",
    );
  });

  it("rejects unsafe or malformed addresses and phone numbers", () => {
    expect(isValidEmailAddress("hello@example.com\r\nBcc:bad@example.com")).toBe(
      false,
    );
    expect(() =>
      createMailtoHref({ to: "not-an-address" }),
    ).toThrow(TypeError);
    expect(() => normalizePhoneNumber("911")).toThrow(TypeError);
  });
});

