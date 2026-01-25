import {
    ArmorBuild,
    Build,
    BuildWeapon,
    Decoration,
    DecorationKind,
    SlotLevel,
    isSlotLevel,
    hasSlots,
    isSlotHaving,
    Weapon,
    WeaponKind,
    Armor,
    ArmorBySlot,
    CharmRank,
    SkillFilter,
    GearWithReqSkills,
    GearWithRelevantSkills,
    RelevantSkillsMap,
    MaxSkillsPerSlotMap,
    BuildProgress,
    BuildData,
    SkillGainMap,
    SlotCounts,
    DecoPlacement,
    BuildDecorations,
} from "../types/types";

const gearSlots = ["head", "chest", "arms", "waist", "legs", "charm"] as const;
type GearSlot = typeof gearSlots[number];

type ArmorSlotKey = "head" | "chest" | "arms" | "waist" | "legs";

type SlotHaving = { slots?: number[] };

type ArmorWithRelevant = GearWithRelevantSkills<Armor>;
type CharmWithRelevant = GearWithRelevantSkills<CharmRank>;
type GearPiece = GearWithRelevantSkills<Armor> | GearWithRelevantSkills<CharmRank>;

const isArmorPiece = (p: GearPiece | undefined): p is ArmorWithRelevant => {
    return !!p && "defense" in p; // ArmorPiece has defense; CharmRank doesn't
};

const isCharmPiece = (p: GearPiece | undefined): p is CharmWithRelevant => {
    return !!p && "charm" in p; // CharmRank has charm: { id }, ArmorPiece doesn't
};


// NEW/CHANGED: slots tracked by kind
type SlotCountsByKind = Record<DecorationKind, SlotCounts>;

// NEW/CHANGED: decos grouped by kind and max slot
type DecosByKindByL = Record<DecorationKind, Record<SlotLevel, Decoration[]>>;


// NEW/CHANGED: best gain by kind and slot level
type BestGainByKind = Record<DecorationKind, Record<SlotLevel, SkillGainMap>>;

/* =========================================================
   FIXED WEAPON
========================================================= */

// NEW/CHANGED: Create/define the fixed weapon.
// If you already have an ID/name in your DB, you can find it instead.
const FIXED_WEAPON: BuildWeapon = {
    id: -999999,                // pick a sentinel id that won't collide
    name: "Artian Weapon",
    kind: "sword-shield",              // doesn't matter much unless your UI uses it
    rarity: 8,
    slots: [3, 3, 3],           // ✅ 3 level-3 slots
    skills: [],                 // ✅ no skills
}

// NEW/CHANGED: fixed weapon slot counts (weapon-only)
const FIXED_WEAPON_SLOT_COUNTS: SlotCounts = { 1: 0, 2: 0, 3: 3 };

/* =========================================================
   NEW: beam + bounds helpers
========================================================= */

function countSlots(piece: unknown): SlotCounts {
    const c: SlotCounts = { 1: 0, 2: 0, 3: 0 };
    if (!isSlotHaving(piece)) return c;

    for (const raw of piece.slots) {
        if (isSlotLevel(raw)) c[raw] += 1;
    }
    return c;
}

function maxSlotsForCandidates(cands: ReadonlyArray<unknown>): SlotCounts {
    const best: SlotCounts = { 1: 0, 2: 0, 3: 0 };
    for (const p of cands) {
        const c = countSlots(p);
        best[1] = Math.max(best[1], c[1]);
        best[2] = Math.max(best[2], c[2]);
        best[3] = Math.max(best[3], c[3]);
    }
    return best;
}

function createMaxSlotsRemainingFromIndex(
    ordered: ReadonlyArray<GearSlot>,
    candidatesBySlot: Record<GearSlot, ReadonlyArray<unknown>>
): Record<number, SlotCounts> {
    const perIndexMax: SlotCounts[] = ordered.map((slot) =>
        maxSlotsForCandidates(candidatesBySlot[slot])
    );

    const out: Record<number, SlotCounts> = {};
    out[ordered.length] = { 1: 0, 2: 0, 3: 0 };

    for (let i = ordered.length - 1; i >= 0; i--) {
        const next = out[i + 1];
        const add = perIndexMax[i];
        out[i] = { 1: next[1] + add[1], 2: next[2] + add[2], 3: next[3] + add[3] };
    }
    return out;
}

