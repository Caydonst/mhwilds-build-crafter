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
    Skill,
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
type WeaponWithRelevant = (Weapon | BuildWeapon) & {
    relevantSkills: RelevantSkillsMap;
};
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

export type ArtianConfig = {
    enabled: boolean;
    setBonusSkillId: number | null;
    groupBonusSkillId: number | null;
};

type BonusRequirement = {
    skillId: number;
    level: number;
    requiredPieces: number;
};

type BonusCounts = Record<number, number>;

function getSetBonusPiecesForLevel(level: number): number {
    if (level >= 2) return 4;
    return 2;
}

function getGroupBonusPiecesForLevel(_level: number): number {
    return 3;
}

function getArmorSetForPiece(
    piece: GearPiece | undefined,
    armorBySlot: ArmorBySlot,
) {
    if (!piece || !isArmorPiece(piece)) {
        return null;
    }

    const armorSetId = piece.armorSet?.id;

    if (!armorSetId) {
        return null;
    }

    return (
        armorBySlot.armorSets.find(
            (armorSet) => armorSet.id === armorSetId,
        ) ?? null
    );
}

function getPieceBonusContributions(
    piece: GearPiece | undefined,
    armorBySlot: ArmorBySlot,
) {
    const setBonuses: BonusCounts = {};
    const groupBonuses: BonusCounts = {};

    const armorSet = getArmorSetForPiece(
        piece,
        armorBySlot,
    );

    if (!armorSet) {
        return {
            setBonuses,
            groupBonuses,
        };
    }

    if (armorSet.bonus) {
        setBonuses[armorSet.bonus.skill.id] = 1;
    }

    if (armorSet.groupBonus) {
        groupBonuses[armorSet.groupBonus.skill.id] = 1;
    }

    return {
        setBonuses,
        groupBonuses,
    };
}

function createArtianWeapon(
    weaponKind: Exclude<WeaponKind, null>,
): BuildWeapon {
    return {
        id: -999999,
        name: "Artian Weapon",
        kind: weaponKind,
        rarity: 8,
        slots: [3, 3, 3],
        skills: [],
    };
}

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

    weapon: WeaponWithRelevant;

    totals: Record<number, number>;

    setBonusCounts: BonusCounts;
    groupBonusCounts: BonusCounts;

    slotsArmor: SlotCounts;
    slotsWeapon: SlotCounts;

    score: number;
};

// prefer meeting requirements, plus slots, plus rarity
function scoreState(
    st: BeamState,
    orderedGearSlots: GearSlot[],
    skillIds: number[],
    requiredLevels: Record<number, number>,
    setBonusRequirements: BonusRequirement[],
    groupBonusRequirements: BonusRequirement[],
) {
    let satisfied = 0;
    let remaining = 0;

    for (const id of skillIds) {
        const have = st.totals[id] ?? 0;
        const req = requiredLevels[id] ?? 0;

        satisfied += Math.min(have, req);
        remaining += Math.max(0, req - have);
    }

    const armorSlotVal =
        st.slotsArmor[1] * 1 +
        st.slotsArmor[2] * 3 +
        st.slotsArmor[3] * 9;

    const weaponSlotVal =
        st.slotsWeapon[1] * 1 +
        st.slotsWeapon[2] * 3 +
        st.slotsWeapon[3] * 9;

    const slotVal =
        armorSlotVal +
        weaponSlotVal;

    let raritySum = st.weapon.rarity ?? 0;

    for (let i = 0; i < st.depth; i++) {
        const k = orderedGearSlots[i];
        raritySum += st.chosen[k]?.rarity ?? 0;
    }

    let bonusSatisfied = 0;
    let bonusRemaining = 0;

    for (const requirement of setBonusRequirements) {
        const have =
            st.setBonusCounts[
            requirement.skillId
            ] ?? 0;

        bonusSatisfied += Math.min(
            have,
            requirement.requiredPieces,
        );

        bonusRemaining += Math.max(
            0,
            requirement.requiredPieces - have,
        );
    }

    for (const requirement of groupBonusRequirements) {
        const have =
            st.groupBonusCounts[
            requirement.skillId
            ] ?? 0;

        bonusSatisfied += Math.min(
            have,
            requirement.requiredPieces,
        );

        bonusRemaining += Math.max(
            0,
            requirement.requiredPieces - have,
        );
    }

    return (
        // Requested normal skills
        satisfied * 10_000 -
        remaining * 2_000 +

        // Requested set/group bonus progress
        bonusSatisfied * 25_000 -
        bonusRemaining * 5_000 +

        // Secondary optimization
        slotVal * 200 +
        raritySum * 50
    );
}

