import {
    BuilderBuild,
    ArmorSet,
    ArmorSetBonus,
    ArmorSetBonusRank,
    type Armor, Skill, SkillRank,
} from "@/app/api/types/types";

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

    for (const piece of pieces) {
        if (!piece) continue;
        const setId = piece?.armorSet?.id;
        const set = armorSets.find((set) => set.id === setId);

        // IF SET IS GOGMAZIOS BETA
        if (setId === 182) {
            const gogmapocalypse = bonusesArray.find(bonus => bonus.id === 178);
            if (gogmapocalypse) {
                gogmapocalypse.count++
            } else {
                bonusesArray.push({ id: 178, count: 1 })
            }
            if (piece.id === 675) {
                const guardianArkveldsVitality = bonusesArray.find(bonus => bonus.id === 26);
                if (guardianArkveldsVitality) {
                    guardianArkveldsVitality.count++
                } else {
                    bonusesArray.push({ id: 26, count: 1 })
                }
            }
        }

        // IF SET IS GOGMAZIOS ALPHA
        if (setId === 181 && piece.id === 670) {
            const gogmapocalypse = bonusesArray.find(bonus => bonus.id === 178);
            if (gogmapocalypse) {
                gogmapocalypse.count++
            } else {
                bonusesArray.push({ id: 178, count: 1 })
            }
            if (piece.id === 670) {
                const zohShiasPulse = bonusesArray.find(bonus => bonus.id === 51);
                if (zohShiasPulse) {
                    zohShiasPulse.count++
                } else {
                    bonusesArray.push({ id: 51, count: 1 })
                }
            }
        }

        if (set) {
            // Check for set bonus
            if (set.bonus) {
                if (!(setId === 182 && set.bonus.skill.id === 26)) {
                    const setBonus = bonusesArray.find(bonus => bonus.id === set?.bonus?.skill.id);
                    if (setBonus) {
                        setBonus.count++
                    } else {
                        bonusesArray.push({ id: set.bonus.skill.id, count: 1 })
                    }
                }
            }
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
                if (skill.skill.kind === "set") {
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

    const setBonuses = [];
    const groupBonuses = [];

    //const setBonus = armorSets.find(set => set.id === setId)?.bonus?.skill.name;
    //const groupBonus = armorSets.find(set => set.id === setId)?.groupBonus?.skill.name;

    const set = armorSets.find(set => set.id === setId);
    //const groupBonus = armorSets.find(set => set.id === setId);

    if (set) {
        if (set.id === 182) {
            setBonuses.push("Gogmapocalypse");
        } else {
            if (set.bonus) {
                setBonuses.push(set.bonus.skill.name);
            }
        }
        if (set.groupBonus) {
            groupBonuses.push(set.groupBonus.skill.name);
        }
    }

    if (piece.id === 670) {
        setBonuses.push("Zoh Shia's Pulse")
    }
    if (piece.id === 675) {
        setBonuses.push("Guardian Arkveld's Vitality")
    }

    piece.skills.forEach(skill => {
        if (skill.skill.kind === "set") {
            setBonuses.push(skill.skill.name);
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
    const buildArmor = [build.head, build.arms, build.waist, build.legs];
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
        buildStats.raw += buildWeapon.damage.raw;
        buildStats.affinity += buildWeapon.affinity
        if (buildWeapon.specials.length > 0) {
            if (buildWeapon.specials[0].status) {
                buildStats.element = buildWeapon.specials[0].status
            } else if (buildWeapon.specials[0].element) {
                buildStats.element = buildWeapon.specials[0].element
            }
            buildStats.elementDamage = buildWeapon.specials[0].damage.display;
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
