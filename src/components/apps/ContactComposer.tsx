"use client";

import { useState, type FormEvent, type FocusEvent } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";
import { PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr/PaperPlaneTilt";
import { Phone } from "@phosphor-icons/react/dist/ssr/Phone";
import { ChatCircle } from "@phosphor-icons/react/dist/ssr/ChatCircle";
import { siteConfig } from "@/registry/site";
import styles from "./ContactComposer.module.css";

type Field = "name" | "replyTo" | "subject" | "message";
const labels: Record<Field, string> = { name: "Your name", replyTo: "Your email", subject: "Subject", message: "Message" };
const ids: Record<Field, string> = { name: "contact-name", replyTo: "contact-email", subject: "contact-subject", message: "contact-message" };
const topics = ["A new website", "A redesign", "Custom software", "Something else"];

export function ContactComposer({ recipient }: { recipient: string | null }) {
  const [topic, setTopic] = useState(topics[0]);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [handoff, setHandoff] = useState(false);

  function validate(field: Field, value: string) {
    if (!value.trim()) return `Add ${field === "replyTo" ? "your email address" : field === "name" ? "your name" : `a ${field}`}.`;
    if (field === "replyTo" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Use an email address like name@example.com.";
    return undefined;
  }

  function handOffToEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fields = Object.keys(labels) as Field[];
    const nextErrors = Object.fromEntries(fields.map(field => [field, validate(field, String(data.get(field) ?? ""))]));
    setErrors(nextErrors);
    const firstInvalid = fields.find(field => nextErrors[field]);
    if (firstInvalid) {
      event.currentTarget.querySelector<HTMLElement>(`#${ids[firstInvalid]}`)?.focus();
      return;
    }
    if (!recipient) return;
    const params = new URLSearchParams({
      subject: String(data.get("subject")).trim(),
      body: `${String(data.get("message")).trim()}\n\nProject: ${topic}\nFrom: ${String(data.get("name")).trim()}\nReply to: ${String(data.get("replyTo")).trim()}`,
    });
    window.location.href = `mailto:${recipient}?${params.toString()}`;
    setHandoff(true);
  }

  return <div className={styles.layout}><div className={styles.composer}>
    <aside className={styles.address} aria-label="Contact Brandon">
      <span className={styles.stamp} aria-hidden="true"><EnvelopeSimple size={36} weight="duotone" /></span>
      <p className={styles.eyebrow}>TO / BRANDON AT WESTCOSE</p>
      <h2>A good place<br />to start.</h2>
      <p>Tell me what you have in mind. A rough idea, a website that needs work, or a problem you haven&apos;t quite named yet.</p>
      <div className={styles.direct}>
        {recipient && <a href={`mailto:${recipient}`}><EnvelopeSimple size={20} aria-hidden="true" /><span>{recipient}</span><ArrowUpRight size={16} aria-hidden="true" /></a>}
        <a href={`sms:${siteConfig.phoneE164}`}><ChatCircle size={20} aria-hidden="true" /><span>Send a text</span><ArrowUpRight size={16} aria-hidden="true" /></a>
        <a href={`tel:${siteConfig.phoneE164}`}><Phone size={20} aria-hidden="true" /><span>{siteConfig.phoneDisplay}</span><ArrowUpRight size={16} aria-hidden="true" /></a>
      </div>
      <small>One person. A direct conversation.</small>
    </aside>
    <form className={styles.form} onSubmit={handOffToEmail} noValidate aria-label="Project email">
      <div className={styles.formHeading}><span className={styles.eyebrow}>YOUR NEXT THING</span><span className={styles.eyebrow}>01 / SAY HELLO</span></div>
      <fieldset className={styles.topics}>
        <legend>What are you thinking?</legend>
        <div>{topics.map(item => <label key={item}><input type="radio" name="topic" value={item} checked={topic === item} onChange={() => setTopic(item)} /><span>{item}</span></label>)}</div>
      </fieldset>
      <div className={styles.fields}>
        {(Object.keys(labels) as Field[]).map(field => {
          const props = {
            id: ids[field], name: field, required: true,
            "aria-invalid": Boolean(errors[field]),
            "aria-describedby": errors[field] ? `${ids[field]}-error` : field === "message" ? "contact-message-hint" : undefined,
            onBlur: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => setErrors(previous => ({ ...previous, [field]: validate(field, event.target.value) })),
          };
          return <div className={styles.field} key={field} data-wide={field === "subject" || field === "message" || undefined}>
            <label htmlFor={ids[field]}>{labels[field]} <span aria-hidden="true">*</span></label>
            {field === "message" ? <textarea {...props} rows={6} /> : <input {...props} type={field === "replyTo" ? "email" : "text"} autoComplete={field === "name" ? "name" : field === "replyTo" ? "email" : "off"} />}
            {field === "message" && <small id="contact-message-hint">What are we making? Share any links, timing, or budget you already have.</small>}
            {errors[field] && <p id={`${ids[field]}-error`} className={styles.error}>{errors[field]}</p>}
          </div>;
        })}
      </div>
      <p className={styles.error} role="alert">{Object.values(errors).some(Boolean) ? "A few details need a second look. Check the marked fields above." : ""}</p>
      <div className={styles.send}>
        <button className="route-action route-action--primary" type="submit" disabled={!recipient}>Open email draft <PaperPlaneTilt size={20} aria-hidden="true" /></button>
        <small>Required fields are marked *.<br />You review and send it in your email app.</small>
      </div>
      <p className={styles.disclosure} role="status">{handoff ? "Email draft requested. If your email app didn’t open, use the direct email link. Your message stays here so you can copy it." : "This opens a draft in your email app. Nothing is sent or stored by this website."}</p>
    </form>
  </div></div>;
}
