"use client";

import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Bot, RotateCcw, Send, Sparkles, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedGradientBackground } from "@/components/ui/animated-gradient-background";
import { useSendMessage, type ChatMessage } from "@/hooks/useChat";
import { useAuthStore } from "@/store/authStore";

type Msg = { role: "user" | "model"; text: string };

const STORAGE_KEY = "garage-chat-messages";
const WELCOME = `Привет! Я **ARIA** — ассистент коворкинга GARAGE.

Помогу узнать о свободных местах, правилах бронирования и твоих резервациях. Спрашивай!`;
const INITIAL_MESSAGES: Msg[] = [{ role: "model", text: WELCOME }];
const SUGGESTIONS = [
  "Какие места свободны сегодня?",
  "Покажи мои предстоящие бронирования",
  "Чем оснащены переговорные?",
  "Какой режим работы?",
];

function isMessageList(value: unknown): value is Msg[] {
  return Array.isArray(value) && value.every((item) => (
    item &&
    typeof item === "object" &&
    (item as Msg).role &&
    ((item as Msg).role === "user" || (item as Msg).role === "model") &&
    typeof (item as Msg).text === "string"
  ));
}

function readStoredMessages(): Msg[] {
  if (typeof window === "undefined") {
    return INITIAL_MESSAGES;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return INITIAL_MESSAGES;
    }

    const parsed = JSON.parse(raw);

    if (!isMessageList(parsed) || parsed.length === 0) {
      return INITIAL_MESSAGES;
    }

    return parsed;
  } catch {
    return INITIAL_MESSAGES;
  }
}

function md(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br />");
}

