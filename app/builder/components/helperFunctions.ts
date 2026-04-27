import {
    BuilderBuild,
    ArmorSet,
    ArmorSetBonus,
    ArmorSetBonusRank,
    type Armor, Skill, SkillRank, Weapon,
} from "@/app/api/types/types";

import {getElementDamage, getAffinityBoost, getAttackBoost} from "@/app/components/builder/build/buildComponents/helperFunctions"

type BonusType = {
    id: number;
    count: number;
}

type Bonus = {
    bonus: Skill,
    ranks: SkillRank[]
}

/*
    Instead of storing the set ID's
    Store the skill ID's that are "set" skills

    Completely get rid of bonusesArray and just store bonuses directly into setBonuses/groupBonuses arrays
    bonus skills object:
    setBonuses = [...{ id: number, count: number}]
    groupBonuses = [...{ id: number, count: number}]
 */

export function findBonuses(build: BuilderBuild, armorSets: ArmorSet[], skills: Skill[]) {
    const bonusesArray: BonusType[] = [];
    const setBonuses: Bonus[] = [];
    const groupBonuses: Bonus[] = [];
    const pieces = [build.head, build.chest, build.arms, build.waist, build.legs];

    if (build.weapon !== null) {
        const setBonusName = build.weapon?.bonuses?.setBonus;
        const groupBonusName = build.weapon?.bonuses?.groupBonus;

        const setBonusId = skills.find(skill => skill.name === setBonusName)?.id;
        const groupBonusId = skills.find(skill => skill.name === groupBonusName)?.id;

        const foundSetBonus = bonusesArray.find(bonus => bonus.id === setBonusId);
        if (foundSetBonus) {
            foundSetBonus.count++
        } else {
            if (setBonusId) {
                bonusesArray.push({ id: setBonusId, count: 1 })
            }
        }

        const foundGroupBonus = bonusesArray.find(bonus => bonus.id === groupBonusId);
        if (foundGroupBonus) {
            foundGroupBonus.count++
        } else {
            if (groupBonusId) {
                bonusesArray.push({ id: groupBonusId, count: 1 })
            }
        }
    }

    for (const piece of pieces) {
        if (!piece) continue;
        const setId = piece?.armorSet?.id;
        const set = armorSets.find((set) => set.id === setId);

        if (set) {
            // Check for group bonus
            if (set.groupBonus) {
                const groupBonuses = bonusesArray.find(bonus => bonus.id === set?.groupBonus?.skill.id);
                if (groupBonuses) {
                    groupBonuses.count++
                } else {
                    bonusesArray.push({ id: set.groupBonus.skill.id, count: 1 })
                }
            }

            for (const skill of piece.skills) {
                if ("kind" in skill.skill && skill.skill.kind === "set") {
                    const setBonus = bonusesArray.find(bonus => bonus.id === skill.skill.id);
                    if (setBonus) {
                        setBonus.count++
                    } else {
                        bonusesArray.push({ id: skill.skill.id, count: 1 })
                    }
                }
            }
        }
    }

    for (const bonus of bonusesArray) {
        const skill = skills.find(skill => skill.id === bonus.id);
        if (skill && skill.kind === "set") {
            const bonusObj: Bonus = { bonus: skill, ranks: [] };
            if (bonus.count >= 2) {
                bonusObj.ranks.push(skill.ranks[0]);
            }
            if (bonus.count >= 4) {
                bonusObj.ranks.push(skill.ranks[1]);
            }
            setBonuses.push(bonusObj);
        }
        if (skill && skill.kind === "group") {
            const bonusObj: Bonus = { bonus: skill, ranks: [] };
            if (bonus.count >= 3) {
                bonusObj.ranks.push(skill.ranks[0]);
            }
            groupBonuses.push(bonusObj);
        }
    }

    console.log(setBonuses);

    return {bonusesArray, setBonuses, groupBonuses};
}

