import {CharmRank, ArmorSkill, CharmRankCrafting, Skill, CustomCharm, CharmDecoSlot} from "@/app/api/types/types";
/*
export interface CharmRank {
    //charm: CharmIdentifier;
    id: number;
    name: string;
    description: string;
    level: number;
    rarity: number;
    skills: ArmorSkill[];
    crafting: CharmRankCrafting | null;
}

export interface ArmorSkill {
    description: string;
    id: number
    level: number;
    name: string | null
    skill: Skill
}

 */

type CharmSkill = {
    id: number;
    skillId: number;
    name: string;
    level: number;
}

export function createCharm(skillList: CharmSkill[], skills: Skill[], slots: string[]) {
    const decoSlots: CharmDecoSlot[] = [];
    if (!(slots.includes("None"))) {
        for (const slot of slots) {
            if (slot === "W1") {
                decoSlots.push({type: "weapon", level: 1});
            } else {
                decoSlots.push({type: "armor", level: Number(slot)});
            }
        }
    }

    const charm: CustomCharm = {
        customCharm: 1,
        id: -1,
        name: "Custom Charm",
        description: "",
        level: 1,
        rarity: 2,
        skills: [],
        crafting: null,
        slots: decoSlots,
    }

    for (const skill of skillList) {
        if (skill.skillId === -1 ) continue;
        const foundCharmSkill = skills.find((s: Skill) => s.id === skill.skillId);
        const foundCharmSkillRank = skills.find((s: Skill) => s.id === skill.skillId)?.ranks[skill.level-1];
        if (foundCharmSkillRank && foundCharmSkill) {
            foundCharmSkillRank.skill["name"] = foundCharmSkill.name;
        }
        console.log(foundCharmSkillRank);
        const charmSkill = {
            description: "",
            id: skill.skillId,
            level: skill.level,
            name: null,
            skill: {
                id: skill.skillId,
                name: "",
            },
        }
        if (foundCharmSkill) {
            charmSkill.skill.name = foundCharmSkill.name;
        }
        charm.skills.push(charmSkill)
    }

    console.log(charm);
    return charm;
}