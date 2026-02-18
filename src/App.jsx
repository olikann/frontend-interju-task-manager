import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";

const STORAGE_KEY = "tasks_v1";

function createId() {
  // Biztonságos fallback, ha randomUUID nem elérhető
  return crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function App() {
  const [text, setText] = useState("");

  // LocalStorage -> induláskor betöltjük (lazy init)
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Derived state (olcsó számítás)
  const trimmedText = text.trim();
  const hasText = trimmedText.length > 0;
  const doneCount = tasks.reduce((acc, t) => acc + (t.done ? 1 : 0), 0);

  // LocalStorage -> mentés minden változásnál
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  function addTask() {
    if (!hasText) return;

    const newTask = {
      id: createId(),
      text: trimmedText,
      done: false,
      createdAt: Date.now(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setText("");
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function clearDone() {
    setTasks((prev) => prev.filter((t) => !t.done));
  }

  function setDone(id, checked) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: Boolean(checked) } : t))
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Feladatkezelő</h1>
          </div>

          <div className="text-right text-sm text-slate-600">
            <div>
              Összesen:{" "}
              <span className="font-medium text-slate-900">{tasks.length}</span>
            </div>
            <div>
              Kész:{" "}
              <span className="font-medium text-slate-900">{doneCount}</span>
            </div>
          </div>
        </div>

        {/* Add task */}
        <Card className="p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Írj be egy feladatot…"
              onKeyDown={(e) => {
                if (e.key === "Enter") addTask();
              }}
            />

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={addTask} disabled={!hasText} className="w-full sm:w-auto">
                Hozzáadás
              </Button>

              <Button
                variant="secondary"
                onClick={clearDone}
                disabled={doneCount === 0}
                className="w-full sm:w-auto"
                title="Kész feladatok törlése"
              >
                Készek törlése
              </Button>
            </div>
          </div>
        </Card>

        {/* List */}
        <div className="mt-4 grid gap-3">
          {tasks.length === 0 ? (
            <Card className="p-10 text-center shadow-sm">
              <p className="text-sm text-slate-600">
                Nincs még feladat. Adj hozzá egyet..
              </p>
            </Card>
          ) : (
            tasks.map((t) => (
              <Card
                key={t.id}
                className={[
                  "p-4 shadow-sm transition-all duration-300 hover:shadow-xl",
                  t.done
                    ? "bg-emerald-50 border-emerald-200 border-l-4 border-l-emerald-500"
                    : "bg-white border-slate-200",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <label className="flex flex-1 items-start gap-3">
                    <Checkbox
                      checked={t.done}
                      onCheckedChange={(checked) => setDone(t.id, checked)}
                      className="mt-1 shrink-0 rounded-full"
                    />

                    <div className="min-w-0">
                      <div
                        className={[
                          "text-sm font-medium",
                          t.done ? "line-through text-emerald-800" : "text-slate-900",
                        ].join(" ")}
                        title={t.text}
                      >
                        {t.text}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {new Date(t.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </label>

                  <Button
                    variant="ghost"
                    onClick={() => deleteTask(t.id)}
                    className="shrink-0"
                    title="Törlés"
                  >
                    Törlés
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
