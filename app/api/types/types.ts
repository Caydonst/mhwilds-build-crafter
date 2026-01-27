export type SkillRank = {
    id: number,
    name: string,
    description: string,
    level: number
    skill: {
        id: number;
        name: string;
        gameId: number;
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
export type SlotLevel = 1 | 2 | 3;

export function isSlotLevel(x: unknown): x is SlotLevel {
    return x === 1 || x === 2 || x === 3;
}
export type HasSlots = { slots: number[] };

export function hasSlots(x: unknown): x is HasSlots {
    return typeof x === "object" && x !== null && Array.isArray((x as HasSlots).slots);
}

export interface SlotHaving {
    slots: ReadonlyArray<number>;
}

export function isSlotHaving(x: unknown): x is SlotHaving {
    return typeof x === "object" && x !== null && Array.isArray((x as SlotHaving).slots);
}

export type DecorationKind = "armor" | "weapon";


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


/** ---------- ArmorPiece ---------- **/

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
 * ArmorPiece pieces (head/chest/arms/waist/legs)
 */
export interface ArmorSkill {
    description: string;
    id: number
    level: number;
    name: string | null
    skill: Skill
}
export interface Armor {
    id: number;
    name: string;
    description: string;
    kind: ArmorKind;
    rank: Rank;
    rarity: number;
    defense: ArmorDefense;
    resistances: ArmorResistances;
    slots: number[];
    skills: ArmorSkill[];
    armorSet: ArmorSetStub | null;
    crafting: ArmorCrafting;
}

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
    groupBonus: ArmorSetBonus;
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
    | 'sword-shield'
    | null;

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

export type BuildWeapon = Pick<Weapon, "id" | "kind" | "name" | "rarity" | "slots" | "skills">;


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
    skills: ArmorSkill[];
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
    kind: DecorationKind;                // DecorationKind enum if defined elsewhere
    skills: DecorationSkill[];
    icon: DecorationIcon;
}

export interface SetBonusSkill {
    name: string;
    level: number;
}

export type ArmorBuild = {
    head: Armor | null;
    chest: Armor | null;
    arms: Armor | null;
    waist: Armor | null;
    legs: Armor | null;
    charm: CharmRank | null;
};

interface Bonuses {
    skillSetBonuses: number[];
    groupBonuses: number[];
}

export type DecoPlacement = {
    slotLevel: SlotLevel;
    decoration: Decoration | null;
};

export type BuildDecorationSlot = "head" | "chest" | "arms" | "waist" | "legs" | "weapon";

export type BuildDecorations = Record<BuildDecorationSlot, DecoPlacement[]>;


export interface Build {
    weapon: BuildWeapon;
    armor: ArmorBuild;
    bonuses: Bonuses;
    decorations: BuildDecorations;
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

export interface BuildProgress {
    tried: number;     // leaf combos evaluated
    found: number;     // valid builds found (<=10)
    pruned: number;    // optional
    total: number;     // total upper-bound combos
}

export interface BuildData {
    weapons: Weapon[];
    armorBySlot: ArmorBySlot;
    charms: CharmRank[];
    decorations: Decoration[];
    skills: Skill[];
}

export type SkillGainMap = Record<number, number>;
export type SlotCounts = { 1: number; 2: number; 3: number };

export type BuilderBuild = {
    weapon: Weapon | null;
    head: Armor | null;
    chest: Armor | null;
    arms: Armor | null;
    waist: Armor | null;
    legs: Armor | null;
    charm: CharmRank | null;
    decorations: BuildDecorations;
}

