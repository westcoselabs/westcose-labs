"use client";

import { useState, type FormEvent } from "react";

type ContactComposerProps = {
  recipient: string | null;
};

export function ContactComposer({ recipient }: ContactComposerProps) {
  const [error, setError] = useState<string | null>(null);

  function handOffToEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!recipient) {
      setError(
        "Email handoff is unavailable until the owner supplies a production address.",
      );
      return;
    }

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const replyTo = String(data.get("replyTo") ?? "").trim();
    const subject = String(data.get("subject") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    if (!name || !replyTo || !subject || !message) {
      setError("Complete every field before opening your email application.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo)) {
      setError("Enter a valid reply-to email address.");
      return;
    }

    const params = new URLSearchParams({
      subject,
      body: `${message}\n\nFrom: ${name}\nReply to: ${replyTo}`,
    });

    window.location.href = `mailto:${recipient}?${params.toString()}`;
  }

  return (
    <form className="contact-composer" onSubmit={handOffToEmail} noValidate>
      <div className="contact-composer__field">
        <label htmlFor="contact-name">Your name</label>
        <input id="contact-name" name="name" autoComplete="name" required />
      </div>
      <div className="contact-composer__field">
        <label htmlFor="contact-email">Your email</label>
        <input
          id="contact-email"
          name="replyTo"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="contact-composer__field">
        <label htmlFor="contact-subject">Subject</label>
        <input id="contact-subject" name="subject" required />
      </div>
      <div className="contact-composer__field">
        <label htmlFor="contact-message">Message</label>
        <textarea id="contact-message" name="message" rows={6} required />
      </div>
      {error ? (
        <p className="contact-composer__error" role="alert">
          {error}
        </p>
      ) : null}
      <button
        className="route-action route-action--primary"
        type="submit"
        disabled={!recipient}
      >
        {recipient ? "Open email application" : "Email setup pending"}
      </button>
      {!recipient ? (
        <p className="contact-composer__error" role="status">
          The owner has not supplied a production contact email. Text and phone
          actions remain available below.
        </p>
      ) : null}
      <p className="contact-composer__disclosure">
        This website does not send or store submissions. The button opens your
        device&apos;s email application with these fields filled in.
      </p>
    </form>
  );
}
