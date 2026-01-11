"use client"
import Image from "next/image";
import styles from "./page.module.css";
import {useEffect, useState} from "react";
import Builder from "@/app/components/builder/builder"
import fetchAll from "@/app/api/apiCalls/apiCalls"
import {Weapon, ArmorBySlot, CharmRank, Decoration, Skill} from "@/app/api/types/types"

export default function Home() {
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

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <main className={styles.homeContainer}>
            <div className={styles.buildsContainer}>
                <h1>My Builds</h1>
                <button className={styles.customBuildBtn} onClick={() => setBuilderOpen(true)}>+ Custom Build</button>
            </div>
            {builderOpen &&
                <Builder builderOpen={builderOpen} setBuilderOpen={setBuilderOpen} weaponData={weaponData} skillData={skillData} />
            }
        </main>
    );
}
