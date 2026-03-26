"use client"
import Image from "next/image";
import styles from "./page.module.css";
import React, {useEffect, useState} from "react";
import Builder from "@/app/components/builder/builder"
import fetchAll from "@/app/api/apiCalls/apiCalls"
import {Weapon, ArmorBySlot, CharmRank, Decoration, Skill} from "@/app/api/types/types"
import {SparklesIcon, ChevronRightIcon, WrenchScrewdriverIcon, CubeTransparentIcon} from "@heroicons/react/24/solid"
import {CogIcon} from "@heroicons/react/24/outline"
import Link from "next/link"

export default function Home() {

    return (
        <main className={styles.homeContainer}>
            <div className={styles.mainContainer}>
                <div className={styles.titleContainer}>
                    <h2>Monster Hunter Wilds</h2>
                    <h1><CogIcon className={styles.titleIcon} />Builder</h1>
                </div>
                <p>An advanced build crafter that allows for optimized builds through real-time stat calculation.</p>
                <Link href="/builder" className={styles.buildGeneratorBtn}>
                    <div>Open builder<ChevronRightIcon className={styles.arrowIcon}/></div>
                </Link>
                <div className={styles.tileContainer}>

                    {/*<div className={styles.buildGeneratorBtn}>
                        <div className={styles.tileHeader}>
                            <div className={styles.tileIconContainer}>
                                <SparklesIcon className={styles.sparklesIcon} />
                            </div>
                            <h3>Build Generator</h3>
                        </div>
                        <div className={styles.comingSoon}>Coming Soon</div>
                    </div>*/}
                </div>
            </div>
        </main>
    );
}
