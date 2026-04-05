"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLogin } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
  remember: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = (data: LoginForm) => {
    login.mutate({ email: data.email, password: data.password });
  };

  const serverError = login.error
    ? (login.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Неверные данные"
    : null;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0f1117]">
      <div className="absolute inset-0 z-0">
        <CanvasRevealEffect
          colors={[[79, 142, 247], [124, 92, 252]]}
          dotSize={2}
          opacities={[0.1, 0.12, 0.14, 0.18, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5]}
          showGradient={false}
        />
        <div className="absolute inset-0 bg-[#0f1117]/30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[420px] mx-4"
      >
        <div
          className="rounded-2xl px-10 py-10"
          style={{
            background: "rgba(22,27,39,0.88)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 0 1px rgba(79,142,247,0.06), 0 32px 64px rgba(7,10,16,0.6)",
          }}
        >
          <div className="mb-8 space-y-1">
            <Link
              href="/"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "22px",
                fontWeight: 700,
                letterSpacing: "0.24em",
                color: "#4f8ef7",
                display: "block",
                marginBottom: "20px",
              }}
            >
              GARAGE
            </Link>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "24px",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              Войти
            </h1>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "rgba(136,146,164,0.9)" }}>
              Добро пожаловать обратно
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "rgba(200,210,230,0.8)" }}>
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@dstu.ru"
                        type="email"
                        autoComplete="email"
                        className="h-11 bg-[#0f1117]/60 border-white/10 focus:border-primary/50 text-white placeholder:text-white/25 rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "rgba(200,210,230,0.8)" }}>
                      Пароль
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="••••••••"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          className="h-11 bg-[#0f1117]/60 border-white/10 focus:border-primary/50 text-white placeholder:text-white/25 rounded-xl pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remember"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2.5 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </FormControl>
                    <FormLabel
                      className="cursor-pointer select-none"
                      style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "rgba(136,146,164,0.9)" }}
                    >
                      Запомнить меня
                    </FormLabel>
                  </FormItem>
                )}
              />

              {serverError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
                >
                  {serverError}
                </motion.p>
              )}

              <Button
                type="submit"
                disabled={login.isPending}
                className="w-full h-11 rounded-xl mt-2 shadow-[0_0_24px_rgba(79,142,247,0.3)]"
                style={{ fontFamily: "var(--font-heading)", fontSize: "13px", fontWeight: 600, letterSpacing: "0.1em" }}
              >
                {login.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>Войти <ArrowRight className="size-4 ml-2" /></>
                )}
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-center" style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "rgba(136,146,164,0.7)" }}>
            Нет аккаунта?{" "}
            <Link href="/register" className="text-primary hover:text-primary/80 transition-colors font-medium">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
