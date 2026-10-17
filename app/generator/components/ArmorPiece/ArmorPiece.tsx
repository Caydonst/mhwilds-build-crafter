import styles from "./page.module.css";

import React, { useMemo } from "react";

import type { Armor, ArmorSet, Build, CharmRank } from "@/app/api/types/types";

import { findGearPieceBonuses } from "@/app/builder/components/helperFunctions";

type ArmorSlotKey = "head" | "chest" | "arms" | "waist" | "legs";

type GearSlotKey = ArmorSlotKey | "charm";

type GeneratorGearPiece = Armor | CharmRank;

type Props = {
  gearPiece: GeneratorGearPiece | null;
  armorSets: ArmorSet[];
  slotKey: string;
  build: Build;
};

const armorIndex: Record<GearSlotKey, number> = {
  head: 14,
  chest: 15,
  arms: 16,
  waist: 17,
  legs: 18,
  charm: 19,
};

const slotLabelMap: Record<GearSlotKey, string> = {
  head: "Head",
  chest: "Chest",
  arms: "Arms",
  waist: "Waist",
  legs: "Legs",
  charm: "Charm",
};

function isArmorPiece(piece: GeneratorGearPiece | null): piece is Armor {
  return !!piece && "kind" in piece;
}

function isCharmRank(piece: GeneratorGearPiece | null): piece is CharmRank {
  return !!piece && "charm" in piece && !("kind" in piece);
}

export default function ArmorPiece({
  gearPiece,
  armorSets,
  slotKey,
  build,
}: Props) {
  const normalizedSlot = slotKey as GearSlotKey;

  const findBonuses = useMemo(() => {
    if (isArmorPiece(gearPiece) && armorSets) {
      return findGearPieceBonuses(gearPiece, armorSets);
    }

    return undefined;
  }, [gearPiece, armorSets]);

  const backgroundPosition = useMemo(() => {
    if (!gearPiece) {
      return undefined;
    }

    const rarity = gearPiece.rarity ?? 0;

    const spriteX =
      normalizedSlot === "charm"
        ? armorIndex.charm
        : isArmorPiece(gearPiece)
          ? armorIndex[gearPiece.kind]
          : armorIndex.charm;

    return `calc((-64px * ${spriteX}) * var(--generator-build-icon-size))
                calc((-64px * ${rarity}) * var(--generator-build-icon-size))`;
  }, [gearPiece, normalizedSlot]);

  const visibleSkills = useMemo(() => {
    if (!gearPiece) {
      return [];
    }

    if (isArmorPiece(gearPiece)) {
      return gearPiece.skills.filter(
        (skill) =>
          "kind" in skill.skill &&
          skill.skill.kind !== "set" &&
          skill.skill.kind !== "group",
      );
    }

    return gearPiece.skills;
  }, [gearPiece]);

  const slots = gearPiece && !isCharmRank(gearPiece) ? gearPiece.slots : [];

  return (
    <div className={styles.armorPiece}>
      <div className={styles.mainContent}>
        <div className={styles.iconWrapper}>
          {gearPiece ? (
            <span
              className={styles.buildPieceIcon}
              style={{
                backgroundPosition,
              }}
            />
          ) : (
            <span className={`${styles.buildPieceIcon} ${styles.emptyIcon}`} />
          )}
        </div>

        <div className={styles.pieceInfo}>
          <div className={styles.titleContainer}>
            <p className={styles.pieceTitle}>{gearPiece?.name ?? "None"}</p>
          </div>

          {gearPiece && (
            <div className={styles.skillsContainer}>
              {visibleSkills.map((skill, index) => (
                <span
                  key={`${skill.skill.id}-${index}`}
                  className={styles.skill}
                >
                  {skill.skill.name} {skill.level}
                </span>
              ))}

              {findBonuses?.setBonuses.map((bonus) => (
                <span
                  key={`set-${bonus}`}
                  className={`${styles.skill} ${styles.setBonus}`}
                >
                  {bonus}
                </span>
              ))}

              {findBonuses?.groupBonuses.map((bonus) => (
                <span
                  key={`group-${bonus}`}
                  className={`${styles.skill} ${styles.groupBonus}`}
                >
                  {bonus}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {slots.length > 0 && (
        <div className={styles.decoSlotsContainer}>
          {slots.map((slot, index) => {
            const placement =
              normalizedSlot !== "charm"
                ? build.decorations?.[normalizedSlot]?.[index]
                : undefined;

            const hasDecoration =
              placement?.decoration && placement.slotLevel <= slot;

            return (
              <div
                key={`${normalizedSlot}-${index}`}
                className={`${styles.decoSlot} ${
                  hasDecoration ? styles.filledSlot : ""
                }`}
              >
                <span
                  className={`${styles.decoIcon} ${styles[`deco${slot}`]}`}
                />

                {hasDecoration && (
                  <span className={styles.decoName}>
                    {placement.decoration?.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
