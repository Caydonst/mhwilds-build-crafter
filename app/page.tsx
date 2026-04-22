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
import Logo from "@/app/assets/logo3.png";
import landingImg from "@/app/assets/image.png"

export default function Home() {

    return (
        <main className={styles.homeContainer}>
            <div className={styles.mainContainer}>
                <div className={styles.mainLeft}>
                    <div className={styles.titleContainer}>
                        <h2>Monster Hunter Wilds</h2>
                        <h1><img src={Logo.src} />Builder</h1>
                    </div>
                    <p>An advanced build crafter that allows for optimized builds through real-time stat calculation.</p>
                    <Link href="/builder" className={styles.openBuilderBtn}>
                        <div>Open builder<ChevronRightIcon className={styles.arrowIcon}/></div>
                    </Link>
                </div>
                <div className={styles.mainRight}>
                    <div className={styles.imgContainer}>
                        <img src={landingImg.src} />
                    </div>
                </div>
            </div>
            {/*
            <div className={styles.offerContainer}>
                What we offer
            </div>
            <div className={styles.ctaContainer}>
                <h2>Start building now</h2>
                <p>Join hundreds of hunters in creating the perfect builds for their hunts.</p>
                <Link href="/builder" className={styles.buildGeneratorBtn}>
                    <div>Open builder<ChevronRightIcon className={styles.arrowIcon}/></div>
                </Link>
            </div>
            */}
        </main>
    );
}
