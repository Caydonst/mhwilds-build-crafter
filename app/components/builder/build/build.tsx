import styles from "./page.module.css";
import React from "react";
import type {
    Build,
    Skill as SkillType,
    Armor,
    CharmRank,
    DecoPlacement,
    SlotLevel,
    BuildWeapon,
    DecorationSkill,
} from "@/app/api/types/types";
import Skill from "./buildComponents/skill"
import ArmorPiece from "./buildComponents/armorPiece"
import Weapon from "./buildComponents/weapon"
import {addSkillLevel, addDecoSkillsToAggregate} from "./buildComponents/helperFunctions";
import {useGameData} from "@/app/hooks/useGameData";

type Props = {
    index: number;
    build: Build;
    skillData: SkillType[] | null;
    setBuildBreakdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedBuild: React.Dispatch<React.SetStateAction<Build | null>>;
};

type ArmorSlotKey = "head" | "chest" | "arms" | "waist" | "legs";

type ArmorOrCharm = Armor | CharmRank;

const ARMOR_SLOTS: readonly ArmorSlotKey[] = ["head", "chest", "arms", "waist", "legs"] as const;

export default function Build({ index, build, skillData, setBuildBreakdownOpen, setSelectedBuild }: Props) {
    // If you still want sprite index maps, keep as consts (no need for useState)
    const { armorBySlot } = useGameData();

    type AggregatedSkill = {
        skill: SkillType;
        totalLevel: [current: number, max: number];
    };

    const aggregatedSkillsMap: Record<number, AggregatedSkill> = {};

    const findSkillIcon = (skill: SkillType): number => {
        const foundSkill = skillData?.find((thisSkill) => thisSkill.id === skill.id);
        return foundSkill?.icon.id ?? 0;
    };

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
        addDecoSkillsToAggregate(skillData, aggregatedSkillsMap, build.decorations?.[slot]);
    }

// --- 3) Weapon decorations skills (NEW) ---
    addDecoSkillsToAggregate(skillData, aggregatedSkillsMap, build.decorations?.weapon);

    // --- Bonuses ---
    const setBonusSkills: SkillType[] = [];
    for (const setSkillId of build.bonuses.skillSetBonuses) {
        const sk = skillData?.find((s) => s.id === setSkillId);
        if (sk) setBonusSkills.push(sk);
    }

    const groupBonusSkills: SkillType[] = [];
    for (const groupSkillId of build.bonuses.groupBonuses) {
        const sk = skillData?.find((s) => s.id === groupSkillId);
        if (sk) groupBonusSkills.push(sk);
    }

    const aggregatedSkills = Object.values(aggregatedSkillsMap).sort((a, b) => b.totalLevel[0] - a.totalLevel[0]);
    console.log(aggregatedSkills);

    // Weapon (assumes your Build type has been updated to include weapon)
    const weapon: BuildWeapon | null = build.weapon ?? null;

    function openBuilder() {
        setSelectedBuild(build);
        setBuildBreakdownOpen(true);
    }

    return (
        <div className={styles.buildContainer}>
            <h2 className={styles.buildHeader}>Build {index + 1}</h2>

            <div className={styles.gearContainer}>
                {/* ========================= WEAPON CARD ========================= */}
                {weapon && (
                    <Weapon build={build} />
                )}

                {/* ========================= ARMOR + CHARM CARDS ========================= */}
                {armorBySlot && (Object.entries(build.armor)).map(
                    ([slotKey, gearPiece]) => {
                        return (
                            <ArmorPiece key={slotKey} armorSets={armorBySlot.armorSets} slotKey={slotKey} gearPiece={gearPiece} build={build} />
                        );
                    }
                )}
            </div>

            {/* ========================= SKILLS ========================= */}
            <div className={styles.skillsContainer}>
                <div className={styles.equipSkillsContainer}>
                    <p className={styles.equipSkillsText}>Equipment Skills</p>

                    {aggregatedSkills.map(({ skill, totalLevel }) => {
                        return (
                            <Skill key={skill.id} skill={skill} skillData={skillData} totalLevel={totalLevel} />
                        );
                    })}
                </div>

                {setBonusSkills.length > 0 && (
                    <div className={styles.setBonusSkillsContainer}>
                        <p className={styles.setBonusSkillsText}>Set Bonus Skills</p>
                        {setBonusSkills.map((skill) => {
                            const iconId = findSkillIcon(skill);
                            return (
                                <div key={skill.id} className={styles.skill}>
                                    <span className={`${styles.skillIcon} ${styles[`skill${iconId}`]}`} />
                                    <div className={styles.skillInfo}>
                                        <p>{skill.name}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {groupBonusSkills.length > 0 && (
                    <div className={styles.setBonusSkillsContainer}>
                        <p className={styles.setBonusSkillsText}>Group Skills</p>
                        {groupBonusSkills.map((skill) => {
                            const iconId = findSkillIcon(skill);
                            return (
                                <div key={skill.id} className={styles.skill}>
                                    <span className={`${styles.skillIcon} ${styles[`skill${iconId}`]}`} />
                                    <div className={styles.skillInfo}>
                                        <p>{skill.name}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <button className={styles.fullBuildBtn} onClick={openBuilder}>View full build</button>
        </div>
    );
}
