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

export const addSkillLevel = (skillData: SkillType[] | null, skillId: number, add: number, aggregatedSkillsMap: Record<number, AggregatedSkill>) => {
    const fullSkill = findFullSkill(skillData, skillId);
    const max = getMaxSkillLevel(skillData, skillId);

    if (fullSkill?.kind === "set") {
        return;
    }

    if (!aggregatedSkillsMap[skillId]) {
        // Prefer full skill object (has ranks/icons), else fallback
        const chosenSkill = fullSkill;
        if (!chosenSkill) return;

        aggregatedSkillsMap[skillId] = {
            skill: chosenSkill,
            totalLevel: [0, max],
        };
    } else if (aggregatedSkillsMap[skillId].totalLevel[1] === 0 && max > 0) {
        aggregatedSkillsMap[skillId].totalLevel[1] = max;
    }

    if (aggregatedSkillsMap[skillId].totalLevel[0] < max && aggregatedSkillsMap[skillId].totalLevel[0] + add > max) {
        aggregatedSkillsMap[skillId].totalLevel[0] = max;
    } else {
        aggregatedSkillsMap[skillId].totalLevel[0] += add;
    }
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

export function calculateElement(weapon: Weapon, weaponDecoSlots: DecoPlacement[]) {
    console.log("HELLOOOO")
    for (const slot of weaponDecoSlots) {
        if (slot.decoration) {
            console.log("Includes decoration")
            if (weapon.specials[0].element) {
                console.log("Includes special element")
                console.log(slot.decoration.name);
                console.log(weapon.specials[0].element);
                if (slot.decoration.name.toLowerCase().includes(weapon.specials[0].element)) {
                    console.log("Includes name")
                    for (const skill of slot.decoration.skills) {
                        if (skill.skill.name.toLowerCase().includes(weapon.specials[0].element)) {
                            console.log("Includes skill")
                            switch (skill.level) {
                                case 1:
                                    weapon.specials[0].damage.display *= 1.20 + 60;
                                    break;
                                case 2:
                                    weapon.specials[0].damage.display *= 1.10 + 50;
                                    break;
                                case 3:
                                    weapon.specials[0].damage.display += 40;
                                    break;
                            }
                        }
                    }
                }
            } else if (weapon.specials[0].status) {
                if (slot.decoration.name.includes(weapon.specials[0].status)) {
                    for (const skill of slot.decoration.skills) {
                        if (skill.skill.name.includes(weapon.specials[0].status)) {
                            switch (skill.level) {
                                case 1:
                                    weapon.specials[0].damage.display *= 1.20 + 50;
                                    break;
                                case 2:
                                    weapon.specials[0].damage.display *= 1.10 + 20;
                                    break;
                                case 3:
                                    weapon.specials[0].damage.display *= 1.05 + 10;
                                    break;
                            }
                        }
                    }
                }
            }
        }
    }

    console.log(weapon);

    return weapon;
}

