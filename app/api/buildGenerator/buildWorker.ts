// buildWorker.ts
import { fetchWeapons, getArmorByKind, fetchIndividualCharms, fetchDecorations, fetchSkills } from "@/app/api/apiCalls/apiCalls";
import { generateBuild } from "./buildGenerator";

let cache: any = null;

async function ensureDataLoaded() {
    if (cache) return cache;

    const [weapons, armorBySlot, charms, decorations, skills] = await Promise.all([
        fetchWeapons(),
        getArmorByKind(),
        fetchIndividualCharms(),
        fetchDecorations(),
        fetchSkills(),
    ]);

    cache = { weapons, armorBySlot, charms, decorations, skills };
    return cache;
}

self.onmessage = async (e) => {
    try {
        const { skillFilters, weaponKind } = e.data;

        const data = await ensureDataLoaded();

        const builds = generateBuild(skillFilters, weaponKind, data, (p) => {
            (self as any).postMessage({ type: "progress", payload: p });
        });

        (self as any).postMessage({ type: "done", payload: builds });
    } catch (err: any) {
        (self as any).postMessage({
            type: "error",
            payload: { message: err?.message ?? String(err), stack: err?.stack ?? null },
        });
    }
};
