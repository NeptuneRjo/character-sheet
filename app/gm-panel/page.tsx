"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  SheetState,
  PhysicalBuild,
  WoundEntry,
  SkillBonus,
  SkillName,
  CharacterEntry,
  SkillBonuses,
  SkillCatalog,
} from "@/lib/types";

const skillCatalog: SkillCatalog = [
  { name: "Acrobatics", ability: "Physicality" },
  { name: "Alchemy", ability: "Acuity" },
  { name: "Animal Handling", ability: "Sense or Presence" },
  { name: "Arcana", ability: "Acuity" },
  { name: "Athletics", ability: "Physicality" },
  { name: "Blacksmithing", ability: "Physicality" },
  { name: "Brewing", ability: "Acuity" },
  { name: "Calligraphy", ability: "Acuity" },
  { name: "Carpentry", ability: "Physicality" },
  { name: "Climbing", ability: "Physicality" },
  { name: "Cooking", ability: "Acuity or Acuity" },
  { name: "Deception", ability: "Presence" },
  { name: "Diplomacy", ability: "Presence" },
  { name: "Endurance", ability: "Vitality" },
  { name: "Engineering", ability: "Acuity" },
  { name: "Fishing", ability: "Sense or Acuity" },
  { name: "Gambling", ability: "Acuity or Presence" },
  { name: "Force", ability: "Physicality" },
  { name: "Grapple Defense", ability: "Physicality" },
  { name: "Grapple Offense", ability: "Physicality" },
  { name: "Herbalism", ability: "Acuity or Sense" },
  { name: "History", ability: "Acuity" },
  { name: "Insight", ability: "Presence" },
  { name: "Initiative", ability: "Sense" },
  { name: "Intimidation", ability: "Presence or Physicality" },
  { name: "Investigation", ability: "Sense or Acuity" },
  { name: "Leatherworking", ability: "Sense or Acuity" },
  { name: "Lockpicking", ability: "Physicality or Sense" },
  { name: "Medicine", ability: "Acuity" },
  { name: "Navigation", ability: "Acuity or Sense" },
  { name: "Nature", ability: "Acuity" },
  { name: "Performance", ability: "Presence" },
  { name: "Perception", ability: "Sense" },
  { name: "Persuasion", ability: "Presence" },
  { name: "Pickpocketing", ability: "Finesse" },
  { name: "Pottery", ability: "Finesse" },
  { name: "Religion", ability: "Acuity" },
  { name: "Riding", ability: "Finesse or Sense" },
  { name: "Sailing", ability: "Physicality or Acuity" },
  { name: "Sleight of Hand", ability: "Finesse" },
  { name: "Stealth", ability: "Finesse or Sense" },
  { name: "Survival", ability: "Sense" },
  { name: "Tailoring", ability: "Acuity" },
  { name: "Tinkering", ability: "Acuity" },
  { name: "Tracking", ability: "Sense" },
  { name: "Traps", ability: "Finesse or Acuity" },
  { name: "Weaving", ability: "Finesse" },
];

const characters: CharacterEntry[] = [
  { id: "elric", name: "Elric" },
  { id: "zinrie", name: "Zinrie" },
  { id: "aled", name: "Aled" },
  { id: "verso", name: "Verso" },
  { id: "cerid", name: "Cerid" },
];

const defaultSheetState: SheetState = {
  resilienceCurrent: 10,
  resilienceMax: 10,
  resilienceReserves: 0,
  actionPoints: 4,
  wardCurrent: 0,
  hitClass: 8,
  physicalBuild: "Average",
  stats: {
    phy: 2,
    vit: 2,
    sen: 2,
    wil: 2,
    acu: 2,
    pre: 2,
  },
  moveSpeed: 5,
  wounds: [],
  skills: skillCatalog.reduce((acc, skill) => {
    acc[skill.name] = { flat: 0, bonusDice: "" };
    return acc;
  }, {} as SkillBonuses),
};

const woundOptions = [
  "Generic Trivial Wound",
  "Generic Light Wound",
  "Generic Medium Wound",
  "Generic Heavy Wound",
  "Bleeding Gash",
] as const;

const woundDefinitions = {
  "Generic Trivial Wound": {
    tier: "Trivial",
    severity: 1,
  },
  "Generic Light Wound": {
    tier: "Light",
    severity: 2,
  },
  "Generic Medium Wound": {
    tier: "Medium",
    severity: 3,
  },
  "Generic Heavy Wound": {
    tier: "Heavy",
    severity: 4,
  },
  "Bleeding Gash": {
    tier: "Bleeding",
    severity: 2,
  },
} as const;

