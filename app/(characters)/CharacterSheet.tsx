"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  SheetState,
  SkillBonuses,
  SkillBonus,
  WoundEntry,
  PhysicalBuild,
  SkillCatalog,
  SkillName,
} from "@/lib/types";

type CharacterSheetProps = {
  name: string;
};

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

const hardcodedStatsByCharacter: Record<
  string,
  { stats: SheetState["stats"]; physicalBuild?: PhysicalBuild }
> = {
  elric: {
    stats: { phy: 4, vit: 3, sen: 0, wil: 5, acu: -1, pre: 1 },
  },
  zinrie: {
    stats: { phy: 5, vit: 3, sen: 6, wil: 0, acu: 0, pre: -2 },
    physicalBuild: "Lithe",
  },
  aled: {
    stats: { phy: 6, vit: 4, sen: 2, wil: 0, acu: 0, pre: 0 },
    physicalBuild: "Hulking",
  },
  verso: {
    stats: { phy: 4, vit: 2, sen: 1, wil: 4, acu: 0, pre: 2 },
    physicalBuild: "Lithe",
  },
  cerid: {
    stats: { phy: -2, vit: 2, sen: -2, wil: 5, acu: 6, pre: 3 },
    physicalBuild: "Lithe",
  },
};

const hardcodedSkillsByCharacter: Record<string, Partial<SkillBonuses>> = {
  cerid: {
    Arcana: { flat: 2, bonusDice: "1d4" },
    Deception: { flat: 2, bonusDice: "1d4" },
    Persuasion: { flat: 2, bonusDice: "1d4" },
    Investigation: { flat: 2, bonusDice: "1d4" },
    Initiative: { flat: 2, bonusDice: "1d4" },
  },
  elric: {
    Athletics: { flat: 2, bonusDice: "1d4" },
    Insight: { flat: 2, bonusDice: "1d4" },
    Initiative: { flat: 2, bonusDice: "1d4" },
    Force: { flat: 2, bonusDice: "1d4" },
    Acrobatics: { flat: 2, bonusDice: "1d4" },
  },
  aled: {
    Athletics: { flat: 2, bonusDice: "1d4" },
    Force: { flat: 2, bonusDice: "1d4" },
    Initiative: { flat: 2, bonusDice: "1d4" },
    Stealth: { flat: 2, bonusDice: "1d4" },
    Acrobatics: { flat: 2, bonusDice: "1d4" },
  },
  verso: {
    Acrobatics: { flat: 2, bonusDice: "1d4" },
    Brewing: { flat: 2, bonusDice: "1d4" },
    Religion: { flat: 2, bonusDice: "1d4" },
    Insight: { flat: 2, bonusDice: "1d4" },
    Persuasion: { flat: 2, bonusDice: "1d4" },
  },
  zinrie: {
    Acrobatics: { flat: 2, bonusDice: "1d4" },
    Stealth: { flat: 2, bonusDice: "1d4" },
    Nature: { flat: 2, bonusDice: "1d4" },
    Herbalism: { flat: 2, bonusDice: "1d4" },
    "Animal Handling": { flat: 2, bonusDice: "1d4" },
  },
};

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
      hitClassBonus: 2,
      moveSpeedBonus: 1,
      thresholdBonus: 0,
      woundPointBonus: 0,
      carryMultiplier: 0.5,
    };
  }
  if (build === "Hulking") {
    return {
      hitClassBonus: -2,
      moveSpeedBonus: -1,
      thresholdBonus: 2,
      woundPointBonus: 4,
      carryMultiplier: 1.5,
    };
  }
  return {
    hitClassBonus: 0,
    moveSpeedBonus: 0,
    thresholdBonus: 0,
    woundPointBonus: 0,
    carryMultiplier: 1,
  };
};

