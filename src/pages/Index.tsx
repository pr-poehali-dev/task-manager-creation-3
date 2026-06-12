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
        <Icon name="ArrowLeft" size={14} />
        Назад
      </button>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">Вход в аккаунт</h2>
        <p className="text-muted-foreground text-sm">Введите данные для входа</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="section-header block mb-1.5">Email</label>
          <input
            type="email"
            className="input-base"
            placeholder="you@example.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
            autoFocus
          />
        </div>
        <div>
          <label className="section-header block mb-1.5">Пароль</label>
          <input
            type="password"
            className="input-base"
            placeholder="••••••••"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(""); }}
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1.5">
            <Icon name="AlertCircle" size={12} />
            {error}
          </p>
        )}
        <button type="submit" className="btn-primary w-full py-2.5 text-base font-semibold mt-2">
          Войти
        </button>
      </form>

      <p className="text-sm text-muted-foreground text-center mt-6">
        Нет аккаунта?{" "}
        <button onClick={onSwitch} className="text-foreground font-medium hover:underline">
          Зарегистрироваться
        </button>
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
        <Icon name="ArrowLeft" size={14} />
        Назад
      </button>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">Создать аккаунт</h2>
        <p className="text-muted-foreground text-sm">Начните управлять задачами прямо сейчас</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="section-header block mb-1.5">Ваше имя</label>
          <input
            className="input-base"
            placeholder="Иван Петров"
            value={name}
            onChange={e => { setName(e.target.value); setError(""); }}
            autoFocus
          />
        </div>
        <div>
          <label className="section-header block mb-1.5">Email</label>
          <input
            type="email"
            className="input-base"
            placeholder="you@example.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
          />
        </div>
        <div>
          <label className="section-header block mb-1.5">Пароль</label>
          <input
            type="password"
            className="input-base"
            placeholder="Минимум 6 символов"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(""); }}
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1.5">
            <Icon name="AlertCircle" size={12} />
            {error}
          </p>
        )}
        <button type="submit" className="btn-primary w-full py-2.5 text-base font-semibold mt-2">
          Создать аккаунт
        </button>
      </form>

      <p className="text-sm text-muted-foreground text-center mt-6">
        Уже есть аккаунт?{" "}
        <button onClick={onSwitch} className="text-foreground font-medium hover:underline">
          Войти
        </button>
      </p>
    </div>
  );
}

// ─── Landing ──────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: "ListTodo",    title: "Задачи",     desc: "Создавайте, редактируйте и отслеживайте задачи с приоритетами и тегами" },
  { icon: "CalendarDays",title: "Календарь",  desc: "Визуализируйте дедлайны на календаре — никогда не пропустите срок" },
  { icon: "BarChart2",   title: "Аналитика",  desc: "Отслеживайте прогресс, видьте статистику выполненных задач" },
  { icon: "Bell",        title: "Уведомления",desc: "Напоминания о задачах, срок которых наступает завтра" },
];