// Recompute maxRemainingFromIndex for an arbitrary recursion order
function createMaxRemainingFromIndexForOrder(
    skills: SkillFilter[],
    maxSkillsPerSlot: MaxSkillsPerSlotMap,
    ordered: GearSlot[]
) {
    const out: Record<number, Record<number, number>> = {};
    const base: Record<number, number> = {};
    for (const s of skills) base[s.skillId] = 0;

    out[ordered.length] = { ...base };

    for (let i = ordered.length - 1; i >= 0; i--) {
        const slot = ordered[i] as keyof MaxSkillsPerSlotMap;
        const prev = out[i + 1];
        const add = maxSkillsPerSlot[slot];

        const combined: Record<number, number> = {};
        for (const s of skills) {
            const id = s.skillId;
            combined[id] = (prev[id] ?? 0) + (add?.[id] ?? 0);
        }
        out[i] = combined;
    }
    return out;
}

type BeamState = {
    depth: number;
    chosen: Partial<Record<GearSlot, GearPiece>>;
    totals: Record<number, number>;
    // NEW/CHANGED: track ARMOR slot counts only here (weapon slots are constant)
    slotsArmor: SlotCounts;
    score: number;
};

// prefer meeting requirements, plus slots, plus rarity
function scoreState(
    st: BeamState,
    orderedGearSlots: GearSlot[],
    skillIds: number[],
    requiredLevels: Record<number, number>
) {
    let satisfied = 0;
    let remaining = 0;

    for (const id of skillIds) {
        const have = st.totals[id] ?? 0;
        const req = requiredLevels[id] ?? 0;
        satisfied += Math.min(have, req);
        remaining += Math.max(0, req - have);
    }

    // NEW/CHANGED: include weapon slots in "slot value" to bias toward deco flexibility
    const armorSlotVal =
        st.slotsArmor[1] * 1 + st.slotsArmor[2] * 3 + st.slotsArmor[3] * 9;
    const weaponSlotVal =
        FIXED_WEAPON_SLOT_COUNTS[1] * 1 +
        FIXED_WEAPON_SLOT_COUNTS[2] * 3 +
        FIXED_WEAPON_SLOT_COUNTS[3] * 9;

    const slotVal = armorSlotVal + weaponSlotVal;

    let raritySum = 0;
    for (let i = 0; i < st.depth; i++) {
        const k = orderedGearSlots[i];
        raritySum += st.chosen[k]?.rarity ?? 0;
    }

    return satisfied * 10_000 - remaining * 2_000 + slotVal * 200 + raritySum * 50;
}

/* =========================================================
   NEW/CHANGED: DECORATION HELPERS (KIND-AWARE)
========================================================= */

function groupDecosByMaxSlotAndKind(decos: Decoration[]): DecosByKindByL {
    const out: DecosByKindByL = {
        armor: { 1: [], 2: [], 3: [] },
        weapon: { 1: [], 2: [], 3: [] },
    };

    for (const d of decos) {
        const k = d.kind; // DecorationKind
        if (d.slot <= 1) out[k][1].push(d);
        if (d.slot <= 2) out[k][2].push(d);
        if (d.slot <= 3) out[k][3].push(d);
    }
    return out;
}

function buildBestGainPerSlotLevelAndKind(
    filters: SkillFilter[],
    decos: Decoration[]
): BestGainByKind {
    const skillIds = filters.map((f) => f.skillId);

    const best: BestGainByKind = {
        armor: { 1: {}, 2: {}, 3: {} },
        weapon: { 1: {}, 2: {}, 3: {} },
    };

    for (const kind of ["armor", "weapon"] as const) {
        for (const L of [1, 2, 3] as const) {
            for (const id of skillIds) best[kind][L][id] = 0;
        }
    }

    for (const deco of decos) {
        const kind = deco.kind;
        const req = deco.slot;
        if (req !== 1 && req !== 2 && req !== 3) continue;

        for (const s of deco.skills) {
            const id = s.skill.id;
            const lvl = s.level;

            for (const L of [req, 2, 3] as const) {
                if (L >= req && best[kind][L][id] !== undefined) {
                    best[kind][L][id] = Math.max(best[kind][L][id], lvl);
                }
            }
        }
    }

    return best;
}


