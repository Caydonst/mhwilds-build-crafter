type SkillRank = {
    id: number,
    name: string,
    description: string,
    level: number
    skill?: {
        id: number;
        name?: string;
        gameId?: number;
    }
}
type SkillIcon = {
    id: number,
    kind: string,
}
export type Skill = {
    id: number,
    name: string,
    description: string,
    ranks: SkillRank[],
    kind: string,
    icon: SkillIcon
}
export type SkillFilter = {
    id: number;
    skillId: number;
    name: string;
    level: number;
}
/** ---------- Shared / Utility Types ---------- **/

export type Rank = 'low' | 'high' | 'master'; // :contentReference[oaicite:0]{index=0}

export interface WeaponDamage {
    raw: number;
    display: number;
}

export interface Sharpness {
    red: number;
    orange: number;
    yellow: number;
    green: number;
    blue: number;
    white: number;
    purple: number;
}

/** Decoration slots are just numbers in the API */
export type DecorationSlot = number;

/** Stub of an item used in crafting costs */
export interface CraftingItem {
    id: number;
    gameId: number;
    name: string;
    description: string;
    rarity: number;
    value: number;
    carryLimit: number;
    // recipes / icon exist in the API but are omitted here
}

/** Generic crafting cost entry (used by armor + weapons) */
export interface CraftingCost {
    quantity: number;
    item: CraftingItem;
}


/** ---------- Armor ---------- **/

export type ArmorKind = 'head' | 'chest' | 'arms' | 'waist' | 'legs'; // :contentReference[oaicite:5]{index=5}

export interface ArmorDefense {
    base: number;
    max: number;
}

export interface ArmorResistances {
    fire: number;
    water: number;
    ice: number;
    thunder: number;
    dragon: number;
}

export interface ArmorSetStub {
    id: number;
    name?: string;
    gameId?: number;
}

export interface ArmorCrafting {
    id: number;
    zennyCost: number;
    materials: CraftingCost[];
}

/**
 * Armor pieces (head/chest/arms/waist/legs)
 */
export interface Armor {
    id: number;
    name: string;
    description: string;
    kind: ArmorKind;
    rank: Rank;
    rarity: number;
    defense: ArmorDefense;
    resistances: ArmorResistances;
    /**
     * Decoration slots. Position = slot index, value = max decoration level. :contentReference[oaicite:6]{index=6}
     */
    slots: number[];
    /**
     * Skill ranks directly on the armor piece.
     */
    skills: SkillRank[];
    /**
     * Armor set this piece belongs to (if any).
     */
    armorSet: ArmorSetStub | null;
    crafting: ArmorCrafting;
} // :contentReference[oaicite:7]{index=7}

interface ArmorSetBonusRank {
    id: number;
    pieces: number;
    skill: Skill;
}

interface ArmorSetBonus {
    id: number;
    skill: SkillRank
    ranks: ArmorSetBonusRank[];
}
export interface ArmorSet {
    id: number;
    gameId: number;
    name: string;
    pieces: Armor[];
    bonus: ArmorSetBonus;
}

export interface ArmorBySlot {
    head: Armor[];
    chest: Armor[];
    arms: Armor[];
    waist: Armor[];
    legs: Armor[];
    armorSets: ArmorSet[]
}

/** ---------- Weapons ---------- **/

export type WeaponKind =
    | 'bow'
    | 'charge-blade'
    | 'dual-blades'
    | 'great-sword'
    | 'gunlance'
    | 'hammer'
    | 'heavy-bowgun'
    | 'hunting-horn'
    | 'insect-glaive'
    | 'lance'
    | 'light-bowgun'
    | 'long-sword'
    | 'switch-axe'
    | 'sword-shield'; // from Weapon Types table :contentReference[oaicite:8]{index=8}

export type SpecialKind = 'element' | 'status'; // two subtypes listed for WeaponSpecial :contentReference[oaicite:9]{index=9}

export interface WeaponSpecial {
    id: number;
    damage: WeaponDamage;
    hidden: boolean;
    kind: SpecialKind;
    // Depending on kind, one of these will be present:
    element?: string; // Element enum in docs
    status?: string;  // Status enum in docs
} // :contentReference[oaicite:10]{index=10}

export interface WeaponSeries {
    id: number;
    gameId: number;
    name?: string;
}

