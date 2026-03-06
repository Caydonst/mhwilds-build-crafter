// --- Aggregate skills: { [skillId]: { skill, totalLevel: [current, max] } }
import type {Skill as SkillType, DecorationSkill, DecoPlacement, Weapon} from "@/app/api/types/types";

type AggregatedSkill = {
    skill: SkillType;
    totalLevel: [current: number, max: number];
};

function findFullSkill(skillData: SkillType[] | null, skillId: number): SkillType | null {
    return skillData?.find((sk) => sk.id === skillId) ?? null;
}

function getMaxSkillLevel(skillData: SkillType[] | null, skillId: number): number {
    const fullSkill = skillData?.find((sk) => sk.id === skillId);
    return fullSkill?.ranks?.[fullSkill.ranks.length - 1]?.level ?? 0;
}

let baseElement = 0;
let currentElement = 0;

export function setBaseElement(elementNum: number) {
    baseElement = elementNum;
    currentElement = baseElement;
}
export function getElementDamage() {
    return currentElement;
}

export function updateElement(aggregatedSkillsMap: Record<number, AggregatedSkill>, weapon: Weapon | null) {

    let foundSkill;
    let level;

    console.log(aggregatedSkillsMap)

    if (weapon && weapon.specials) {
        Object.entries(aggregatedSkillsMap).forEach(([key, value]) => {
            if (weapon.specials[0].element && value.skill.name.toLowerCase().includes(weapon.specials[0].element)) {
                foundSkill = true;
                level = aggregatedSkillsMap[Number(key)].totalLevel[0];
                switch(level) {
                    case 1:
                        currentElement = Math.round(baseElement + 40);
                        break;
                    case 2:
                        currentElement = Math.round(baseElement * 1.10 + 50);
                        break;
                    case 3:
                        currentElement = Math.round(baseElement * 1.20 + 60);
                        break;
                    default:
                        currentElement = baseElement;
                        break;
                }
            } else if (weapon.specials[0].status && value.skill.name.toLowerCase().includes(weapon.specials[0].status)) {
                foundSkill = true;
                level = aggregatedSkillsMap[Number(key)].totalLevel[0];
                switch(level) {
                    case 1:
                        currentElement = Math.round(baseElement * 1.05 + 10);
                        break;
                    case 2:
                        currentElement = Math.round(baseElement * 1.10 + 20);
                        break;
                    case 3:
                        currentElement = Math.round(baseElement * 1.20 + 50);
                        break;
                    default:
                        currentElement = baseElement;
                        break;
                }
            }
        })
        if (!foundSkill) {
            currentElement = baseElement;
        }
    }
}

export const addSkillLevel = (skillData: SkillType[] | null, skillId: number, add: number, aggregatedSkillsMap: Record<number, AggregatedSkill>) => {
    const fullSkill = findFullSkill(skillData, skillId);
    const max = getMaxSkillLevel(skillData, skillId);

    console.log("Add: " + add);
    console.log("SkillId: " + skillId);

    if (fullSkill?.kind === "set") {
        return;
    }

    if (!aggregatedSkillsMap[skillId]) {
        const chosenSkill = fullSkill;
        if (!chosenSkill) return

        aggregatedSkillsMap[skillId] = {
            skill: chosenSkill,
            totalLevel: [0, max],
        };

    } else if (aggregatedSkillsMap[skillId].totalLevel[1] === 0 && max > 0) {
        aggregatedSkillsMap[skillId].totalLevel[1] = max;
    }

    if (aggregatedSkillsMap[skillId].totalLevel[0] === max) {
        return;
    } else if (aggregatedSkillsMap[skillId].totalLevel[0] < max && aggregatedSkillsMap[skillId].totalLevel[0] + add > max) {
        aggregatedSkillsMap[skillId].totalLevel[0] = max;
    }
    else {
        aggregatedSkillsMap[skillId].totalLevel[0] += add;
    }

    console.log(aggregatedSkillsMap[skillId].totalLevel[0], aggregatedSkillsMap[skillId].totalLevel[1]);

};

// helper to add deco skills into aggregate map
export const addDecoSkillsToAggregate = (skillData: SkillType[] | null, aggregatedSkillsMap: Record<number, AggregatedSkill>, placements?: ReadonlyArray<DecoPlacement>) => {
    if (!placements?.length) return;

    for (const placement of placements) {
        if (!placement) continue;

        const deco = placement.decoration;
        if (!deco) continue;

        for (const ds of deco.skills as DecorationSkill[]) {
            const id = ds.skill?.id;
            if (!id) continue;

            addSkillLevel(skillData, id, ds.level ?? 0, aggregatedSkillsMap);
        }
    }
};

const decorationNameMap: Record<string, string> = {
    "fire": "Blaze",
    "water": "Stream",
    "thunder": "Bolt",
    "dragon": "Dragon",
    "ice": "Frost",
    "poison": "Venom",
    "paralysis": "Paralyzer",
    "sleep": "Sleep",
    "blast": "Blast",
}

