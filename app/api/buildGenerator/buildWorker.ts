// buildWorker.ts

import {
  fetchWeapons,
  getArmorByKind,
  fetchIndividualCharms,
  fetchDecorations,
  fetchSkills,
} from "@/app/api/apiCalls/apiCalls";

import { generateBuild } from "./buildGenerator";
import type { Build } from "../types/types";

type ArtianConfig = {
  enabled: boolean;
  setBonusSkillId: number | null;
  groupBonusSkillId: number | null;
};

type WorkerRequest = {
  skillFilters: any[];
  weaponKind: any;
  artian: ArtianConfig;
};

let cache: any = null;

async function ensureDataLoaded() {
  if (cache) return cache;

  const [weapons, armorBySlot, charms, decorations, skills] = await Promise.all(
    [
      fetchWeapons(),
      getArmorByKind(),
      fetchIndividualCharms(),
      fetchDecorations(),
      fetchSkills(),
    ],
  );

  cache = {
    weapons,
    armorBySlot,
    charms,
    decorations,
    skills,
  };

  return cache;
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  try {
    const { skillFilters, weaponKind, artian } = e.data;

    const data = await ensureDataLoaded();

    const builds = await generateBuild(
      skillFilters,
      weaponKind,
      artian,
      data,
      (progress) => {
        self.postMessage({
          type: "progress",
          payload: progress,
        });
      },
      (build: Build) => {
        self.postMessage({
          type: "build_found",
          payload: build,
        });
      },
    );

    self.postMessage({
      type: "done",
      payload: builds,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? `${error.name}: ${error.message}\n${error.stack ?? ""}`
        : String(error);

    console.error("Build worker error:", error);

    self.postMessage({
      type: "error",
      payload: message,
    });
  }
};