export function findGearPieceBonuses(piece: Armor, armorSets: ArmorSet[]) {

    const setId = piece?.armorSet?.id;

    const setBonuses: string[] = [];
    const groupBonuses: string[] = [];

    piece.skills.forEach(skill => {
        if ("kind" in skill.skill && skill.skill.kind === "set") {
            setBonuses.push(skill.skill.name);
        }
        if ("kind" in skill.skill && skill.skill.kind === "group") {
            groupBonuses.push(skill.skill.name);
        }
    })

    return { setBonuses, groupBonuses };
}

type BuildStats = {
    raw: number,
    affinity: number,
    element: string,
    elementDamage: number,
    defense: number,
    fire: number,
    water: number,
    thunder: number,
    ice: number,
    dragon: number,
}

export function updateStats(build: BuilderBuild) {
    const buildArmor = [build.head, build.chest, build.arms, build.waist, build.legs];
    const buildWeapon = build.weapon;

    const resistKeys = ["fire", "water", "thunder", "ice", "dragon"] as const;
    const RES_KEY_MAP = {
        fire: "fire",
        water: "water",
        thunder: "thunder",
        ice: "ice",
        dragon: "dragon",
    } as const;


    const buildStats: BuildStats = {
        raw: 0,
        affinity: 0,
        element: "None",
        elementDamage: 0,
        defense: 0,
        fire: 0,
        water: 0,
        thunder: 0,
        ice: 0,
        dragon: 0,
    };

    if (buildWeapon) {
        buildStats.raw += buildWeapon.damage.raw + getAttackBoost();
        buildStats.affinity += buildWeapon.affinity + getAffinityBoost()
        if (buildWeapon.specials.length > 0) {
            if (buildWeapon.specials[0].status) {
                buildStats.element = buildWeapon.specials[0].status
            } else if (buildWeapon.specials[0].element) {
                buildStats.element = buildWeapon.specials[0].element
            }
            buildStats.elementDamage = getElementDamage()
        }
    }

    for (const item of buildArmor) {
        if (!item) continue;

        buildStats.defense += item.defense.base;

        for (const k of resistKeys) {
            buildStats[RES_KEY_MAP[k]] += item.resistances[k];
        }
    }

    return buildStats;
}

export function handleTranscendence(gearPiece: Armor) {
    const transcendence = !gearPiece.transcendence;

    return {
        ...gearPiece,
        transcendence: !gearPiece.transcendence,
        slots: updateSlots(gearPiece.slots, gearPiece.rarity, transcendence),
    };
}

function updateSlots(currentSlots: number[], rarity: number, transcendence: boolean) {
    let newSlots = []
    if (transcendence) {
        switch (rarity) {
            case 5:
                for (let i = 0; i < 3; i++) {
                    if (currentSlots[i]) {
                        if (currentSlots[i] !== 3) {
                            newSlots.push(currentSlots[i] + 1);
                        }
                    } else {
                        newSlots.push(1);
                    }
                }
                break;
            case 6:
                for (let i = 0; i < 2; i++) {
                    if (currentSlots[i]) {
                        if (currentSlots[i] !== 3) {
                            newSlots.push(currentSlots[i] + 1);
                        }
                    } else {
                        newSlots.push(1);
                    }
                }
                if (currentSlots[2]) {
                    newSlots.push(1);
                }
                break;
            default:
                newSlots = [...currentSlots];
        }
    } else {
        switch (rarity) {
            case 5:
                for (let i = 0; i < 3; i++) {
                    if (currentSlots[i]) {
                        if (currentSlots[i] !== 1) {
                            newSlots.push(currentSlots[i] - 1);
                        }
                    }
                }
                break;
            case 6:
                for (let i = 0; i < 2; i++) {
                    if (currentSlots[i]) {
                        if (currentSlots[i] !== 1) {
                            newSlots.push(currentSlots[i] - 1);
                        }
                    }
                }
                if (currentSlots[2]) {
                    newSlots.push(currentSlots[2]);
                }
                break;
            default:
                newSlots = [...currentSlots];
        }
    }
    console.log("Current slots: " + currentSlots);
    console.log("New slots: " + newSlots);
    return newSlots;
}

export function updateBuild(updatedBuild: BuilderBuild) {
    localStorage.setItem("savedBuild", JSON.stringify(updatedBuild));
}
