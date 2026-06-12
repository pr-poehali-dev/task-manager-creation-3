import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import IndexPage from "@/pages/Index";

// ─── Auth State ───────────────────────────────────────────────────────────────

interface User {
  name: string;
  email: string;
}

// ─── Types ───────────────────────────────────────────────────────────────────

type Priority = "low" | "medium" | "high" | "urgent";
type Status = "todo" | "in_progress" | "done";
type Section = "tasks" | "calendar" | "analytics" | "archive" | "settings";

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

// ─── Constants ───────────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dot: string }> = {
  low:    { label: "Низкий",  color: "text-green-700 bg-green-50 border border-green-200",    dot: "bg-green-500" },
  medium: { label: "Средний", color: "text-amber-700 bg-amber-50 border border-amber-200",   dot: "bg-amber-500" },
  high:   { label: "Высокий", color: "text-red-700 bg-red-50 border border-red-200",          dot: "bg-red-500" },
  urgent: { label: "Срочный", color: "text-purple-700 bg-purple-50 border border-purple-200", dot: "bg-purple-500" },
};

const STATUS_CONFIG: Record<Status, { label: string; icon: string }> = {
  todo:        { label: "К выполнению", icon: "Circle" },
  in_progress: { label: "В процессе",   icon: "Clock" },
  done:        { label: "Готово",       icon: "CheckCircle2" },
};

