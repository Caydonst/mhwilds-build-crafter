"use client"
import styles from "./page.module.css"
import {useGameData} from "@/app/hooks/useGameData";
import React, {useState, useEffect, useMemo} from "react";
import ArmorPiece from "@/app/components/builder/build/buildComponents/armorPiece";
import GearSelector from "./components/gearSelector"
import WeaponSelector from "./components/weaponSelector"
import type {BuilderBuild, DecoPlacement, Skill as SkillType, ArmorSet} from "@/app/api/types/types"
import Skill from "@/app/components/builder/build/buildComponents/skill";
import GearPiece from "@/app/builder/components/gearPiece";
import DecoSelector from "./components/decoSelector"
import StatsComponent from "./components/statsComponent";
import {armorSets, weapons} from "@/app/api/apiCalls/apiCalls";
import SkillsComponent from "@/app/builder/components/skillsComponent";

type ArmorSlotKey = "weapon" | "head" | "chest" | "arms" | "waist" | "legs" | "charm";

export default function Builder() {
    const { skills, armorBySlot, isLoading, error } = useGameData();
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

    if (armorSets) {

    }

    useEffect(() => {
        if (weaponSelectorOpen || gearSelectorOpen || decoSelectorOpen) {
            document.body.classList.add("no-scroll");
        } else {
            document.body.classList.remove("no-scroll");
        }
    }, [weaponSelectorOpen, gearSelectorOpen, decoSelectorOpen]);

    const ARMOR_SLOTS: ArmorSlotKey[] = ["weapon", "head", "chest", "arms", "waist", "legs", "charm"]

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
                            {armorBySlot && (
                                <SkillsComponent build={build} skills={skills} armorSets={armorBySlot.armorSets} />
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
                                {armorBySlot && (
                                    <SkillsComponent build={build} skills={skills} armorSets={armorBySlot.armorSets} />
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