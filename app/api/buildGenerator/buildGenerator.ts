import {
    Build,
    Weapon,
    Armor,
    ArmorBySlot,
    Charm,
    CharmRank,
    Skill,
    SkillFilter,
    SetBonusSkill,
    GearWithReqSkills,
    GearWithRelevantSkills,
    RelevantSkillsMap,
    MaxSkillsPerSlotMap
} from "../types/types"
import {
    weapons,
    armorBySlot,
    charms,
    decorations,
    skills
} from "@/app/api/apiCalls/apiCalls";


const gearSlots = [ "head", "chest", "arms", "waist", "legs", "charm" ] as const;
type GearSlot = typeof gearSlots[number];


export function generateBuild(skillFilters: SkillFilter[], weaponKind: string | null) {
    // Filter out "empty" filters
    const filters = skillFilters.filter(skill => skill.skillId !== -1);
    const filteredDecos = decorations.filter(decoration => decoration.skills.some(decoSkill => skillFilters.some(skill => skill.skillId === decoSkill.skill.id)))
    console.log("Filtered Decos:");
    console.log(filteredDecos);

    if (!weaponKind || filters.length === 0) {
        return []; // we'll just return an array of builds
    }

    // --- 1. Prepare skill bookkeeping ---

    const skillIds: number[] = [];
    const requiredLevels: Record<number, number> = {};
    const currentSkillTotals: Record<number, number> = {};
    const setBonusSkills: SetBonusSkill[] = [];

    for (const filter of filters) {
        const id = filter.skillId;
        skillIds.push(id);
        requiredLevels[id] = filter.level;
        currentSkillTotals[id] = 0; // start with zero for each required skill
    }

    // --- 2. Preprocess gear ---

    const gearWithReqSkills: GearWithReqSkills = getGearWithReqSkills(weaponKind, filters);


    let maxSkillsPerSlot: MaxSkillsPerSlotMap = {
        head: {},
        chest: {},
        arms: {},
        waist: {},
        legs: {},
        charm: {},
    };

    maxSkillsPerSlot = getMaxSkillsPerSlot(gearWithReqSkills, filters);

    const maxRemainingFromIndex = createMaxRemainingFromIndex(filters, maxSkillsPerSlot);

    // Map from slot name → candidate pieces in that slot
    const candidatesBySlot: Record<GearSlot, any[]> = {
        head:  gearWithReqSkills.heads,
        chest: gearWithReqSkills.chests,
        arms:  gearWithReqSkills.arms,
        waist: gearWithReqSkills.waists,
        legs:  gearWithReqSkills.legs,
        charm: gearWithReqSkills.charms,
    };

    // --- 3. Search state ---

    const builds: Build[] = [];
    const chosenPieces: Partial<Record<GearSlot, any>> = {};
    const MAX_RESULTS = 10; // you can tweak or remove this if you want everything

    // --- 4. Recursive search function ---

    function search(slotIndex: number) {
        // Base case: all slots filled
        if (slotIndex === gearSlots.length) {
            // Check if we meet all requiredLevels exactly
            for (const skillId of skillIds) {
                if (currentSkillTotals[skillId] < requiredLevels[skillId]) {
                    return; // not a valid build
                }
            }

            // Build a Build object from chosenPieces
            const build: Build = {
                // You can attach weapon later if you want; for now we just store armor + charm
                head:  chosenPieces.head ?? {},
                chest: chosenPieces.chest ?? {},
                arms:  chosenPieces.arms ?? {},
                waist: chosenPieces.waist ?? {},
                legs:  chosenPieces.legs ?? {},
                charm: chosenPieces.charm ?? {},
                //setBonusSkills: setBonusSkills
            };

            const armorSlots = ["head", "chest", "arms", "waist", "legs"] as const;
            const armorSets = []
            let counts;

            armorSlots.forEach((slot, index) => {
                const piece = build[slot];
                if (piece?.armorSet?.id) {
                    armorSets.push(piece.armorSet.id);
                    //const armorSetName = armorBySlot.armorSets.filter(set => set.id === piece.armorSet?.id)
                    //armorSets.push(armorSetName[0].bonus?.skill?.name)
                }
            })

            /*
            - Count num of repeated numbers e.g. [3, 3, 3, 48, 53] 3: 3, 48: 1, 53: 1
            - Check for ID in armorSets
            - Check
             */

            //console.log(armorSets);
            counts = armorSets.reduce((accumulator, currentValue) => {
                // If the number already exists as a key, increment its count.
                // Otherwise, initialize it to 1.
                accumulator[currentValue] = (accumulator[currentValue] || 0) + 1;
                return accumulator;
            }, {});
            console.log(counts);

            

            builds.push(build);
            return;
        }

        // Optional: stop if enough builds found
        if (builds.length >= MAX_RESULTS) return;

        const slot = gearSlots[slotIndex];
        const candidates = candidatesBySlot[slot];

        for (const piece of candidates) {
            // 1) Apply this piece's skills (delta tracking for backtracking)
            const delta: Record<number, number> = {};

            for (const skillId of skillIds) {
                const add = piece.relevantSkills[skillId] ?? 0;
                if (add !== 0) {
                    delta[skillId] = add;
                    currentSkillTotals[skillId] += add;
                }
            }

            // 2) Prune if impossible to meet requirements from here
            let impossible = false;
            const remaining = maxRemainingFromIndex[slotIndex + 1];

            for (const skillId of skillIds) {
                const current = currentSkillTotals[skillId];
                const maxFuture = remaining[skillId]; // max we can still gain
                const required = requiredLevels[skillId];

                // If even with perfect future pieces we can't hit required → prune
                if (current + maxFuture < required) {
                    impossible = true;
                    break;
                }
            }

            if (!impossible) {
                // 3) Choose this piece and go deeper
                chosenPieces[slot] = piece;
                search(slotIndex + 1);
                delete chosenPieces[slot];
            }

            // 4) Backtrack skill totals
            for (const idStr of Object.keys(delta)) {
                const id = Number(idStr);
                currentSkillTotals[id] -= delta[id];
            }

            if (builds.length >= MAX_RESULTS) return;
        }
    }

    search(0);

    return builds;
}

