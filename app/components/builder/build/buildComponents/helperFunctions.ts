// --- Aggregate skills: { [skillId]: { skill, totalLevel: [current, max] } }
import type {Skill as SkillType, DecorationSkill, DecoPlacement} from "@/app/api/types/types";

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