function Bubble({ role, text }: Msg) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className="mt-0.5 flex size-7 flex-shrink-0 items-center justify-center rounded-xl"
        style={
          isUser
            ? { background: "rgba(79,142,247,0.18)", border: "1px solid rgba(79,142,247,0.28)" }
            : { background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.25)" }
        }
      >
        {isUser
          ? <UserIcon className="size-3.5 text-[#4f8ef7]" />
          : <Bot className="size-3.5 text-[#a78bfa]" />}
      </div>

      <div
        className="max-w-[78%] rounded-2xl px-4 py-2.5"
        style={
          isUser
            ? { background: "rgba(79,142,247,0.14)", border: "1px solid rgba(79,142,247,0.22)" }
            : { background: "rgba(22,27,39,0.85)", border: "1px solid rgba(255,255,255,0.07)" }
        }
      >
        <p
          className="text-sm leading-relaxed"
          style={{ fontFamily: "var(--font-sans)", color: isUser ? "#c8d6f0" : "#e8edf5" }}
          dangerouslySetInnerHTML={{ __html: md(text) }}
        />
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-2.5"
    >
      <div
        className="flex size-7 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.25)" }}
      >
        <Bot className="size-3.5 text-[#a78bfa]" />
      </div>

      <div
        className="rounded-2xl px-4 py-3"
        style={{ background: "rgba(22,27,39,0.85)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="size-1.5 rounded-full"
              style={{ background: "#a78bfa" }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const sendMessage = useSendMessage();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesViewportRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Msg[]>(readStoredMessages);
  const [input, setInput] = useState("");

  const onlyWelcome = messages.length === 1;

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const viewport = messagesViewportRef.current;

    if (!viewport || (onlyWelcome && !sendMessage.isPending)) {
      return;
    }

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, onlyWelcome, sendMessage.isPending]);

  const history = useMemo<ChatMessage[]>(
    () => messages.filter((message) => message.text !== WELCOME).map((message) => ({
      role: message.role,
      parts: message.text,
    })),
    [messages],
  );

  const send = (text: string) => {
    const trimmed = text.trim();

    if (!trimmed || sendMessage.isPending) {
      return;
    }

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    sendMessage.mutate(
      { message: trimmed, history },
      {
        onSuccess: (reply) => {
          setMessages((prev) => [...prev, { role: "model", text: reply }]);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            { role: "model", text: "Что-то пошло не так. Попробуй ещё раз." },
          ]);
        },
      },
    );
  };

  const reset = () => {
    setMessages(INITIAL_MESSAGES);
    setInput("");
    window.localStorage.removeItem(STORAGE_KEY);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send(input);
    }
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <div className="relative flex min-h-screen flex-col" style={{ background: "#0a0d14" }}>
      <AnimatedGradientBackground />

      <header
        className="sticky top-0 z-50 flex h-14 flex-shrink-0 items-center justify-between px-6"
        style={{
          background: "rgba(10,13,20,0.85)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="h-8 gap-1.5 rounded-full px-3 text-muted-foreground hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "11px", letterSpacing: "0.12em" }}>
              Дашборд
            </span>
          </Button>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-[#a78bfa]" />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em", color: "#a78bfa" }}>
              ARIA
            </span>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "14px" }}>/</span>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: 600, color: "#fff" }}>
              AI Ассистент
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="h-8 gap-1.5 rounded-full px-3 text-muted-foreground hover:bg-white/5 hover:text-white"
          >
            <RotateCcw className="size-3.5" />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "11px" }}>Очистить</span>
          </Button>

          <div
            className="flex size-8 items-center justify-center rounded-xl"
            style={{ background: "rgba(79,142,247,0.15)", border: "1px solid rgba(79,142,247,0.2)" }}
          >
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "11px", fontWeight: 700, color: "#4f8ef7" }}>
              {initials}
            </span>
          </div>
        </div>
      </header>

      <div ref={messagesViewportRef} className="relative z-10 flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-4">
          <Bubble role="model" text={WELCOME} />

          <AnimatePresence>
            {onlyWelcome && (
              <motion.div
                key="suggestions"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2 }}
                className="flex flex-wrap gap-2 pl-9"
              >
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => send(suggestion)}
                    className="rounded-xl px-3 py-1.5 text-xs transition-all hover:brightness-125"
                    style={{
                      fontFamily: "var(--font-sans)",
                      color: "rgba(167,139,250,0.85)",
                      background: "rgba(167,139,250,0.08)",
                      border: "1px solid rgba(167,139,250,0.2)",
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {messages.slice(1).map((message, index) => (
            <Bubble key={`${message.role}-${index}-${message.text.slice(0, 24)}`} role={message.role} text={message.text} />
          ))}

          <AnimatePresence>
            {sendMessage.isPending && <TypingDots />}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative z-10 flex-shrink-0 px-4 pb-6 pt-3">
        <div className="mx-auto max-w-2xl">
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{
              background: "rgba(16,20,32,0.92)",
              border: "1px solid rgba(255,255,255,0.09)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKeyDown}
              onInput={(event) => {
                const target = event.currentTarget;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
              }}
              placeholder="Напиши вопрос... (Enter — отправить, Shift+Enter — перенос)"
              rows={1}
              disabled={sendMessage.isPending}
              className="flex-1 resize-none self-center bg-transparent text-sm leading-relaxed outline-none"
              style={{ fontFamily: "var(--font-sans)", color: "#e8edf5", maxHeight: "120px" }}
            />

            <Button
              onClick={() => send(input)}
              disabled={!input.trim() || sendMessage.isPending}
              size="sm"
              className="h-9 w-9 flex-shrink-0 self-center rounded-xl p-0 transition-all"
              style={{
                background:
                  input.trim() && !sendMessage.isPending
                    ? "rgba(79,142,247,0.9)"
                    : "rgba(79,142,247,0.15)",
                border:
                  input.trim() && !sendMessage.isPending
                    ? "1px solid rgba(79,142,247,0.5)"
                    : "1px solid rgba(79,142,247,0.15)",
              }}
            >
              <Send className="size-3.5" />
            </Button>
          </div>

          <p
            className="mt-2 text-center"
            style={{ fontFamily: "var(--font-sans)", fontSize: "10px", color: "rgba(136,146,164,0.28)" }}
          >
            ARIA может ошибаться. Для бронирования используй раздел «Забронировать».
          </p>
        </div>
      </div>
    </div>
  );
}