function maxDecoPossibleForSkillByKind(
    kind: DecorationKind,
    skillId: number,
    slots: SlotCounts,
    bestGainByKind: BestGainByKind
) {
    const bestGain = bestGainByKind[kind];
    return (
        slots[1] * (bestGain[1][skillId] ?? 0) +
        slots[2] * (bestGain[2][skillId] ?? 0) +
        slots[3] * (bestGain[3][skillId] ?? 0)
    );
}

// NEW/CHANGED: compute max possible from BOTH armor + weapon slots
function maxDecoPossibleForSkillCombined(
    skillId: number,
    slotsArmor: SlotCounts,
    slotsWeapon: SlotCounts,
    bestGainByKind: BestGainByKind
) {
    return (
        maxDecoPossibleForSkillByKind("armor", skillId, slotsArmor, bestGainByKind) +
        maxDecoPossibleForSkillByKind("weapon", skillId, slotsWeapon, bestGainByKind)
    );
}

/* =========================================================
   NEW/CHANGED: SOLVER THAT RESPECTS SLOT KIND
========================================================= */

type SlotRefKinded = { kind: DecorationKind; slotLevel: SlotLevel };

function solveDecorationsKinded(
    needs: Record<number, number>,
    slotRefs: SlotRefKinded[],
    decosByKindL: DecosByKindByL,
    skillIds: number[]
): DecoPlacement[] | null {
    const memo = new Map<string, DecoPlacement[] | null>();

    const needsKey = (n: Record<number, number>) =>
        skillIds.map((id) => n[id] ?? 0).join(",");

    const applyDeco = (n: Record<number, number>, deco: Decoration) => {
        const out = { ...n };
        for (const s of deco.skills) {
            const id = s.skill.id;
            if ((out[id] ?? 0) > 0) out[id] = Math.max(0, out[id] - s.level);
        }
        return out;
    };

    const allMet = (n: Record<number, number>) => skillIds.every((id) => (n[id] ?? 0) <= 0);

    function dfs(i: number, n: Record<number, number>): DecoPlacement[] | null {
        if (allMet(n)) {
            // fill remaining slots as empties
            return slotRefs.slice(i).map((r) => ({ slotLevel: r.slotLevel, decoration: null }));
        }
        if (i === slotRefs.length) return null;

        const key = i + "|" + needsKey(n);
        if (memo.has(key)) return memo.get(key)!;

        const { kind, slotLevel: L } = slotRefs[i];
        const candidates = decosByKindL[kind][L];

        // try placing a helpful deco (of correct kind)
        for (const deco of candidates) {
            let helps = false;
            for (const s of deco.skills) {
                if ((n[s.skill.id] ?? 0) > 0) {
                    helps = true;
                    break;
                }
            }
            if (!helps) continue;

            const nextNeeds = applyDeco(n, deco);
            const rest = dfs(i + 1, nextNeeds);
            if (rest) {
                const ans: DecoPlacement[] = [{ slotLevel: L, decoration: deco }, ...rest];
                memo.set(key, ans);
                return ans;
            }
        }

        // leave empty
        const emptyRest = dfs(i + 1, n);
        const ans = emptyRest ? [{ slotLevel: L, decoration: null }, ...emptyRest] : null;
        memo.set(key, ans);
        return ans;
    }

    return dfs(0, needs);
}

type ArmorSlotRef = { kind: "armor"; piece: ArmorSlotKey; slotIndex: number; slotLevel: SlotLevel };
type WeaponSlotRef = { kind: "weapon"; weaponIndex: number; slotLevel: SlotLevel };
type SlotRefFull = ArmorSlotRef | WeaponSlotRef;