const getBuildSkillMultipliers = (build: PhysicalBuild) => {
  if (build === "Lithe") {
    return {
      "Grapple Defense": 2,
      "Grapple Offense": 0,
      Force: 0,
    } as const;
  }
  if (build === "Hulking") {
    return {
      "Grapple Defense": 0.5,
      "Grapple Offense": 2,
      Force: 2,
    } as const;
  }
  return {
    "Grapple Defense": 1,
    "Grapple Offense": 1,
    Force: 1,
  } as const;
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

export default function CharacterSheet({ name }: CharacterSheetProps) {
  const characterId = name.toLowerCase();
  const storageKey = `character-sheet:${characterId}`;
  const [sheet, setSheet] = useState<SheetState>(defaultSheetState);
  const [damageAmount, setDamageAmount] = useState("0");
  const [damageType, setDamageType] = useState("Physical");
  const [wardSpendAmount, setWardSpendAmount] = useState("0");
  const channelRef = useState(
    () => new BroadcastChannel("character-sheet-sync")
  )[0];
  const skipBroadcastRef = useRef(false);
  const skipSupabaseRef = useRef(false);
  const supabaseChannelRef = useRef<ReturnType<
    NonNullable<typeof supabase>["channel"]
  > | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = window.localStorage.getItem(storageKey);
    const hardcoded = hardcodedStatsByCharacter[characterId];
    const hardcodedSkills = hardcodedSkillsByCharacter[characterId];
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as SheetState;
        setSheet({
          ...defaultSheetState,
          ...parsed,
          wounds: normalizeWounds(parsed.wounds),
          // skills: {
          //   ...normalizeSkills(parsed.skills),
          //   ...(hardcodedSkills ?? {}),
          // },
          physicalBuild: normalizePhysicalBuild(parsed.physicalBuild),
          stats: hardcoded?.stats ?? parsed.stats ?? defaultSheetState.stats,
          ...(hardcoded?.physicalBuild
            ? { physicalBuild: hardcoded.physicalBuild }
            : {}),
        });
      } catch {
        setSheet({
          ...defaultSheetState,
          ...(hardcoded ?? {}),
          // skills: {
          //   ...defaultSheetState.skills,
          //   ...(hardcodedSkills ?? {}),
          // },
        });
      }
    } else {
      setSheet({
        ...defaultSheetState,
        ...(hardcoded ?? {}),
        // skills: {
        //   ...defaultSheetState.skills,
        //   ...(hardcodedSkills ?? {}),
        // },
      });
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    channelRef.onmessage = (event) => {
      const payload = event.data as {
        id?: string;
        sheet?: SheetState;
        source?: "gm" | "character";
      };
      if (
        payload?.id === characterId &&
        payload.sheet &&
        payload.source === "gm"
      ) {
        skipBroadcastRef.current = true;
        setSheet({
          ...defaultSheetState,
          ...payload.sheet,
          wounds: normalizeWounds(payload.sheet.wounds),
          skills: normalizeSkills(payload.sheet.skills),
          physicalBuild: normalizePhysicalBuild(payload.sheet.physicalBuild),
        });
      }
    };
    return () => {
      channelRef.close();
    };
  }, [characterId, channelRef]);

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
        nextPayload?.id !== characterId ||
        !nextPayload.sheet ||
        nextPayload.source !== "gm"
      ) {
        return;
      }
      skipBroadcastRef.current = true;
      skipSupabaseRef.current = true;
      setSheet({
        ...defaultSheetState,
        ...nextPayload.sheet,
        wounds: normalizeWounds(nextPayload.sheet.wounds),
        skills: normalizeSkills(nextPayload.sheet.skills),
        physicalBuild: normalizePhysicalBuild(nextPayload.sheet.physicalBuild),
      });
    });

    channel.subscribe();

    return () => {
      channel.unsubscribe();
      supabaseChannelRef.current = null;
    };
  }, [characterId]);

  const derivedResilienceMax = useMemo(() => {
    return getDerivedResilienceMax(
      sheet.stats,
      sheet.wounds,
      sheet.physicalBuild
    );
  }, [sheet.stats, sheet.wounds, sheet.physicalBuild]);

  const buildModifiers = useMemo(() => {
    return getBuildModifiers(sheet.physicalBuild);
  }, [sheet.physicalBuild]);

  const buildSkillMultipliers = useMemo(() => {
    return getBuildSkillMultipliers(sheet.physicalBuild);
  }, [sheet.physicalBuild]);

  const derivedThresholdBase = useMemo(() => {
    return 8 + 3 * sheet.stats.vit + sheet.stats.phy;
  }, [sheet.stats.phy, sheet.stats.vit]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(sheet));
    if (skipBroadcastRef.current) {
      skipBroadcastRef.current = false;
      return;
    }
    channelRef.postMessage({ id: characterId, sheet, source: "character" });
    if (skipSupabaseRef.current) {
      skipSupabaseRef.current = false;
      return;
    }
    supabaseChannelRef.current?.send({
      type: "broadcast",
      event: "sheet-update",
      payload: { id: characterId, sheet, source: "character" },
    });
  }, [sheet, storageKey, characterId, channelRef]);

  useEffect(() => {
    setSheet((prev) => {
      const max = getDerivedResilienceMax(
        prev.stats,
        prev.wounds,
        prev.physicalBuild
      );
      return {
        ...prev,
        resilienceMax: max,
        resilienceCurrent: Math.min(prev.resilienceCurrent, max),
        resilienceReserves: Math.min(
          prev.resilienceReserves,
          Math.floor(max / 3)
        ),
      };
    });
  }, [derivedResilienceMax]);

  const barState = useMemo(() => {
    const max = derivedResilienceMax;
    const current = sheet.resilienceCurrent;
    const reserves = sheet.resilienceReserves;
    if (max <= 0) {
      return {
        currentPercent: 0,
        reservesPercent: 0,
      };
    }
    const maxReserves = max / 3;
    const currentShown = Math.max(0, Math.min(current, max));
    const reservesShown = Math.max(0, Math.min(reserves, maxReserves));
    return {
      currentPercent: (currentShown / max) * 100,
      reservesPercent:
        maxReserves > 0 ? (reservesShown / maxReserves) * 100 : 0,
      maxReserves,
    };
  }, [sheet.resilienceCurrent, derivedResilienceMax, sheet.resilienceReserves]);

  const currentEffect = useMemo(() => {
    const max = derivedResilienceMax;
    const current = sheet.resilienceCurrent;
    if (max <= 0) {
      return {
        label: "Trivial",
        detail: "No negatives",
      };
    }
    const deadlyThreshold = -max / 3;
    if (current <= deadlyThreshold) {
      return {
        label: "Deadly",
        detail: "Death occurs",
      };
    }
    if (current <= 0) {
      return {
        label: "Extreme",
        detail: "Fall unconscious",
      };
    }
    if (current < max / 8) {
      return {
        label: "Heavy",
        detail: "Movement -2m, -2 to all main stats, no crits",
      };
    }
    if (current < max / 4) {
      return {
        label: "Moderate",
        detail: "Movement -1m, -1 to all main stats",
      };
    }
    if (current < max / 2) {
      return {
        label: "Light",
        detail: "Movement -1m",
      };
    }
    return {
      label: "Trivial",
      detail: "No negatives",
    };
  }, [sheet.resilienceCurrent, derivedResilienceMax]);

  const penalties = useMemo(() => {
    const max = derivedResilienceMax;
    const current = sheet.resilienceCurrent;
    let movementPenalty = 0;
    let statPenalty = 0;

    if (max > 0 && current < max / 2) {
      movementPenalty = 1;
    }
    if (max > 0 && current < max / 4) {
      statPenalty = 1;
    }
    if (max > 0 && current < max / 8) {
      movementPenalty = 2;
      statPenalty = 2;
    }

    return { movementPenalty, statPenalty };
  }, [sheet.resilienceCurrent, derivedResilienceMax]);

  const effectiveMoveSpeed = Math.max(
    0,
    sheet.moveSpeed + buildModifiers.moveSpeedBonus - penalties.movementPenalty
  );

  const effectivePhysicality = Math.max(
    0,
    sheet.stats.phy - penalties.statPenalty
  );

  const reactionPhysicalityBonus = useMemo(() => {
    const multiplier =
      sheet.physicalBuild === "Lithe"
        ? 1
        : sheet.physicalBuild === "Average"
          ? 0.5
          : 0;
    return Math.floor(effectivePhysicality * multiplier);
  }, [effectivePhysicality, sheet.physicalBuild]);

  const derivedHitClass = useMemo(() => {
    return sheet.hitClass + buildModifiers.hitClassBonus;
  }, [sheet.hitClass, buildModifiers.hitClassBonus]);

  const carryCapacityKg = useMemo(() => {
    const base = 20 + sheet.stats.phy * 10;
    return Math.max(0, Math.round(base * buildModifiers.carryMultiplier));
  }, [sheet.stats.phy, buildModifiers.carryMultiplier]);

  const wardMax = useMemo(() => sheet.stats.wil * 4, [sheet.stats.wil]);

  const activeSkills = useMemo(() => {
    return skillCatalog.filter((skill) => {
      const entry = sheet.skills[skill.name];
      const buildMultiplier =
        buildSkillMultipliers[skill.name as keyof typeof buildSkillMultipliers];
      return (
        entry?.flat !== 0 ||
        (entry?.bonusDice ?? "") !== "" ||
        (typeof buildMultiplier === "number" && buildMultiplier !== 1)
      );
    });
  }, [sheet.skills, buildSkillMultipliers]);

  const barColorClass = useMemo(() => {
    const max = derivedResilienceMax;
    const current = sheet.resilienceCurrent;
    if (max <= 0 || current <= 0) {
      return "bg-red-600";
    }
    if (current < max / 4) {
      return "bg-red-600";
    }
    if (current < max / 2) {
      return "bg-orange-500";
    }
    return "bg-emerald-600";
  }, [sheet.resilienceCurrent, derivedResilienceMax]);

  const handleResilienceDecrease = () => {
    setSheet((prev) => {
      if (prev.resilienceReserves > 0) {
        return {
          ...prev,
          resilienceReserves: Math.max(0, prev.resilienceReserves - 1),
        };
      }
      return {
        ...prev,
        resilienceCurrent: prev.resilienceCurrent - 1,
      };
    });
  };

  const handleResilienceIncrease = () => {
    setSheet((prev) => ({
      ...prev,
      resilienceCurrent: Math.min(
        prev.resilienceCurrent + 1,
        derivedResilienceMax
      ),
    }));
  };

  const handleReservesIncrease = () => {
    setSheet((prev) => ({
      ...prev,
      resilienceReserves: Math.min(
        prev.resilienceReserves + 1,
        Math.floor(derivedResilienceMax / 3)
      ),
    }));
  };

  const handleApplyDamage = () => {
    const damageValue = Number(damageAmount);
    if (Number.isNaN(damageValue)) {
      return;
    }
    const max = derivedThresholdBase;
    const trivialMax = Math.floor(max * 0.25) + buildModifiers.thresholdBonus;
    const lightMax = Math.floor(max * 0.5) + buildModifiers.thresholdBonus;
    const mediumMax = Math.floor(max * 0.9) + buildModifiers.thresholdBonus;
    const heavyMax = Math.floor(max * 1.25) + buildModifiers.thresholdBonus;

    let threshold: "Trivial" | "Light" | "Medium" | "Heavy" | "Deadly" =
      "Trivial";
    if (damageValue > heavyMax) {
      threshold = "Deadly";
    } else if (damageValue > mediumMax) {
      threshold = "Heavy";
    } else if (damageValue > lightMax) {
      threshold = "Medium";
    } else if (damageValue > trivialMax) {
      threshold = "Light";
    }

    if (threshold === "Deadly") {
      return;
    }

    const physicalTypes = ["Piercing", "Slashing", "Bludgeoning", "Cleaving"];
    const isLightPhysical =
      threshold === "Light" && physicalTypes.includes(damageType);
    const woundName =
      isLightPhysical && Math.random() < 0.5
        ? "Bleeding Gash"
        : threshold === "Light"
          ? "Generic Light Wound"
          : `Generic ${threshold} Wound`;

    const newWound = createWound(woundName);

    setSheet((prev) => {
      const nextWounds = [newWound, ...prev.wounds];
      const nextMax = getDerivedResilienceMax(
        prev.stats,
        nextWounds,
        prev.physicalBuild
      );
      return {
        ...prev,
        wounds: nextWounds,
        resilienceMax: nextMax,
        resilienceCurrent: Math.min(
          prev.resilienceCurrent - newWound.severity,
          nextMax
        ),
      };
    });
  };

  const handleSpendAp = () => {
    handleSpendApCost(1);
  };

  const handleSpendApCost = (cost: number) => {
    if (cost <= 0) {
      return;
    }
    setSheet((prev) => {
      let remaining = cost;
      let nextAp = prev.actionPoints;
      let nextResilience = prev.resilienceCurrent;

      while (remaining > 0) {
        if (nextAp > 0) {
          nextAp -= 1;
          remaining -= 1;
          continue;
        }
        if (nextAp > -2) {
          nextAp -= 1;
          nextResilience -= 1;
          remaining -= 1;
          continue;
        }
        break;
      }

      return {
        ...prev,
        actionPoints: nextAp,
        resilienceCurrent: nextResilience,
      };
    });
  };

  const handleHealWound = (indexToRemove: number) => {
    setSheet((prev) => {
      const wound = prev.wounds[indexToRemove];
      if (!wound) {
        return prev;
      }
      const healed = getHealedWound(wound);
      const nextWounds = prev.wounds
        .map((entry, index) => (index === indexToRemove ? healed : entry))
        .filter(Boolean) as WoundEntry[];
      const nextMax = getDerivedResilienceMax(
        prev.stats,
        nextWounds,
        prev.physicalBuild
      );
      const severityDelta = wound.severity - (healed?.severity ?? 0);
      return {
        ...prev,
        wounds: nextWounds,
        resilienceMax: nextMax,
        resilienceCurrent: Math.min(
          prev.resilienceCurrent + severityDelta,
          nextMax
        ),
      };
    });
  };

  return (
    <section className="flex flex-col gap-8">
      {!supabase && (
        <div className="rounded-2xl border border-[#5c4a33] bg-[#19130d] px-4 py-3 text-sm text-[#f0d9a8]">
          Realtime sync is disabled. Add NEXT_PUBLIC_SUPABASE_URL and
          NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart the dev
          server.
        </div>
      )}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b7a387]">
            Character Sheet
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#f0e4cf]">
            {name}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
              Hit Class
            </p>
            <p className="text-lg font-semibold text-[#f0d9a8]">
              {derivedHitClass}
            </p>
          </div>
          <div className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
              Physical Build
            </p>
            <p className="text-lg font-semibold text-[#f0d9a8]">
              {sheet.physicalBuild}
            </p>
          </div>
          <div className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
              Carry Capacity
            </p>
            <p className="text-lg font-semibold text-[#f0d9a8]">
              {carryCapacityKg} kg
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-2xl border border-[#5c4a33] bg-[#140f0a] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-[#f0e4cf]">
                Resilience
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#b7a387]">
                <span className="font-semibold">Current / Max</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResilienceDecrease}
                    className="h-7 w-7 rounded-full border border-[#5c4a33] bg-[#19130d] text-[#f0d9a8]"
                    aria-label="Reduce resilience"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={sheet.resilienceCurrent}
                    onChange={(event) =>
                      setSheet((prev) => ({
                        ...prev,
                        resilienceCurrent: Math.min(
                          Number(event.target.value),
                          derivedResilienceMax
                        ),
                      }))
                    }
                    className="w-20 rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-1 text-sm text-[#f0e4cf]"
                  />
                  <span className="text-[#8b6a3f]">/</span>
                  <span className="min-w-[3.5rem] text-sm font-semibold text-[#f0e4cf]">
                    {derivedResilienceMax}
                  </span>
                  <button
                    type="button"
                    onClick={handleResilienceIncrease}
                    className="h-7 w-7 rounded-full border border-[#5c4a33] bg-[#19130d] text-[#f0d9a8]"
                    aria-label="Increase resilience"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="relative h-4 w-full overflow-hidden rounded-full border border-[#5c4a33] bg-[#19130d]">
                <div
                  className={`h-full ${barColorClass}`}
                  style={{ width: `${barState.currentPercent}%` }}
                />
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full border border-[#5c4a33] bg-[#19130d]">
                <div
                  className="h-full bg-gradient-to-r from-[#f5c542] to-[#ffd46b]"
                  style={{ width: `${barState.reservesPercent}%` }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#b7a387]">
                <span>Resilience Reserves:</span>
                <span className="rounded-full border border-[#8b6a3f] px-3 py-1 text-xs font-semibold text-[#f0d9a8]">
                  {sheet.resilienceReserves}
                </span>
                <span className="text-xs text-[#8b6a3f]">
                  /{" "}
                  {Math.floor(barState.maxReserves ?? derivedResilienceMax / 3)}
                </span>
                <button
                  type="button"
                  onClick={handleReservesIncrease}
                  className="h-7 w-7 rounded-full border border-[#8b6a3f] bg-[#19130d] text-[#f0d9a8]"
                  aria-label="Increase resilience reserves"
                >
                  +
                </button>
              </div>
            </div>
            <div className="mt-2 grid gap-2 text-xs text-[#b7a387]">
              <div className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#8b6a3f]">
                  Current Effect
                </p>
                <p className="mt-1 text-sm text-[#f0e4cf]">
                  {currentEffect.label}: {currentEffect.detail}
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Physicality", key: "PHY", value: sheet.stats.phy },
              { label: "Vitality", key: "VIT", value: sheet.stats.vit },
              { label: "Sense", key: "SEN", value: sheet.stats.sen },
              { label: "Willpower", key: "WIL", value: sheet.stats.wil },
              { label: "Acuity", key: "ACU", value: sheet.stats.acu },
              { label: "Presence", key: "PRE", value: sheet.stats.pre },
            ].map((stat) => (
              <div
                key={stat.key}
                className="flex items-center justify-between rounded-2xl border border-[#5c4a33] bg-[#140f0a] px-5 py-4"
              >
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-[#b7a387]">
                    {stat.key}
                  </p>
                  <p className="text-lg font-semibold text-[#f0e4cf]">
                    {stat.label}
                  </p>
                </div>
                <div className="text-2xl font-semibold text-[#f0d9a8]">
                  {Math.max(-2, stat.value - penalties.statPenalty)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <div className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] px-5 py-4">
            <h2 className="text-lg font-semibold text-[#f0e4cf]">
              Damage Thresholds
            </h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {(() => {
                const max = derivedThresholdBase;
                const trivialMax =
                  Math.floor(max * 0.25) + buildModifiers.thresholdBonus;
                const lightMax =
                  Math.floor(max * 0.5) + buildModifiers.thresholdBonus;
                const mediumMax =
                  Math.floor(max * 0.9) + buildModifiers.thresholdBonus;
                const heavyMax =
                  Math.floor(max * 1.25) + buildModifiers.thresholdBonus;
                const ranges = [
                  { label: "Trivial", range: `0-${trivialMax}` },
                  { label: "Light", range: `${trivialMax + 1}-${lightMax}` },
                  { label: "Medium", range: `${lightMax + 1}-${mediumMax}` },
                  { label: "Heavy", range: `${mediumMax + 1}-${heavyMax}` },
                  { label: "Deadly", range: `${heavyMax + 1}+` },
                ];
                return ranges.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border border-[#5c4a33] bg-[#19130d] px-3 py-2"
                  >
                    <span className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                      {item.label}
                    </span>
                    <span className="text-sm font-semibold text-[#f0d9a8]">
                      {item.range}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] p-5">
            <h2 className="text-lg font-semibold text-[#f0e4cf]">Wounds</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="number"
                  min={0}
                  value={damageAmount}
                  onChange={(event) => setDamageAmount(event.target.value)}
                  className="w-full rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
                  placeholder="Damage"
                />
                <select
                  value={damageType}
                  onChange={(event) => setDamageType(event.target.value)}
                  className="w-full rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
                >
                  <option>Piercing</option>
                  <option>Slashing</option>
                  <option>Bludgeoning</option>
                  <option>Cleaving</option>
                  <option>Fire</option>
                  <option>Cold</option>
                  <option>Lightning</option>
                  <option>Poison</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleApplyDamage}
                className="rounded-full border border-[#8b6a3f] bg-[#19130d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
              >
                Apply
              </button>
            </div>
            {sheet.wounds.length === 0 ? (
              <p className="mt-2 text-sm text-[#b7a387]">No wounds listed.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-[#f0e4cf]">
                {sheet.wounds.map((wound, index) => (
                  <li
                    key={wound.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2"
                  >
                    <div>
                      <span>{wound.name}</span>
                      <span className="ml-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                        Sev {wound.severity}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleHealWound(index)}
                      className="rounded-full border border-[#8b6a3f] bg-transparent px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
                    >
                      Heal
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] px-5 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#f0e4cf]">Actions</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSpendAp}
                  className="h-7 w-7 rounded-full border border-[#5c4a33] bg-[#19130d] text-[#f0d9a8]"
                  aria-label="Spend action point"
                >
                  -
                </button>
              </div>
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
              Action Points
            </p>
            <div className="mt-2 flex items-center gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className={`h-4 w-4 rounded-full border border-[#8b6a3f] ${
                    index < sheet.actionPoints ? "bg-[#f0d9a8]" : "bg-[#19130d]"
                  }`}
                />
              ))}
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
              {sheet.actionPoints} / 4
            </p>
            <div className="mt-4 grid gap-2 text-sm text-[#f0e4cf]">
              {[
                { name: `Move (${effectiveMoveSpeed}m)`, cost: 1 },
                { name: "Take Cover", cost: 1 },
                { name: "Hide", cost: 1 },
                { name: "Weapon Attack", cost: 2 },
                ...(name.toLowerCase() === "cerid"
                  ? [
                      {
                        name: "Repeat (Spell)",
                        cost: 2,
                        note: "Difficulty TBD. Target repeats their last turn on their next turn.",
                      },
                      {
                        name: "Temporal Shear (Spell)",
                        cost: 2,
                        note: "Difficulty 7. Slows time in random sections of the target’s body, dealing 3d4 cleaving damage.",
                      },
                    ]
                  : []),
              ].map((action) => (
                <button
                  key={action.name}
                  type="button"
                  onClick={() => handleSpendApCost(action.cost)}
                  className="flex items-center justify-between rounded-xl border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-left text-sm text-[#f0e4cf] transition hover:border-[#8b6a3f]"
                >
                  <div>
                    <span>{action.name}</span>
                    {"note" in action && action.note && (
                      <p className="mt-1 text-xs text-[#b7a387]">
                        {action.note}
                      </p>
                    )}
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                    {action.cost} AP
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] px-5 py-4">
            <h2 className="text-lg font-semibold text-[#f0e4cf]">Reactions</h2>
            <div className="mt-4 grid gap-2 text-sm text-[#f0e4cf]">
              {[
                {
                  name: "Dodge",
                  note: `Add 1d4 + ${reactionPhysicalityBonus} to Hit Class for a specific attack. Move one melee range out. If the attack still hits but could have caused it to miss, take half damage.`,
                },
                {
                  name: "Parry",
                  note: `Roll a weapon attack, if the roll matches or exceeds the attack roll, cause the attack to miss, if the attack still hits but the roll was over half the attack roll, you may take the dodge action for free.`,
                },
              ].map((reaction) => (
                <button
                  key={reaction.name}
                  type="button"
                  onClick={() => handleSpendApCost(1)}
                  className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-left text-sm text-[#f0e4cf] transition hover:border-[#8b6a3f]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{reaction.name}</span>
                    <span className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                      1 AP
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#b7a387]">{reaction.note}</p>
                </button>
              ))}
              {name.toLowerCase() === "cerid" && (
                <div className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Ward</span>
                    <span className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                      2 AP
                    </span>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#8b6a3f]">
                    Difficulty 8
                  </p>
                  <p className="mt-2 text-sm text-[#b7a387]">
                    Track your ward points (max {wardMax}).
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        handleSpendApCost(2);
                        setSheet((prev) => ({
                          ...prev,
                          wardCurrent: Math.min(wardMax, 20),
                        }));
                      }}
                      className="rounded-full border border-[#8b6a3f] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
                    >
                      Ward to 20
                    </button>
                    <span className="text-lg font-semibold text-[#f0d9a8]">
                      {Math.min(sheet.wardCurrent, wardMax)}
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                      / {wardMax}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      value={wardSpendAmount}
                      onChange={(event) =>
                        setWardSpendAmount(event.target.value)
                      }
                      className="w-28 rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
                      placeholder="Reduce"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const amount = Number(wardSpendAmount);
                        if (Number.isNaN(amount) || amount <= 0) {
                          return;
                        }
                        setSheet((prev) => ({
                          ...prev,
                          wardCurrent: Math.max(0, prev.wardCurrent - amount),
                        }));
                      }}
                      className="rounded-full border border-[#8b6a3f] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
                    >
                      Reduce Ward
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] p-5">
          <h3 className="text-lg font-semibold text-[#f0e4cf]">Traits</h3>
          {name.toLowerCase() === "verso" ? (
            <ul className="mt-3 space-y-2 text-sm text-[#f0e4cf]">
              <li className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-3 py-2">
                Unarmed strikes deal 1d6 + PHY bludgeoning damage.
              </li>
              <li className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-3 py-2">
                Unarmed strikes deal 1d64 + WIL elemental damage of your choice,
                elemental damage can be dealt at all melee ranges.
              </li>
              <li className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-3 py-2">
                Improved Doge: When you take the Dodge reaction, add half your
                Wil (as a whole number) to your Hit Class for that attack. The
                first doge each round costs 0 AP.
              </li>
            </ul>
          ) : name.toLowerCase() === "elric" ? (
            <ul className="mt-3 space-y-2 text-sm text-[#f0e4cf]">
              <li className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-3 py-2">
                Smile: When you hit with a melee attack, you may deal +1d8 Fire
                damage by spending +1 AP. Then roll a Will check against half
                the damage rolled; on a failure, lose 1 additional AP.
              </li>
              <li className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-3 py-2">
                Lay on Hands: Touch a creature to heal a wound by a severity
                equal to AP spent. Roll over 5 times the severity healed or lose
                the same amount of Resilience.
              </li>
            </ul>
          ) : name.toLowerCase() === "aled" ? (
            <ul className="mt-3 space-y-2 text-sm text-[#f0e4cf]">
              <li className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-3 py-2">
                Improved Grapple: Add 1d4 to grapple checks. A grappled
                opponent’s move speed is reduced to one quarter.
              </li>
              <li className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-3 py-2">
                Chokehold: On a second consecutive success, the target gains the
                helpless condition. After 3 consecutive rounds, the target is
                knocked unconscious.
              </li>
            </ul>
          ) : (
            <p className="mt-2 text-sm text-[#b7a387]">None listed.</p>
          )}
        </div>
        <div className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] p-5">
          <h3 className="text-lg font-semibold text-[#f0e4cf]">Equipment</h3>
          <p className="mt-2 text-sm text-[#b7a387]">None listed.</p>
        </div>
        <div className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] p-5">
          <h3 className="text-lg font-semibold text-[#f0e4cf]">Skills</h3>
          {activeSkills.length === 0 ? (
            <p className="mt-2 text-sm text-[#b7a387]">None listed.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-[#f0e4cf]">
              {activeSkills.map((skill) => {
                const entry = sheet.skills[skill.name];
                const flat = entry?.flat ?? 0;
                const bonusDice = entry?.bonusDice ?? "";
                const buildMultiplier =
                  buildSkillMultipliers[
                    skill.name as keyof typeof buildSkillMultipliers
                  ];
                return (
                  <li
                    key={skill.name}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#5c4a33] bg-[#19130d] px-3 py-2"
                  >
                    <div>
                      <span>{skill.name}</span>
                      <span className="ml-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                        ({skill.ability})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                      {flat !== 0 && (
                        <span className="rounded-full border border-[#5c4a33] px-2 py-1">
                          Flat {flat > 0 ? `+${flat}` : flat}
                        </span>
                      )}
                      {bonusDice !== "" && (
                        <span className="rounded-full border border-[#5c4a33] px-2 py-1">
                          Bonus {bonusDice}
                        </span>
                      )}
                      {typeof buildMultiplier === "number" &&
                        buildMultiplier !== 1 && (
                          <span className="rounded-full border border-[#5c4a33] px-2 py-1">
                            Build x{buildMultiplier}
                          </span>
                        )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
