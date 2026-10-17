import styles from "../page.module.css";

import React, { useMemo } from "react";

import type { BuildWeapon, SlotLevel, Build } from "@/app/api/types/types";

interface Props {
  build: Build;
}

export default function Weapon({ build }: Props) {
  const weapon: BuildWeapon | null = build.weapon ?? null;

  const weaponSlots: SlotLevel[] = useMemo(() => {
    if (!weapon) return [];

    return (
      weapon.slots?.filter(
        (slot): slot is SlotLevel => slot === 1 || slot === 2 || slot === 3,
      ) ?? []
    );
  }, [weapon]);

  const normalSkills = useMemo(() => {
    if (!weapon) return [];

    return weapon.skills.filter(
      (skill) =>
        !("kind" in skill.skill) ||
        (skill.skill.kind !== "set" && skill.skill.kind !== "group"),
    );
  }, [weapon]);

  const setBonusSkills = useMemo(() => {
    if (!weapon) return [];

    return weapon.skills.filter(
      (skill) => "kind" in skill.skill && skill.skill.kind === "set",
    );
  }, [weapon]);

  const groupBonusSkills = useMemo(() => {
    if (!weapon) return [];

    return weapon.skills.filter(
      (skill) => "kind" in skill.skill && skill.skill.kind === "group",
    );
  }, [weapon]);

  if (!weapon) return null;

  return (
    <div className={styles.buildPieceContainer}>
      <div className={styles.weaponMainContent}>
        <div className={styles.weaponIconWrapper}>
          <span
            className={`${styles.buildPieceIcon} ${styles[weapon.kind === null ? "sword-shield" : weapon.kind]
              }`}
          />
        </div>

        <div className={styles.weaponPieceInfo}>
          <p className={styles.pieceTitle}>{weapon.name}</p>

          {weapon.skills.length > 0 && (
            <div className={styles.weaponSkillsContainer}>
              {normalSkills.map((skill, index) => (
                <span
                  key={`normal-${skill.skill.id}-${index}`}
                  className={styles.weaponSkill}
                >
                  {skill.skill.name} {skill.level}
                </span>
              ))}

              {setBonusSkills.map((skill, index) => (
                <span
                  key={`set-${skill.skill.id}-${index}`}
                  className={`${styles.weaponSkill} ${styles.weaponSetBonus}`}
                >
                  {skill.skill.name}
                </span>
              ))}

              {groupBonusSkills.map((skill, index) => (
                <span
                  key={`group-${skill.skill.id}-${index}`}
                  className={`${styles.weaponSkill} ${styles.weaponGroupBonus}`}
                >
                  {skill.skill.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {weaponSlots.length > 0 && (
        <div className={styles.decoSlotsContainer}>
          {weaponSlots.map((slot, index) => {
            const placement = build.decorations?.weapon?.[index];

            const hasDecoration =
              placement?.decoration && placement.slotLevel <= slot;

            return (
              <div
                key={`weapon-slot-${index}`}
                className={`${styles.slot} ${hasDecoration ? styles.filledSlot : ""
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