import { useState } from "react";
import Icon from "@/components/ui/icon";

type AuthMode = "landing" | "login" | "register";

interface AuthPageProps {
  onLogin: (name: string, email: string) => void;
}

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginForm({ onLogin, onSwitch, onBack }: { onLogin: (name: string, email: string) => void; onSwitch: () => void; onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError("Заполните все поля"); return; }
    const name = email.split("@")[0];
    onLogin(name.charAt(0).toUpperCase() + name.slice(1), email);
  }

  return (
    <div className="animate-scale-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <Icon name="ArrowLeft" size={14} />Назад
      </button>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">Вход в аккаунт</h2>
        <p className="text-muted-foreground text-sm">Введите данные для входа</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Email</label>
          <input type="email" className="input-base" placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} autoFocus />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Пароль</label>
          <input type="password" className="input-base" placeholder="••••••••" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} />
        </div>
        {error && <p className="text-xs text-red-500 flex items-center gap-1.5"><Icon name="AlertCircle" size={12} />{error}</p>}
        <button type="submit" className="btn-primary w-full py-2.5 text-base font-semibold mt-2">Войти</button>
      </form>
      <p className="text-sm text-muted-foreground text-center mt-6">
        Нет аккаунта?{" "}
        <button onClick={onSwitch} className="text-foreground font-medium hover:underline">Зарегистрироваться</button>
      </p>
    </div>
  );
}

// ─── Register Form ────────────────────────────────────────────────────────────

function RegisterForm({ onLogin, onSwitch, onBack }: { onLogin: (name: string, email: string) => void; onSwitch: () => void; onBack: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) { setError("Заполните все поля"); return; }
    if (password.length < 6) { setError("Пароль минимум 6 символов"); return; }
    onLogin(name, email);
  }

  return (
    <div className="animate-scale-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <Icon name="ArrowLeft" size={14} />Назад
      </button>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">Создать аккаунт</h2>
        <p className="text-muted-foreground text-sm">Начните управлять задачами прямо сейчас</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Ваше имя</label>
          <input className="input-base" placeholder="Иван Петров" value={name} onChange={e => { setName(e.target.value); setError(""); }} autoFocus />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Email</label>
          <input type="email" className="input-base" placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Пароль</label>
          <input type="password" className="input-base" placeholder="Минимум 6 символов" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} />
        </div>
        {error && <p className="text-xs text-red-500 flex items-center gap-1.5"><Icon name="AlertCircle" size={12} />{error}</p>}
        <button type="submit" className="btn-primary w-full py-2.5 text-base font-semibold mt-2">Создать аккаунт</button>
      </form>
      <p className="text-sm text-muted-foreground text-center mt-6">
        Уже есть аккаунт?{" "}
        <button onClick={onSwitch} className="text-foreground font-medium hover:underline">Войти</button>
      </p>
    </div>
  );
}

// ─── Landing ──────────────────────────────────────────────────────────────────

const STEPS = [
  { num: "01", title: "Создайте задачу",       desc: "Добавьте название, приоритет, срок и теги за несколько секунд" },
  { num: "02", title: "Следите за прогрессом", desc: "Статусы «к выполнению», «в процессе», «выполнено» — всё под контролем" },
  { num: "03", title: "Анализируйте итоги",    desc: "Смотрите статистику и понимайте, как улучшить продуктивность" },
];

const FEATURES = [
  { icon: "ListTodo",     title: "Приоритеты",   desc: "Высокий, средний, низкий и срочный — всегда знаете что важнее" },
  { icon: "CalendarDays", title: "Календарь",    desc: "Все дедлайны на одном экране, удобный выбор даты" },
  { icon: "BarChart2",    title: "Аналитика",    desc: "Процент выполнения, графики по приоритетам и тегам" },
  { icon: "Tag",          title: "Теги",         desc: "Группируйте задачи по проектам, командам или темам" },
  { icon: "Archive",      title: "Архив",        desc: "Выполненные задачи не мешают — уходят в архив" },
  { icon: "Bell",         title: "Уведомления",  desc: "Напоминания о задачах, срок которых скоро наступит" },
];

const STATS = [
  { value: "3 мин", label: "среднее время на задачу" },
  { value: "100%",  label: "бесплатно навсегда" },
  { value: "0",     label: "лишних кнопок" },
];

function Landing({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Zap" size={13} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-sm tracking-tight">Задачи</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onLogin} className="btn-ghost text-sm">Войти</button>
            <button onClick={onRegister} className="btn-primary text-sm">Создать аккаунт</button>
          </div>
        </div>
      </header>

      {/* Hero — full-width centered */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Grid bg */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            opacity: 0.35,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/60 to-background pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <p className="text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-4 animate-fade-in-up opacity-0 stagger-1" style={{ animationFillMode: "forwards" }}>
            Менеджер задач
          </p>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-fade-in-up opacity-0 stagger-2" style={{ animationFillMode: "forwards" }}>
            Управляйте<br />задачами быстро
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-10 leading-relaxed animate-fade-in-up opacity-0 stagger-3" style={{ animationFillMode: "forwards" }}>
            Простой и чёткий инструмент для личных задач и небольших команд. Без лишнего шума.
          </p>
          <div className="flex items-center justify-center gap-3 animate-fade-in-up opacity-0 stagger-4" style={{ animationFillMode: "forwards" }}>
            <button onClick={onRegister} className="btn-primary px-7 py-3 text-sm font-semibold">
              Начать бесплатно <Icon name="ArrowRight" size={15} />
            </button>
            <button onClick={onLogin} className="btn-outline py-3 px-5 text-sm">
              Войти
            </button>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 mt-14 animate-fade-in-up opacity-0 stagger-5" style={{ animationFillMode: "forwards" }}>
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — 3 steps */}
      <section className="border-b border-border py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.18em] text-center mb-10">Как это работает</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-5 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-px bg-border" />
            {STEPS.map((s, i) => (
              <div key={s.num} className={`animate-fade-in-up opacity-0 stagger-${i + 1}`} style={{ animationFillMode: "forwards" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                    <span className="text-xs font-bold text-primary">{s.num}</span>
                  </div>
                  <h3 className="font-semibold text-sm">{s.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-[52px]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-14 px-6 bg-card/40 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.18em] text-center mb-10">Возможности</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`bg-card border border-border rounded-xl p-5 flex gap-4 items-start animate-fade-in-up opacity-0 stagger-${(i % 3) + 1}`} style={{ animationFillMode: "forwards" }}>
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name={f.icon} size={17} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-14 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3 tracking-tight">Готовы начать?</h2>
          <p className="text-muted-foreground text-sm mb-7 leading-relaxed">Создайте аккаунт за 30 секунд и начните управлять задачами прямо сейчас</p>
          <button onClick={onRegister} className="btn-primary px-8 py-3 text-sm font-semibold mx-auto">
            Создать аккаунт <Icon name="ArrowRight" size={15} />
          </button>
        </div>
      </section>

    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function IndexPage({ onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("landing");

  if (mode === "login")
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-sm">
          <LoginForm onLogin={onLogin} onSwitch={() => setMode("register")} onBack={() => setMode("landing")} />
        </div>
      </div>
    );

  if (mode === "register")
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-sm">
          <RegisterForm onLogin={onLogin} onSwitch={() => setMode("login")} onBack={() => setMode("landing")} />
        </div>
      </div>
    );

  return <Landing onLogin={() => setMode("login")} onRegister={() => setMode("register")} />;
}
