import {
    Armor,
    ArmorBySlot, ArmorSet,
    Charm,
    CharmRank,
    Decoration,
    Skill,
    Weapon
} from "@/app/api/types/types";

export async function fetchWeapons(): Promise<Weapon[]> {
    const url = "https://wilds.mhdb.io/en/weapons"; // Example API

    try {
        const response = await fetch(url);

        // 3. Handle non-OK HTTP responses (e.g., 404 Not Found)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 4. Parse the JSON response and cast it to the User interface
        const weaponData: Weapon[] = await response.json();
        return weaponData;

    } catch (error) {
        // 5. Handle network errors or errors thrown above
        console.error("Error fetching weapons:", error);
        throw error; // Re-throw the error if necessary for the caller to handle
    }
}

export async function fetchArmorSets(): Promise<ArmorSet[]> {
    const url = "https://wilds.mhdb.io/en/armor/sets"; // Example API

    try {
        const response = await fetch(url);

        // 3. Handle non-OK HTTP responses (e.g., 404 Not Found)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 4. Parse the JSON response and cast it to the User interface
        const armorData: ArmorSet[] = await response.json();
        return armorData;

    } catch (error) {
        // 5. Handle network errors or errors thrown above
        console.error("Error fetching armor:", error);
        throw error; // Re-throw the error if necessary for the caller to handle
    }
}

export async function getArmorByKind() {
    const armorSets: ArmorSet[] = await fetchArmorSets();

    const head: Armor[] = armorSets.flatMap(set => set.pieces).filter(piece => piece.kind === "head" && piece.rarity >= 6);
    const chest: Armor[] = armorSets.flatMap(set => set.pieces).filter(piece => piece.kind === "chest" && piece.rarity >= 6);
    const arms: Armor[] = armorSets.flatMap(set => set.pieces).filter(piece => piece.kind === "arms" && piece.rarity >= 6);
    const waist: Armor[] = armorSets.flatMap(set => set.pieces).filter(piece => piece.kind === "waist" && piece.rarity >= 6);
    const legs: Armor[] = armorSets.flatMap(set => set.pieces).filter(piece => piece.kind === "legs" && piece.rarity >= 6);

    return { head, chest, arms, waist, legs, armorSets };
}

export async function fetchCharms(): Promise<Charm[]> {
    const url = "https://wilds.mhdb.io/en/charms"; // Example API

    try {
        const response = await fetch(url);

        // 3. Handle non-OK HTTP responses (e.g., 404 Not Found)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 4. Parse the JSON response and cast it to the User interface
        const charmData: Charm[] = await response.json();
        return charmData;

    } catch (error) {
        // 5. Handle network errors or errors thrown above
        console.error("Error fetching charms:", error);
        throw error; // Re-throw the error if necessary for the caller to handle
    }
}

export async function fetchIndividualCharms(): Promise<CharmRank[]> {
    const charms: Charm[] = await fetchCharms();

    let individualCharms: CharmRank[] = [];
    charms.forEach(charm => {
        charm.ranks.forEach((rank) => {
            individualCharms.push(rank);
        })
    })

    individualCharms = individualCharms.filter(charm => charm.rarity >= 6)

    return individualCharms;
}
export async function fetchDecorations(): Promise<Decoration[]> {
    const url = "https://wilds.mhdb.io/en/decorations"; // Example API

    try {
        const response = await fetch(url);

        // 3. Handle non-OK HTTP responses (e.g., 404 Not Found)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 4. Parse the JSON response and cast it to the User interface
        const decoData: Decoration[] = await response.json();
        return decoData;

    } catch (error) {
        // 5. Handle network errors or errors thrown above
        console.error("Error fetching decorations:", error);
        throw error; // Re-throw the error if necessary for the caller to handle
    }
}
export async function fetchSkills(): Promise<Skill[]> {
    const url = "https://wilds.mhdb.io/en/skills"; // Example API

    try {
        const response = await fetch(url);

        // 3. Handle non-OK HTTP responses (e.g., 404 Not Found)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 4. Parse the JSON response and cast it to the User interface
        const skillData: Skill[] = await response.json();
        return skillData;

    } catch (error) {
        // 5. Handle network errors or errors thrown above
        console.error("Error fetching skills:", error);
        throw error; // Re-throw the error if necessary for the caller to handle
    }
}

export let weapons: Weapon[];
export let armorBySlot: ArmorBySlot;
export let charms: CharmRank[];
export let armorSets: ArmorSet[];
export let decorations: Decoration[];
export let skills: Skill[];

export default async function fetchAll() {
    weapons = await fetchWeapons();
    console.log(weapons);

    armorBySlot = await getArmorByKind();
    console.log(armorBySlot);

    charms = await fetchIndividualCharms()
    console.log(charms)

    decorations = await fetchDecorations()
    console.log(charms)

    skills = await fetchSkills();
    console.log(skills);

    return { weapons, armorBySlot, charms, decorations, skills };
}