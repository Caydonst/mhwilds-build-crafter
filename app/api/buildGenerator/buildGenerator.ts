import {Build} from "../types/types"
/*
type Weapon = {
    id: number,
    gameId: GameId,
    kind: WeaponKind,
    name: string,
    rarity: number,
    damage: WeaponDamage,
    specials: WeaponSpecial[],
    sharpness: Sharpness,
    handicraft: number[],
    skills: SkillRanks[],
    defenseBonus: number,
    elderseal: Elderseal,
    affinity: number,
    slots: DecorationSlot[],
    crafting: WeaponCrafting,
    series: WeaponSeries,
}
 */

export async function fetchWeapons(): Promise<any> {
    const url = "https://wilds.mhdb.io/en/weapons"; // Example API

    try {
        const response = await fetch(url);

        // 3. Handle non-OK HTTP responses (e.g., 404 Not Found)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 4. Parse the JSON response and cast it to the User interface
        const weaponData = await response.json();
        return weaponData;

    } catch (error) {
        // 5. Handle network errors or errors thrown above
        console.error("Error fetching weapons:", error);
        throw error; // Re-throw the error if necessary for the caller to handle
    }
}

export async function fetchArmor(): Promise<any> {
    const url = "https://wilds.mhdb.io/en/armor"; // Example API

    try {
        const response = await fetch(url);

        // 3. Handle non-OK HTTP responses (e.g., 404 Not Found)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 4. Parse the JSON response and cast it to the User interface
        const armorData = await response.json();
        return armorData;

    } catch (error) {
        // 5. Handle network errors or errors thrown above
        console.error("Error fetching armor:", error);
        throw error; // Re-throw the error if necessary for the caller to handle
    }
}

export async function fetchSkills(): Promise<any> {
    const url = "https://wilds.mhdb.io/en/skills"; // Example API

    try {
        const response = await fetch(url);

        // 3. Handle non-OK HTTP responses (e.g., 404 Not Found)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 4. Parse the JSON response and cast it to the User interface
        const skillData = await response.json();
        return skillData;

    } catch (error) {
        // 5. Handle network errors or errors thrown above
        console.error("Error fetching skills:", error);
        throw error; // Re-throw the error if necessary for the caller to handle
    }
}
let weapons: any[];
let armor;
let skills;

export default async function fetchAll() {
    weapons = await fetchWeapons();
    console.log(weapons);
    armor = await fetchArmor();
    console.log(armor);
    skills = await fetchSkills();
    console.log(skills);

    return skills;
}

export function generateBuild(skills: any, selectedWeapon: any) {
    const builds: Build[] = [];

    weapons.forEach((weapon, index) => {
        if (weapon.kind === selectedWeapon) {

            weapon.skills.forEach((weaponSkill) => {
                skills.forEach((skill) => {
                    if (weaponSkill.skill.name === skill.name && weaponSkill.level === skill.level) {
                        const build: Build = {
                            weapon: {id: index, type:weapon.kind, name: weapon.name, rarity: weapon.rarity},
                            helmet: null,
                            chest: null,
                            arms: null,
                            waist: null,
                            boots: null,
                            talisman: null,
                        }
                        builds.push(build);
                    }
                })
            })
        }
    })
    return builds;
}
