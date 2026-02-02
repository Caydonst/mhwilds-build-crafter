"use client"
import styles from "./page.module.css"
import {useGameData} from "@/app/hooks/useGameData";
import React, {useState, useEffect, useMemo} from "react";
import ArmorPiece from "@/app/components/builder/build/buildComponents/armorPiece";
import GearSelector from "./components/gearSelector"
import WeaponSelector from "./components/weaponSelector"
import type {BuilderBuild, DecoPlacement, Skill as SkillType} from "@/app/api/types/types"
import {addDecoSkillsToAggregate, addSkillLevel} from "@/app/components/builder/build/buildComponents/helperFunctions";
import Skill from "@/app/components/builder/build/buildComponents/skill";
import GearPiece from "@/app/builder/components/gearPiece";
import DecoSelector from "./components/decoSelector"
import StatsComponent from "./components/statsComponent";
import {weapons} from "@/app/api/apiCalls/apiCalls";

type ArmorSlotKey = "weapon" | "head" | "chest" | "arms" | "waist" | "legs" | "charm";

export default function Builder() {
    const { skills, isLoading, error } = useGameData();
    const [weaponSelectorOpen, setWeaponSelectorOpen] = useState<boolean>(false);
    const [gearSelectorOpen, setGearSelectorOpen] = useState<boolean>(false);
    const [decoSelectorOpen, setDecoSelectorOpen] = useState<boolean>(false);
    const [slotLevel, setSlotLevel] = useState<number>(0);
    const [decoKind, setDecoKind] = useState<string>("weapon");
    const [decoSlotIndex, setDecoSlotIndex] = useState<number>(0);
    const [type, setType] = useState<ArmorSlotKey>("head")
    const [build, setBuild] = useState<BuilderBuild>({
        weapon: null,
        head: null,
        chest: null,
        arms: null,
        waist: null,
        legs: null,
        charm: null,
        decorations: {
            weapon: [],
            head: [],
            chest: [],
            arms: [],
            waist: [],
            legs: [],
        },
    });
    const [selectedPage, setSelectedPage] = useState<string>("gear");

    useEffect(() => {
        if (weaponSelectorOpen || gearSelectorOpen || decoSelectorOpen) {
            document.body.classList.add("no-scroll");
        } else {
            document.body.classList.remove("no-scroll");
        }
    }, [weaponSelectorOpen, gearSelectorOpen, decoSelectorOpen]);

    const ARMOR_SLOTS: ArmorSlotKey[] = ["weapon", "head", "chest", "arms", "waist", "legs", "charm"]

    type AggregatedSkill = {
        skill: SkillType;
        totalLevel: [current: number, max: number];
    };

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

        if (build.decorations) {
            (Object.keys(build.decorations) as (keyof typeof build.decorations)[]).forEach((slot) => {
                addDecoSkillsToAggregate(skills, map, build.decorations[slot]);
            });
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
    function openDecoSelector(slotLevel: number, decoKind: string, slot: ArmorSlotKey, slotIndex: number) {
        setType(slot);
        setSlotLevel(slotLevel);
        setDecoKind(decoKind);
        setDecoSlotIndex(slotIndex);
        setDecoSelectorOpen(true);
        console.log(decoKind);
    }
    function deleteBuildItem(slotKey: ArmorSlotKey) {
        setBuild((prev) => {
            if (slotKey === "charm") {
                return {
                    ...prev,
                    [slotKey]: null,
                };
            }

            const emptySlots: DecoPlacement[] = [];

            return {
                ...prev,
                [slotKey]: null,
                decorations: {
                    ...prev.decorations,
                    [slotKey]: emptySlots,
                },
            };
        });
    }
    function deleteDecoration(slotKey: ArmorSlotKey, slotIndex: number) {
        setBuild((prev) => {
            if (!prev.decorations) return prev;

            // charms don't have deco slots
            if (slotKey === "charm") return prev;

            const nextSlot = [...prev.decorations[slotKey]];
            nextSlot[slotIndex] = {
                slotLevel: 1,
                decoration: null,
            };

            return {
                ...prev,
                decorations: {
                    ...prev.decorations,
                    [slotKey]: nextSlot,
                },
            };
        });
    }

    return (
        <main className={styles.builderPageWrapper}>
            {isLoading ? (
                <div className={styles.spinnerContainer}>
                    <span className={styles.spinnerWrapper}>
                    <span className={styles.spinner}></span>
                    Loading resources...
                </span>
                </div>
            ) : (
                <>
                    <div className={styles.desktopHeader}>
                        <div className={styles.headerInner}>
                            <div className={styles.skillsHeaderDesktop}>Skills</div>
                            <div className={styles.gearHeaderDesktop}>Gear</div>
                            <div className={styles.statsHeaderDesktop}>Stats</div>
                        </div>
                    </div>
                    <div className={styles.mobileHeader}>
                        <div className={styles.headerInner}>
                            <button
                                className={`${styles.gearHeaderMobile} ${selectedPage === "gear" ? styles.selected : ""}`}
                                onClick={() => setSelectedPage("gear")}
                            >
                                Gear
                            </button>

                            <button
                                className={`${styles.skillsHeaderMobile} ${selectedPage === "skills" ? styles.selected : ""}`}
                                onClick={() => setSelectedPage("skills")}
                            >
                                Skills
                            </button>

                            <button
                                className={`${styles.statsHeaderMobile} ${selectedPage === "stats" ? styles.selected : ""}`}
                                onClick={() => setSelectedPage("stats")}
                            >
                                Stats
                            </button>
                        </div>
                    </div>

                    <div className={styles.builderPageInnerDesktop}>
                        <div className={styles.skillsContainer}>
                            {aggregatedSkills.length > 0 ? (
                                aggregatedSkills.map(({ skill, totalLevel }) => {
                                    return (
                                        <Skill key={skill.id} skill={skill} skillData={skills} totalLevel={totalLevel} />
                                    );
                                })
                            ) : (
                                <p className={styles.noSkills}>No skills</p>
                            )}
                        </div>
                        <div className={styles.gearContainer}>
                            {ARMOR_SLOTS.map((slot) => (
                                <GearPiece key={slot} slotKey={slot} gearPiece={build[slot]} build={build} deleteBuildItem={deleteBuildItem} openGearSelector={openGearSelector} openWeaponSelector={openWeaponSelector} openDecoSelector={openDecoSelector} deleteDecoration={deleteDecoration} />
                            ))}
                        </div>
                        <div className={styles.statsContainer}>
                            <StatsComponent build={build} />
                        </div>
                    </div>
                    <div className={styles.builderPageInnerMobile}>
                        {selectedPage === "gear" && (
                            <div className={styles.gearContainer}>
                                {ARMOR_SLOTS.map((slot) => (
                                    <GearPiece key={slot} slotKey={slot} gearPiece={build[slot]} build={build} deleteBuildItem={deleteBuildItem} openGearSelector={openGearSelector} openWeaponSelector={openWeaponSelector} openDecoSelector={openDecoSelector} deleteDecoration={deleteDecoration} />
                                ))}
                            </div>
                        )}
                        {selectedPage === "skills" && (
                            <div className={styles.skillsContainer}>
                                {aggregatedSkills.length > 0 ? (
                                    aggregatedSkills.map(({ skill, totalLevel }) => {
                                            return (
                                                <Skill key={skill.id} skill={skill} skillData={skills} totalLevel={totalLevel} />
                                            );
                                        })
                                ) : (
                                    <p className={styles.noSkills}>No skills</p>
                                )}
                            </div>
                        )}
                        {selectedPage === "stats" && (
                            <div className={styles.statsContainer}>
                                <StatsComponent build={build} />
                            </div>
                        )}
                    </div>
                    {weaponSelectorOpen && (
                        <WeaponSelector weaponSelectorOpen={weaponSelectorOpen} setWeaponSelectorOpen={setWeaponSelectorOpen} type={type} build={build} setBuild={setBuild} />
                    )}
                    {gearSelectorOpen && (
                        <GearSelector gearSelectorOpen={gearSelectorOpen} setGearSelectorOpen={setGearSelectorOpen} type={type} build={build} setBuild={setBuild} />
                    )}
                    {decoSelectorOpen && (
                        <DecoSelector decoSlotIndex={decoSlotIndex} slotLevel={slotLevel} kind={decoKind} decoSelectorOpen={decoSelectorOpen} setDecoSelectorOpen={setDecoSelectorOpen} build={build} setBuild={setBuild} type={type} />
                    )}
                </>
            )}

        </main>
    )
}