function packDecorationsToSmallestSlots(
    slotRefs: SlotRefFull[],
    solvedFlat: DecoPlacement[]
): Map<SlotRefFull, DecoPlacement> {
    // Gather actual placed decos (ignore nulls)
    const placedDecos: Decoration[] = solvedFlat
        .map(p => p.decoration)
        .filter((d): d is Decoration => d != null);

    // Sort decos by required slot DESC so big decos claim big slots first
    placedDecos.sort((a, b) => (b.slot as number) - (a.slot as number));

    // Available slots by kind, sorted ASC so we pick the smallest fitting slot
    const armorSlots = slotRefs
        .filter((r): r is ArmorSlotRef => r.kind === "armor")
        .slice()
        .sort((a, b) => a.slotLevel - b.slotLevel);

    const weaponSlots = slotRefs
        .filter((r): r is WeaponSlotRef => r.kind === "weapon")
        .slice()
        .sort((a, b) => a.slotLevel - b.slotLevel);

    const out = new Map<SlotRefFull, DecoPlacement>();

    // Pre-fill everything as empty
    for (const ref of slotRefs) {
        out.set(ref, { slotLevel: ref.slotLevel, decoration: null });
    }

    // Place each deco into the smallest possible slot of its kind
    for (const deco of placedDecos) {
        const req = deco.slot as SlotLevel; // 1|2|3
        const pool = deco.kind === "armor" ? armorSlots : weaponSlots;

        const idx = pool.findIndex(s => s.slotLevel >= req);
        if (idx === -1) {
            // Shouldn't happen because the solver already proved feasibility,
            // but if it does, just skip (keeps nulls).
            continue;
        }

        const chosenSlot = pool.splice(idx, 1)[0];
        out.set(chosenSlot, { slotLevel: chosenSlot.slotLevel, decoration: deco });
    }

    return out;
}

/* =========================================================
   MAIN
========================================================= */