function Landing({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize: "128px" }}
      />

      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
              <Icon name="CheckSquare" size={14} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-sm tracking-tight">Задачи</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onLogin} className="btn-ghost text-sm">
              Войти
            </button>
            <button onClick={onRegister} className="btn-primary text-sm">
              Создать аккаунт
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            opacity: 0.4,
          }}
        />
        {/* Gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

        <div className="relative text-center max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-5 tracking-tight animate-fade-in-up opacity-0 stagger-1" style={{ animationFillMode: "forwards" }}>
            Управляйте<br />
            задачами быстро
          </h1>

          <p className="text-muted-foreground text-lg leading-relaxed mb-8 animate-fade-in-up opacity-0 stagger-2" style={{ animationFillMode: "forwards" }}>
            Минималистичный менеджер задач с календарём, приоритетами,<br className="hidden md:block" />
            тегами и аналитикой. Без лишнего шума.
          </p>

          <div className="flex items-center justify-center gap-4 animate-fade-in-up opacity-0 stagger-3" style={{ animationFillMode: "forwards" }}>
            <button
              onClick={onRegister}
              className="btn-primary px-8 py-3 text-base font-semibold flex items-center gap-2 rounded-md"
            >
              Создать аккаунт
              <Icon name="ArrowRight" size={16} />
            </button>
            <button onClick={onLogin} className="btn-ghost px-6 py-3 text-base border border-border rounded-md">
              Войти
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-10 px-6 border-t border-border bg-card/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <span className="section-header block mb-2">Возможности</span>
            <h2 className="text-2xl font-bold">Всё что нужно — и ничего лишнего</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`bg-card border border-border rounded-lg p-5 animate-fade-in-up opacity-0 stagger-${i + 1}`}
                style={{ animationFillMode: "forwards" }}
              >
                <div className="w-9 h-9 bg-secondary rounded flex items-center justify-center mb-4">
                  <Icon name={f.icon} size={18} className="text-foreground" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview strip */}
      <section className="py-16 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "ListTodo", label: "Активных задач", value: "12", sub: "3 просрочено" },
              { icon: "CheckCircle2", label: "Выполнено сегодня", value: "5", sub: "+2 за вчера" },
              { icon: "TrendingUp", label: "Продуктивность", value: "78%", sub: "за эту неделю" },
            ].map((s, i) => (
              <div key={s.label} className={`stat-card text-center animate-fade-in-up opacity-0 stagger-${i + 1}`} style={{ animationFillMode: "forwards" }}>
                <Icon name={s.icon} size={20} className="mx-auto mb-3 text-muted-foreground" fallback="Circle" />
                <p className="text-3xl font-bold font-mono mb-1">{s.value}</p>
                <p className="text-xs font-medium mb-0.5">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-border bg-primary text-primary-foreground">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">Готовы начать?</h2>
          <p className="text-primary-foreground/70 text-sm mb-8">Создайте аккаунт за 30 секунд и начните управлять своими задачами</p>
          <button
            onClick={onRegister}
            className="bg-primary-foreground text-primary px-8 py-3 rounded-md text-base font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
          >
            Создать аккаунт бесплатно
            <Icon name="ArrowRight" size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-muted-foreground font-mono">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary rounded flex items-center justify-center">
              <Icon name="CheckSquare" size={10} className="text-primary-foreground" />
            </div>
            <span>Задачи · 2026</span>
          </div>
          <span>Минималистичный менеджер задач</span>
        </div>
      </footer>
    </div>
  );
}

// ─── Auth layout wrapper ──────────────────────────────────────────────────────

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left — form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-background">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      {/* Right — decorative */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative text-primary-foreground text-center max-w-xs">
          <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-8">
            <Icon name="CheckSquare" size={28} className="text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-4 leading-tight">Всё под<br />контролем</h2>
          <p className="text-primary-foreground/60 text-sm leading-relaxed">
            Управляйте задачами, расставляйте приоритеты и не пропускайте дедлайны
          </p>

          <div className="mt-10 space-y-3">
            {[
              { icon: "CheckCircle2", text: "Приоритеты и теги" },
              { icon: "CalendarDays", text: "Календарь дедлайнов" },
              { icon: "BarChart2",    text: "Аналитика выполнения" },
              { icon: "Archive",      text: "Архив задач" },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <Icon name={f.icon} size={15} className="text-primary-foreground/50 flex-shrink-0" />
                {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function Index({ onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("landing");

  if (mode === "landing") {
    return <Landing onLogin={() => setMode("login")} onRegister={() => setMode("register")} />;
  }

  return (
    <AuthLayout>
      {mode === "login" ? (
        <LoginForm
          onLogin={onLogin}
          onSwitch={() => setMode("register")}
          onBack={() => setMode("landing")}
        />
      ) : (
        <RegisterForm
          onLogin={onLogin}
          onSwitch={() => setMode("login")}
          onBack={() => setMode("landing")}
        />
      )}
    </AuthLayout>
  );
}