export interface WeaponCrafting {
    id: number;
    craftable: boolean;
    previous: Weapon | null;
    branches: Weapon[];
    craftingZennyCost: number;
    craftingMaterials: CraftingCost[];
    upgradeZennyCost: number;
    upgradeMaterials: CraftingCost[];
    row: number;
    column: number;
} // :contentReference[oaicite:11]{index=11}

/**
 * Base weapon shape – fields present on all weapons, per docs.
 * Specific weapon types (Bow, Gunlance, etc.) add their own fields on top of this.
 */
export interface Weapon {
    id: number;
    gameId: number;             // unique per kind
    kind: WeaponKind;
    name: string;
    rarity: number;
    damage: WeaponDamage;
    specials: WeaponSpecial[];
    /**
     * Not present on bows/bowguns.
     */
    sharpness?: Sharpness;
    /**
     * Handicraft breakpoints. Not present on bows/bowguns.
     */
    handicraft?: number[];
    /**
     * Skills granted by the weapon.
     */
    skills: SkillRank[];
    defenseBonus: number;
    /**
     * Null if weapon does not apply elderseal.
     */
    elderseal: 'low' | 'average' | 'high' | null; // from Elderseal enum :contentReference[oaicite:12]{index=12}
    /**
     * Base affinity; can be negative.
     */
    affinity: number;
    /**
     * Decoration slots on the weapon.
     */
    slots: DecorationSlot[];
    crafting: WeaponCrafting;
    /**
     * Series this weapon belongs to; null for Artian etc. :contentReference[oaicite:13]{index=13}
     */
    series: WeaponSeries | null;
} // :contentReference[oaicite:14]{index=14}


/** ---------- Charms ---------- **/

export interface CharmRankCrafting {
    craftable: boolean;
    zennyCost: number;
    materials: CraftingCost[];
}

export interface CharmRankSkill {
    id: number;
    level: number;
    description: string;
    skill: {
        id: number;
        name: string;
        description?: string | null;
    };
}

interface CharmIdentifier {
    id: number
}

export interface CharmRank {
    charm: CharmIdentifier;
    id: number;
    name: string;
    description: string;
    level: number;
    rarity: number;
    skills: CharmRankSkill[];
    crafting: CharmRankCrafting;
}

/**
 * A Charm object represents an equipment item that grants one or more skills,
 * and has multiple available ranks.
 */
export interface Charm {
    id: number;
    gameId: number;
    ranks: CharmRank[];
}

/** A single skill entry on a Decoration */
export interface DecorationSkill {
    id: number;
    level: number;
    description: string;
    skill: {
        id: number;
        name: string;
    };
}

/** Decoration Icon info */
export interface DecorationIcon {
    color: string;
    colorId: number;
}

/**
 * Decoration object from the Wilds API
 * GET /decorations/{id}
 */
export interface Decoration {
    id: number;
    gameId: number;
    name: string;
    description: string;
    slot: number;
    rarity: number;
    kind: string;                // DecorationKind enum if defined elsewhere
    skills: DecorationSkill[];
    icon: DecorationIcon;
}

export interface SetBonusSkill {
    name: string;
    level: number;
}

export type Build = {
    //weapon: Weapon | null;
    head: Armor;
    chest: Armor;
    arms: Armor;
    waist: Armor;
    legs: Armor;
    charm: CharmRank;
    setBonusSkills: SetBonusSkill[];
}

export interface GearWithReqSkills {
    heads: GearWithRelevantSkills<Armor>[];
    chests: GearWithRelevantSkills<Armor>[];
    arms: GearWithRelevantSkills<Armor>[];
    waists: GearWithRelevantSkills<Armor>[];
    legs: GearWithRelevantSkills<Armor>[];
    charms: GearWithRelevantSkills<CharmRank>[];
}

export type RelevantSkillsMap = Record<number, number>; // skillId -> level

export type GearWithRelevantSkills<T extends Weapon | Armor | CharmRank> = T & {
    relevantSkills: RelevantSkillsMap;
};

export interface MaxSkillsPerSlotMap {
    head: MaxSkills;
    chest: MaxSkills;
    arms: MaxSkills;
    waist: MaxSkills;
    legs: MaxSkills;
    charm: MaxSkills;
}

type MaxSkills = Record<number, number>;
