import {Weapon} from "@/app/api/types/types";

type PartType = {
    0: string;
    1: string;
    2: string;
}
type ReinforcementType = {
    reinforcement: string;
    lvl: string;
}
type ReinforcementsType = {
    0: ReinforcementType;
    1: ReinforcementType;
    2: ReinforcementType;
    3: ReinforcementType;
    4: ReinforcementType;
}
type BonusesType = {
    setBonus?: string;
    groupBonus?: string;
}
type Artian = {
    element: string;
    elementDamage: number;
    kind: string;
    type: string;
    raw: number;
    affinity: number;
    parts: PartType;
    reinforcements: ReinforcementsType;
    tarredDevice?: string;
    bonuses?: BonusesType;
}

const gogmaReinforcementBoostMap: Record<string, Record<string, number | null>> = {
    "Attack Boost": {
        "I": 5,
        "II": 6,
        "III": 9,
        "EX": 12,
    },

    "Affinity Boost": {
        "I": 5,   // percentage
        "II": 6,
        "III": 8,
        "EX": 10,
    },

    "Sharpness Boost": {
        "I": 30,
        "II": null,
        "III": null,
        "EX": 50,
    },

    "Ammo Boost": {
        "I": 1,
        "II": null,
        "III": null,
        "EX": 2,
    },
};

const elementBoostMap: Record<string, Record<string, number>> = {
    "great-sword": {
        "I": 80,
        "II": 90,
        "EX": 110,
    },
    "hammer": {
        "I": 50,
        "II": 60,
        "EX": 90,
    },
    "hunting-horn": {
        "I": 50,
        "II": 60,
        "EX": 90,
    },
    "lance": {
        "I": 50,
        "II": 60,
        "EX": 90,
    },
    "gunlance": {
        "I": 50,
        "II": 60,
        "EX": 90,
    },
    "charge-blade": {
        "I": 50,
        "II": 60,
        "EX": 80,
    },
    "long-sword": {
        "I": 50,
        "II": 60,
        "EX": 90,
    },
    "sword-and-shield": {
        "I": 30,
        "II": 50,
        "EX": 80,
    },
    "switch-axe": {
        "I": 30,
        "II": 50,
        "EX": 80,
    },
    "insect-glaive": {
        "I": 30,
        "II": 50,
        "EX": 80,
    },
    "dual-blades": {
        "I": 20,
        "II": 30,
        "EX": 50,
    },
    "bow": {
        "I": 30,
        "II": 40,
        "EX": 60,
    },
};

function getBoost() {

}

export function CreateArtian(data: Artian) {
    const weapon: Weapon = {
        "id": 999,
        "gameId": 999,
        "kind": data.kind,
        "name": data.type,
        "rarity": 8,
        "damage": {
            "raw": data.raw,
            "display": 0
        },
        "specials": [
            {
                "id": 999,
                "damage": {
                    "raw": 0,
                    "display": data.elementDamage
                },
                "hidden": false,
                "kind": "element",
                "element": data.element,
            }
        ],
        "skills": [],
        "defenseBonus": 0,
        "elderseal": null,
        "affinity": data.affinity,
        "slots": [3, 3, 3],
        "crafting": null,
        "series": null,
        "reinforcements": [],
        "bonuses": null,
        "tarredDevice": data.tarredDevice,
    }

    const newWeapon = calculateArtianStats(weapon, data, data.type);

    return newWeapon;
}

