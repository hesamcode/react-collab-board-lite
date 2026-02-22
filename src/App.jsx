import { useMemo, useState } from "react";

function Card({ title, desc, tag }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-zinc-600">{desc}</p>
        </div>
        <span className="rounded-full border px-3 py-1 text-xs font-medium text-zinc-700">
          {tag}
        </span>
      </div>
      <button className="mt-4 inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 active:bg-zinc-950">
        Open
      </button>
    </div>
  );
}

export default function App() {
  const [name, setName] = useState("");
  const [items, setItems] = useState([
    {
      id: 1,
      title: "Board",
      desc: "A tiny collaboration board UI.",
      tag: "UI",
    },
    {
      id: 2,
      title: "Tasks",
      desc: "Cards with quick actions and layout.",
      tag: "Demo",
    },
    {
      id: 3,
      title: "Notes",
      desc: "Simple form + list preview.",
      tag: "Tailwind",
    },
  ]);

  const greeting = useMemo(() => {
    if (!name.trim()) return "Welcome 👋";
    return `Welcome, ${name.trim()} 👋`;
  }, [name]);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Tailwind Playground
            </h1>
            <p className="text-sm text-zinc-600">Vite + React + Tailwind v4</p>
          </div>
          <a
            className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
            href="#form"
          >
            Jump to form
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* Hero */}
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">{greeting}</h2>
              <p className="mt-2 text-zinc-600">
                این صفحه فقط برای اینه که حس بگیری چطور با کلاس‌های Tailwind
                سریع UI می‌سازیم.
              </p>
            </div>

            <div className="flex gap-2">
              <button className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800">
                Primary
              </button>
              <button className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50">
                Secondary
              </button>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {items.map((x) => (
            <Card key={x.id} title={x.title} desc={x.desc} tag={x.tag} />
          ))}
        </section>

        {/* Form */}
        <section
          id="form"
          className="mt-10 rounded-3xl border bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold">Mini form</h2>
          <p className="mt-1 text-sm text-zinc-600">
            اسم رو وارد کن تا عنوان بالا تغییر کنه.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="مثلاً Hesam"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
              onClick={() => setName("")}
            >
              Clear
            </button>
          </div>

          <div className="mt-4 rounded-2xl border bg-zinc-50 p-4 text-sm text-zinc-700">
            <span className="font-semibold">Preview:</span>{" "}
            {name.trim() || "(empty)"}
          </div>
        </section>
      </main>

      <footer className="border-t bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-zinc-600">
          Built with Tailwind classes ✨
        </div>
      </footer>
    </div>
  );
}