const getWoundId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createWound = (name: string): WoundEntry => {
  const definition = woundDefinitions[name as keyof typeof woundDefinitions];
  if (!definition) {
    return {
      id: getWoundId(),
      name,
      tier: "Trivial",
      severity: 1,
    };
  }
  return {
    id: getWoundId(),
    name,
    tier: definition.tier,
    severity: definition.severity,
  };
};

const normalizeWounds = (wounds: Array<string | WoundEntry> | undefined) => {
  if (!wounds) {
    return [] as WoundEntry[];
  }
  return wounds.map((wound) =>
    typeof wound === "string" ? createWound(wound) : wound
  );
};

const normalizeSkills = (skills: SheetState["skills"] | undefined) => {
  const base = defaultSheetState.skills;
  if (!skills) {
    return base;
  }
  const next: SkillBonuses = { ...base };
  Object.keys(base).forEach((skillName) => {
    const key = skillName as SkillName;
    const entry = skills[key];
    next[key] = {
      flat: entry?.flat ?? 0,
      bonusDice: entry?.bonusDice ?? "",
    };
  });
  return next;
};

const normalizePhysicalBuild = (
  value: SheetState["physicalBuild"] | undefined
) => {
  if (value === "Lithe" || value === "Average" || value === "Hulking") {
    return value;
  }
  return "Average";
};

const getBuildModifiers = (build: PhysicalBuild) => {
  if (build === "Lithe") {
    return {
      woundPointBonus: 0,
    };
  }
  if (build === "Hulking") {
    return {
      woundPointBonus: 4,
    };
  }
  return {
    woundPointBonus: 0,
  };
};

const getHealedWound = (wound: WoundEntry): WoundEntry | null => {
  if (wound.name === "Bleeding Gash") {
    return createWound("Generic Light Wound");
  }
  if (wound.name === "Generic Heavy Wound") {
    return createWound("Generic Medium Wound");
  }
  if (wound.name === "Generic Medium Wound") {
    return createWound("Generic Light Wound");
  }
  if (wound.name === "Generic Light Wound") {
    return createWound("Generic Trivial Wound");
  }
  if (wound.name === "Generic Trivial Wound") {
    return null;
  }
  return null;
};

const getTotalSeverity = (wounds: WoundEntry[]) =>
  wounds.reduce((total, wound) => total + wound.severity, 0);

const getDerivedResilienceMax = (
  stats: SheetState["stats"],
  wounds: WoundEntry[],
  physicalBuild: PhysicalBuild
) => {
  const base = 4 + 2 * stats.vit;
  return Math.max(0, base - getTotalSeverity(wounds));
};

const clampSheet = (sheet: SheetState): SheetState => {
  const derivedMax = getDerivedResilienceMax(
    sheet.stats,
    sheet.wounds,
    sheet.physicalBuild
  );
  return {
    ...sheet,
    resilienceMax: derivedMax,
    resilienceCurrent: Math.min(sheet.resilienceCurrent, derivedMax),
    resilienceReserves: Math.min(
      sheet.resilienceReserves,
      Math.floor(derivedMax / 3)
    ),
  };
};

function getStorageKey(id: string) {
  return `character-sheet:${id}`;
}