function calculateArtianStats(weapon: Weapon, data: Artian, type: string) {

    if (weapon.kind !== "bow" && weapon.kind !== "light-bowgun" && weapon.kind !== "heavy-bowgun") {
        weapon.sharpness = {
            "red": 140,
            "orange": 40,
            "yellow": 40,
            "green": 80,
            "blue": 30,
            "white": 20,
            "purple": 0
        }
    }

    (Object.entries(data.parts) as [string, string][]).forEach(([key, value]) => {
        switch (value) {
            case "attack":
                weapon.damage.raw += 5;
                break;
            case "affinity":
                weapon.affinity += 5;
                break;
            default:
                break;
        }
    });

    if (type === "Artian") {

        for (const slot of Object.values(data.reinforcements)) {
            const { reinforcement, lvl } = slot;
            let boost;

            if (reinforcement === "Select") continue;

            if (reinforcement === "Element Boost") {
                if (weapon.kind) {
                    boost = elementBoostMap[weapon.kind]["I"];
                }
            } else {
                boost = gogmaReinforcementBoostMap[reinforcement]["I"];
            }
            if (!boost) continue;

            switch (reinforcement) {
                case "Attack Boost":
                    weapon.damage.raw += boost;
                    break;

                case "Affinity Boost":
                    weapon.affinity += boost;
                    break;

                case "Sharpness Boost":
                    if (weapon.sharpness) {
                        if (weapon.sharpness.white + boost >= 70) {
                            weapon.sharpness.white = 70;
                        }
                        else {
                            weapon.sharpness.white += boost;
                        }
                    }
                    break;

                case "Ammo Boost":
                    // apply to ammo system
                    break;

                case "Element Boost":
                    weapon.specials[0].damage.display += boost
                    break;
            }
            weapon.reinforcements?.push({reinforcement: reinforcement, lvl: "I"});
        }
    }

    else if (type === "Gogma Artian") {

        if (data.bonuses?.setBonus && data.bonuses?.groupBonus) {
            console.log(data.bonuses.setBonus, data.bonuses.groupBonus)
            weapon.bonuses = {
                setBonus: data.bonuses.setBonus,
                groupBonus: data.bonuses.groupBonus,
            };
        }

        for (const slot of Object.values(data.reinforcements)) {
            const { reinforcement, lvl } = slot;
            let boost;

            if (reinforcement === "Select") continue;

            if (reinforcement === "Element Boost") {
                if (weapon.kind) {
                    boost = elementBoostMap[weapon.kind][lvl];
                }
            } else {
                boost = gogmaReinforcementBoostMap[reinforcement][lvl];
            }
            if (!boost) continue;

            switch (reinforcement) {
                case "Attack Boost":
                    weapon.damage.raw += boost;
                    break;

                case "Affinity Boost":
                    weapon.affinity += boost;
                    break;

                case "Sharpness Boost":
                    if (weapon.sharpness) {
                        if (weapon.sharpness.white + boost >= 70) {
                            weapon.sharpness.white = 70;
                        }
                        else {
                            weapon.sharpness.white += boost;
                        }
                    }
                    break;

                case "Ammo Boost":
                    // apply to ammo system
                    break;

                case "Element Boost":
                    weapon.specials[0].damage.display += boost
                    break;
            }
            weapon.reinforcements?.push({reinforcement: reinforcement, lvl: lvl});
        }
        getTarredDeviceStats(weapon);
    }


    console.log(weapon);
    return weapon
}

function getTarredDeviceStats(weapon: Weapon) {
    switch (weapon.tarredDevice) {
        case "Attack Focus":
            weapon.damage.raw += 10;
            weapon.affinity -= 15;
            if (weapon.sharpness) {
                weapon.sharpness.blue -= 10;
            }
            break;
        case "Affinity Focus":
            weapon.damage.raw -= 10;
            weapon.affinity += 10;
            if (weapon.sharpness) {
                weapon.sharpness.white -= 10;
            }
            if (weapon.kind) {
                weapon.specials[0].damage.display += tarredDeviceElementMap["Affinity"][weapon.kind];
            }
            break;
        case "Element Focus":
            weapon.affinity -= 5;
            if (weapon.sharpness) {
                weapon.sharpness.blue -= 10;
            }
            if (weapon.kind) {
                weapon.specials[0].damage.display += tarredDeviceElementMap["Element"][weapon.kind];
            }
            break;
    }
}

const tarredDeviceElementMap: Record<string, Record<string, number>> = {
    "Affinity": {
        "gunlance": 30,
        "hunting-horn": 20,

        "great-sword": -10,
        "hammer": -10,

        "long-sword": -20,
        "sword-and-shield": -20,
        "dual-blades": -20,
        "lance": -20,
        "switch-axe": -20,
        "charge-blade": -20,
        "insect-glaive": -20,
        "bow": -20,
    },
    "Element": {
        "hunting-horn": 80,
        "gunlance": 80,

        "great-sword": 50,
        "long-sword": 50,
        "lance": 50,
        "charge-blade": 50,

        "sword-and-shield": 40,
        "hammer": 40,
        "switch-axe": 40,
        "insect-glaive": 40,

        "dual-blades": 30,
        "bow": 30,
    }
}