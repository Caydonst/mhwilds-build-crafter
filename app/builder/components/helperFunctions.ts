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