export default function GMPanelPage() {
  const [sheets, setSheets] = useState<Record<string, SheetState>>({});
  const channelRef = useRef<BroadcastChannel | null>(null);
  const supabaseChannelRef = useRef<ReturnType<
    NonNullable<typeof supabase>["channel"]
  > | null>(null);
  const skipSupabaseRef = useRef(false);
  const [newWounds, setNewWounds] = useState<Record<string, string>>({});
  const [skillSelections, setSkillSelections] = useState<
    Record<string, SkillName>
  >({});
  const [skillFlatInputs, setSkillFlatInputs] = useState<
    Record<string, number>
  >({});
  const [skillDiceInputs, setSkillDiceInputs] = useState<
    Record<string, string>
  >({});
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const channel = new BroadcastChannel("character-sheet-sync");
    channelRef.current = channel;
    channel.onmessage = (event) => {
      const payload = event.data as {
        id?: string;
        sheet?: SheetState;
        source?: "gm" | "character";
      };
      if (!payload?.id || !payload.sheet || payload.source !== "character") {
        return;
      }
      const nextSheet = clampSheet({
        ...payload.sheet,
        wounds: normalizeWounds(payload.sheet.wounds),
        skills: normalizeSkills(payload.sheet.skills),
        physicalBuild: normalizePhysicalBuild(payload.sheet.physicalBuild),
      });
      setSheets((prev) => ({
        ...prev,
        [payload.id as string]: nextSheet,
      }));
      window.localStorage.setItem(
        getStorageKey(payload.id),
        JSON.stringify(nextSheet)
      );
    };
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }
    const channel = supabase.channel("character-sheet-sync", {
      config: { broadcast: { self: false } },
    });
    supabaseChannelRef.current = channel;

    channel.on("broadcast", { event: "sheet-update" }, ({ payload }) => {
      const nextPayload = payload as {
        id?: string;
        sheet?: SheetState;
        source?: "gm" | "character";
      };
      if (
        !nextPayload?.id ||
        !nextPayload.sheet ||
        nextPayload.source !== "character"
      ) {
        return;
      }
      skipSupabaseRef.current = true;
      const nextSheet = clampSheet({
        ...nextPayload.sheet,
        wounds: normalizeWounds(nextPayload.sheet.wounds),
        skills: normalizeSkills(nextPayload.sheet.skills),
        physicalBuild: normalizePhysicalBuild(nextPayload.sheet.physicalBuild),
      });
      setSheets((prev) => ({
        ...prev,
        [nextPayload.id as string]: nextSheet,
      }));
      window.localStorage.setItem(
        getStorageKey(nextPayload.id),
        JSON.stringify(nextSheet)
      );
    });

    channel.subscribe();

    return () => {
      channel.unsubscribe();
      supabaseChannelRef.current = null;
    };
  }, []);

  const broadcastSheet = (id: string, sheet: SheetState) => {
    channelRef.current?.postMessage({ id, sheet, source: "gm" });
    if (skipSupabaseRef.current) {
      skipSupabaseRef.current = false;
      return;
    }
    supabaseChannelRef.current?.send({
      type: "broadcast",
      event: "sheet-update",
      payload: { id, sheet, source: "gm" },
    });
  };

  useEffect(() => {
    const nextState: Record<string, SheetState> = {};
    characters.forEach((character) => {
      const key = getStorageKey(character.id);
      const stored = window.localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as SheetState;
          nextState[character.id] = clampSheet({
            ...defaultSheetState,
            ...parsed,
            wounds: normalizeWounds(parsed.wounds),
            skills: normalizeSkills(parsed.skills),
            physicalBuild: normalizePhysicalBuild(parsed.physicalBuild),
          });
          return;
        } catch {
          nextState[character.id] = clampSheet({
            ...defaultSheetState,
            wounds: [],
            skills: defaultSheetState.skills,
          });
          return;
        }
      }
      nextState[character.id] = clampSheet({
        ...defaultSheetState,
        wounds: [],
        skills: defaultSheetState.skills,
        physicalBuild: defaultSheetState.physicalBuild,
      });
    });
    setSheets(nextState);
  }, []);

  const handleFieldChange = (
    id: string,
    field: keyof SheetState,
    value: number | string
  ) => {
    setSheets((prev) => {
      const nextSheet = clampSheet({
        ...prev[id],
        [field]: value,
      });
      window.localStorage.setItem(getStorageKey(id), JSON.stringify(nextSheet));
      broadcastSheet(id, nextSheet);
      return {
        ...prev,
        [id]: nextSheet,
      };
    });
  };

  const handleStatChange = (
    id: string,
    statKey: keyof SheetState["stats"],
    value: number
  ) => {
    setSheets((prev) => {
      const nextSheet = clampSheet({
        ...prev[id],
        stats: {
          ...prev[id].stats,
          [statKey]: value,
        },
      });
      window.localStorage.setItem(getStorageKey(id), JSON.stringify(nextSheet));
      broadcastSheet(id, nextSheet);
      return {
        ...prev,
        [id]: nextSheet,
      };
    });
  };

  const handleSkillChange = (
    id: string,
    skillName: SkillName,
    field: keyof SkillBonus,
    value: number | string
  ) => {
    setSheets((prev) => {
      const nextSheet = clampSheet({
        ...prev[id],
        skills: {
          ...prev[id].skills,
          [skillName]: {
            ...prev[id].skills[skillName],
            [field]: value,
          },
        },
      });
      window.localStorage.setItem(getStorageKey(id), JSON.stringify(nextSheet));
      broadcastSheet(id, nextSheet);
      return {
        ...prev,
        [id]: nextSheet,
      };
    });
  };

  const handleAddSkillBonus = (id: string) => {
    const selectedSkill = skillSelections[id] ?? skillCatalog[0].name;
    const flat = skillFlatInputs[id] ?? 0;
    const bonusDice = skillDiceInputs[id] ?? "";
    if (flat === 0 && bonusDice === "") {
      return;
    }
    setSheets((prev) => {
      const nextSheet = clampSheet({
        ...prev[id],
        skills: {
          ...prev[id].skills,
          [selectedSkill]: {
            flat,
            bonusDice,
          },
        },
      });
      window.localStorage.setItem(getStorageKey(id), JSON.stringify(nextSheet));
      broadcastSheet(id, nextSheet);
      return {
        ...prev,
        [id]: nextSheet,
      };
    });
  };

  const handleRemoveSkillBonus = (id: string, skillName: SkillName) => {
    setSheets((prev) => {
      const nextSheet = clampSheet({
        ...prev[id],
        skills: {
          ...prev[id].skills,
          [skillName]: {
            flat: 0,
            bonusDice: "",
          },
        },
      });
      window.localStorage.setItem(getStorageKey(id), JSON.stringify(nextSheet));
      broadcastSheet(id, nextSheet);
      return {
        ...prev,
        [id]: nextSheet,
      };
    });
  };

  const handleAddWound = (id: string) => {
    const nextWound = (newWounds[id] ?? woundOptions[0]).trim();
    if (!nextWound) {
      return;
    }
    const woundEntry = createWound(nextWound);
    setSheets((prev) => {
      const nextWounds = [woundEntry, ...prev[id].wounds];
      const nextMax = getDerivedResilienceMax(
        prev[id].stats,
        nextWounds,
        prev[id].physicalBuild
      );
      const nextSheet = clampSheet({
        ...prev[id],
        wounds: nextWounds,
        resilienceMax: nextMax,
        resilienceCurrent: Math.min(
          prev[id].resilienceCurrent - woundEntry.severity,
          nextMax
        ),
      });
      broadcastSheet(id, nextSheet);
      return {
        ...prev,
        [id]: nextSheet,
      };
    });
    setNewWounds((prev) => ({
      ...prev,
      [id]: woundOptions[0],
    }));
  };

  const handleHealWound = (id: string, indexToHeal: number) => {
    setSheets((prev) => {
      const current = prev[id];
      const wound = current.wounds[indexToHeal];
      if (!wound) {
        return prev;
      }
      const healed = getHealedWound(wound);
      const updatedWounds = current.wounds
        .map((entry, index) => (index === indexToHeal ? healed : entry))
        .filter(Boolean) as WoundEntry[];
      const nextMax = getDerivedResilienceMax(
        current.stats,
        updatedWounds,
        current.physicalBuild
      );
      const severityDelta = wound.severity - (healed?.severity ?? 0);
      const nextSheet = clampSheet({
        ...current,
        wounds: updatedWounds,
        resilienceMax: nextMax,
        resilienceCurrent: Math.min(
          current.resilienceCurrent + severityDelta,
          nextMax
        ),
      });
      broadcastSheet(id, nextSheet);
      return {
        ...prev,
        [id]: nextSheet,
      };
    });
  };

  const handleSave = (id: string) => {
    const sheet = sheets[id];
    if (!sheet) {
      return;
    }
    window.localStorage.setItem(getStorageKey(id), JSON.stringify(sheet));
    broadcastSheet(id, sheet);
  };

  const handleStartTurn = (id: string) => {
    const sheet = sheets[id];
    if (!sheet) {
      return;
    }
    const bleedingCount = sheet.wounds.filter(
      (wound) => wound.name === "Bleeding Gash"
    ).length;
    const nextSheet = clampSheet({
      ...sheet,
      actionPoints: 4,
      resilienceCurrent: sheet.resilienceCurrent - bleedingCount,
    });
    setSheets((prev) => ({
      ...prev,
      [id]: nextSheet,
    }));
    window.localStorage.setItem(getStorageKey(id), JSON.stringify(nextSheet));
    broadcastSheet(id, nextSheet);
  };

  const handleReset = (id: string) => {
    const nextSheet = clampSheet(defaultSheetState);
    setSheets((prev) => ({
      ...prev,
      [id]: nextSheet,
    }));
    window.localStorage.setItem(getStorageKey(id), JSON.stringify(nextSheet));
    broadcastSheet(id, nextSheet);
  };

  const loaded = useMemo(() => Object.keys(sheets).length > 0, [sheets]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f1a14,_#14100c_45%,_#0b0907_100%)] px-6 py-20 text-[#e6d9c5]">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        {!supabase && (
          <div className="rounded-2xl border border-[#5c4a33] bg-[#19130d] px-4 py-3 text-sm text-[#f0d9a8]">
            Realtime sync is disabled. Add NEXT_PUBLIC_SUPABASE_URL and
            NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart the dev
            server.
          </div>
        )}
        <a
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b7a387] hover:text-[#f0d9a8]"
        >
          ← Back to selection
        </a>
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b7a387]">
            GM Panel
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#f0e4cf]">
            Party Overview
          </h1>
          <p className="text-sm text-[#b7a387]">
            Update character values and pass turns to reset AP and tick wounds.
          </p>
        </header>
        {!isAuthorized ? (
          <section className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] p-6">
            <h2 className="text-lg font-semibold text-[#f0e4cf]">GM Access</h2>
            <p className="mt-2 text-sm text-[#b7a387]">
              Enter the GM password to continue.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full max-w-xs rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setIsAuthorized(password === "1597Gm!@")}
                className="rounded-full border border-[#8b6a3f] bg-[#19130d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
              >
                Unlock
              </button>
            </div>
          </section>
        ) : (
          <div className="grid gap-6">
            {characters.map((character) => {
              const sheet = sheets[character.id];
              return (
                <section
                  key={character.id}
                  className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] p-6"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-[#f0e4cf]">
                      {character.name}
                    </h2>
                    <a
                      href={`/${character.id}`}
                      className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b7a387] hover:text-[#f0d9a8]"
                    >
                      View Sheet →
                    </a>
                  </div>

                  {!loaded || !sheet ? (
                    <p className="text-sm text-[#b7a387]">Loading…</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                          Resilience Current
                          <input
                            type="number"
                            value={sheet.resilienceCurrent}
                            onChange={(event) =>
                              handleFieldChange(
                                character.id,
                                "resilienceCurrent",
                                Number(event.target.value)
                              )
                            }
                            className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
                          />
                        </label>
                        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                          Resilience Reserves
                          <input
                            type="number"
                            value={sheet.resilienceReserves}
                            onChange={(event) =>
                              handleFieldChange(
                                character.id,
                                "resilienceReserves",
                                Number(event.target.value)
                              )
                            }
                            className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
                          />
                        </label>
                        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                          Action Points
                          <input
                            type="number"
                            value={sheet.actionPoints}
                            onChange={(event) =>
                              handleFieldChange(
                                character.id,
                                "actionPoints",
                                Number(event.target.value)
                              )
                            }
                            className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
                          />
                        </label>
                      </div>

                      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#8b6a3f]">
                        Derived Max Resilience: {sheet.resilienceMax}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                          Move Speed (m)
                          <input
                            type="number"
                            value={sheet.moveSpeed}
                            onChange={(event) =>
                              handleFieldChange(
                                character.id,
                                "moveSpeed",
                                Number(event.target.value)
                              )
                            }
                            className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
                          />
                        </label>
                        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                          Physical Build
                          <select
                            value={sheet.physicalBuild}
                            onChange={(event) =>
                              handleFieldChange(
                                character.id,
                                "physicalBuild",
                                event.target.value as PhysicalBuild
                              )
                            }
                            className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
                          >
                            <option value="Lithe">Lithe</option>
                            <option value="Average">Average</option>
                            <option value="Hulking">Hulking</option>
                          </select>
                        </label>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        {(
                          [
                            ["phy", "PHY"],
                            ["vit", "VIT"],
                            ["sen", "SEN"],
                            ["wil", "WIL"],
                            ["acu", "ACU"],
                            ["pre", "PRE"],
                          ] as const
                        ).map(([statKey, label]) => (
                          <label
                            key={statKey}
                            className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]"
                          >
                            {label}
                            <input
                              type="number"
                              value={sheet.stats[statKey]}
                              onChange={(event) =>
                                handleStatChange(
                                  character.id,
                                  statKey,
                                  Number(event.target.value)
                                )
                              }
                              className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
                            />
                          </label>
                        ))}
                      </div>

                      <div className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                          Skill Bonuses
                        </p>
                        <div className="mt-3 grid gap-3">
                          <div className="grid gap-3 rounded-lg border border-[#5c4a33] bg-[#140f0a] px-3 py-3 sm:grid-cols-[1.4fr_0.8fr_0.8fr_auto]">
                            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                              Skill
                              <select
                                value={
                                  skillSelections[character.id] ??
                                  skillCatalog[0].name
                                }
                                onChange={(event) =>
                                  setSkillSelections((prev) => ({
                                    ...prev,
                                    [character.id]: event.target
                                      .value as SkillName,
                                  }))
                                }
                                className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
                              >
                                {skillCatalog.map((skill) => (
                                  <option key={skill.name} value={skill.name}>
                                    {skill.name} ({skill.ability})
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                              Flat Modifier
                              <input
                                type="number"
                                value={skillFlatInputs[character.id] ?? 0}
                                onChange={(event) =>
                                  setSkillFlatInputs((prev) => ({
                                    ...prev,
                                    [character.id]: Number(event.target.value),
                                  }))
                                }
                                className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
                              />
                            </label>
                            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                              Bonus Dice
                              <input
                                type="text"
                                value={skillDiceInputs[character.id] ?? ""}
                                onChange={(event) =>
                                  setSkillDiceInputs((prev) => ({
                                    ...prev,
                                    [character.id]: event.target.value,
                                  }))
                                }
                                className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
                                placeholder="e.g. d6, 2d4"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleAddSkillBonus(character.id)}
                              className="self-end rounded-full border border-[#8b6a3f] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
                            >
                              Add
                            </button>
                          </div>

                          <div className="rounded-lg border border-[#5c4a33] bg-[#140f0a] px-3 py-3">
                            <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                              Modified Skills
                            </p>
                            {skillCatalog.filter((skill) => {
                              const entry = sheet.skills[skill.name];
                              return entry.flat !== 0 || entry.bonusDice !== "";
                            }).length === 0 ? (
                              <p className="mt-2 text-sm text-[#b7a387]">
                                No skill bonuses applied.
                              </p>
                            ) : (
                              <ul className="mt-2 space-y-2 text-sm text-[#f0e4cf]">
                                {skillCatalog
                                  .filter((skill) => {
                                    const entry = sheet.skills[skill.name];
                                    return (
                                      entry.flat !== 0 || entry.bonusDice !== ""
                                    );
                                  })
                                  .map((skill) => {
                                    const entry = sheet.skills[skill.name];
                                    return (
                                      <li
                                        key={skill.name}
                                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2"
                                      >
                                        <div>
                                          <span>{skill.name}</span>
                                          <span className="ml-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                                            ({skill.ability})
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                                          {entry.flat !== 0 && (
                                            <span className="rounded-full border border-[#5c4a33] px-2 py-1">
                                              Flat{" "}
                                              {entry.flat > 0
                                                ? `+${entry.flat}`
                                                : entry.flat}
                                            </span>
                                          )}
                                          {entry.bonusDice !== "" && (
                                            <span className="rounded-full border border-[#5c4a33] px-2 py-1">
                                              Bonus {entry.bonusDice}
                                            </span>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveSkillBonus(
                                                character.id,
                                                skill.name
                                              )
                                            }
                                            className="rounded-full border border-[#8b6a3f] bg-transparent px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      </li>
                                    );
                                  })}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <select
                          value={newWounds[character.id] ?? woundOptions[0]}
                          onChange={(event) =>
                            setNewWounds((prev) => ({
                              ...prev,
                              [character.id]: event.target.value,
                            }))
                          }
                          className="flex-1 rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
                        >
                          {woundOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleAddWound(character.id)}
                          className="rounded-full border border-[#8b6a3f] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
                        >
                          Add Wound
                        </button>
                      </div>
                      <div className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                          Current Wounds
                        </p>
                        {sheet.wounds.length === 0 ? (
                          <p className="mt-2 text-sm text-[#b7a387]">
                            No wounds listed.
                          </p>
                        ) : (
                          <ul className="mt-2 space-y-2 text-sm text-[#f0e4cf]">
                            {sheet.wounds.map((wound, index) => (
                              <li
                                key={wound.id}
                                className="flex items-center justify-between gap-3 rounded-lg border border-[#5c4a33] bg-[#140f0a] px-3 py-2"
                              >
                                <div>
                                  <span>{wound.name}</span>
                                  <span className="ml-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                                    Sev {wound.severity}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleHealWound(character.id, index)
                                  }
                                  className="rounded-full border border-[#8b6a3f] bg-transparent px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
                                >
                                  Heal
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleStartTurn(character.id)}
                          className="rounded-full border border-[#8b6a3f] bg-transparent px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
                        >
                          Start Turn
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReset(character.id)}
                          className="rounded-full border border-[#5c4a33] bg-transparent px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b7a387]"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
