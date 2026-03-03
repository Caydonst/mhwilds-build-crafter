"use client"
import Image from "next/image";
import styles from "./page.module.css";
import React, {useEffect, useState} from "react";
import Builder from "@/app/components/builder/builder"
import fetchAll from "@/app/api/apiCalls/apiCalls"
import {Weapon, ArmorBySlot, CharmRank, Decoration, Skill} from "@/app/api/types/types"
import {SparklesIcon, ArrowRightIcon, WrenchScrewdriverIcon} from "@heroicons/react/24/solid"
import Link from "next/link"

export default function Home() {

    return (
        <main className={styles.homeContainer}>
            <div className={styles.mainContainer}>
                <div className={styles.titleContainer}>
                    <h1>Monster Hunter Wilds</h1>
                    <h2>Builder</h2>
                </div>
                <div className={styles.tileContainer}>
                    <Link href="/builder" className={styles.buildGeneratorBtn}>
                        <div className={styles.tileIconContainer}>
                            <WrenchScrewdriverIcon className={styles.sparklesIcon} />
                        </div>
                        <h3>Builder</h3>
                        <p>An advanced build crafter that allows for optimized builds through real-time stat calculation.</p>
                        <ArrowRightIcon className={styles.arrowIcon}/>
                    </Link>
                    <div className={styles.buildGeneratorBtn}>
                        <div className={styles.comingSoon}>Coming Soon</div>
                        <div className={styles.tileHeader}>
                            <SparklesIcon className={styles.sparklesIcon}/>Build Generator
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
