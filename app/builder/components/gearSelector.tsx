import styles from "./page.module.css"
import {XMarkIcon} from "@heroicons/react/24/outline"
import React, {useState} from "react";
import {useGameData} from "@/app/hooks/useGameData";
import ArmorPiece from "@/app/components/builder/build/buildComponents/armorPiece"
import type {BuilderBuild, Armor, CharmRank} from "@/app/api/types/types";

type ArmorSlotKey = "weapon" | "head" | "chest" | "arms" | "waist" | "legs" | "charm";

interface Props {
    gearSelectorOpen: boolean;
    setGearSelectorOpen: React.Dispatch<React.SetStateAction<boolean>>;
    type: ArmorSlotKey;
    build: BuilderBuild;
    setBuild: React.Dispatch<React.SetStateAction<BuilderBuild>>;
}

export default function GearSelector({ gearSelectorOpen, setGearSelectorOpen, type, build, setBuild }: Props) {
    const { weapons, armorBySlot, charms } = useGameData();

    let gear;

    if (type !== "weapon" && type !== "charm") {
        gear = armorBySlot?.[type] ?? [];
    } else if (type === "charm") {
        gear = charms
    }

    function addArmor(armor: Armor | CharmRank) {
        setBuild({
            ...build,
            [type]: armor,
        })
        setGearSelectorOpen(false);
    }

    return (
        <div className={gearSelectorOpen ? `${styles.gearSelectorContainer} ${styles.open}` : styles.gearSelectorContainer}>
            <div className={styles.gearSelectorInner}>
                <div className={styles.info}>
                    <div className={styles.header}>
                        <p>Gear Search</p>
                        <button onClick={() => setGearSelectorOpen(false)}><XMarkIcon /></button>
                    </div>
                    <div className={styles.searchContainer}>
                        <p>Armor</p>
                        <input type={"text"} placeholder={"Search"} />
                    </div>
                </div>
                <div className={styles.main}>
                    <div className={styles.mainInner}>
                        {}
                        {gear && gear.map((piece, i) => (
                            <div key={i} className={styles.gearContainer} onClick={() => addArmor(piece)}>
                                <ArmorPiece gearPiece={piece} slotKey={type} build={null} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}