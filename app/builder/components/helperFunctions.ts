import {
    BuilderBuild,
    ArmorSet,
    ArmorSetBonus,
    ArmorSetBonusRank,
    type Armor,
} from "@/app/api/types/types";

type BonusType = {
    id: number;
    count: number;
}

type Bonus = {
    bonus: ArmorSetBonus,
    ranks: ArmorSetBonusRank[]
}

export function findBonuses(build: BuilderBuild, armorSets: ArmorSet[]) {
    const bonusesArray: BonusType[] = [];
    const setBonuses: Bonus[] = [];
    const groupBonuses: Bonus[] = [];
    const pieces = [build.head, build.chest, build.arms, build.waist, build.legs];

    for (const piece of pieces) {
        if (!piece) continue;
        const setId = piece?.armorSet?.id;
        if (setId) {
            let found;
            bonusesArray.forEach((bonus: BonusType) => {
                if (bonus.id === setId) {
                    found = true;
                    bonus.count++;
                }
            })
            if (!found) {
                bonusesArray.push({ id: setId, count: 1 })
            }
        }
    }

    for (const piece of pieces) {
        if (!piece) continue;
        for (const skill of piece.skills) {
            if (skill.skill.kind === "set") {
                let found = false;
                let set;
                bonusesArray.forEach((bonus: BonusType) => {
                    set = armorSets.find(set => set.id === bonus.id)
                    console.log("set:")
                    console.log(set);
                    if (set && set.bonus) {
                        console.log("set.bonus.skill.id")
                        console.log(set.bonus.skill.id)
                        console.log("skill.skill.id")
                        console.log(skill.skill.id)
                        if (set.bonus.skill.id === skill.skill.id) {
                            found = true;
                            bonus.count++;
                        }
                    }
                })
                if (!found) {
                    if (set) {
                        bonusesArray.push({ id: set.id, count: 1 })
                    }
                }
            }
        }
    }

    for (const bonus of bonusesArray) {
        Object.values(armorSets).forEach((set) => {
            if (set.id === bonus.id) {
                if (set.bonus) {
                    if (!setBonuses.some(bonus => bonus.bonus.id === set.id)) {
                        setBonuses.push({ bonus: set.bonus, ranks: [] });
                    }
                    set.bonus.ranks.forEach((rank) => {
                        if (bonus.count >= rank.pieces) {
                            setBonuses.forEach((bonus) => {
                                if (bonus.bonus.id === set.bonus.id) {
                                    bonus.ranks.push(rank);
                                }
                            })
                        }
                    })
                }
            }
        })
    }
    for (const bonus of bonusesArray) {
        const set = armorSets.find(set => set.id === bonus.id);
        if (set && set.groupBonus) {
            if (!groupBonuses.some(bonus => bonus.bonus.id === set.id)) {
                groupBonuses.push({ bonus: set.groupBonus, ranks: [] });
            }
            set.groupBonus.ranks.forEach((rank) => {
                if (bonus.count >= rank.pieces) {
                    groupBonuses.forEach((bonus) => {
                        if (bonus.bonus.id === set.groupBonus.id) {
                            bonus.ranks.push(rank);
                        }
                    })
                }
            })
        }
    }
    return {bonusesArray, setBonuses, groupBonuses};
}

export function findGearPieceBonuses(piece: Armor, armorSets: ArmorSet[]) {

    const setId = piece?.armorSet?.id;

    const setBonus = armorSets.find(set => set.id === setId)?.bonus?.skill.name;
    const groupBonus = armorSets.find(set => set.id === setId)?.groupBonus?.skill.name;

    return { setBonus, groupBonus };
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
