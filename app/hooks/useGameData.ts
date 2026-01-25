// hooks/useGameData.ts
import useSWR from "swr";
import fetchAll from "@/app/api/apiCalls/apiCalls";

export function useGameData() {
    const { data, error, isLoading, mutate } = useSWR("game-data", fetchAll);
//{ weapons, armorBySlot, charms, decorations, skills };
    return {
        data,
        skills: data?.skills ?? [],
        weapons: data?.weapons ?? [],
        armorBySlot: data?.armorBySlot ?? null,
        charms: data?.charms ?? [],
        decorations: data?.decorations ?? [],
        isLoading,
        error,
        refresh: mutate, // manually refetch if you ever need it
    };
}
