"use client"
import Image from "next/image";
import styles from "./page.module.css";
import React, {useEffect, useState} from "react";
import Builder from "@/app/components/builder/builder"
import fetchAll from "@/app/api/apiCalls/apiCalls"
import {Weapon, ArmorBySlot, CharmRank, Decoration, Skill} from "@/app/api/types/types"
import {SparklesIcon, ArrowRightIcon} from "@heroicons/react/24/solid"
import Link from "next/link"

export default function Home() {

    return (
        <main className={styles.homeContainer}>
            <div className={styles.glowingCircle}></div>
            <div className={styles.mainContainer}>
                <div className={styles.titleContainer}>
                    <h1>Monster Hunter Wilds</h1>
                    <h2>Builder</h2>
                </div>
                <Link href="/builder" className={styles.buildGeneratorBtn}>
                    Builder<ArrowRightIcon className={styles.sparklesIcon}/>
                </Link>
                <Link href="/generator" className={styles.buildGeneratorBtn}>
                    <SparklesIcon className={styles.sparklesIcon}/>Build Generator
                </Link>
            </div>
        </main>
    );
}
