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

// ─── Mock UI Preview ──────────────────────────────────────────────────────────

const MOCK_TASKS = [
  { title: "Разработать дизайн страницы", priority: "high",   status: "in_progress", tag: "#дизайн" },
  { title: "Написать документацию API",   priority: "low",    status: "todo",        tag: "#документация" },
  { title: "Добавить тёмную тему",        priority: "medium", status: "done",        tag: "" },
];

const DOT: Record<string, string> = {
  high: "bg-red-500", medium: "bg-amber-400", low: "bg-blue-400",
};
const BORDER: Record<string, string> = {
  in_progress: "border-l-amber-400", todo: "border-l-blue-200", done: "border-l-primary",
};
const STATUS_ICON: Record<string, React.ReactNode> = {
  in_progress: <span className="w-4 h-4 rounded-full bg-amber-50 flex items-center justify-center"><Icon name="Clock" size={11} className="text-amber-500" /></span>,
  todo:        <span className="w-4 h-4 rounded-full border-2 border-border" />,
  done:        <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center"><Icon name="CheckCircle2" size={13} className="text-primary" /></span>,
};

function AppPreview() {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl overflow-hidden text-left select-none scale-100">
      {/* Fake titlebar */}
      <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-border bg-secondary/50">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="flex-1 text-center text-xs text-muted-foreground font-mono">Мои задачи</span>
      </div>

      <div className="flex h-[320px]">
        {/* Mini sidebar */}
        <div className="w-[52px] flex-shrink-0 border-r border-border bg-card flex flex-col items-center py-3 gap-3">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center mb-1">
            <Icon name="Zap" size={13} className="text-primary-foreground" />
          </div>
          {[
            { icon: "ListTodo", active: true },
            { icon: "CalendarDays", active: false },
            { icon: "BarChart2", active: false },
            { icon: "Archive", active: false },
          ].map(({ icon, active }) => (
            <div key={icon} className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? "bg-primary/10" : "hover:bg-secondary"}`}>
              <Icon name={icon} size={15} className={active ? "text-primary" : "text-muted-foreground"} />
            </div>
          ))}
          <div className="flex-1" />
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-[9px] font-bold text-primary">КИ</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-3 gap-2">
          {/* Search bar mock */}
          <div className="flex items-center gap-1.5 bg-secondary rounded-lg px-2.5 py-1.5">
            <Icon name="Search" size={11} className="text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground">Поиск задач...</span>
          </div>

          {/* Filter chips mock */}
          <div className="flex gap-1">
            <span className="text-[9px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">Все</span>
            <span className="text-[9px] text-muted-foreground px-2 py-0.5 rounded-full">Высокий</span>
            <span className="text-[9px] text-muted-foreground px-2 py-0.5 rounded-full">Средний</span>
          </div>

          {/* Group label */}
          <span className="text-[9px] font-bold text-amber-500 tracking-widest uppercase mt-0.5">В ПРОЦЕССЕ 1</span>

          {/* Task cards */}
          <div className="space-y-1.5">
            {MOCK_TASKS.map(t => (
              <div key={t.title} className={`bg-background border border-border border-l-4 ${BORDER[t.status]} rounded-lg px-2.5 py-2 flex items-start gap-2`}>
                <div className="flex-shrink-0 mt-0.5">{STATUS_ICON[t.status]}</div>
                <div className="min-w-0 flex-1">
                  <p className={`text-[10px] font-semibold leading-snug truncate ${t.status === "done" ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOT[t.priority]}`} />
                    {t.tag && <span className="text-[9px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full">{t.tag}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Landing ──────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: "ListTodo",     title: "Задачи с приоритетами", desc: "Высокий, средний, низкий — всегда знаете что важнее" },
  { icon: "CalendarDays", title: "Календарь дедлайнов",   desc: "Визуализируйте сроки, не пропускайте ни одной задачи" },
  { icon: "BarChart2",    title: "Аналитика прогресса",   desc: "Смотрите статистику выполнения и динамику по тегам" },
  { icon: "Tag",          title: "Теги и фильтры",         desc: "Группируйте задачи по проектам, людям или темам" },
];

function Landing({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
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

      {/* Hero — split layout */}
      <section className="flex-1 max-w-6xl mx-auto w-full px-6 py-16 flex items-center gap-16">

        {/* Left */}
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-6 animate-fade-in-up opacity-0 stagger-1" style={{ animationFillMode: "forwards" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-xs text-primary font-medium">Менеджер задач</span>
          </div>

          <h1 className="text-5xl font-bold leading-[1.15] tracking-tight mb-5 animate-fade-in-up opacity-0 stagger-2" style={{ animationFillMode: "forwards" }}>
            Управляйте<br />задачами<br />быстро
          </h1>

          <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-sm animate-fade-in-up opacity-0 stagger-3" style={{ animationFillMode: "forwards" }}>
            Минималистичный менеджер с календарём, приоритетами, тегами и аналитикой. Без лишнего шума.
          </p>

          <div className="flex items-center gap-3 animate-fade-in-up opacity-0 stagger-4" style={{ animationFillMode: "forwards" }}>
            <button onClick={onRegister} className="btn-primary px-6 py-2.5 text-sm font-semibold">
              Создать аккаунт
              <Icon name="ArrowRight" size={15} />
            </button>
            <button onClick={onLogin} className="btn-outline py-2.5">
              <Icon name="LogIn" size={14} />
              Войти
            </button>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4 mt-8 animate-fade-in-up opacity-0 stagger-5" style={{ animationFillMode: "forwards" }}>
            <div className="flex -space-x-2">
              {["АК","ИП","МС","ДВ"].map((i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                  <span className="text-[9px] font-bold text-primary">{i}</span>
                </div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">Уже используют сотни команд</span>
          </div>
        </div>

        {/* Right — App preview */}
        <div className="flex-shrink-0 hidden md:flex justify-center items-center animate-fade-in opacity-0 stagger-3" style={{ animationFillMode: "forwards" }}>
          <div className="relative">
            {/* Glow */}
            <div className="absolute -inset-6 bg-primary/10 rounded-3xl blur-2xl" />
            <AppPreview />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card/50 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Возможности</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`bg-card border border-border rounded-xl p-4 animate-fade-in-up opacity-0 stagger-${i + 1}`}
                style={{ animationFillMode: "forwards" }}
              >
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                  <Icon name={f.icon} size={17} className="text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1.5 leading-snug">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-border px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-base">Готовы начать?</p>
            <p className="text-sm text-muted-foreground">Создайте аккаунт за 30 секунд — это бесплатно</p>
          </div>
          <button onClick={onRegister} className="btn-primary px-6 py-2.5 text-sm font-semibold flex-shrink-0">
            Создать аккаунт
            <Icon name="ArrowRight" size={15} />
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
