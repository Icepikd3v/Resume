"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  mood?: OrbitMood;
};

type OrbitMood = "idle" | "listening" | "excited" | "angry" | "happy" | "curious";

const AGENT_NAME = process.env.NEXT_PUBLIC_AI_CONCIERGE_NAME || "Orbit";
const AGENT_STYLE = process.env.NEXT_PUBLIC_AI_CONCIERGE_STYLE || "Calm tactical co-pilot";
const AGENT_THEME = (process.env.NEXT_PUBLIC_AI_CONCIERGE_THEME || "mentor").toLowerCase();
const AGENT_THEME_KEY = ["executive", "creative", "mentor"].includes(AGENT_THEME) ? AGENT_THEME : "mentor";
const AGENT_THEME_LABELS: Record<string, string> = {
  executive: "Executive",
  creative: "Creative",
  mentor: "Tech Mentor"
};

const starter: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: `I'm ${AGENT_NAME}. What can I help you with today? You can ask about navigation, weather, time, trivia, or type 'contact agent:' to send Samuel a message.`,
  mood: "happy"
};

export function AiConciergeWidget() {
  const [open, setOpen] = useState(false);
  const [orbitState, setOrbitState] = useState<OrbitMood>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([starter]);
  const [prompt, setPrompt] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const chatLogRef = useRef<HTMLDivElement | null>(null);

  const canSendPrompt = useMemo(() => prompt.trim().length > 0 && !sendingChat, [prompt, sendingChat]);

  useEffect(() => {
    if (!open) return;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant" && last?.text.includes("What can I help you with today?")) return prev;
      return [
        ...prev,
        {
          id: `a-open-${Date.now()}`,
          role: "assistant",
          text: `What can I help you with today?`,
          mood: "happy"
        }
      ];
    });
  }, [open]);

  useEffect(() => {
    const el = chatLogRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, sendingChat, open]);

  async function sendPrompt(value: string) {
    const trimmed = value.trim();
    if (!trimmed || sendingChat) return;
    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setSendingChat(true);
    setOrbitState("listening");

    if (trimmed.toLowerCase().startsWith("contact agent:")) {
      const raw = trimmed.slice("contact agent:".length).trim();
      const parts = raw.split("|").map((item) => item.trim());
      if (parts.length < 4) {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-contact-help-${Date.now()}`,
            role: "assistant",
            text: "Use: contact agent: Your Name | you@email.com | Subject | Message",
            mood: "curious"
          }
        ]);
        setOrbitState("curious");
        setSendingChat(false);
        setTimeout(() => setOrbitState("idle"), 1200);
        return;
      }

      const [name, email, subject, ...msgParts] = parts;
      const message = msgParts.join(" | ");
      try {
        const res = await fetch("/api/contact-agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            subject,
            message,
            website: "",
            formStartedAt: Date.now() - 6000
          })
        });
        const json = (await res.json()) as { ok?: boolean; error?: string; message?: string };
        if (!res.ok || !json.ok) {
          setMessages((prev) => [
            ...prev,
            { id: `a-contact-err-${Date.now()}`, role: "assistant", text: json.error || "Unable to send contact message.", mood: "angry" }
          ]);
          setOrbitState("angry");
        } else {
          setMessages((prev) => [
            ...prev,
            { id: `a-contact-ok-${Date.now()}`, role: "assistant", text: json.message || "Message sent to Samuel.", mood: "excited" }
          ]);
          setOrbitState("excited");
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: `a-contact-fail-${Date.now()}`, role: "assistant", text: "Unable to send contact message right now.", mood: "angry" }
        ]);
        setOrbitState("angry");
      } finally {
        setSendingChat(false);
        setTimeout(() => setOrbitState("idle"), 1400);
      }
      return;
    }

    try {
      const history = messages.slice(-8).map((item) => ({
        role: item.role,
        text: item.text
      }));

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 18000);
      let res: Response;
      try {
        res = await fetch("/api/assistant-agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            history
          }),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeout);
      }

      const json = (await res.json()) as { reply?: string; mood?: OrbitMood };
      const reply = json.reply || "I couldn't process that yet. Please try again.";
      const mood = json.mood || "happy";

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: reply,
          mood
        }
      ]);
      setOrbitState(mood);
      setTimeout(() => setOrbitState("idle"), 1500);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: "I’m still here. That request timed out, so please try again in a shorter prompt or re-send.",
          mood: "angry"
        }
      ]);
      setOrbitState("angry");
      setTimeout(() => setOrbitState("idle"), 1500);
    } finally {
      setSendingChat(false);
    }
  }

  async function onChatSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendPrompt(prompt);
  }

  return (
    <>
      <button
        type="button"
        className={`ai-concierge-launch ai-state-${orbitState}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="ai-concierge-panel"
        aria-label={open ? `Close ${AGENT_NAME}` : `Chat with ${AGENT_NAME}`}
      >
        <span className="ai-dock-status" aria-hidden="true" />
        <span className="ai-dock-mascot-wrap" aria-hidden="true">
          <span className="ai-dock-ring" />
          <span className="ai-dock-mascot">
            <span className="ai-dock-eye ai-dock-eye-left" />
            <span className="ai-dock-eye ai-dock-eye-right" />
            <span className="ai-dock-smile" />
          </span>
        </span>
      </button>

      {open ? (
        <section
          id="ai-concierge-panel"
          className={`ai-concierge-panel ai-theme-${AGENT_THEME_KEY} ai-state-${orbitState}`}
          aria-label="AI concierge assistant"
        >
          <div className="ai-concierge-ambient" aria-hidden="true">
            <span className="ai-ambient-orb ai-ambient-orb-a" />
            <span className="ai-ambient-orb ai-ambient-orb-b" />
          </div>
          <header className="ai-concierge-head">
            <div className="ai-agent-hero">
              <div className="ai-agent-mascot-wrap" aria-hidden="true">
                <span className="ai-agent-ring" />
                <div className="ai-agent-mascot">
                  <span className="ai-agent-crater ai-agent-crater-a" />
                  <span className="ai-agent-crater ai-agent-crater-b" />
                  <span className="ai-agent-eye ai-agent-eye-left" />
                  <span className="ai-agent-eye ai-agent-eye-right" />
                  <span className="ai-agent-smile" />
                </div>
                <span className="ai-agent-moon" />
                <span className="ai-agent-spark ai-agent-spark-a" />
                <span className="ai-agent-spark ai-agent-spark-b" />
                <span className="ai-agent-tag">{AGENT_NAME}</span>
              </div>
              <div className="ai-agent-meta">
                <h3>{AGENT_NAME}</h3>
                <p className="ai-concierge-style">{AGENT_STYLE}</p>
                <p>Navigation + Weather + Time + Trivia + Contact Agent</p>
              </div>
            </div>
            <div className="ai-persona-strip">
              <span className="ai-persona-chip">{AGENT_THEME_LABELS[AGENT_THEME_KEY]}</span>
              <span className="ai-persona-chip">Live Assistant</span>
              <span className="ai-persona-chip">Fast Replies</span>
            </div>
          </header>

          <div className="ai-chat-shell">
              <div className="ai-chat-log" aria-live="polite" ref={chatLogRef}>
                {messages.map((item) => (
                  <article
                    key={item.id}
                    className={`ai-chat-msg ai-chat-msg-${item.role} ${item.mood ? `ai-chat-mood-${item.mood}` : ""}`}
                  >
                    <p>{item.text}</p>
                  </article>
                ))}
                {sendingChat ? (
                  <article className="ai-chat-msg ai-chat-msg-assistant ai-chat-mood-curious">
                    <p>{AGENT_NAME} is thinking...</p>
                  </article>
                ) : null}
              </div>

              <form className="ai-chat-form" onSubmit={onChatSubmit}>
                <input
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder={`Ask ${AGENT_NAME}: weather in Miami`}
                  aria-label={`Ask ${AGENT_NAME}`}
                />
                <button type="submit" className="btn btn-primary btn-small" disabled={!canSendPrompt}>
                  {sendingChat ? "Sending..." : "Send"}
                </button>
              </form>
            </div>
        </section>
      ) : null}
    </>
  );
}
