import styles from "./page.module.css"
import React from "react";
import type {Build} from "@/app/api/types/types"

type props = {
    build: Build;
}

export default function Build({ build }: props) {
    return (
        <div className={styles.buildContainer}>
            <div className={styles.buildWeaponContainer}>
                <span
                    className={styles.buildWeaponIcon}
                    style={{backgroundPosition: `calc((-64px * 9) * var(--build-icon-size)) calc((-64px * ${build.weapon?.rarity}) * var(--build-icon-size))`}}
                />
                <div className={styles.buildWeaponInfo}>
                    <p className={`${styles.weaponTitle} ${styles[`rarity${build.weapon?.rarity}`]}`}>{build.weapon?.name}</p>
                    <p className={`${styles.weaponRarity} ${styles[`rarity${build.weapon?.rarity}`]}`}>{`Rarity ${build.weapon?.rarity}`}</p>
                </div>
            </div>
        </div>
    )
}