function getGearWithReqSkills(weaponKind: string | null, filters: SkillFilter[]) {
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

    // sort each slot by rarity (highest -> lowest)
    Object.values(gearWithReqSkills).forEach(slot => {
        slot.sort((a, b) => b.rarity - a.rarity);
    });

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

function createMaxRemainingFromIndex(skills: SkillFilter[], maxSkillsPerSlot: MaxSkillsPerSlotMap) {
    const maxRemainingFromIndex: Record<number, Record<number, number>> = {};
    const entry: Record<number, number> = {};
    const index = gearSlots.length;

    for (let i = index; i >= 0; i--) {
        if (Object.keys(maxRemainingFromIndex).length === 0) {
            skills.forEach((skill) => {
                entry[skill.skillId] = 0
            })
            maxRemainingFromIndex[i] = entry;
        } else {
            const key = gearSlots[i]
            console.log("maxRemainingFromIndex[i+1]:")
            console.log(maxRemainingFromIndex[i+1])
            console.log("maxSkillsPerSlot[key]")
            console.log(maxSkillsPerSlot[key])
            maxRemainingFromIndex[i] = combine(maxRemainingFromIndex[i+1], maxSkillsPerSlot[key]);
        }
    }

    return maxRemainingFromIndex;

    function combine<T extends Record<string, number>>(x: T, y: T): T {
        return Object.keys(x).reduce((acc, key) => {
            acc[key as keyof T] = x[key as keyof T] + y[key as keyof T];
            return acc;
        }, {} as T);
    }
}

function checkMaxRemainingFromIndex(slotIndex: number, skillIds: number[], currentSkillTotals, maxRemainingFromIndex, required) {
    skillIds.forEach((skillId) => {
        if (currentSkillTotals[skillId] + maxRemainingFromIndex[slotIndex][skillId] <= required[skillId]) {
            return false;
        }
    })
    return true;
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

