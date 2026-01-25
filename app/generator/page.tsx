"use client"
import styles from "./page.module.css"
import Builder from "@/app/components/builder/builder"
import React, {useEffect, useState} from "react";
import {ArmorBySlot, CharmRank, Decoration, Skill, Weapon} from "@/app/api/types/types";
import fetchAll from "@/app/api/apiCalls/apiCalls";
import {SparklesIcon} from "@heroicons/react/24/solid";
import { useGameData } from "@/app/hooks/useGameData";

export default function BuilderPage() {
    const [skillData, setSkillData] = useState<Skill[] | null>(null);
    const [weaponData, setWeaponData] = useState<Weapon[] | null>(null);
    const [armorData, setArmorData] = useState<ArmorBySlot | null>(null);
    const [charmData, setCharmData] = useState<CharmRank[] | null>(null);
    const [decoData, setDecoData] = useState<Decoration[] | null>(null);
    //const [isLoading, setIsLoading] = useState(true);
    //const [error, setError] = useState(null);
    const [builderOpen, setBuilderOpen] = useState(false);

    const { skills, weapons, armorBySlot, charms, decorations, isLoading, error } = useGameData();


    return (
        <div className={styles.builderPage}>
            {isLoading ? (
                <span className={styles.spinnerWrapper}>
                    <span className={styles.spinner}></span>
                    Loading resources...
                </span>
            ) : (
                <Builder builderOpen={builderOpen} setBuilderOpen={setBuilderOpen} weaponData={weapons}
                         skillData={skills}/>
            )}
        </div>
    )
}