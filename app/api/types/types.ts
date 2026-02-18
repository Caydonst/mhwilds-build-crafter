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

export type Rank = 'low' | 'high' | 'master';

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

export interface ArmorSetBonusRank {
    id: number;
    pieces: number;
    skill: Skill;
}

export interface ArmorSetBonus {
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
    | string
    | null

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
export type SpecialKind = 'element' | 'status';

export interface WeaponSpecial {
    id: number;
    damage: WeaponDamage;
    hidden: boolean;
    kind: SpecialKind;
    element?: string;
    status?: string;
}

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

export interface Weapon {
    id: number;
    gameId: number;
    kind: WeaponKind;
    name: string;
    rarity: number;
    damage: WeaponDamage;
    specials: WeaponSpecial[];
    sharpness?: Sharpness;
    handicraft?: number[];
    skills: SkillRank[];
    defenseBonus: number;
    elderseal: 'low' | 'average' | 'high' | null;
    affinity: number;
    slots: DecorationSlot[];
    crafting: WeaponCrafting | null;
    series: WeaponSeries | null;
    reinforcements?: string[];
}

export interface ArtianWeapon {
    name: string;
    rarity: number;
    damage: WeaponDamage;
    specials: WeaponSpecial[];
    sharpness?: Sharpness;
    affinity: number;
    slots: DecorationSlot[];
}

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
    slot: SlotLevel;
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