function selectBestBeamStates(
    states: BeamState[],
    beamWidth: number,
    setBonusRequirements: BonusRequirement[],
    groupBonusRequirements: BonusRequirement[],
): BeamState[] {
    if (states.length <= beamWidth) {
        return states.sort((a, b) => b.score - a.score);
    }

    // No set/group requirements: normal beam search.
    if (
        setBonusRequirements.length === 0 &&
        groupBonusRequirements.length === 0
    ) {
        states.sort((a, b) => b.score - a.score);
        return states.slice(0, beamWidth);
    }

    const buckets = new Map<string, BeamState[]>();

    for (const state of states) {
        const progress: number[] = [];

        for (const requirement of setBonusRequirements) {
            progress.push(
                Math.min(
                    state.setBonusCounts[requirement.skillId] ?? 0,
                    requirement.requiredPieces,
                ),
            );
        }

        for (const requirement of groupBonusRequirements) {
            progress.push(
                Math.min(
                    state.groupBonusCounts[requirement.skillId] ?? 0,
                    requirement.requiredPieces,
                ),
            );
        }

        const key = progress.join("|");

        let bucket = buckets.get(key);

        if (!bucket) {
            bucket = [];
            buckets.set(key, bucket);
        }

        bucket.push(state);
    }

    const groups = [...buckets.values()];

    for (const group of groups) {
        group.sort((a, b) => b.score - a.score);
    }

    const selected: BeamState[] = [];

    const perBucketLimit = Math.max(
        1,
        Math.floor(beamWidth / groups.length),
    );

    const leftovers: BeamState[] = [];

    // First pass: preserve states from each progress bucket.
    for (const group of groups) {
        const take = Math.min(
            group.length,
            perBucketLimit,
            beamWidth - selected.length,
        );

        for (let i = 0; i < take; i++) {
            selected.push(group[i]);
        }

        // Don't spread the remaining states.
        for (let i = take; i < group.length; i++) {
            leftovers.push(group[i]);
        }

        if (selected.length >= beamWidth) {
            break;
        }
    }

    // Second pass: fill remaining capacity by score.
    if (selected.length < beamWidth) {
        leftovers.sort((a, b) => b.score - a.score);

        const remaining = beamWidth - selected.length;

        for (
            let i = 0;
            i < remaining && i < leftovers.length;
            i++
        ) {
            selected.push(leftovers[i]);
        }
    }

    selected.sort((a, b) => b.score - a.score);

    return selected;
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

function getArmorSetData(
    piece: GearPiece | undefined,
    armorBySlot: ArmorBySlot,
) {
    if (!piece || !isArmorPiece(piece)) {
        return null;
    }

    const armorSetId = piece.armorSet?.id;

    if (!armorSetId) {
        return null;
    }

    return (
        armorBySlot.armorSets.find(
            (armorSet) => armorSet.id === armorSetId,
        ) ?? null
    );
}

function armorPieceMatchesSetBonus(
    piece: GearPiece | undefined,
    skillId: number | null,
    armorBySlot: ArmorBySlot,
): boolean {
    if (skillId === null) {
        return false;
    }

    const armorSet = getArmorSetData(
        piece,
        armorBySlot,
    );

    return armorSet?.bonus?.skill.id === skillId;
}

function armorPieceMatchesGroupBonus(
    piece: GearPiece | undefined,
    skillId: number | null,
    armorBySlot: ArmorBySlot,
): boolean {
    if (skillId === null) {
        return false;
    }

    const armorSet = getArmorSetData(
        piece,
        armorBySlot,
    );

    return armorSet?.groupBonus?.skill.id === skillId;
}

/* =========================================================
   MAIN
========================================================= */

export async function generateBuild(
    skillFilters: SkillFilter[],
    weaponKind: WeaponKind | null,
    artian: ArtianConfig,
    data: BuildData,
    onProgress?: (p: BuildProgress) => void,
    onBuildFound?: (build: Build) => void,
) {
    const filters = skillFilters.filter(
        (skill) => skill.skillId !== -1,
    );

    const skillById = new Map<number, Skill>(
        data.skills.map((skill) => [
            skill.id,
            skill,
        ]),
    );

    const normalFilters: SkillFilter[] = [];
    const setBonusFilters: SkillFilter[] = [];
    const groupBonusFilters: SkillFilter[] = [];

    for (const filter of filters) {
        const skill = skillById.get(filter.skillId);

        if (!skill) {
            continue;
        }

        if (skill.kind === "set") {
            setBonusFilters.push(filter);
            continue;
        }

        if (skill.kind === "group") {
            groupBonusFilters.push(filter);
            continue;
        }

        normalFilters.push(filter);
    }

    const setBonusRequirements: BonusRequirement[] =
        setBonusFilters.map((filter) => ({
            skillId: filter.skillId,
            level: filter.level,
            requiredPieces:
                getSetBonusPiecesForLevel(filter.level),
        }));

    const groupBonusRequirements: BonusRequirement[] =
        groupBonusFilters.map((filter) => ({
            skillId: filter.skillId,
            level: filter.level,
            requiredPieces:
                getGroupBonusPiecesForLevel(filter.level),
        }));

    const filteredDecos = data.decorations.filter((decoration) =>
        decoration.skills.some((decoSkill) =>
            normalFilters.some(
                (skill) =>
                    skill.skillId === decoSkill.skill.id,
            ),
        ),
    );

    if (!weaponKind || filters.length === 0) return [];

    if (
        artian.enabled &&
        (
            artian.setBonusSkillId === null ||
            artian.groupBonusSkillId === null
        )
    ) {
        return [];
    }

    // --- 1. Prepare skill bookkeeping ---
    const skillIds: number[] = [];
    const requiredLevels: Record<number, number> = {};
    for (const filter of normalFilters) {
        const id = filter.skillId;
        skillIds.push(id);
        requiredLevels[id] = filter.level;
    }

    // --- 1.5 Preprocess decorations helpers (NEW/CHANGED: kind-aware) ---
    const bestGainByKind =
        buildBestGainPerSlotLevelAndKind(
            normalFilters,
            filteredDecos,
        );
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
    const gearWithReqSkills: GearWithReqSkills =
        getGearWithReqSkills(
            weaponKind,
            normalFilters,
            data.weapons,
            data.armorBySlot,
            data.charms,
        );

    let weaponCandidates: WeaponWithRelevant[];

    if (artian.enabled) {
        const artianWeapon = createArtianWeapon(weaponKind);

        const artianSkills = [
            artian.setBonusSkillId,
            artian.groupBonusSkillId,
        ]
            .filter((id): id is number => id !== null)
            .map((id) => {
                const skill = skillById.get(id);

                return skill ? { skill, level: 1 } : null;
            })
            .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

        artianWeapon.skills = artianSkills;

        weaponCandidates = [
            {
                ...artianWeapon,
                relevantSkills: {},
            },
        ];
    } else {
        weaponCandidates =
            gearWithReqSkills.weapons as WeaponWithRelevant[];
    }

    if (weaponCandidates.length === 0) {
        return [];
    }

    let maxSkillsPerSlot: MaxSkillsPerSlotMap = {
        head: {},
        chest: {},
        arms: {},
        waist: {},
        legs: {},
        charm: {},
    };

    maxSkillsPerSlot =
        getMaxSkillsPerSlot(
            gearWithReqSkills,
            normalFilters,
        );

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
    const maxRemainingFromIndex =
        createMaxRemainingFromIndexForOrder(
            normalFilters,
            maxSkillsPerSlot,
            orderedGearSlots,
        );
    const maxSlotsRemainingFromIndex = createMaxSlotsRemainingFromIndex(orderedGearSlots, candidatesBySlot);

    const total =
        weaponCandidates.length *
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

    // BEAM SETTINGS
    const MAX_RESULTS = 10;

    const BEAM_WIDTH = 500;

    const SEARCH_TIME_LIMIT_MS = 30000;
    const FINALIZATION_TIME_LIMIT_MS = 10000;

    const FINALIZATION_BATCH_SIZE = 10;

    const START = performance.now();

    const canStillSucceed = (st: BeamState) => {
        const remainingSkills =
            maxRemainingFromIndex[st.depth] ?? {};

        const remainingArmorSlots =
            maxSlotsRemainingFromIndex[st.depth] ?? {
                1: 0,
                2: 0,
                3: 0,
            };

        /*
         * =====================================================
         * NORMAL SKILLS
         * =====================================================
         */

        const possibleArmorSlots: SlotCounts = {
            1:
                st.slotsArmor[1] +
                remainingArmorSlots[1],

            2:
                st.slotsArmor[2] +
                remainingArmorSlots[2],

            3:
                st.slotsArmor[3] +
                remainingArmorSlots[3],
        };

        const possibleWeaponSlots =
            st.slotsWeapon;

        for (const id of skillIds) {
            const have =
                st.totals[id] ?? 0;

            const maxFutureGear =
                remainingSkills[id] ?? 0;

            const maxFromDecos =
                maxDecoPossibleForSkillCombined(
                    id,
                    possibleArmorSlots,
                    possibleWeaponSlots,
                    bestGainByKind,
                );

            if (
                have +
                maxFutureGear +
                maxFromDecos <
                (requiredLevels[id] ?? 0)
            ) {
                return false;
            }
        }

        /*
         * =====================================================
         * SET BONUS REQUIREMENTS
         * =====================================================
         *
         * These come ONLY from Selected Skills.
         *
         * Artian may already have contributed +1 to
         * st.setBonusCounts during beam initialization,
         * but selecting an Artian bonus does NOT itself
         * create a requirement.
         * =====================================================
         */

        for (const requirement of setBonusRequirements) {
            const currentPieces =
                st.setBonusCounts[
                requirement.skillId
                ] ?? 0;

            /*
             * Already satisfied.
             */
            if (
                currentPieces >=
                requirement.requiredPieces
            ) {
                continue;
            }

            let possibleRemainingPieces = 0;

            /*
             * Check each remaining armor slot to see
             * whether at least one candidate in that slot
             * can contribute to this requested set bonus.
             */
            for (
                let i = st.depth;
                i < orderedGearSlots.length;
                i++
            ) {
                const remainingSlot =
                    orderedGearSlots[i];

                /*
                 * Charms cannot contribute toward
                 * armor set bonuses.
                 */
                if (remainingSlot === "charm") {
                    continue;
                }

                const candidates =
                    candidatesBySlot[remainingSlot];

                const slotCanProvideBonus =
                    candidates.some((candidate) =>
                        armorPieceMatchesSetBonus(
                            candidate,
                            requirement.skillId,
                            data.armorBySlot,
                        ),
                    );

                if (slotCanProvideBonus) {
                    possibleRemainingPieces++;
                }
            }

            /*
             * If even the absolute best remaining armor
             * choices cannot reach the required piece
             * count, kill this branch.
             */
            if (
                currentPieces +
                possibleRemainingPieces <
                requirement.requiredPieces
            ) {
                return false;
            }
        }

        /*
         * =====================================================
         * GROUP BONUS REQUIREMENTS
         * =====================================================
         */

        for (const requirement of groupBonusRequirements) {
            const currentPieces =
                st.groupBonusCounts[
                requirement.skillId
                ] ?? 0;

            if (
                currentPieces >=
                requirement.requiredPieces
            ) {
                continue;
            }

            let possibleRemainingPieces = 0;

            for (
                let i = st.depth;
                i < orderedGearSlots.length;
                i++
            ) {
                const remainingSlot =
                    orderedGearSlots[i];

                if (remainingSlot === "charm") {
                    continue;
                }

                const candidates =
                    candidatesBySlot[remainingSlot];

                const slotCanProvideBonus =
                    candidates.some((candidate) =>
                        armorPieceMatchesGroupBonus(
                            candidate,
                            requirement.skillId,
                            data.armorBySlot,
                        ),
                    );

                if (slotCanProvideBonus) {
                    possibleRemainingPieces++;
                }
            }

            if (
                currentPieces +
                possibleRemainingPieces <
                requirement.requiredPieces
            ) {
                return false;
            }
        }

        return true;
    };

    // ---- initialize beam ----
    let beam: BeamState[] = weaponCandidates.map((weapon) => {
        const totals: Record<number, number> = {};

        for (const id of skillIds) {
            totals[id] = weapon.relevantSkills[id] ?? 0;
        }

        const initialSetBonusCounts: BonusCounts = {};
        const initialGroupBonusCounts: BonusCounts = {};

        if (
            artian.enabled &&
            artian.setBonusSkillId !== null
        ) {
            initialSetBonusCounts[
                artian.setBonusSkillId
            ] = 1;
        }

        if (
            artian.enabled &&
            artian.groupBonusSkillId !== null
        ) {
            initialGroupBonusCounts[
                artian.groupBonusSkillId
            ] = 1;
        }

        const state: BeamState = {
            depth: 0,

            chosen: {},

            weapon,

            totals,

            setBonusCounts: {
                ...initialSetBonusCounts,
            },

            groupBonusCounts: {
                ...initialGroupBonusCounts,
            },

            slotsArmor: {
                1: 0,
                2: 0,
                3: 0,
            },

            slotsWeapon: countSlots(weapon),

            score: 0,
        };

        state.score = scoreState(
            state,
            orderedGearSlots,
            skillIds,
            requiredLevels,
            setBonusRequirements,
            groupBonusRequirements,
        );

        return state;
    });

    beam = selectBestBeamStates(
        beam,
        BEAM_WIDTH,
        setBonusRequirements,
        groupBonusRequirements,
    );

    // ---- expand beam through each gear slot ----
    for (let depth = 0; depth < orderedGearSlots.length; depth++) {
        if (
            performance.now() - START >
            SEARCH_TIME_LIMIT_MS
        ) {
            break;
        }

        const slot = orderedGearSlots[depth];
        const cands = candidatesBySlot[slot];

        const nextBeam: BeamState[] = [];

        for (const st of beam) {
            if (
                performance.now() - START >
                SEARCH_TIME_LIMIT_MS
            ) {
                break;
            }

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

                const nextChosen = {
                    ...st.chosen,
                    [slot]: piece,
                };

                const nextSetBonusCounts = {
                    ...st.setBonusCounts,
                };

                const nextGroupBonusCounts = {
                    ...st.groupBonusCounts,
                };

                if (isArmorPiece(piece)) {
                    const contributions =
                        getPieceBonusContributions(
                            piece,
                            data.armorBySlot,
                        );

                    for (
                        const [skillIdString, amount]
                        of Object.entries(
                            contributions.setBonuses,
                        )
                    ) {
                        const skillId =
                            Number(skillIdString);

                        nextSetBonusCounts[skillId] =
                            (nextSetBonusCounts[skillId] ?? 0) +
                            amount;
                    }

                    for (
                        const [skillIdString, amount]
                        of Object.entries(
                            contributions.groupBonuses,
                        )
                    ) {
                        const skillId =
                            Number(skillIdString);

                        nextGroupBonusCounts[skillId] =
                            (nextGroupBonusCounts[skillId] ?? 0) +
                            amount;
                    }
                }

                const ns: BeamState = {
                    depth: depth + 1,

                    chosen: nextChosen,

                    weapon: st.weapon,

                    totals: nextTotals,

                    setBonusCounts:
                        nextSetBonusCounts,

                    groupBonusCounts:
                        nextGroupBonusCounts,

                    slotsArmor: nextSlotsArmor,

                    slotsWeapon: st.slotsWeapon,

                    score: 0,
                };

                if (!canStillSucceed(ns)) {
                    pruned++;
                    continue;
                }

                ns.score = scoreState(
                    ns,
                    orderedGearSlots,
                    skillIds,
                    requiredLevels,
                    setBonusRequirements,
                    groupBonusRequirements,
                );

                nextBeam.push(ns);
            }
        }

        beam = selectBestBeamStates(
            nextBeam,
            BEAM_WIDTH,
            setBonusRequirements,
            groupBonusRequirements,
        );

        report();
        if (beam.length === 0) break;
    }

    // ---- finalize best states into actual builds (solve decos only for best) ----
    const builds: Build[] = [];

    beam.sort((a, b) => b.score - a.score);

    const finalizationStart = performance.now();

    let processedFinalizationStates = 0;

    for (const st of beam) {
        if (builds.length >= MAX_RESULTS) break;

        if (
            performance.now() - finalizationStart >
            FINALIZATION_TIME_LIMIT_MS
        ) {
            break;
        }

        processedFinalizationStates++;

        if (
            processedFinalizationStates %
            FINALIZATION_BATCH_SIZE === 0
        ) {
            report(true);

            await new Promise<void>((resolve) =>
                setTimeout(resolve, 0),
            );
        }

        if (st.depth !== orderedGearSlots.length) continue;

        const setBonusesMet =
            setBonusRequirements.every(
                (requirement) =>
                    (
                        st.setBonusCounts[
                        requirement.skillId
                        ] ?? 0
                    ) >= requirement.requiredPieces,
            );

        if (!setBonusesMet) {
            continue;
        }

        const groupBonusesMet =
            groupBonusRequirements.every(
                (requirement) =>
                    (
                        st.groupBonusCounts[
                        requirement.skillId
                        ] ?? 0
                    ) >= requirement.requiredPieces,
            );

        if (!groupBonusesMet) {
            continue;
        }

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

        const weaponSlotRefs: WeaponSlotRef[] = [];

        const selectedWeaponSlots = st.weapon.slots ?? [];

        for (let i = 0; i < selectedWeaponSlots.length; i++) {
            const slotLevel = selectedWeaponSlots[i];

            if (isSlotLevel(slotLevel)) {
                weaponSlotRefs.push({
                    kind: "weapon",
                    weaponIndex: i,
                    slotLevel,
                });
            }
        }

        const slotRefsKinded: SlotRefKinded[] = [
            ...armorSlotRefs.map((r) => ({
                kind: "armor" as const,
                slotLevel: r.slotLevel,
            })),

            ...weaponSlotRefs.map((r) => ({
                kind: "weapon" as const,
                slotLevel: r.slotLevel,
            })),
        ];

        const decorations: BuildDecorations = {
            head: [],
            chest: [],
            arms: [],
            waist: [],
            legs: [],
            weapon: [],
            charm: [],
        };

        if (slotRefsKinded.length === 0) {
            if (!allMet) continue;
        } else if (allMet) {
            // fill empties for armor slots
            for (const ref of armorSlotRefs) {
                decorations[ref.piece][ref.slotIndex] = { slotLevel: ref.slotLevel, decoration: null };
            }

            decorations.weapon = weaponSlotRefs.map((ref) => ({
                slotLevel: ref.slotLevel,
                decoration: null,
            }));

        } else {
            // fast feasibility check (avoid expensive solve if hopeless)
            const armorCounts: SlotCounts = { 1: 0, 2: 0, 3: 0 };
            for (const r of armorSlotRefs) armorCounts[r.slotLevel]++;

            const weaponCounts: SlotCounts = st.slotsWeapon;

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

                ...weaponSlotRefs,
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

        const finalSkillLevels: Record<number, number> = {
            ...st.totals,
        };

        for (const placements of Object.values(decorations)) {
            if (!Array.isArray(placements)) continue;

            for (const placement of placements) {
                const deco = placement?.decoration;

                if (!deco) continue;

                for (const entry of deco.skills) {
                    const id = entry.skill.id;

                    finalSkillLevels[id] =
                        (finalSkillLevels[id] ?? 0) + entry.level;
                }
            }
        }

        const missingRequirements = skillIds.filter(
            (id) =>
                (finalSkillLevels[id] ?? 0) <
                (requiredLevels[id] ?? 0),
        );

        if (missingRequirements.length > 0) {
            console.warn(
                "[Build Generator] Rejected incomplete build",
                {
                    weapon: st.weapon.name,
                    weaponSlots: st.weapon.slots,
                    missingRequirements: missingRequirements.map(
                        (id) => ({
                            skillId: id,
                            required: requiredLevels[id],
                            actual: finalSkillLevels[id] ?? 0,
                        }),
                    ),
                },
            );

            continue;
        }

        const bonuses = getBonuses(
            armorBuild,
            data.armorBySlot,
            artian,
        );

        const {
            relevantSkills: _relevantSkills,
            ...selectedWeapon
        } = st.weapon;


        const build: Build = {
            armor: armorBuild,
            bonuses,
            weapon: selectedWeapon as BuildWeapon,
            decorations,
        };

        builds.push(build);

        found = builds.length;

        onBuildFound?.(build);

        report(true);

        await new Promise<void>((resolve) =>
            setTimeout(resolve, 0),
        );
    }

    report(true);

    console.log("[Build Generator]", {
        requestedSetBonuses: setBonusRequirements,
        requestedGroupBonuses: groupBonusRequirements,
        completedStates: beam.filter(
            (state) => state.depth === orderedGearSlots.length,
        ).length,
        results: builds.length,
        elapsedMs: Math.round(
            performance.now() - START,
        ),
        timedOut:
            performance.now() - START >= SEARCH_TIME_LIMIT_MS,
    });

    return builds;
}


function getBonuses(
    build: ArmorBuild,
    armorBySlot: ArmorBySlot,
    artian: ArtianConfig,
) {
    const armorSlots = ["head", "chest", "arms", "waist", "legs"] as const;

    const setBonusCounts = new Map<number, number>();
    const groupBonusCounts = new Map<number, number>();

    for (const slot of armorSlots) {
        const piece = build[slot];

        if (!piece?.armorSet?.id) continue;

        const set = armorBySlot.armorSets.find(
            (armorSet) => armorSet.id === piece.armorSet?.id,
        );

        if (!set) continue;

        if (set.bonus) {
            const skillId = set.bonus.skill.id;

            setBonusCounts.set(
                skillId,
                (setBonusCounts.get(skillId) ?? 0) + 1,
            );
        }

        if (set.groupBonus) {
            const skillId = set.groupBonus.skill.id;

            groupBonusCounts.set(
                skillId,
                (groupBonusCounts.get(skillId) ?? 0) + 1,
            );
        }
    }

    // Artian weapon counts as one piece toward its selected bonuses.
    if (artian.enabled) {
        if (artian.setBonusSkillId !== null) {
            setBonusCounts.set(
                artian.setBonusSkillId,
                (setBonusCounts.get(artian.setBonusSkillId) ?? 0) + 1,
            );
        }

        if (artian.groupBonusSkillId !== null) {
            groupBonusCounts.set(
                artian.groupBonusSkillId,
                (groupBonusCounts.get(artian.groupBonusSkillId) ?? 0) + 1,
            );
        }
    }

    const skillSetBonuses: {
        skillId: number;
        level: number;
    }[] = [];

    const groupBonuses: {
        skillId: number;
        level: number;
    }[] = [];

    // Set bonuses:
    // Lv 1 = 2 pieces
    // Lv 2 = 4 pieces
    for (const [skillId, pieces] of setBonusCounts) {
        let level = 0;

        if (pieces >= 4) {
            level = 2;
        } else if (pieces >= 2) {
            level = 1;
        }

        if (level > 0) {
            skillSetBonuses.push({
                skillId,
                level,
            });
        }
    }

    // Group bonuses:
    // Lv 1 = 3 pieces
    for (const [skillId, pieces] of groupBonusCounts) {
        if (pieces >= 3) {
            groupBonuses.push({
                skillId,
                level: 1,
            });
        }
    }

    return {
        skillSetBonuses,
        groupBonuses,
    };
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

    const gearWithReqSkills = {
        weapons: weaponsWithRelevant,
        heads: headsWithRelevant,
        chests: chestsWithRelevant,
        arms: armsWithRelevant,
        waists: waistsWithRelevant,
        legs: legsWithRelevant,
        charms: charmsWithRelevant,
    }

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

