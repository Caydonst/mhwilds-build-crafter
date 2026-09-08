import styles from "./page.module.css";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

import Decoration from "./decoration";

import type {
  Decoration as DecoType,
  BuilderBuild,
  BuildDecorations,
} from "@/app/api/types/types";

import React, { useMemo, useState } from "react";

import { useGameData } from "@/app/hooks/useGameData";

type ArmorSlotKey =
  | "weapon"
  | "head"
  | "chest"
  | "arms"
  | "waist"
  | "legs"
  | "charm";

interface Props {
  decoSlotIndex: number;
  slotLevel: number;
  kind: string;
  decoSelectorOpen: boolean;
  setDecoSelectorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  build: BuilderBuild;
  setBuild: React.Dispatch<React.SetStateAction<BuilderBuild>>;
  type: ArmorSlotKey;
}

export default function DecoSelector({
  decoSlotIndex,
  slotLevel,
  kind,
  decoSelectorOpen,
  setDecoSelectorOpen,
  build,
  setBuild,
  type,
}: Props) {
  const { decorations } = useGameData();

  const [searchQuery, setSearchQuery] = useState("");

  const DEFAULT_DECOS: BuildDecorations = {
    weapon: [],
    head: [],
    chest: [],
    arms: [],
    waist: [],
    legs: [],
    charm: [],
  };

  const thisKind = kind === "weapon" ? "weapon" : "armor";

  const filteredDecos = useMemo(() => {
    return decorations
      .filter((deco) => deco.kind === thisKind && deco.slot <= slotLevel)
      .sort((a, b) => b.slot - a.slot);
  }, [decorations, thisKind, slotLevel]);

  const searchedDecos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return filteredDecos;
    }

    return filteredDecos.filter(
      (deco) =>
        deco.name.toLowerCase().includes(query) ||
        deco.skills.some((skill) =>
          skill.skill.name.toLowerCase().includes(query),
        ),
    );
  }, [searchQuery, filteredDecos]);

  function addDecoration(decoration: DecoType) {
    setBuild((prev) => {
      const decos = prev.decorations ?? DEFAULT_DECOS;

      const nextSlot = [...decos[type]];

      nextSlot[decoSlotIndex] = {
        slotLevel: decoration.slot,
        decoration,
      };

      return {
        ...prev,

        decorations: {
          ...decos,
          [type]: nextSlot,
        },
      };
    });

    setDecoSelectorOpen(false);
  }

  const formattedKind = thisKind.charAt(0).toUpperCase() + thisKind.slice(1);

  return (
    <div
      className={
        decoSelectorOpen
          ? `${styles.gearSelectorContainer} ${styles.open}`
          : styles.gearSelectorContainer
      }
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setDecoSelectorOpen(false);
        }
      }}
    >
      <div className={styles.gearSelectorInnerWrapper}>
        <div className={styles.gearSelectorInner}>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => setDecoSelectorOpen(false)}
            aria-label="Close decoration selector"
          >
            <XMarkIcon />
          </button>

          <div className={styles.info}>
            <div className={styles.header}>
              <div className={styles.headerText}>
                <span>DECORATIONS</span>

                <h2>Select Decoration</h2>

                <p>
                  Choose a {formattedKind.toLowerCase()} decoration up to slot
                  level {slotLevel}.
                </p>
              </div>
            </div>

            <div className={styles.searchContainer}>
              <div className={styles.searchInputWrapper}>
                <MagnifyingGlassIcon />

                <input
                  type="text"
                  placeholder="Search decorations or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.main}>
            <div className={styles.resultsHeader}>
              <p>
                {searchedDecos.length}{" "}
                {searchedDecos.length === 1 ? "decoration" : "decorations"}
              </p>
            </div>

            <div className={styles.mainInner}>
              {searchedDecos.length > 0 ? (
                searchedDecos.map((deco: DecoType) => (
                  <div key={deco.id} className={styles.decoContainer}>
                    <Decoration deco={deco} addDecoration={addDecoration} />
                  </div>
                ))
              ) : (
                <div className={styles.noResults}>
                  <h3>No decorations found</h3>

                  <p>Try another decoration name or skill.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
