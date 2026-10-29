"use client";

import { Search } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";

import { cn } from "@/lib/cn";

import { SkillCard, type SkillCardData } from "./skill-card";

const ALL = "All";

const matches = (skill: SkillCardData, query: string) => {
  if (!query) return true;
  const haystack = [skill.name, skill.summary, ...skill.phrases].join(" ").toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/u)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
};

/** Catalog filter. Renders every skill on the server; state mirrors ?q=&group= after hydration. */
export function SkillFilter({ skills, groups }: { skills: SkillCardData[]; groups: string[] }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState(ALL);
  const inputId = useId();

  useEffect(() => {
    // Hydrate from the URL after first paint so the static HTML lists every skill.
    const params = new URLSearchParams(window.location.search);
    const g = params.get("group");
    // oxlint-disable-next-line react/set-state-in-effect
    setQuery(params.get("q") ?? "");
    setGroup(g && groups.includes(g) ? g : ALL);
  }, [groups]);

  const update = (nextQuery: string, nextGroup: string) => {
    setQuery(nextQuery);
    setGroup(nextGroup);
    const params = new URLSearchParams(window.location.search);
    if (nextQuery.trim()) params.set("q", nextQuery);
    else params.delete("q");
    if (nextGroup !== ALL) params.set("group", nextGroup);
    else params.delete("group");
    const search = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
  };

  const visible = useMemo(
    () => skills.filter((s) => (group === ALL || s.group === group) && matches(s, query.trim())),
    [skills, group, query],
  );
  const filtered = visible.length !== skills.length;

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div className="relative w-full max-w-xl">
          <label htmlFor={inputId} className="sr-only">
            Filter skills by name, summary, or phrase
          </label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => update(e.target.value, group)}
            placeholder="Filter skills by name or outcome…"
            autoComplete="off"
            className="min-h-12 w-full rounded-xl border border-line-strong bg-panel pl-11 pr-4 text-base text-fg placeholder:text-fg-subtle focus:border-lavender/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender"
          />
        </div>
        <fieldset className="-mx-5 flex min-w-0 gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          <legend className="sr-only">Filter by group</legend>
          {[ALL, ...groups].map((name) => {
            const active = group === name;
            return (
              <button
                key={name}
                type="button"
                aria-pressed={active}
                onClick={() => update(query, name)}
                className={cn(
                  "min-h-10 shrink-0 whitespace-nowrap rounded-lg border px-3.5 text-sm transition-colors",
                  active ? "border-lavender-soft bg-lavender-soft font-semibold text-ink" : "border-line-strong text-fg-muted hover:border-lavender/50 hover:text-fg",
                )}
              >
                {name}
              </button>
            );
          })}
        </fieldset>
      </div>

      <p aria-live="polite" className="label-mono mt-6">
        {filtered ? `${visible.length} of ${skills.length} skills` : `${skills.length} skills`}
      </p>

      {visible.length > 0 ? (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((skill) => (
            <li key={skill.name}>
              <SkillCard skill={skill} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="card mt-4 flex flex-col items-start gap-4 p-8">
          <p className="text-lg font-semibold text-fg">No skills match that filter.</p>
          <p className="text-fg-muted">Try a different word, or describe the outcome you want to your agent; it picks the skill that fits.</p>
          <button
            type="button"
            onClick={() => update("", ALL)}
            className="inline-flex min-h-11 items-center rounded-lg border border-line-strong bg-panel-raised px-5 text-sm font-semibold text-fg hover:border-lavender/50"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
