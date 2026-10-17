"use client"
import styles from "./page.module.css"
import React, {useEffect, useState} from "react";
import {ArmorBySlot, CharmRank, Decoration, Skill, Weapon} from "@/app/api/types/types";
import fetchAll from "@/app/api/apiCalls/apiCalls";
import {SparklesIcon} from "@heroicons/react/24/solid";
import { useGameData } from "@/app/hooks/useGameData";
import Builder from "./components/generatorClient";

export default function BuilderPage() {
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