export function generateBuild(
    skillFilters: SkillFilter[],
    weaponKind: WeaponKind | null,
    data: BuildData,
    onProgress?: (p: BuildProgress) => void
) {
    const filters = skillFilters.filter((skill) => skill.skillId !== -1);

    // NEW/CHANGED: Keep only decorations that contain at least 1 required skill,
    // but DO NOT drop based on kind yet (we split later)
    const filteredDecos = data.decorations.filter((decoration) =>
        decoration.skills.some((decoSkill) =>
            filters.some((skill) => skill.skillId === decoSkill.skill.id)
        )
    );

    if (!weaponKind || filters.length === 0) return [];

    console.log("Weapon Kind:" + weaponKind)

    FIXED_WEAPON.kind = weaponKind;

    // --- 1. Prepare skill bookkeeping ---
    const skillIds: number[] = [];
    const requiredLevels: Record<number, number> = {};
    for (const filter of filters) {
        const id = filter.skillId;
        skillIds.push(id);
        requiredLevels[id] = filter.level;
    }

    // --- 1.5 Preprocess decorations helpers (NEW/CHANGED: kind-aware) ---
    const bestGainByKind = buildBestGainPerSlotLevelAndKind(filters, filteredDecos);
    const decosByKindL = groupDecosByMaxSlotAndKind(filteredDecos);

    // cache expensive decoration solve across identical (slots, needs)
    const decoSolveCache = new Map<string, DecoPlacement[] | null>();
    const solveDecorationsCached = (needs: Record<number, number>, slotRefs: SlotRefKinded[]) => {
        const needsKey = skillIds.map((id) => needs[id] ?? 0).join(",");
        const slotKey = slotRefs.map((r) => `${r.kind[0]}${r.slotLevel}`).join(",");
        const key = slotKey + "|" + needsKey;
        if (decoSolveCache.has(key)) return decoSolveCache.get(key)!;

        const res = solveDecorationsKinded(needs, slotRefs, decosByKindL, skillIds);
        decoSolveCache.set(key, res);
        return res;
    };

    // --- 2. Preprocess gear ---
    const gearWithReqSkills: GearWithReqSkills = getGearWithReqSkills(
        weaponKind,
        filters,
        data.weapons,
        data.armorBySlot,
        data.charms
    );

    let maxSkillsPerSlot: MaxSkillsPerSlotMap = {
        head: {},
        chest: {},
        arms: {},
        waist: {},
        legs: {},
        charm: {},
    };

    maxSkillsPerSlot = getMaxSkillsPerSlot(gearWithReqSkills, filters);

    // candidates
    const candidatesBySlot: Record<GearSlot, ReadonlyArray<GearPiece>> = {
        head: gearWithReqSkills.heads,
        chest: gearWithReqSkills.chests,
        arms: gearWithReqSkills.arms,
        waist: gearWithReqSkills.waists,
        legs: gearWithReqSkills.legs,
        charm: gearWithReqSkills.charms,
    };

    // --- Beam order: expand smallest candidate list first ---
    const orderedGearSlots: GearSlot[] = [...gearSlots].sort(
        (a, b) => candidatesBySlot[a].length - candidatesBySlot[b].length
    );

    // bounds for pruning during beam expansion
    const maxRemainingFromIndex = createMaxRemainingFromIndexForOrder(filters, maxSkillsPerSlot, orderedGearSlots);
    const maxSlotsRemainingFromIndex = createMaxSlotsRemainingFromIndex(orderedGearSlots, candidatesBySlot);

    const total =
        candidatesBySlot.head.length *
        candidatesBySlot.chest.length *
        candidatesBySlot.arms.length *
        candidatesBySlot.waist.length *
        candidatesBySlot.legs.length *
        candidatesBySlot.charm.length;

    let tried = 0;
    let pruned = 0;
    let found = 0;

    let lastReport = performance.now();
    const report = (force = false) => {
        if (!onProgress) return;
        const now = performance.now();
        if (force || now - lastReport > 50) {
            lastReport = now;
            onProgress({ tried, found, pruned, total });
        }
    };

    const MAX_RESULTS = 10;

    // ---- Beam settings ----
    const BEAM_WIDTH = 2000;
    const TIME_LIMIT_MS = 10000;
    const START = performance.now();

    // ---- pruning predicate (NEW/CHANGED: includes weapon slots & weapon bestGain) ----
    const canStillSucceed = (st: BeamState) => {
        const remainingSkills = maxRemainingFromIndex[st.depth] ?? {};
        const remainingArmorSlots = maxSlotsRemainingFromIndex[st.depth] ?? { 1: 0, 2: 0, 3: 0 };

        // armor slots that could exist (chosen so far + best possible remaining armor slots)
        const possibleArmorSlots: SlotCounts = {
            1: st.slotsArmor[1] + remainingArmorSlots[1],
            2: st.slotsArmor[2] + remainingArmorSlots[2],
            3: st.slotsArmor[3] + remainingArmorSlots[3],
        };

        // weapon slots are fixed for every build
        const possibleWeaponSlots = FIXED_WEAPON_SLOT_COUNTS;

        for (const id of skillIds) {
            const have = st.totals[id] ?? 0;
            const maxFutureGear = remainingSkills[id] ?? 0;

            const maxFromDecos = maxDecoPossibleForSkillCombined(
                id,
                possibleArmorSlots,
                possibleWeaponSlots,
                bestGainByKind
            );

            if (have + maxFutureGear + maxFromDecos < (requiredLevels[id] ?? 0)) return false;
        }
        return true;
    };

    // ---- initialize beam ----
    const initTotals: Record<number, number> = {};
    for (const id of skillIds) initTotals[id] = 0;

    let beam: BeamState[] = [
        { depth: 0, chosen: {}, totals: initTotals, slotsArmor: { 1: 0, 2: 0, 3: 0 }, score: 0 }
    ];
    beam[0].score = scoreState(beam[0], orderedGearSlots, skillIds, requiredLevels);

    // ---- expand beam through each gear slot ----
    for (let depth = 0; depth < orderedGearSlots.length; depth++) {
        if (performance.now() - START > TIME_LIMIT_MS) break;

        const slot = orderedGearSlots[depth];
        const cands = candidatesBySlot[slot];

        const nextBeam: BeamState[] = [];

        for (const st of beam) {
            if (performance.now() - START > TIME_LIMIT_MS) break;

            for (const piece of cands) {
                tried++;

                // apply skills
                const nextTotals = { ...st.totals };
                const rs = piece.relevantSkills ?? {};
                for (const id of skillIds) {
                    const add = rs[id] ?? 0;
                    if (add) nextTotals[id] = (nextTotals[id] ?? 0) + add;
                }

                // apply ARMOR slots only (weapon slots are fixed, not from armor pieces)
                const nextSlotsArmor: SlotCounts = { ...st.slotsArmor };
                if (hasSlots(piece)) {
                    for (const raw of piece.slots ?? []) {
                        if (isSlotLevel(raw)) {
                            nextSlotsArmor[raw] += 1;
                        }
                    }
                }

                const nextChosen = { ...st.chosen, [slot]: piece };

                const ns: BeamState = {
                    depth: depth + 1,
                    chosen: nextChosen,
                    totals: nextTotals,
                    slotsArmor: nextSlotsArmor,
                    score: 0,
                };

                if (!canStillSucceed(ns)) {
                    pruned++;
                    continue;
                }

                ns.score = scoreState(ns, orderedGearSlots, skillIds, requiredLevels);
                nextBeam.push(ns);
            }
        }

        nextBeam.sort((a, b) => b.score - a.score);
        beam = nextBeam.slice(0, BEAM_WIDTH);

        report();
        if (beam.length === 0) break;
    }

    // ---- finalize best states into actual builds (solve decos only for best) ----
    const builds: Build[] = [];
    beam.sort((a, b) => b.score - a.score);

    for (const st of beam) {
        if (builds.length >= MAX_RESULTS) break;
        if (performance.now() - START > TIME_LIMIT_MS) break;
        if (st.depth !== orderedGearSlots.length) continue;

        const armorBuild: ArmorBuild = {
            head: isArmorPiece(st.chosen.head) ? st.chosen.head : null,
            chest: isArmorPiece(st.chosen.chest) ? st.chosen.chest : null,
            arms: isArmorPiece(st.chosen.arms) ? st.chosen.arms : null,
            waist: isArmorPiece(st.chosen.waist) ? st.chosen.waist : null,
            legs: isArmorPiece(st.chosen.legs) ? st.chosen.legs : null,
            charm: isCharmPiece(st.chosen.charm) ? st.chosen.charm : null,
        };

        // remaining needs AFTER gear (armor/charm skills)
        const needs: Record<number, number> = {};
        for (const id of skillIds) {
            needs[id] = Math.max(0, (requiredLevels[id] ?? 0) - (st.totals[id] ?? 0));
        }
        const allMet = skillIds.every((id) => needs[id] <= 0);

        // build per-piece slot refs for ARMOR (KEEP ORIGINAL SLOT INDEX)
        const armorSlotKeys: ArmorSlotKey[] = ["head", "chest", "arms", "waist", "legs"];
        type ArmorSlotRef = { piece: ArmorSlotKey; slotIndex: number; slotLevel: SlotLevel };
        const armorSlotRefs: ArmorSlotRef[] = [];

        for (const pieceKey of armorSlotKeys) {
            const p = armorBuild[pieceKey];
            const slots = p?.slots ?? [];

            for (let i = 0; i < slots.length; i++) {
                const L = slots[i];
                if (L === 1 || L === 2 || L === 3) {
                    // slotIndex is the REAL index in the armor's slots array (e.g. [3,2,1])
                    armorSlotRefs.push({ piece: pieceKey, slotIndex: i, slotLevel: L });
                }
            }
        }


        // NEW/CHANGED: weapon slot refs (always 3x L3, kind="weapon")
        const weaponSlotRefs: SlotRefKinded[] = [
            { kind: "weapon", slotLevel: 3 },
            { kind: "weapon", slotLevel: 3 },
            { kind: "weapon", slotLevel: 3 },
        ];

        // NEW/CHANGED: combined slotRefs with kinds
        // Order matters because solver returns placements aligned to this list.
        // Put more restrictive first (armor often has L1/L2). Weapon L3 are easiest so keep them last.
        const slotRefsKinded: SlotRefKinded[] = [
            ...armorSlotRefs.map((r) => ({ kind: "armor" as const, slotLevel: r.slotLevel })),
            ...weaponSlotRefs,
        ];

        // Decorations result structure:
        // - armor per piece arrays
        // - weapon array length 3
        const decorations: BuildDecorations = {
            head: [],
            chest: [],
            arms: [],
            waist: [],
            legs: [],
            weapon: [], // NEW/CHANGED
        };

        if (slotRefsKinded.length === 0) {
            if (!allMet) continue;
        } else if (allMet) {
            // fill empties for armor slots
            for (const ref of armorSlotRefs) {
                decorations[ref.piece][ref.slotIndex] = { slotLevel: ref.slotLevel, decoration: null };
            }
            // fill empties for weapon slots
            decorations.weapon = [
                { slotLevel: 3, decoration: null },
                { slotLevel: 3, decoration: null },
                { slotLevel: 3, decoration: null },
            ];
        } else {
            // fast feasibility check (avoid expensive solve if hopeless)
            const armorCounts: SlotCounts = { 1: 0, 2: 0, 3: 0 };
            for (const r of armorSlotRefs) armorCounts[r.slotLevel]++;

            const weaponCounts: SlotCounts = FIXED_WEAPON_SLOT_COUNTS;

            let possible = true;
            for (const id of skillIds) {
                const maxFromDecos = maxDecoPossibleForSkillCombined(id, armorCounts, weaponCounts, bestGainByKind);
                if ((st.totals[id] ?? 0) + maxFromDecos < (requiredLevels[id] ?? 0)) {
                    possible = false;
                    break;
                }
            }
            if (!possible) continue;

            // solve kinded decos across armor+weapon slots
            const solvedFlat = solveDecorationsCached(needs, slotRefsKinded);
            if (!solvedFlat) continue;

            // Build full refs with identity (armor refs + weapon refs)
            const fullSlotRefs: SlotRefFull[] = [
                ...armorSlotRefs.map((r) => ({
                    kind: "armor" as const,
                    piece: r.piece,
                    slotIndex: r.slotIndex,
                    slotLevel: r.slotLevel,
                })),
                { kind: "weapon" as const, weaponIndex: 0, slotLevel: 3 },
                { kind: "weapon" as const, weaponIndex: 1, slotLevel: 3 },
                { kind: "weapon" as const, weaponIndex: 2, slotLevel: 3 },
            ];

            // Re-pack solved decorations into the smallest fitting slots
            const packed = packDecorationsToSmallestSlots(fullSlotRefs, solvedFlat);

            // Write packed results back into BuildDecorations
            for (const ref of fullSlotRefs) {
                const placement = packed.get(ref)!;

                if (ref.kind === "armor") {
                    decorations[ref.piece][ref.slotIndex] = placement;
                } else {
                    decorations.weapon[ref.weaponIndex] = placement;
                }
            }
        }

        const bonuses = getBonuses(armorBuild, data.armorBySlot);

        builds.push({
            armor: armorBuild,
            bonuses: {
                skillSetBonuses: bonuses.skillSetBonuses,
                groupBonuses: bonuses.groupBonuses,
            },
            weapon: FIXED_WEAPON,
            decorations,
        });

        found = builds.length;
        report(true);
    }

    report(true);
    return builds;
}

