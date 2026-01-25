"use client"
import Image from "next/image";
import styles from "./page.module.css";
import React, {useEffect, useState} from "react";
import Builder from "@/app/components/builder/builder"
import fetchAll from "@/app/api/apiCalls/apiCalls"
import {Weapon, ArmorBySlot, CharmRank, Decoration, Skill} from "@/app/api/types/types"
import {SparklesIcon} from "@heroicons/react/24/solid"
import Link from "next/link"

export default function Home() {

    return (
        <main className={styles.homeContainer}>
            <div className={styles.glowingCircle}></div>
            <div className={styles.mainContainer}>
                <div className={styles.titleContainer}>
                    <h1>Monster Hunter Wilds</h1>
                    <h2>Build Generator</h2>
                </div>
                <Link href="/generator" className={styles.buildGeneratorBtn}>
                    <SparklesIcon className={styles.sparklesIcon}/>Launch Generator
                </Link>
            </div>
            <div className={styles.worksContainer}>
                <h2>How It Works</h2>
                <div className={styles.worksCards}>
                    <div className={styles.weaponSection}>
                        <h3>Select a Weapon</h3>
                        <p>Select your desired weapon!</p>
                    </div>
                    <div className={styles.filtersSection}>
                        <h3>Add Filters</h3>
                        <p>Add the skills and respective levels you desire on the build</p>
                    </div>
                    <div className={styles.generateSection}>
                        <h3>Generate Builds!</h3>
                    </div>
                </div>
            </div>
        </main>
    );
}
