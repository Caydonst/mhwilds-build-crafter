import styles from "./page.module.css"
import {XMarkIcon} from "@heroicons/react/24/outline"
import React, {useEffect, useState} from "react";
import {type Armor, Build, type CharmRank, type Skill as SkillType, ArmorSkill} from "@/app/api/types/types"
import ArmorPiece from "@/app/components/builder/build/buildComponents/armorPiece";
import {addDecoSkillsToAggregate, addSkillLevel} from "@/app/components/builder/build/buildComponents/helperFunctions";
import Skill from "../build/buildComponents/skill"
import Weapon from "@/app/components/builder/build/buildComponents/weapon";
import GearPieceBreakdown from "@/app/components/builder/buildBreakdown/components/gearPieceBreakdown";

interface props {
    setBuildBreakdownOpen: React.Dispatch<React.SetStateAction<boolean>>
    build: Build | null;
    skillData: SkillType[] | null;
}

type ArmorSlotKey = "head" | "chest" | "arms" | "waist" | "legs";

type ArmorOrCharm = Armor | CharmRank;

const ARMOR_SLOTS: readonly ArmorSlotKey[] = ["head", "chest", "arms", "waist", "legs"] as const;

export default function BuildBreakdown({setBuildBreakdownOpen, build, skillData}: props) {
    const [selectedGearPiece, setSelectedGearPiece] = useState<Armor | CharmRank | null>(null);
    const [buildStats, setBuildStats] = useState(null);

    function isArmorWithResistances(piece: Armor | CharmRank | null): piece is Armor {
        return !!piece && "resistances" in piece;
    }


    useEffect(() => {
        console.log(build);
        const buildStats = {
            defense: 0,
            resistances: {
                fire: 0,
                water: 0,
                thunder: 0,
                ice: 0,
                dragon: 0,
            }
        }

        if (build) {
            (Object.keys(buildStats.resistances) as (keyof typeof buildStats.resistances)[])
                .forEach((key) => {

                    Object.values(build.armor).forEach((armor) => {

                        if (isArmorWithResistances(armor)) {
                            buildStats.resistances[key] += armor.resistances[key];
                        }

                    });

                });
        }
        ARMOR_SLOTS.forEach(slot => {

        })
        setBuildStats(buildStats);
    }, [build]);


    useEffect(() => {
        console.log(selectedGearPiece);
    }, [selectedGearPiece]);

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
        build?.armor.head,
        build?.armor.chest,
        build?.armor.arms,
        build?.armor.waist,
        build?.armor.legs,
        build?.armor.charm,
    ].filter((p): p is ArmorOrCharm => Boolean(p));

    for (const piece of pieces) {
        for (const s of piece.skills) {

            const id = s.skill?.id;
            if (!id) continue;

            // s.skill is NOT your full Skill type, so use skillData as source of truth if present
            addSkillLevel(skillData, id, s.level ?? 0, aggregatedSkillsMap);
        }
    }

    const setBonusSkills: SkillType[] = [];
    const groupBonusSkills: SkillType[] = [];
    if (build) {
        for (const slot of ARMOR_SLOTS) {
            addDecoSkillsToAggregate(skillData, aggregatedSkillsMap, build.decorations?.[slot]);
        }

// --- 3) Weapon decorations skills (NEW) ---
        addDecoSkillsToAggregate(skillData, aggregatedSkillsMap, build.decorations?.weapon);

        // --- Bonuses ---
        for (const setSkillId of build.bonuses.skillSetBonuses) {
            const sk = skillData?.find((s) => s.id === setSkillId);
            if (sk) setBonusSkills.push(sk);
        }


        for (const groupSkillId of build.bonuses.groupBonuses) {
            const sk = skillData?.find((s) => s.id === groupSkillId);
            if (sk) groupBonusSkills.push(sk);
        }
    }
// --- 2) ArmorPiece decorations skills ---
    const aggregatedSkills = Object.values(aggregatedSkillsMap).sort((a, b) => b.totalLevel[0] - a.totalLevel[0]);

    return (
        <div className={styles.buildBreakdownWrapper}>
            <div className={styles.buildBreakdownContainer}>
                <div className={styles.header}>
                    Build Breakdown
                    <button className={styles.closeBtn} onClick={() => setBuildBreakdownOpen(false)}><XMarkIcon /></button>
                </div>
                <div className={styles.mainContainer}>
                    <div className={styles.statsContainer}>
                        <div className={styles.attackStatsContainer}>
                            <p className={styles.attackStatsText}>Attack Stats</p>
                            <div className={styles.selectedGearInfo}>
                                {buildStats && (
                                    <GearPieceBreakdown buildStats={buildStats} skillData={skillData} />
                                )}
                            </div>
                        </div>
                        <div className={styles.defenseStatsContainer}>
                            <p className={styles.defenseStatsText}>Defense Stats</p>
                            <div className={styles.selectedGearInfo}>
                                {buildStats && (
                                    <GearPieceBreakdown buildStats={buildStats} skillData={skillData} />
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}