/* =========================================================
   KEEP EVERYTHING BELOW AS-IS
   (getBonuses, getGearWithReqSkills, addRelevantSkillsToSlot,
    getMaxSkillsPerSlot, createMaxRemainingFromIndex, maxBy,
    buildBestGainPerSlotLevel, groupDecosByMaxSlot, solveDecorations,
    addSlots/removeSlots, etc.)
========================================================= */


function getBonuses(build: ArmorBuild, armorBySlot: ArmorBySlot) {
    const armorSlots = ["head", "chest", "arms", "waist", "legs"] as const;
    const armorSets: number[] = []

    armorSlots.forEach((slot) => {
        const piece = build[slot];
        if (piece?.armorSet?.id) {
            armorSets.push(piece.armorSet.id);
        }
    })

    /*
    - Count num of repeated numbers e.g. [3, 3, 3, 48, 53] 3: 3, 48: 1, 53: 1
    - Check for ID in armorSets
    - Check
     */

    const counts = armorSets.reduce<Record<number, number>>((accumulator, currentValue) => {
        // If the number already exists as a key, increment its count.
        // Otherwise, initialize it to 1.
        accumulator[currentValue] = (accumulator[currentValue] || 0) + 1;
        return accumulator;
    }, {});

    const skillSetBonusIds = new Set<number>();
    const groupBonusIds = new Set<number>();

    Object.keys(counts).forEach((key) => {
        const setId = Number(key);
        const set = armorBySlot.armorSets.find(s => s.id === setId);
        if (!set) return;

        const setBonus = set.bonus;
        if (setBonus && counts[setId] >= (setBonus.ranks[0]?.pieces ?? Infinity)) {
            skillSetBonusIds.add(setBonus.skill.id);
        }

        const groupBonus = set.groupBonus;
        if (groupBonus && counts[setId] >= (groupBonus.ranks[0]?.pieces ?? Infinity)) {
            groupBonusIds.add(groupBonus.skill.id);
        }
    });

    const skillSetBonuses = [...skillSetBonusIds];
    const groupBonuses = [...groupBonusIds];

    console.log(skillSetBonuses);
    console.log(groupBonuses);

    return {skillSetBonuses, groupBonuses};
}

