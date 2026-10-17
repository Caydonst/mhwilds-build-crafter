import styles from "./page.module.css";
import React, { useEffect, useMemo } from "react";
import type {
  Build,
  Skill as SkillType,
  Armor,
  CharmRank,
  BuildWeapon,
  Weapon as WeaponType,
} from "@/app/api/types/types";
import Skill from "@/app/components/builder/build/buildComponents/skill";
import ArmorPiece from "../ArmorPiece/ArmorPiece";
import Weapon from "./buildComponents/weapon";
import {
  addSkillLevel,
  addDecoSkillsToAggregate,
} from "./buildComponents/helperFunctions";
import { useGameData } from "@/app/hooks/useGameData";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { createPlaceholderArtian } from "@/app/components/artianCreator/createPlaceholderArtian";
import { Truculenta } from "next/font/google";

type Props = {
  index: number;
  build: Build;
  skillData: SkillType[] | null;
  setBuildBreakdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedBuild: React.Dispatch<React.SetStateAction<Build | null>>;

  artianConfig: {
    enabled: boolean;
    weaponKind: string | null;
    setBonusSkillId: number | null;
    groupBonusSkillId: number | null;
  };
};

type ArmorSlotKey = "head" | "chest" | "arms" | "waist" | "legs";

type ArmorOrCharm = Armor | CharmRank;

const ARMOR_SLOTS: readonly ArmorSlotKey[] = [
  "head",
  "chest",
  "arms",
  "waist",
  "legs",
] as const;