const INITIAL_TASKS: Task[] = [
  { id: "1", title: "Подготовить презентацию для клиента", description: "Собрать данные за Q3, оформить слайды в корпоративном стиле", priority: "high", status: "in_progress", dueDate: "2026-06-15", tags: ["работа", "клиент"], createdAt: "2026-06-01", archived: false, notification: true },
  { id: "2", title: "Ревью кода нового модуля авторизации", description: "Проверить security best practices, написать комментарии", priority: "urgent", status: "todo", dueDate: "2026-06-13", tags: ["разработка", "security"], createdAt: "2026-06-03", archived: false, notification: true },
  { id: "3", title: "Написать документацию API", description: "Описать все endpoints, параметры и примеры ответов", priority: "medium", status: "todo", dueDate: "2026-06-20", tags: ["документация"], createdAt: "2026-06-05", archived: false, notification: false },
  { id: "4", title: "Встреча с командой по планированию спринта", description: "", priority: "low", status: "done", dueDate: "2026-06-10", tags: ["команда"], createdAt: "2026-06-02", archived: false, notification: false },
  { id: "5", title: "Обновить зависимости в проекте", description: "npm audit, обновить критичные уязвимости", priority: "medium", status: "todo", dueDate: "2026-06-25", tags: ["разработка"], createdAt: "2026-06-07", archived: false, notification: false },
  { id: "6", title: "Отчёт за прошлый квартал", description: "Финансовый отчёт и KPI-метрики", priority: "high", status: "done", dueDate: "2026-06-08", tags: ["отчёты", "финансы"], createdAt: "2026-06-01", archived: true, notification: false },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

function isOverdue(dateStr: string, status: Status) {
  if (!dateStr || status === "done") return false;
  return new Date(dateStr) < new Date();
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const MONTHS_RU = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const DAYS_RU = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

// ─── TaskModal ────────────────────────────────────────────────────────────────

interface TaskModalProps {
  task: Task | null;
  onSave: (task: Task) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

function TaskModal({ task, onSave, onClose, onDelete }: TaskModalProps) {
  const isEdit = !!task?.id;
  const [form, setForm] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    priority: task?.priority ?? "medium" as Priority,
    status: task?.status ?? "todo" as Status,
    dueDate: task?.dueDate ?? "",
    tags: task?.tags ?? [] as string[],
    notification: task?.notification ?? false,
  });
  const [tagInput, setTagInput] = useState("");

  function setField<K extends keyof typeof form>(key: K, val: typeof form[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) setField("tags", [...form.tags, t]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    setField("tags", form.tags.filter(t => t !== tag));
  }

  function handleSubmit() {
    if (!form.title.trim()) return;
    onSave({
      ...form,
      id: task?.id || generateId(),
      createdAt: task?.createdAt || new Date().toISOString().split("T")[0],
      archived: task?.archived ?? false,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 animate-fade-in" />
      <div
        className="relative bg-card border border-border rounded-lg w-full max-w-lg mx-4 shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <span className="font-semibold text-sm">{isEdit ? "Редактировать задачу" : "Новая задача"}</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="section-header block mb-1.5">Название</label>
            <input
              className="input-base text-base font-medium"
              placeholder="Что нужно сделать?"
              value={form.title}
              onChange={e => setField("title", e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="section-header block mb-1.5">Описание</label>
            <textarea
              className="input-base resize-none h-20 leading-relaxed"
              placeholder="Подробности задачи..."
              value={form.description}
              onChange={e => setField("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-header block mb-1.5">Приоритет</label>
              <select className="input-base" value={form.priority} onChange={e => setField("priority", e.target.value as Priority)}>
                {(Object.entries(PRIORITY_CONFIG) as [Priority, { label: string }][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="section-header block mb-1.5">Статус</label>
              <select className="input-base" value={form.status} onChange={e => setField("status", e.target.value as Status)}>
                {(Object.entries(STATUS_CONFIG) as [Status, { label: string }][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="section-header block mb-1.5">Срок выполнения</label>
            <input
              type="date"
              className="input-base font-mono"
              value={form.dueDate}
              onChange={e => setField("dueDate", e.target.value)}
            />
          </div>

          <div>
            <label className="section-header block mb-1.5">Теги</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {form.tags.map(tag => (
                <span key={tag} className="tag-pill">
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-foreground ml-0.5">
                    <Icon name="X" size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input-base flex-1"
                placeholder="Добавить тег и нажать Enter..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <button onClick={addTag} className="btn-ghost border border-border px-3">
                <Icon name="Plus" size={14} />
              </button>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setField("notification", !form.notification)}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${form.notification ? "bg-primary" : "bg-border"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.notification ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm text-muted-foreground">Уведомление о сроке</span>
          </label>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <div>
            {isEdit && onDelete && (
              <button
                onClick={() => { onDelete(task!.id); onClose(); }}
                className="text-sm text-destructive hover:opacity-70 transition-opacity flex items-center gap-1.5"
              >
                <Icon name="Trash2" size={14} />
                В архив
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-ghost">Отмена</button>
            <button onClick={handleSubmit} className="btn-primary" disabled={!form.title.trim()}>
              {isEdit ? "Сохранить" : "Создать"}
            </button>
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
    <div className="task-card group animate-fade-in-up opacity-0" style={{ animationFillMode: "forwards" }}>
      <div className="flex items-start gap-3">
        <button
          onClick={e => { e.stopPropagation(); onToggleDone(); }}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
            ${task.status === "done" ? "bg-primary border-primary" : "border-border hover:border-foreground/40"}`}
        >
          {task.status === "done" && <Icon name="Check" size={11} className="text-primary-foreground" />}
        </button>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className={`font-medium text-sm leading-snug ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
              {task.title}
            </span>
            <span className={`priority-badge flex-shrink-0 ${pc.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
              {pc.label}
            </span>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{task.description}</p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {task.dueDate && (
              <span className={`flex items-center gap-1 text-xs font-mono ${overdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                <Icon name={overdue ? "AlertCircle" : "Calendar"} size={11} />
                {formatDate(task.dueDate)}
                {overdue && " · просрочено"}
              </span>
            )}
            {task.notification && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Icon name="Bell" size={11} />
              </span>
            )}
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
  tasks: Task[];
  onUpdate: (t: Task) => void;
  onDelete: (id: string) => void;
  onAdd: (t: Task) => void;
}) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [search, setSearch] = useState("");

  const active = tasks.filter(t => !t.archived);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    active.forEach(t => t.tags.forEach(tag => s.add(tag)));
    return Array.from(s);
  }, [active]);

  const filtered = active.filter(t => {
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterTag !== "all" && !t.tags.includes(filterTag)) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped: Record<Status, Task[]> = {
    todo: filtered.filter(t => t.status === "todo"),
    in_progress: filtered.filter(t => t.status === "in_progress"),
    done: filtered.filter(t => t.status === "done"),
  };

  function openNew() { setEditingTask(null); setShowModal(true); }
  function openEdit(t: Task) { setEditingTask(t); setShowModal(true); }
  function toggleDone(t: Task) {
    onUpdate({ ...t, status: t.status === "done" ? "todo" : "done" });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="input-base pl-8"
            placeholder="Поиск задач..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input-base w-auto" value={filterPriority} onChange={e => setFilterPriority(e.target.value as Priority | "all")}>
          <option value="all">Все приоритеты</option>
          {(Object.entries(PRIORITY_CONFIG) as [Priority, { label: string }][]).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select className="input-base w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value as Status | "all")}>
          <option value="all">Все статусы</option>
          {(Object.entries(STATUS_CONFIG) as [Status, { label: string }][]).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        {allTags.length > 0 && (
          <select className="input-base w-auto" value={filterTag} onChange={e => setFilterTag(e.target.value)}>
            <option value="all">Все теги</option>
            {allTags.map(tag => <option key={tag} value={tag}>#{tag}</option>)}
          </select>
        )}
        <button onClick={openNew} className="btn-primary flex items-center gap-2 flex-shrink-0">
          <Icon name="Plus" size={14} />
          Новая задача
        </button>
      </div>

      <div className="flex gap-5 mb-6">
        {(["todo", "in_progress", "done"] as Status[]).map(s => (
          <div key={s} className="flex items-center gap-2 text-sm">
            <Icon
              name={STATUS_CONFIG[s].icon}
              size={14}
              className={s === "done" ? "text-green-500" : s === "in_progress" ? "text-amber-500" : "text-muted-foreground"}
            />
            <span className="text-muted-foreground">{STATUS_CONFIG[s].label}:</span>
            <span className="font-semibold font-mono">{grouped[s].length}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-auto space-y-8">
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
                <span className="section-header">{STATUS_CONFIG[status].label}</span>
                <span className="font-mono text-xs text-muted-foreground">({group.length})</span>
              </div>
              <div className="space-y-2">
                {group.map((t, i) => (
                  <div key={t.id} style={{ animationDelay: `${i * 0.04}s` }}>
                    <TaskCard
                      task={t}
                      onClick={() => openEdit(t)}
                      onToggleDone={() => toggleDone(t)}
                    />
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
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string | null>(null);

  const activeTasks = tasks.filter(t => !t.archived && t.dueDate);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    activeTasks.forEach(t => {
      if (!map[t.dueDate]) map[t.dueDate] = [];
      map[t.dueDate].push(t);
    });
    return map;
  }, [activeTasks]);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7;
  const days: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const todayStr = today.toISOString().split("T")[0];
  const selectedTasks = selected ? (tasksByDate[selected] ?? []) : [];

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="btn-ghost p-2"><Icon name="ChevronLeft" size={16} /></button>
          <h2 className="font-semibold text-base">{MONTHS_RU[month]} {year}</h2>
          <button onClick={nextMonth} className="btn-ghost p-2"><Icon name="ChevronRight" size={16} /></button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {DAYS_RU.map(d => (
            <div key={d} className="text-center section-header py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayTasks = tasksByDate[dateStr] ?? [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selected;

            return (
              <button
                key={dateStr}
                onClick={() => setSelected(isSelected ? null : dateStr)}
                className={`relative aspect-square flex flex-col items-center justify-start pt-1.5 rounded text-sm transition-all
                  ${isToday ? "bg-primary text-primary-foreground font-semibold" : ""}
                  ${isSelected && !isToday ? "bg-secondary ring-1 ring-foreground/30" : ""}
                  ${!isToday && !isSelected ? "hover:bg-secondary" : ""}
                `}
              >
                <span className="font-mono text-xs leading-none">{day}</span>
                {dayTasks.length > 0 && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center px-0.5">
                    {dayTasks.slice(0, 3).map(t => (
                      <span key={t.id} className={`w-1.5 h-1.5 rounded-full ${PRIORITY_CONFIG[t.priority].dot} ${t.status === "done" ? "opacity-30" : ""}`} />
                    ))}
                    {dayTasks.length > 3 && <span className="text-[8px] text-muted-foreground font-mono">+{dayTasks.length - 3}</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-4 mt-6 pt-4 border-t border-border">
          {(Object.entries(PRIORITY_CONFIG) as [Priority, { label: string; dot: string }][]).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`w-2 h-2 rounded-full ${v.dot}`} />
              {v.label}
            </div>
          ))}
        </div>
      </div>

      <div className="w-72 flex-shrink-0 border-l border-border pl-6">
        {selected ? (
          <div className="animate-slide-in-right">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="section-header block">Задачи на дату</span>
                <span className="font-semibold text-sm mt-0.5 block">{formatDate(selected)}</span>
              </div>
              <button onClick={() => setSelected(null)} className="btn-ghost p-1">
                <Icon name="X" size={14} />
              </button>
            </div>
            {selectedTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет задач на эту дату</p>
            ) : (
              <div className="space-y-2">
                {selectedTasks.map(t => (
                  <div key={t.id} className="task-card">
                    <div className="flex items-start gap-2">
                      <Icon
                        name={STATUS_CONFIG[t.status].icon}
                        size={14}
                        className={`mt-0.5 flex-shrink-0 ${t.status === "done" ? "text-green-500" : t.status === "in_progress" ? "text-amber-500" : "text-muted-foreground"}`}
                      />
                      <div>
                        <p className={`text-sm font-medium leading-snug ${t.status === "done" ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
                        <span className={`priority-badge mt-1.5 ${PRIORITY_CONFIG[t.priority].color}`}>
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
  const all = tasks.filter(t => !t.archived);
  const done = all.filter(t => t.status === "done");
  const overdue = all.filter(t => isOverdue(t.dueDate, t.status));
  const completionRate = all.length ? Math.round((done.length / all.length) * 100) : 0;

  const byPriority = (Object.keys(PRIORITY_CONFIG) as Priority[]).map(p => ({
    priority: p,
    count: all.filter(t => t.priority === p).length,
    done: all.filter(t => t.priority === p && t.status === "done").length,
  }));

  const allTags: Record<string, number> = {};
  all.forEach(t => t.tags.forEach(tag => { allTags[tag] = (allTags[tag] || 0) + 1; }));
  const topTags = Object.entries(allTags).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const stats = [
    { label: "Всего задач",  value: all.length,        icon: "ListTodo",    color: "text-foreground" },
    { label: "Выполнено",    value: done.length,        icon: "CheckCircle2",color: "text-green-600" },
    { label: "Выполнение",   value: `${completionRate}%`,icon: "TrendingUp", color: "text-blue-600" },
    { label: "Просрочено",   value: overdue.length,     icon: "AlertCircle", color: "text-red-500" },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className={`stat-card animate-fade-in-up opacity-0 stagger-${i + 1}`} style={{ animationFillMode: "forwards" }}>
            <div className="flex items-center gap-2 mb-3">
              <Icon name={s.icon} size={15} className={s.color} fallback="Circle" />
              <span className="section-header">{s.label}</span>
            </div>
            <span className={`text-3xl font-bold font-mono ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      <div className="stat-card animate-fade-in-up opacity-0 stagger-3" style={{ animationFillMode: "forwards" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="section-header">Прогресс выполнения</span>
          <span className="font-mono text-sm font-semibold">{completionRate}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${completionRate}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2 font-mono">
          <span>{done.length} выполнено</span>
          <span>{all.length - done.length} осталось</span>
        </div>
      </div>

      <div className="stat-card animate-fade-in-up opacity-0 stagger-4" style={{ animationFillMode: "forwards" }}>
        <span className="section-header block mb-4">По приоритетам</span>
        <div className="space-y-3">
          {byPriority.filter(p => p.count > 0).map(p => {
            const rate = p.count ? Math.round((p.done / p.count) * 100) : 0;
            return (
              <div key={p.priority}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[p.priority].dot}`} />
                    <span className="text-sm">{PRIORITY_CONFIG[p.priority].label}</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{p.done}/{p.count} · {rate}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${PRIORITY_CONFIG[p.priority].dot}`} style={{ width: `${rate}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {topTags.length > 0 && (
        <div className="stat-card animate-fade-in-up opacity-0 stagger-5" style={{ animationFillMode: "forwards" }}>
          <span className="section-header block mb-4">Популярные теги</span>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <div key={tag} className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded">
                <span className="text-sm">#{tag}</span>
                <span className="font-mono text-xs text-muted-foreground bg-background px-1 rounded">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ArchiveView ──────────────────────────────────────────────────────────────

function ArchiveView({ tasks, onRestore, onDelete }: {
  tasks: Task[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const archived = tasks.filter(t => t.archived);

  if (archived.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Icon name="Archive" size={40} className="text-border mb-4" />
        <p className="text-muted-foreground text-sm">Архив пуст</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-w-2xl">
      <p className="text-sm text-muted-foreground mb-6 font-mono">{archived.length} задач в архиве</p>
      {archived.map((t, i) => (
        <div
          key={t.id}
          className="task-card animate-fade-in-up opacity-0"
          style={{ animationDelay: `${i * 0.04}s`, animationFillMode: "forwards" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground line-through">{t.title}</span>
                <span className={`priority-badge ${PRIORITY_CONFIG[t.priority].color}`}>{PRIORITY_CONFIG[t.priority].label}</span>
              </div>
              {t.dueDate && <span className="font-mono text-xs text-muted-foreground">{formatDate(t.dueDate)}</span>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => onRestore(t.id)} className="btn-ghost text-xs flex items-center gap-1.5 border border-border">
                <Icon name="RotateCcw" size={12} />
                Восстановить
              </button>
              <button onClick={() => onDelete(t.id)} className="btn-ghost text-xs text-destructive flex items-center gap-1.5">
                <Icon name="Trash2" size={12} />
                Удалить
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SettingsView ─────────────────────────────────────────────────────────────

function SettingsView() {
  const [name, setName] = useState("Иван Петров");
  const [email, setEmail] = useState("ivan@example.com");
  const [notif, setNotif] = useState(true);
  const [defaultPriority, setDefaultPriority] = useState<Priority>("medium");

  return (
    <div className="max-w-md space-y-8">
      <div>
        <h3 className="font-semibold text-sm mb-4">Профиль</h3>
        <div className="space-y-3">
          <div>
            <label className="section-header block mb-1.5">Имя</label>
            <input className="input-base" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="section-header block mb-1.5">Email</label>
            <input type="email" className="input-base" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <button className="btn-primary">Сохранить профиль</button>
        </div>
      </div>

      <div className="divider" />

      <div>
        <h3 className="font-semibold text-sm mb-4">Уведомления</h3>
        <label className="flex items-center justify-between cursor-pointer select-none">
          <div>
            <p className="text-sm">Уведомления о сроках</p>
            <p className="text-xs text-muted-foreground mt-0.5">Напоминания за день до дедлайна</p>
          </div>
          <div
            onClick={() => setNotif(n => !n)}
            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${notif ? "bg-primary" : "bg-border"}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${notif ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
        </label>
      </div>

      <div className="divider" />

      <div>
        <h3 className="font-semibold text-sm mb-4">Настройки задач</h3>
        <div>
          <label className="section-header block mb-1.5">Приоритет по умолчанию</label>
          <select className="input-base w-auto" value={defaultPriority} onChange={e => setDefaultPriority(e.target.value as Priority)}>
            {(Object.entries(PRIORITY_CONFIG) as [Priority, { label: string }][]).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="divider" />

      <div className="text-xs text-muted-foreground font-mono space-y-1">
        <p>Менеджер задач v1.0</p>
        <p>Данные хранятся локально в браузере</p>
      </div>
    </div>
  );
}

// ─── Navigation items ─────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Section; label: string; icon: string }[] = [
  { id: "tasks",     label: "Задачи",    icon: "ListTodo" },
  { id: "calendar",  label: "Календарь", icon: "CalendarDays" },
  { id: "analytics", label: "Аналитика", icon: "BarChart2" },
  { id: "archive",   label: "Архив",     icon: "Archive" },
  { id: "settings",  label: "Настройки", icon: "Settings" },
];

const SECTION_TITLES: Record<Section, string> = {
  tasks:     "Задачи",
  calendar:  "Календарь",
  analytics: "Аналитика",
  archive:   "Архив",
  settings:  "Настройки",
};

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [section, setSection] = useState<Section>("tasks");
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  // Show landing / auth if not logged in
  if (!user) {
    return <IndexPage onLogin={(name, email) => setUser({ name, email })} />;
  }

  function addTask(t: Task)    { setTasks(prev => [t, ...prev]); }
  function updateTask(t: Task) { setTasks(prev => prev.map(x => x.id === t.id ? t : x)); }
  function deleteTask(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, archived: true } : t));
  }
  function hardDelete(id: string) { setTasks(prev => prev.filter(t => t.id !== id)); }
  function restoreTask(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, archived: false } : t));
  }

  const activeTasks = tasks.filter(t => !t.archived);
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCount = activeTasks.filter(t => t.dueDate === todayStr && t.status !== "done").length;
  const overdueCount = activeTasks.filter(t => isOverdue(t.dueDate, t.status)).length;
  const pendingCount = activeTasks.filter(t => t.status !== "done").length;
  const archiveCount = tasks.filter(t => t.archived).length;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-card border-r border-border flex flex-col">
        <div className="px-4 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
              <Icon name="CheckSquare" size={14} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-sm tracking-tight">Задачи</span>
          </div>
        </div>

        {(todayCount > 0 || overdueCount > 0) && (
          <div className="px-3 py-3 border-b border-border space-y-1.5">
            {overdueCount > 0 && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded px-2.5 py-1.5">
                <Icon name="AlertCircle" size={12} className="text-red-500 flex-shrink-0" />
                <span className="text-xs text-red-600 font-medium">{overdueCount} просрочено</span>
              </div>
            )}
            {todayCount > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5">
                <Icon name="Clock" size={12} className="text-amber-500 flex-shrink-0" />
                <span className="text-xs text-amber-600 font-medium">{todayCount} на сегодня</span>
              </div>
            )}
          </div>
        )}

        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`nav-item w-full text-left ${section === item.id ? "active" : ""}`}
            >
              <Icon name={item.icon} size={16} />
              <span className="flex-1">{item.label}</span>
              {item.id === "tasks" && pendingCount > 0 && (
                <span className={`font-mono text-xs px-1.5 py-0.5 rounded-sm ${section === item.id ? "bg-white/20 text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {pendingCount}
                </span>
              )}
              {item.id === "archive" && archiveCount > 0 && (
                <span className={`font-mono text-xs px-1.5 py-0.5 rounded-sm ${section === item.id ? "bg-white/20 text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {archiveCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <Icon name="User" size={13} className="text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <button
              onClick={() => setUser(null)}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              title="Выйти"
            >
              <Icon name="LogOut" size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex-shrink-0 px-8 py-5 border-b border-border flex items-center justify-between bg-card">
          <div>
            <h1 className="font-bold text-lg">{SECTION_TITLES[section]}</h1>
            {section === "tasks" && (
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                {activeTasks.filter(t => t.status === "done").length}/{activeTasks.length} выполнено
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <Icon name="Calendar" size={12} />
            {new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </header>

        <div className="flex-1 overflow-auto px-8 py-6">
          {section === "tasks" && (
            <TasksView tasks={tasks} onUpdate={updateTask} onDelete={deleteTask} onAdd={addTask} />
          )}
          {section === "calendar"  && <CalendarView tasks={tasks} />}
          {section === "analytics" && <AnalyticsView tasks={tasks} />}
          {section === "archive"   && <ArchiveView tasks={tasks} onRestore={restoreTask} onDelete={hardDelete} />}
          {section === "settings"  && <SettingsView />}
        </div>
      </main>
    </div>
  );
}