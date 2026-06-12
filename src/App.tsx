import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import IndexPage from "@/pages/Index";

// ─── Auth ─────────────────────────────────────────────────────────────────────

interface User { name: string; email: string; }

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = "low" | "medium" | "high" | "urgent";
type Status   = "todo" | "in_progress" | "done";
type Section  = "tasks" | "calendar" | "analytics" | "archive" | "settings";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  tags: string[];
  createdAt: string;
  archived: boolean;
  notification: boolean;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<Priority, { label: string; dot: string; text: string }> = {
  low:    { label: "Низкий",  dot: "bg-blue-400",   text: "text-blue-500" },
  medium: { label: "Средний", dot: "bg-amber-400",  text: "text-amber-500" },
  high:   { label: "Высокий", dot: "bg-red-500",    text: "text-red-500" },
  urgent: { label: "Срочный", dot: "bg-purple-500", text: "text-purple-500" },
};

const STATUS_CONFIG: Record<Status, { label: string; icon: string; color: string; groupLabel: string }> = {
  todo:        { label: "К выполнению", icon: "Circle",       color: "text-muted-foreground", groupLabel: "К ВЫПОЛНЕНИЮ" },
  in_progress: { label: "В процессе",   icon: "Clock",        color: "text-amber-500",         groupLabel: "В ПРОЦЕССЕ" },
  done:        { label: "Выполнено",    icon: "CheckCircle2", color: "text-primary",           groupLabel: "ВЫПОЛНЕНО" },
};

const STATUS_BORDER: Record<Status, string> = {
  in_progress: "border-l-4 border-l-amber-400",
  todo:        "border-l-4 border-l-blue-200",
  done:        "border-l-4 border-l-primary",
};

const STATUS_LABEL_COLOR: Record<Status, string> = {
  in_progress: "text-amber-500",
  todo:        "text-muted-foreground",
  done:        "text-primary",
};

const INITIAL_TASKS: Task[] = [
  { id: "1", title: "Разработать дизайн главной страницы", description: "Создать макет в Figma, согласовать с командой", priority: "high",   status: "in_progress", dueDate: "2026-06-16", tags: ["дизайн", "frontend"],   createdAt: "2026-06-01", archived: false, notification: true },
  { id: "2", title: "Написать документацию",               description: "API-документация для бэкенд-разработчиков",        priority: "low",    status: "todo",        dueDate: "2026-06-25", tags: ["документация"],           createdAt: "2026-06-03", archived: false, notification: false },
  { id: "3", title: "Добавить тёмную тему оформления",     description: "Реализовать переключатель темы (светлая/тёмная) в настройках.", priority: "medium", status: "done", dueDate: "2026-07-11", tags: [],                createdAt: "2026-06-02", archived: false, notification: false },
  { id: "4", title: "Добавить валидацию при создании задачи","description": "На форме создания задачи проверять, что название не пустое", priority: "medium", status: "done", dueDate: "2026-06-12", tags: ["дизайн", "встреча"], createdAt: "2026-06-05", archived: false, notification: true },
  { id: "5", title: "Отчёт за прошлый квартал",            description: "Финансовый отчёт и KPI-метрики",                   priority: "high",   status: "done",        dueDate: "2026-06-08", tags: ["отчёты"],                createdAt: "2026-06-01", archived: true,  notification: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0,0,0,0);
  d.setHours(0,0,0,0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  const base = d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }).replace(".", "");
  if (diff === 0) return `${base} · сегодня`;
  if (diff > 0)  return `${base} · через ${diff} дн.`;
  return `${base} · ${Math.abs(diff)} дн. назад`;
}

