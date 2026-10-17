import type { Weapon } from "@/app/api/types/types";
import type { ArtianConfig } from "@/app/api/types/artianConfig";
import { CreateArtian } from "./helperFunctions";

type PlaceholderOptions = {
    kind: string;
    type?: "Artian" | "Gogma Artian";
    setBonus?: string;
    groupBonus?: string;
};

export function createPlaceholderArtian({
    kind,
    type = "Gogma Artian",
    setBonus,
    groupBonus,
}: PlaceholderOptions): Weapon {
    const config: ArtianConfig = {
        kind,
        type,

        element: "fire",
        elementDamage: 300,

        raw: 190,
        affinity: 5,

        parts: {
            0: "attack",
            1: "attack",
            2: "attack",
        },

        reinforcements: {
            0: { reinforcement: "Attack Boost", lvl: "I" },
            1: { reinforcement: "Attack Boost", lvl: "I" },
            2: { reinforcement: "Attack Boost", lvl: "I" },
            3: { reinforcement: "Attack Boost", lvl: "I" },
            4: { reinforcement: "Attack Boost", lvl: "I" },
        },

        tarredDevice: "Attack Focus",

        bonuses: {
            setBonus,
            groupBonus,
        },
    };

    const weapon = CreateArtian(config);

    return {
        ...weapon,
        isDefaultConfig: true,
    }
}