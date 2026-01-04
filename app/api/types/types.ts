type SkillRank = {
    id: number,
    name: string,
    description: string,
    level: number
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

type Weapon = {
    id: number;
    type: string;
    name: string;
    rarity: number;
}
type Armor = {
    id: number;
    name: string;
    rarity: number;
}
type Charm = {
    id: number;
    name: string;
    rarity: number;
}

export type Build = {
    weapon: Weapon | null;
    helmet: Armor | null;
    chest: Armor | null;
    arms: Armor | null;
    waist: Armor | null;
    boots: Armor | null;
    talisman: Charm | null;
}