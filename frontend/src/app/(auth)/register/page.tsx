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
import { useRegister } from "@/hooks/useAuth";

const registerSchema = z
  .object({
    firstName: z.string().min(1, "Введите имя"),
    lastName: z.string().min(1, "Введите фамилию"),
    email: z.string().email("Некорректный email"),
    password: z
      .string()
      .min(8, "Минимум 8 символов")
      .regex(/[A-Z]/, "Нужна заглавная буква")
      .regex(/[0-9]/, "Нужна цифра"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const register = useRegister();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = (data: RegisterForm) => {
    register.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    });
  };

  const serverError = register.error
    ? (register.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Ошибка регистрации"
    : null;

  const labelStyle = { fontFamily: "var(--font-sans)", fontSize: "13px", color: "rgba(200,210,230,0.8)" };
  const inputClass = "h-11 bg-[#0f1117]/60 border-white/10 focus:border-primary/50 text-white placeholder:text-white/25 rounded-xl";

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0f1117] py-10">
      <div className="absolute inset-0 z-0">
        <CanvasRevealEffect
          colors={[[124, 92, 252], [79, 142, 247]]}
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
        className="relative z-10 w-full max-w-[440px] mx-4"
      >
        <div
          className="rounded-2xl px-10 py-10"
          style={{
            background: "rgba(22,27,39,0.88)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 0 1px rgba(124,92,252,0.06), 0 32px 64px rgba(7,10,16,0.6)",
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
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 700, color: "#fff" }}>
              Регистрация
            </h1>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "rgba(136,146,164,0.9)" }}>
              Создай аккаунт для доступа к коворкингу
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={labelStyle}>Имя</FormLabel>
                      <FormControl>
                        <Input placeholder="Иван" className={inputClass} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={labelStyle}>Фамилия</FormLabel>
                      <FormControl>
                        <Input placeholder="Иванов" className={inputClass} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel style={labelStyle}>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@dstu.ru" type="email" autoComplete="email" className={inputClass} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel style={labelStyle}>Пароль</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            className={`${inputClass} pr-10`}
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
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel style={labelStyle}>Подтвердить пароль</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="••••••••"
                          type="password"
                          autoComplete="new-password"
                          className={inputClass}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                disabled={register.isPending}
                className="w-full h-11 rounded-xl mt-1 shadow-[0_0_24px_rgba(124,92,252,0.3)]"
                style={{ fontFamily: "var(--font-heading)", fontSize: "13px", fontWeight: 600, letterSpacing: "0.1em" }}
              >
                {register.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>Создать аккаунт <ArrowRight className="size-4 ml-2" /></>
                )}
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-center" style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "rgba(136,146,164,0.7)" }}>
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
              Войти
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