function isOverdue(dateStr: string, status: Status) {
  if (!dateStr || status === "done") return false;
  return new Date(dateStr) < new Date();
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

const MONTHS_RU = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const DAYS_RU   = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

// ─── TaskModal ────────────────────────────────────────────────────────────────

function TaskModal({ task, onSave, onClose, onDelete }: {
  task: Task | null; onSave: (t: Task) => void; onClose: () => void; onDelete?: (id: string) => void;
}) {
  const isEdit = !!task?.id;
  const [form, setForm] = useState({
    title:        task?.title       ?? "",
    description:  task?.description ?? "",
    priority:     task?.priority    ?? "medium" as Priority,
    status:       task?.status      ?? "todo" as Status,
    dueDate:      task?.dueDate     ?? "",
    tags:         task?.tags        ?? [] as string[],
    notification: task?.notification ?? false,
  });
  const [tagInput, setTagInput] = useState("");

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase().replace(/^#/, "");
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    setTagInput("");
  }

  function submit() {
    if (!form.title.trim()) return;
    onSave({ ...form, id: task?.id || generateId(), createdAt: task?.createdAt || new Date().toISOString().split("T")[0], archived: task?.archived ?? false });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 animate-fade-in" />
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-lg mx-4 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <span className="font-semibold">{isEdit ? "Редактировать задачу" : "Новая задача"}</span>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg"><Icon name="X" size={16} /></button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Название</label>
            <input className="input-base font-medium" placeholder="Что нужно сделать?" value={form.title} onChange={e => set("title", e.target.value)} autoFocus />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Описание</label>
            <textarea className="input-base resize-none h-20 leading-relaxed" placeholder="Подробности..." value={form.description} onChange={e => set("description", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Приоритет</label>
              <select className="input-base" value={form.priority} onChange={e => set("priority", e.target.value as Priority)}>
                {(Object.entries(PRIORITY_CONFIG) as [Priority, {label:string}][]).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Статус</label>
              <select className="input-base" value={form.status} onChange={e => set("status", e.target.value as Status)}>
                {(Object.entries(STATUS_CONFIG) as [Status, {label:string}][]).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Срок выполнения</label>
            <input type="date" className="input-base" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Теги</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tags.map(tag => (
                <span key={tag} className="tag-pill gap-1">
                  #{tag}
                  <button onClick={() => set("tags", form.tags.filter(t => t !== tag))} className="ml-0.5 hover:text-foreground"><Icon name="X" size={10} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input-base flex-1" placeholder="#тег" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} />
              <button onClick={addTag} className="btn-outline px-3 py-2"><Icon name="Plus" size={14} /></button>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div onClick={() => set("notification", !form.notification)} className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${form.notification ? "bg-primary" : "bg-border"}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.notification ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm text-muted-foreground">Уведомление о сроке</span>
          </label>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <div>
            {isEdit && onDelete && (
              <button onClick={() => { onDelete(task!.id); onClose(); }} className="text-sm text-destructive hover:opacity-70 flex items-center gap-1.5">
                <Icon name="Trash2" size={14} />В архив
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-ghost">Отмена</button>
            <button onClick={submit} className="btn-primary" disabled={!form.title.trim()}>{isEdit ? "Сохранить" : "Создать"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────

function TaskCard({ task, onClick, onToggleDone }: { task: Task; onClick: () => void; onToggleDone: () => void }) {
  const overdue = isOverdue(task.dueDate, task.status);
  const pc = PRIORITY_CONFIG[task.priority];

  return (
    <div
      className={`task-card group animate-fade-in-up opacity-0 ${STATUS_BORDER[task.status]}`}
      style={{ animationFillMode: "forwards" }}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Status icon / checkbox */}
        <button
          onClick={e => { e.stopPropagation(); onToggleDone(); }}
          className="flex-shrink-0 mt-0.5"
        >
          {task.status === "done" ? (
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="CheckCircle2" size={18} className="text-primary" />
            </div>
          ) : task.status === "in_progress" ? (
            <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center">
              <Icon name="Clock" size={16} className="text-amber-500" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-border hover:border-primary/40 transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm leading-snug mb-0.5 ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{task.description}</p>
          )}

          <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
            {/* Priority dot + label */}
            <span className={`flex items-center gap-1 font-medium ${pc.text}`}>
              <span className={`w-2 h-2 rounded-full ${pc.dot}`} />
              {pc.label}
            </span>

            {/* Due date */}
            {task.dueDate && (
              <span className={`flex items-center gap-1 ${overdue ? "text-red-500" : ""}`}>
                <Icon name="Calendar" size={11} />
                {formatDate(task.dueDate)}
              </span>
            )}

            {/* Bell */}
            {task.notification && <Icon name="Bell" size={11} className="text-muted-foreground" />}

            {/* Tags */}
            {task.tags.map(tag => (
              <span key={tag} className="tag-pill">#{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TasksView ────────────────────────────────────────────────────────────────

function TasksView({ tasks, onUpdate, onDelete, onAdd }: {
  tasks: Task[]; onUpdate: (t: Task) => void; onDelete: (id: string) => void; onAdd: (t: Task) => void;
}) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [filterStatus,   setFilterStatus]   = useState<Status | "all">("all");
  const [filterTag,      setFilterTag]      = useState("all");
  const [search,         setSearch]         = useState("");

  const active = tasks.filter(t => !t.archived);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    active.forEach(t => t.tags.forEach(tag => s.add(tag)));
    return Array.from(s);
  }, [active]);

  const filtered = active.filter(t => {
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (filterStatus   !== "all" && t.status   !== filterStatus)   return false;
    if (filterTag      !== "all" && !t.tags.includes(filterTag))   return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped: Record<Status, Task[]> = {
    todo:        filtered.filter(t => t.status === "todo"),
    in_progress: filtered.filter(t => t.status === "in_progress"),
    done:        filtered.filter(t => t.status === "done"),
  };

  function toggleDone(t: Task) { onUpdate({ ...t, status: t.status === "done" ? "todo" : "done" }); }

  return (
    <div className="flex flex-col h-full">
      {/* Search + New button */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="input-base pl-9 bg-card"
            placeholder="Поиск задач..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button onClick={() => { setEditingTask(null); setShowModal(true); }} className="btn-primary whitespace-nowrap">
          <Icon name="Plus" size={16} />
          Новая задача
        </button>
      </div>

      {/* Filter chips — Priority */}
      <div className="flex items-center gap-1 mb-2 flex-wrap">
        <span className="text-sm text-muted-foreground mr-1">Приоритет:</span>
        {(["all", "high", "medium", "low"] as (Priority | "all")[]).map(p => (
          <button key={p} onClick={() => setFilterPriority(p)} className={`filter-chip ${filterPriority === p ? "active" : ""}`}>
            {p === "all" ? "Все" : PRIORITY_CONFIG[p].label}
          </button>
        ))}
        <span className="mx-2 text-border">|</span>
        <span className="text-sm text-muted-foreground mr-1">Статус:</span>
        {(["all", "todo", "in_progress", "done"] as (Status | "all")[]).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`filter-chip ${filterStatus === s ? "active" : ""}`}>
            {s === "all" ? "Все" : STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      {/* Tag chips */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1 mb-4 flex-wrap">
          <span className="text-sm text-muted-foreground mr-1">Теги:</span>
          <button onClick={() => setFilterTag("all")} className={`filter-chip ${filterTag === "all" ? "active" : ""}`}>Все</button>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setFilterTag(tag)} className={`filter-chip ${filterTag === tag ? "active" : ""}`}>#{tag}</button>
          ))}
        </div>
      )}

      {/* Task groups */}
      <div className="flex-1 overflow-auto space-y-6">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Icon name="Inbox" size={40} className="text-border mb-4" />
            <p className="text-muted-foreground text-sm">Задачи не найдены</p>
          </div>
        )}

        {(["in_progress", "todo", "done"] as Status[]).map(status => {
          const group = grouped[status];
          if (group.length === 0) return null;
          return (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-bold tracking-widest uppercase ${STATUS_LABEL_COLOR[status]}`}>
                  {STATUS_CONFIG[status].groupLabel}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">{group.length}</span>
              </div>
              <div className="space-y-2">
                {group.map((t, i) => (
                  <div key={t.id} style={{ animationDelay: `${i * 0.04}s` }}>
                    <TaskCard task={t} onClick={() => { setEditingTask(t); setShowModal(true); }} onToggleDone={() => toggleDone(t)} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <TaskModal
          task={editingTask}
          onSave={t => editingTask ? onUpdate(t) : onAdd(t)}
          onClose={() => setShowModal(false)}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}

// ─── CalendarView ─────────────────────────────────────────────────────────────

function CalendarView({ tasks }: { tasks: Task[] }) {
  const today = new Date();
  const [year, setYear]     = useState(today.getFullYear());
  const [month, setMonth]   = useState(today.getMonth());
  const [selected, setSelected] = useState<string | null>(null);

  const activeTasks = tasks.filter(t => !t.archived && t.dueDate);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    activeTasks.forEach(t => { if (!map[t.dueDate]) map[t.dueDate] = []; map[t.dueDate].push(t); });
    return map;
  }, [activeTasks]);

  const firstDay  = new Date(year, month, 1);
  const lastDay   = new Date(year, month + 1, 0);
  const startDow  = (firstDay.getDay() + 6) % 7;
  const days: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);

  const todayStr = today.toISOString().split("T")[0];
  const selectedTasks = selected ? (tasksByDate[selected] ?? []) : [];

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); }

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="btn-ghost p-2 rounded-lg"><Icon name="ChevronLeft" size={16} /></button>
          <h2 className="font-bold text-base">{MONTHS_RU[month]} {year}</h2>
          <button onClick={nextMonth} className="btn-ghost p-2 rounded-lg"><Icon name="ChevronRight" size={16} /></button>
        </div>
        <div className="grid grid-cols-7 mb-1">
          {DAYS_RU.map(d => <div key={d} className="text-center text-xs font-bold text-muted-foreground py-2 tracking-wider">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;
            const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const dayTasks = tasksByDate[dateStr] ?? [];
            const isToday    = dateStr === todayStr;
            const isSelected = dateStr === selected;
            return (
              <button key={dateStr} onClick={() => setSelected(isSelected ? null : dateStr)}
                className={`relative aspect-square flex flex-col items-center justify-start pt-1.5 rounded-lg text-sm transition-all
                  ${isToday    ? "bg-primary text-primary-foreground font-bold" : ""}
                  ${isSelected && !isToday ? "bg-primary/10 ring-1 ring-primary/30" : ""}
                  ${!isToday && !isSelected ? "hover:bg-secondary" : ""}
                `}
              >
                <span className="text-xs leading-none">{day}</span>
                {dayTasks.length > 0 && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center px-0.5">
                    {dayTasks.slice(0,3).map(t => (
                      <span key={t.id} className={`w-1.5 h-1.5 rounded-full ${PRIORITY_CONFIG[t.priority].dot} ${t.status === "done" ? "opacity-30" : ""}`} />
                    ))}
                    {dayTasks.length > 3 && <span className="text-[8px] text-muted-foreground">+{dayTasks.length-3}</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex gap-4 mt-6 pt-4 border-t border-border">
          {(Object.entries(PRIORITY_CONFIG) as [Priority,{label:string;dot:string}][]).map(([k,v]) => (
            <div key={k} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`w-2 h-2 rounded-full ${v.dot}`} />{v.label}
            </div>
          ))}
        </div>
      </div>
      <div className="w-72 flex-shrink-0 border-l border-border pl-6">
        {selected ? (
          <div className="animate-slide-in-right">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Задачи на дату</span>
                <span className="font-bold text-sm mt-0.5 block">{new Date(selected).toLocaleDateString("ru-RU",{day:"numeric",month:"long"})}</span>
              </div>
              <button onClick={() => setSelected(null)} className="btn-ghost p-1 rounded-lg"><Icon name="X" size={14} /></button>
            </div>
            {selectedTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет задач на эту дату</p>
            ) : (
              <div className="space-y-2">
                {selectedTasks.map(t => (
                  <div key={t.id} className="task-card">
                    <div className="flex items-start gap-2">
                      <Icon name={STATUS_CONFIG[t.status].icon} size={14} className={`mt-0.5 flex-shrink-0 ${STATUS_CONFIG[t.status].color}`} />
                      <div>
                        <p className={`text-sm font-semibold ${t.status === "done" ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
                        <span className={`text-xs flex items-center gap-1 mt-1 ${PRIORITY_CONFIG[t.priority].text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_CONFIG[t.priority].dot}`} />
                          {PRIORITY_CONFIG[t.priority].label}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Icon name="CalendarDays" size={32} className="text-border mb-3" />
            <p className="text-sm text-muted-foreground">Выберите дату, чтобы<br/>увидеть задачи</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AnalyticsView ────────────────────────────────────────────────────────────

function AnalyticsView({ tasks }: { tasks: Task[] }) {
  const all    = tasks.filter(t => !t.archived);
  const done   = all.filter(t => t.status === "done");
  const overdue = all.filter(t => isOverdue(t.dueDate, t.status));
  const rate   = all.length ? Math.round((done.length / all.length) * 100) : 0;

  const byPriority = (Object.keys(PRIORITY_CONFIG) as Priority[]).map(p => ({
    priority: p,
    count: all.filter(t => t.priority === p).length,
    done:  all.filter(t => t.priority === p && t.status === "done").length,
  }));

  const allTagsMap: Record<string,number> = {};
  all.forEach(t => t.tags.forEach(tag => { allTagsMap[tag] = (allTagsMap[tag]||0)+1; }));
  const topTags = Object.entries(allTagsMap).sort((a,b)=>b[1]-a[1]).slice(0,8);

  const stats = [
    { label: "Всего задач",  value: all.length,    icon: "ListTodo",    color: "text-primary",     bg: "bg-primary/10" },
    { label: "Выполнено",    value: done.length,    icon: "CheckCircle2",color: "text-green-600",   bg: "bg-green-50" },
    { label: "Выполнение",   value: `${rate}%`,     icon: "TrendingUp",  color: "text-blue-600",    bg: "bg-blue-50" },
    { label: "Просрочено",   value: overdue.length, icon: "AlertCircle", color: "text-red-500",     bg: "bg-red-50" },
  ];

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className={`stat-card animate-fade-in-up opacity-0 stagger-${i+1}`} style={{ animationFillMode: "forwards" }}>
            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon name={s.icon} size={18} className={s.color} fallback="Circle" />
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="stat-card animate-fade-in-up opacity-0 stagger-3" style={{ animationFillMode: "forwards" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold">Прогресс выполнения</span>
          <span className="text-sm font-bold text-primary">{rate}%</span>
        </div>
        <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${rate}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{done.length} выполнено</span>
          <span>{all.length - done.length} осталось</span>
        </div>
      </div>

      <div className="stat-card animate-fade-in-up opacity-0 stagger-4" style={{ animationFillMode: "forwards" }}>
        <span className="text-sm font-semibold block mb-4">По приоритетам</span>
        <div className="space-y-3">
          {byPriority.filter(p => p.count > 0).map(p => {
            const r = p.count ? Math.round((p.done/p.count)*100) : 0;
            return (
              <div key={p.priority}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[p.priority].dot}`} />
                    <span className="text-sm">{PRIORITY_CONFIG[p.priority].label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{p.done}/{p.count} · {r}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${PRIORITY_CONFIG[p.priority].dot}`} style={{ width: `${r}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {topTags.length > 0 && (
        <div className="stat-card animate-fade-in-up opacity-0 stagger-5" style={{ animationFillMode: "forwards" }}>
          <span className="text-sm font-semibold block mb-4">Популярные теги</span>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <div key={tag} className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full">
                <span className="text-sm">#{tag}</span>
                <span className="text-xs text-muted-foreground bg-card px-1.5 py-0.5 rounded-full">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ArchiveView ──────────────────────────────────────────────────────────────

function ArchiveView({ tasks, onRestore, onDelete }: { tasks: Task[]; onRestore: (id: string) => void; onDelete: (id: string) => void; }) {
  const archived = tasks.filter(t => t.archived);
  if (archived.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Icon name="Archive" size={40} className="text-border mb-4" />
      <p className="text-muted-foreground text-sm">Архив пуст</p>
    </div>
  );
  return (
    <div className="space-y-2 max-w-2xl">
      <p className="text-sm text-muted-foreground mb-5">{archived.length} задач в архиве</p>
      {archived.map((t, i) => (
        <div key={t.id} className="task-card animate-fade-in-up opacity-0" style={{ animationDelay: `${i*0.04}s`, animationFillMode: "forwards" }}>
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground line-through">{t.title}</span>
                <span className={`text-xs flex items-center gap-1 ${PRIORITY_CONFIG[t.priority].text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_CONFIG[t.priority].dot}`} />
                  {PRIORITY_CONFIG[t.priority].label}
                </span>
              </div>
              {t.dueDate && <span className="text-xs text-muted-foreground">{new Date(t.dueDate).toLocaleDateString("ru-RU",{day:"numeric",month:"short",year:"numeric"})}</span>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => onRestore(t.id)} className="btn-outline text-xs py-1.5 px-3">
                <Icon name="RotateCcw" size={12} />Восстановить
              </button>
              <button onClick={() => onDelete(t.id)} className="btn-ghost text-xs text-destructive hover:text-destructive flex items-center gap-1">
                <Icon name="Trash2" size={12} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SettingsView ─────────────────────────────────────────────────────────────

function SettingsView({ user, onUpdateUser }: { user: User; onUpdateUser: (u: User) => void }) {
  const [name, setName]   = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);

  const [curPwd,  setCurPwd]  = useState("");
  const [newPwd,  setNewPwd]  = useState("");
  const [confPwd, setConfPwd] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf,setShowConf]= useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSaved, setPwdSaved] = useState(false);

  function saveProfile() {
    onUpdateUser({ name, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updatePwd() {
    if (!curPwd || !newPwd || !confPwd) { setPwdError("Заполните все поля"); return; }
    if (newPwd.length < 8) { setPwdError("Пароль минимум 8 символов"); return; }
    if (newPwd !== confPwd) { setPwdError("Пароли не совпадают"); return; }
    setPwdError(""); setPwdSaved(true);
    setCurPwd(""); setNewPwd(""); setConfPwd("");
    setTimeout(() => setPwdSaved(false), 2000);
  }

  const initials = getInitials(user.name);

  return (
    <div className="max-w-xl space-y-8">
      {/* Profile section */}
      <div>
        <h2 className="text-lg font-bold mb-5">Профиль</h2>
        <div className="settings-card">
          {/* Avatar */}
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-primary">{initials}</span>
            </div>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Имя</label>
              <input className="input-base" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Email</label>
              <input type="email" className="input-base" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button onClick={saveProfile} className="btn-primary">
              {saved ? <><Icon name="Check" size={14} />Сохранено</> : "Сохранить изменения"}
            </button>
          </div>
        </div>
      </div>

      {/* Password section */}
      <div>
        <h2 className="text-lg font-bold mb-5">Смена пароля</h2>
        <div className="settings-card">
          <div className="space-y-3">
            {[
              { label: "Текущий пароль", val: curPwd, set: setCurPwd, show: showCur, setShow: setShowCur, placeholder: "••••••••" },
              { label: "Новый пароль",   val: newPwd, set: setNewPwd, show: showNew, setShow: setShowNew, placeholder: "Минимум 8 символов" },
              { label: "Подтвердите пароль", val: confPwd, set: setConfPwd, show: showConf, setShow: setShowConf, placeholder: "Повторите новый пароль" },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">{f.label}</label>
                <div className="relative">
                  <Icon name="Lock" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={f.show ? "text" : "password"}
                    className="input-base pl-9 pr-9"
                    placeholder={f.placeholder}
                    value={f.val}
                    onChange={e => { f.set(e.target.value); setPwdError(""); setPwdSaved(false); }}
                  />
                  <button onClick={() => f.setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    <Icon name={f.show ? "EyeOff" : "Eye"} size={14} />
                  </button>
                </div>
              </div>
            ))}

            {pwdError && (
              <p className="text-xs text-red-500 flex items-center gap-1.5"><Icon name="AlertCircle" size={12} />{pwdError}</p>
            )}
            {pwdSaved && (
              <p className="text-xs text-green-600 flex items-center gap-1.5"><Icon name="Check" size={12} />Пароль обновлён</p>
            )}

            <button onClick={updatePwd} className="btn-outline">
              <Icon name="KeyRound" size={14} />
              Обновить пароль
            </button>
          </div>
        </div>
      </div>

      {/* Appearance section */}
      <div>
        <h2 className="text-lg font-bold mb-5">Внешний вид</h2>
        <div className="settings-card">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-3">Тема оформления</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "light", label: "Светлая", icon: "Sun" },
                { id: "dark",  label: "Тёмная",  icon: "Moon" },
              ].map(th => (
                <button key={th.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${th.id === "light" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                  <Icon name={th.icon} size={16} />
                  {th.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* App info */}
      <p className="text-xs text-muted-foreground">Менеджер задач v1.0 · Данные хранятся локально</p>
    </div>
  );
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Section; label: string; icon: string }[] = [
  { id: "tasks",     label: "Задачи",    icon: "ListTodo" },
  { id: "calendar",  label: "Календарь", icon: "CalendarDays" },
  { id: "analytics", label: "Аналитика", icon: "BarChart2" },
  { id: "archive",   label: "Архив",     icon: "Archive" },
  { id: "settings",  label: "Настройки", icon: "Settings" },
];

const SECTION_TITLES: Record<Section, string> = {
  tasks:     "Мои задачи",
  calendar:  "Календарь",
  analytics: "Аналитика",
  archive:   "Архив",
  settings:  "Настройки",
};

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [user,    setUser]    = useState<User | null>(null);
  const [section, setSection] = useState<Section>("tasks");
  const [tasks,   setTasks]   = useState<Task[]>(INITIAL_TASKS);

  if (!user) return <IndexPage onLogin={(name, email) => setUser({ name, email })} />;

  function addTask(t: Task)       { setTasks(prev => [t, ...prev]); }
  function updateTask(t: Task)    { setTasks(prev => prev.map(x => x.id === t.id ? t : x)); }
  function deleteTask(id: string) { setTasks(prev => prev.map(t => t.id === id ? { ...t, archived: true } : t)); }
  function hardDelete(id: string) { setTasks(prev => prev.filter(t => t.id !== id)); }
  function restoreTask(id: string){ setTasks(prev => prev.map(t => t.id === id ? { ...t, archived: false } : t)); }

  const activeTasks  = tasks.filter(t => !t.archived);
  const todayStr     = new Date().toISOString().split("T")[0];
  const todayCount   = activeTasks.filter(t => t.dueDate === todayStr && t.status !== "done").length;
  const overdueCount = activeTasks.filter(t => isOverdue(t.dueDate, t.status)).length;
  const pendingCount = activeTasks.filter(t => t.status !== "done").length;
  const archiveCount = tasks.filter(t => t.archived).length;
  const initials     = getInitials(user.name);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="w-[220px] flex-shrink-0 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="px-4 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Zap" size={16} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-base tracking-tight">Задачи</span>
          </div>
        </div>

        {/* Alerts */}
        {(todayCount > 0 || overdueCount > 0) && (
          <div className="px-3 pb-3 space-y-1.5">
            {overdueCount > 0 && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
                <Icon name="AlertCircle" size={12} className="text-red-500 flex-shrink-0" />
                <span className="text-xs text-red-600 font-medium">{overdueCount} просрочено</span>
              </div>
            )}
            {todayCount > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
                <Icon name="Clock" size={12} className="text-amber-500 flex-shrink-0" />
                <span className="text-xs text-amber-600 font-medium">{todayCount} на сегодня</span>
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setSection(item.id)} className={`nav-item ${section === item.id ? "active" : ""}`}>
              <Icon name={item.icon} size={16} />
              <span className="flex-1">{item.label}</span>
              {item.id === "tasks" && pendingCount > 0 && (
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${section === item.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {pendingCount}
                </span>
              )}
              {item.id === "archive" && archiveCount > 0 && (
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${section === item.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {archiveCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{user.name}</p>
            </div>
            <button onClick={() => setUser(null)} title="Выйти" className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
              <Icon name="LogOut" size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 px-8 py-4 border-b border-border flex items-center gap-3 bg-card">
          <Icon name="LayoutGrid" size={16} className="text-muted-foreground" />
          <h1 className="font-bold text-base">{SECTION_TITLES[section]}</h1>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto px-8 py-6">
          {section === "tasks"     && <TasksView tasks={tasks} onUpdate={updateTask} onDelete={deleteTask} onAdd={addTask} />}
          {section === "calendar"  && <CalendarView tasks={tasks} />}
          {section === "analytics" && <AnalyticsView tasks={tasks} />}
          {section === "archive"   && <ArchiveView tasks={tasks} onRestore={restoreTask} onDelete={hardDelete} />}
          {section === "settings"  && <SettingsView user={user} onUpdateUser={u => setUser(u)} />}
        </div>
      </main>
    </div>
  );
}
