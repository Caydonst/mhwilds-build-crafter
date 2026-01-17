"use client"
import styles from "./page.module.css"
import Builder from "@/app/components/builder/builder"
import React, {useEffect, useState} from "react";
import {ArmorBySlot, CharmRank, Decoration, Skill, Weapon} from "@/app/api/types/types";
import fetchAll from "@/app/api/apiCalls/apiCalls";
import {SparklesIcon} from "@heroicons/react/24/solid";

export default function BuilderPage() {
    const [skillData, setSkillData] = useState<Skill[] | null>(null);
    const [weaponData, setWeaponData] = useState<Weapon[] | null>(null);
    const [armorData, setArmorData] = useState<ArmorBySlot | null>(null);
    const [charmData, setCharmData] = useState<CharmRank[] | null>(null);
    const [decoData, setDecoData] = useState<Decoration[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [builderOpen, setBuilderOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchAll();
                setSkillData(response.skills)
                setWeaponData(response.weapons)
                setArmorData(response.armorBySlot)
                setCharmData(response.charms)
                setDecoData(response.decorations)
            } catch (err) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData()
    }, [])
    return (
        <div className={styles.builderPage}>
            {isLoading ? (
                <span className={styles.spinnerWrapper}>
                    <span className={styles.spinner}></span>
                    Loading resources...
                </span>
            ) : (
                <Builder builderOpen={builderOpen} setBuilderOpen={setBuilderOpen} weaponData={weaponData}
                skillData={skillData} />
            )}
        </div>
    )
}