import { promises as fs } from "fs";
import path from "path";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type FramesManifest = {
  frames: string[];
  count: number;
};

const roadmapFocus = [
  {
    title: "Лендинг с видео-сценой",
    description:
      "Кадры из pc.mp4 уже подготовлены, следующим шагом можно собирать ScrollScene и Hero.",
  },
  {
    title: "Базовый API и Swagger",
    description:
      "NestJS запущен как каркас, Prisma-схема готова для аутентификации, бронирований и уведомлений.",
  },
  {
    title: "Docker и локальная среда",
    description:
      "Есть compose-конфигурация для frontend, backend и postgres, плюс стартовые env-файлы.",
  },
];

const foundationStats = [
  {
    label: "Кадры лендинга",
    value: "121",
    note: "Извлечены из pc.mp4 и перечислены в manifest.json",
  },
  {
    label: "Контейнеры",
    value: "3",
    note: "frontend, backend и postgres уже описаны в docker-compose",
  },
  {
    label: "Стек",
    value: "Next + Nest",
    note: "Подтянуты shadcn/ui, Prisma, Socket.io, R3F и рабочие зависимости",
  },
];

const primaryLinkClass =
  "inline-flex h-9 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85";

const secondaryLinkClass =
  "inline-flex h-9 items-center justify-center rounded-full border border-border/80 bg-white/5 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10";

async function getFramesManifest(): Promise<FramesManifest> {
  const manifestPath = path.join(
    process.cwd(),
    "public",
    "frames",
    "manifest.json",
  );

  const file = await fs.readFile(manifestPath, "utf8");
  return JSON.parse(file.replace(/^\uFEFF/, "")) as FramesManifest;
}

export default async function Home() {
  const manifest = await getFramesManifest();
  const firstFrame = manifest.frames[0]
    ? `/frames/${manifest.frames[0]}`
    : "/next.svg";
  const lastFrame = manifest.frames.at(-1)
    ? `/frames/${manifest.frames.at(-1)}`
    : "/next.svg";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-5 py-6 sm:px-8 lg:px-10">
      <section className="glass-panel accent-glow relative overflow-hidden rounded-[2rem] border border-border/70 px-6 py-8 sm:px-10 sm:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,142,247,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(124,92,252,0.14),transparent_22%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <Badge className="rounded-full border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
              Garage / build in progress
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-[family-name:var(--font-heading)] text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Garage Coworking начинает обретать форму.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Мы уже подготовили анимационные кадры для лендинга, подняли
                каркас frontend/backend и собрали стартовый набор UI-компонентов
                для дальнейшей разработки системы управления коворкингом.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="http://localhost:3001/api" className={primaryLinkClass}>
                Swagger
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link href="#foundation" className={secondaryLinkClass}>
                Что уже готово
              </Link>
            </div>
            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              {foundationStats.map((item) => (
                <Card
                  key={item.label}
                  className="glass-panel border-border/70 bg-white/[0.03]"
                >
                  <CardHeader className="space-y-2 pb-3">
                    <CardDescription className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      {item.label}
                    </CardDescription>
                    <CardTitle className="text-3xl font-semibold text-white">
                      {item.label === "Кадры лендинга"
                        ? manifest.count
                        : item.value}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-6 text-slate-300">
                    {item.note}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Card className="glass-panel overflow-hidden border-border/70 bg-white/[0.03]">
              <div className="relative aspect-[16/10]">
                <Image
                  src={firstFrame}
                  alt="Первый кадр анимации Garage"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
              <CardContent className="space-y-2 px-5 py-4">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                  Frame 0001
                </p>
                <p className="text-sm leading-6 text-slate-300">
                  Первый кадр уже доступен во frontend и готов к прелоаду для
                  ScrollScene.
                </p>
              </CardContent>
            </Card>
            <Card className="glass-panel overflow-hidden border-border/70 bg-white/[0.03]">
              <div className="relative aspect-[16/10]">
                <Image
                  src={lastFrame}
                  alt="Финальный кадр анимации Garage"
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="space-y-2 px-5 py-4">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  Frame {String(manifest.count).padStart(4, "0")}
                </p>
                <p className="text-sm leading-6 text-slate-300">
                  Финальный кадр пригодится для hero-сцены и перехода к контенту
                  лендинга.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section
        id="foundation"
        className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]"
      >
        <Card className="glass-panel border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Layers3 className="size-5 text-primary" />
              Точка старта
            </CardTitle>
            <CardDescription className="text-slate-300">
              Проект уже приведен к осмысленному базовому состоянию вместо
              шаблонного boilerplate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-slate-300">
            <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-white/[0.03] p-4">
              <CalendarClock className="mt-1 size-5 text-primary" />
              <div>
                Из `pc.mp4` извлечены все кадры, собран `manifest.json`, а
                ассеты оптимизированы до рабочего размера для браузера.
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-white/[0.03] p-4">
              <ShieldCheck className="mt-1 size-5 text-emerald-400" />
              <div>
                Бэкенд уже готов к расширению: есть Swagger, валидационный
                пайплайн, env-конфигурация и Prisma-схема ядра домена.
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-white/[0.03] p-4">
              <Sparkles className="mt-1 size-5 text-accent" />
              <div>
                Фронтенд оформлен в палитре roadmap и снабжен стартовым набором
                `shadcn/ui`, чтобы дальше собирать auth, booking и admin UI.
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          {roadmapFocus.map((item) => (
            <Card key={item.title} className="glass-panel border-border/70">
              <CardHeader className="space-y-3">
                <Badge
                  variant="secondary"
                  className="w-fit rounded-full bg-white/5 text-slate-200"
                >
                  Next up
                </Badge>
                <CardTitle className="text-xl text-white">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-slate-300">
                {item.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