export default function Build({
  index,
  build,
  skillData,
  setBuildBreakdownOpen,
  setSelectedBuild,
  artianConfig,
}: Props) {
  // If you still want sprite index maps, keep as consts (no need for useState)
  const { armorBySlot } = useGameData();

  const router = useRouter();

  type AggregatedSkill = {
    skill: SkillType;
    totalLevel: [current: number, max: number];
  };

  const aggregatedSkillsMap: Record<number, AggregatedSkill> = {};

  // --- 1) ArmorPiece/charm skills ---
  const pieces: ArmorOrCharm[] = [
    build.armor.head,
    build.armor.chest,
    build.armor.arms,
    build.armor.waist,
    build.armor.legs,
    build.armor.charm,
  ].filter((p): p is ArmorOrCharm => Boolean(p));

  for (const piece of pieces) {
    for (const s of piece.skills) {
      const id = s.skill?.id;
      if (!id) continue;

      // s.skill is NOT your full Skill type, so use skillData as source of truth if present
      addSkillLevel(skillData, id, s.level ?? 0, aggregatedSkillsMap);
    }
  }
  // --- 2) ArmorPiece decorations skills ---
  for (const slot of ARMOR_SLOTS) {
    addDecoSkillsToAggregate(
      skillData,
      aggregatedSkillsMap,
      build.decorations?.[slot],
    );
  }

  // --- 3) Weapon innate skills ---
  if (build.weapon) {
    for (const s of build.weapon.skills ?? []) {
      const id = s.skill?.id;

      if (id == null) continue;

      addSkillLevel(
        skillData,
        id,
        s.level ?? 0,
        aggregatedSkillsMap,
      );
    }
  }

  // --- 3) Weapon decorations skills ---
  addDecoSkillsToAggregate(
    skillData,
    aggregatedSkillsMap,
    build.decorations?.weapon,
  );

  // --- Bonuses ---
  const setBonusSkills: {
    skill: SkillType;
    level: number;
  }[] = [];

  for (const bonus of build.bonuses.skillSetBonuses) {
    const skill = skillData?.find((s) => s.id === bonus.skillId);

    if (skill) {
      setBonusSkills.push({
        skill,
        level: bonus.level,
      });
    }
  }

  const groupBonusSkills: {
    skill: SkillType;
    level: number;
  }[] = [];

  for (const bonus of build.bonuses.groupBonuses) {
    const skill = skillData?.find((s) => s.id === bonus.skillId);

    if (skill) {
      groupBonusSkills.push({
        skill,
        level: bonus.level,
      });
    }
  }

  const aggregatedSkills = Object.values(aggregatedSkillsMap).sort(
    (a, b) => b.totalLevel[0] - a.totalLevel[0],
  );

  // Weapon (assumes your Build type has been updated to include weapon)
  const weapon: BuildWeapon | null = build.weapon ?? null;

  function openBuilder() {
    let selectedWeapon: BuildWeapon | WeaponType | null = build.weapon ?? null;

    if (artianConfig.enabled && artianConfig.weaponKind) {
      const setBonus = skillData?.find(
        (skill) => skill.id === artianConfig.setBonusSkillId,
      )?.name;

      const groupBonus = skillData?.find(
        (skill) => skill.id === artianConfig.groupBonusSkillId,
      )?.name;

      const placeholderWeapon = createPlaceholderArtian({
        kind: artianConfig.weaponKind,
        type: "Gogma Artian",
        setBonus,
        groupBonus,
      });

      selectedWeapon = placeholderWeapon;
    }

    const builderBuild = {
      weapon: selectedWeapon,

      head: build.armor.head ?? null,
      chest: build.armor.chest ?? null,
      arms: build.armor.arms ?? null,
      waist: build.armor.waist ?? null,
      legs: build.armor.legs ?? null,
      charm: build.armor.charm ?? null,

      decorations: {
        weapon: build.decorations?.weapon ?? [],
        head: build.decorations?.head ?? [],
        chest: build.decorations?.chest ?? [],
        arms: build.decorations?.arms ?? [],
        waist: build.decorations?.waist ?? [],
        legs: build.decorations?.legs ?? [],
        charm: build.decorations?.charm ?? [],
      },
    };

    localStorage.setItem("savedBuild", JSON.stringify(builderBuild));

    router.push("/builder");
  }

  function clickEffect(e: React.MouseEvent<HTMLDivElement>) {
    const button = e.currentTarget;

    const rect = button.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement("span");
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 800);
  }

  return (
    <article className={styles.buildContainer}>
      <div className={styles.buildCardHeader}>
        <div className={styles.buildTitleContainer}>
          <h2 className={styles.buildHeader}>Generated Build</h2>
        </div>

        <span className={styles.buildNumber}>
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <section className={styles.buildSection}>
        <div className={styles.buildSectionHeader}>
          <span>Equipment</span>
        </div>

        <div className={styles.gearContainer}>
          <div className={styles.weapon}>
            {weapon && <Weapon build={build} />}
          </div>

          <div className={styles.armor}>
            {armorBySlot &&
              Object.entries(build.armor).map(([slotKey, gearPiece]) => (
                <ArmorPiece
                  key={slotKey}
                  armorSets={armorBySlot.armorSets}
                  slotKey={slotKey}
                  gearPiece={gearPiece}
                  build={build}
                />
              ))}
          </div>
        </div>
      </section>

      {(aggregatedSkills.length > 0 ||
        setBonusSkills.length > 0 ||
        groupBonusSkills.length > 0) && (
        <section className={styles.buildSection}>
          <div className={styles.buildSectionHeader}>
            <span>Equipment Skills</span>
          </div>

          <div className={styles.skillsContainer}>
            {aggregatedSkills.length > 0 && (
              <div className={styles.skillGroup}>
                <div className={styles.skillList}>
                  {aggregatedSkills.map(({ skill, totalLevel }) => (
                    <Skill
                      key={skill.id}
                      skill={skill}
                      skillData={skillData}
                      totalLevel={totalLevel}
                      clickEffect={clickEffect}
                    />
                  ))}
                </div>
              </div>
            )}

            {setBonusSkills.length > 0 && (
              <div className={styles.skillGroup}>
                <span className={styles.skillGroupLabel}>
                  Set Bonuses
                </span>

                <div className={styles.skillList}>
                  {setBonusSkills.map(({ skill, level }) => (
                    <Skill
                      key={skill.id}
                      skill={skill}
                      skillData={skillData}
                      totalLevel={[level, skill.ranks.length]}
                      clickEffect={clickEffect}
                    />
                  ))}
                </div>
              </div>
            )}

            {groupBonusSkills.length > 0 && (
              <div className={styles.skillGroup}>
                <span className={styles.skillGroupLabel}>
                  Group Skills
                </span>

                <div className={styles.skillList}>
                  {groupBonusSkills.map(({ skill, level }) => (
                    <Skill
                      key={skill.id}
                      skill={skill}
                      skillData={skillData}
                      totalLevel={[level, skill.ranks.length]}
                      clickEffect={clickEffect}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <div className={styles.buildFooter}>
        <button
          type="button"
          className={styles.fullBuildBtn}
          onClick={openBuilder}
        >
          Open in builder
          <ChevronRightIcon />
        </button>
      </div>
    </article>
  );
}