function getGearWithReqSkills(weaponKind: string | null, filters: SkillFilter[], weapons: Weapon[], armorBySlot: ArmorBySlot, charms: CharmRank[]) {
    const candidateWeapons = weapons.filter(w => w.kind === weaponKind);

    const weaponsWithRelevant: GearWithRelevantSkills<Weapon>[] = addRelevantSkillsToSlot(candidateWeapons, filters);
    const headsWithRelevant: GearWithRelevantSkills<Armor>[] = addRelevantSkillsToSlot(armorBySlot.head, filters);
    const chestsWithRelevant: GearWithRelevantSkills<Armor>[] = addRelevantSkillsToSlot(armorBySlot.chest, filters);
    const armsWithRelevant: GearWithRelevantSkills<Armor>[] = addRelevantSkillsToSlot(armorBySlot.arms, filters);
    const waistsWithRelevant: GearWithRelevantSkills<Armor>[] = addRelevantSkillsToSlot(armorBySlot.waist, filters);
    const legsWithRelevant: GearWithRelevantSkills<Armor>[] = addRelevantSkillsToSlot(armorBySlot.legs, filters);
    const charmsWithRelevant: GearWithRelevantSkills<CharmRank>[] = addRelevantSkillsToSlot(charms, filters);

    const hasSkills = (item: { relevantSkills: Record<number, number> }) =>
        Object.keys(item.relevantSkills).length > 0;

    const gearWithReqSkills = {
        weapons: weaponsWithRelevant,
        heads: headsWithRelevant,
        chests: chestsWithRelevant,
        arms: armsWithRelevant,
        waists: waistsWithRelevant,
        legs: legsWithRelevant,
        charms: charmsWithRelevant,
    }

    function hasRelevantSkills(gearSlot: GearWithRelevantSkills<Armor | Weapon>[]) {
        return gearSlot.filter(piece => hasSkills(piece)).length > 0 ? weaponsWithRelevant.filter(piece => hasSkills(piece)) : weaponsWithRelevant.sort((a, b) => b.rarity - a.rarity)
    }
    // sort((a, b) => Number(hasSkills(b)) - Number(hasSkills(a)) || b.rarity - a.rarity)

    console.log("Gear with req skills:")
    console.log(gearWithReqSkills);

    return gearWithReqSkills
}

