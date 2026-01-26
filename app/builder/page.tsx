"use client"
import styles from "./page.module.css"
import {useGameData} from "@/app/hooks/useGameData";
import React, {useState, useEffect, useMemo} from "react";
import ArmorPiece from "@/app/components/builder/build/buildComponents/armorPiece";
import GearSelector from "./components/gearSelector"
import WeaponSelector from "./components/weaponSelector"
import type {BuilderBuild, Skill as SkillType} from "@/app/api/types/types"
import {addDecoSkillsToAggregate, addSkillLevel} from "@/app/components/builder/build/buildComponents/helperFunctions";
import Skill from "@/app/components/builder/build/buildComponents/skill";
import GearPiece from "@/app/builder/components/gearPiece";

type ArmorSlotKey = "weapon" | "head" | "chest" | "arms" | "waist" | "legs" | "charm";

export default function Builder() {
    const { skills, weapons, armorBySlot, charms, decorations, isLoading, error } = useGameData();
    const [weaponSelectorOpen, setWeaponSelectorOpen] = useState<boolean>(false);
    const [gearSelectorOpen, setGearSelectorOpen] = useState<boolean>(false);
    const [type, setType] = useState<ArmorSlotKey>("head")
    const [build, setBuild] = useState<BuilderBuild>({
        weapon: null,
        head: null,
        chest: null,
        arms: null,
        waist: null,
        legs: null,
        charm: null,
    });

    const ARMOR_SLOTS: ArmorSlotKey[] = ["weapon", "head", "chest", "arms", "waist", "legs", "charm"]

    type AggregatedSkill = {
        skill: SkillType;
        totalLevel: [current: number, max: number];
    };

    const aggregatedSkillsMap: Record<number, AggregatedSkill> = {};

    const findSkillIcon = (skill: SkillType): number => {
        const foundSkill = skills?.find((thisSkill) => thisSkill.id === skill.id);
        return foundSkill?.icon.id ?? 0;
    };

    // --- 1) ArmorPiece/charm skills ---
    const pieces = [
        build.weapon,
        build.head,
        build.chest,
        build.arms,
        build.waist,
        build.legs,
        build.charm,
    ]
// --- 2) ArmorPiece decorations skills ---
    //for (const slot of ARMOR_SLOTS) {
    //    addDecoSkillsToAggregate(skills, aggregatedSkillsMap, build.decorations?.[slot]);
    //}

// --- 3) Weapon decorations skills (NEW) ---
    //addDecoSkillsToAggregate(skills, aggregatedSkillsMap, build.decorations?.weapon);


    const aggregatedSkills = useMemo(() => {
        const map: Record<number, AggregatedSkill> = {};
        const pieces = [build.weapon, build.head, build.chest, build.arms, build.waist, build.legs, build.charm];

        for (const piece of pieces) {
            if (!piece) continue;
            for (const s of piece.skills) {
                const id = s.skill?.id;
                if (!id) continue;
                addSkillLevel(skills, id, s.level ?? 0, map);
            }
        }

        return Object.values(map).sort((a, b) => b.totalLevel[0] - a.totalLevel[0]);
    }, [build, skills]);

    function openGearSelector(slot: ArmorSlotKey) {
        setType(slot)
        setGearSelectorOpen(true)
    }
    function openWeaponSelector(slot: ArmorSlotKey) {
        setType(slot)
        setWeaponSelectorOpen(true)
    }

    return (
        <main className={styles.builderPage}>
            {isLoading ? (
                <span className={styles.spinnerWrapper}>
                    <span className={styles.spinner}></span>
                    Loading resources...
                </span>
            ) : (
                <>
                    <div className={styles.builderPageInner}>
                        <div className={styles.skillsContainer}>
                            {aggregatedSkills.map(({ skill, totalLevel }) => {
                                return (
                                    <Skill key={skill.id} skill={skill} skillData={skills} totalLevel={totalLevel} />
                                );
                            })}
                        </div>
                        <div className={styles.gearContainer}>
                            {ARMOR_SLOTS.map((slot) => (
                                slot === "weapon" ? (
                                    <GearPiece key={slot} slotKey={slot} gearPiece={build[slot]} build={null} openGearSelector={openGearSelector} openWeaponSelector={openWeaponSelector} />
                                ) : (
                                    <GearPiece key={slot} slotKey={slot} gearPiece={build[slot]} build={null} openGearSelector={openGearSelector} openWeaponSelector={openWeaponSelector} />
                                )
                            ))}
                        </div>
                        <div className={styles.statsContainer}>
                            <div className={styles.placeholder}></div>
                        </div>
                    </div>
                    {weaponSelectorOpen && (
                        <WeaponSelector weaponSelectorOpen={weaponSelectorOpen} setWeaponSelectorOpen={setWeaponSelectorOpen} type={type} build={build} setBuild={setBuild} />
                    )}
                    {gearSelectorOpen && (
                        <GearSelector gearSelectorOpen={gearSelectorOpen} setGearSelectorOpen={setGearSelectorOpen} type={type} build={build} setBuild={setBuild} />
                    )}
                </>
            )}

        </main>
    )
}