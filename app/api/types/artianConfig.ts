
export type ArtianPart = "attack" | "affinity";

export type ReinforcementType = {
    reinforcement: string;
    lvl: string;
};

export type ArtianConfig = {
    element: string;
    elementDamage: number;
    kind: string;
    type: string;
    raw: number;
    affinity: number;

    parts: {
        0: ArtianPart;
        1: ArtianPart;
        2: ArtianPart;
    };

    reinforcements: {
        0: ReinforcementType;
        1: ReinforcementType;
        2: ReinforcementType;
        3: ReinforcementType;
        4: ReinforcementType;
    };

    tarredDevice?: string;

    bonuses?: {
        setBonus?: string;
        groupBonus?: string;
    };
};