function addRelevantSkillsToSlot<T extends Weapon | Armor | CharmRank>(gearSlot: T[], filters: SkillFilter[]): GearWithRelevantSkills<T>[] {
    const relevantIds = new Set(filters.map(f => f.skillId));

    return gearSlot.map(piece => {
        const relevantSkills: RelevantSkillsMap = {};

        piece.skills.forEach(pieceSkill => {
            const id = pieceSkill.skill?.id;
            if (!id || !relevantIds.has(id)) return;

            // If items might have the same skill twice, you can choose sum or max.
            // For MH-style stuff, max per piece is usually fine:
            relevantSkills[id] = pieceSkill.level ?? 0;
        });

        return { ...piece, relevantSkills };
    });
}

function getMaxSkillsPerSlot(gearWithReqSkills: GearWithReqSkills, skills: SkillFilter[]) {

    const maxSkillPerSlot: MaxSkillsPerSlotMap = {
        head: {},
        chest: {},
        arms: {},
        waist: {},
        legs: {},
        charm: {},
    }
    const maxSkillsSlots: (keyof MaxSkillsPerSlotMap)[] = [
        "head",
        "chest",
        "arms",
        "waist",
        "legs",
        "charm"
    ]
    const gearSlots: (keyof GearWithReqSkills)[] = [
        "heads",
        "chests",
        "arms",
        "waists",
        "legs",
        "charms"
    ];

    gearSlots.forEach((gearSlot, index) => {
        const max = maxBy(gearWithReqSkills[gearSlot], skills)
        maxSkillPerSlot[maxSkillsSlots[index]] = max;
    })

    return maxSkillPerSlot;

}

function maxBy(
    gearSlot: GearWithRelevantSkills<Armor>[] | GearWithRelevantSkills<CharmRank>[],
    skills: SkillFilter[]
) {
    const maxSkills: Record<number, number> = {}
    skills.forEach((skill) => {
        // This will add a record into maxSkills - skillId: skillLevel (e.g. 95: 2)
        const levels = gearSlot
            .map(piece => piece.relevantSkills[skill.skillId])
            .filter((lvl): lvl is number => typeof lvl === "number");

        // If no piece has this skill, decide what you want:
        //  - 0        → "no contribution"
        //  - or skip  → don't add it at all
        maxSkills[skill.skillId] = levels.length ? Math.max(...levels) : 0;
    })
    return maxSkills;
}

