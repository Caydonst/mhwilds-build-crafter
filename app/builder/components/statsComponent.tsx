import styles from "./page.module.css"
import {BuilderBuild} from "@/app/api/types/types"
import React, {useState} from "react";

interface Props {
    build: BuilderBuild;
}

export default function StatsComponent({ build }: Props) {
    const [buildStats, setBuildStats] = useState(
        {
            raw: 0,
            affinity: 0,
            element: "None",
            elementDamage: 0,
            health: 150,
            stamina: 150,
            defense: 0,
            fireRes: 0,
            waterRes: 0,
            thunderRes: 0,
            iceRes: 0,
            dragonRes: 0,
        }
    );

    function calcRaw() {}
    function calcElement() {}
    function calcAffinity() {}

    function calcDefenses() {}

    return (
        <div className={styles.statsInner}>
            <div className={styles.stamHealth}>
                <div className={styles.healthContainer}>
                    <p>Health</p>
                    <p>{buildStats.health}</p>
                </div>
                <div className={styles.staminaContainer}>
                    <p>Stamina</p>
                    <p>{buildStats.stamina}</p>
                </div>
            </div>
            <div className={styles.attackContainer}>
                <div className={styles.attackInner}>
                    <h3>Attack</h3>
                    <div className={styles.rawContainer}>
                        <div className={styles.attackLeft}>
                            <span className={`${styles.statsIcon} ${styles.damageIcon}`}></span>
                            <p>Raw</p>
                        </div>
                        <p>{buildStats.raw}</p>
                    </div>
                    <div className={styles.affinityContainer}>
                        <div className={styles.attackLeft}>
                            <span className={`${styles.statsIcon} ${styles.affinityIcon}`}></span>
                            <p>Affinity</p>
                        </div>
                        <p>{buildStats.affinity}</p>
                    </div>
                    <div className={styles.elementContainer}>
                        <div className={styles.elementContainerLeft}>
                            <span className={`${styles.statsIcon} ${styles.elementIcon}`}></span>
                            <p>Element</p>
                        </div>
                        <div className={styles.elementContainerRight}>
                            <p>{buildStats.elementDamage}</p>
                        </div>
                    </div>
                </div>
                <div className={styles.sharpnessContainer}>
                    <h4>Sharpness</h4>
                    {build.weapon && build.weapon.sharpness && (
                        <div className={styles.weaponSharpness}>
                            {Object.entries(build.weapon.sharpness).map(([color, value]) => (
                                value !== 0 && (
                                    <div key={color} className={`${styles.sharpnessColor} ${styles[color]}`} style={{ width: `${(value / 400) * 150}px`}}></div>
                                )
                            ))}
                        </div>
                    )}
                    {build.weapon && build.weapon.sharpness && (
                        <div className={styles.sharpnessNumbers}>
                            {Object.entries(build.weapon.sharpness).map(([color, value]) => (
                                value !== 0 && (
                                    <div key={color} className={`${styles.sharpnessNumber} ${styles[color]}`}>{value}</div>
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.defenseContainer}>
                <h3>Defense</h3>
                <div className={styles.defense}>
                    <div className={styles.resLeft}>
                        <span className={`${styles.statsIcon} ${styles.defenseIcon}`}></span>
                        <p>Defense</p>
                    </div>
                    <p>{buildStats.affinity}</p>
                </div>
                <div className={styles.fireContainer}>
                    <div className={styles.resLeft}>
                        <span className={`${styles.statsIcon} ${styles.fire}`}></span>
                        <p>Fire Res</p>
                    </div>
                    <p>{buildStats.fireRes}</p>
                </div>
                <div className={styles.waterContainer}>
                    <div className={styles.resLeft}>
                        <span className={`${styles.statsIcon} ${styles.water}`}></span>
                        <p>Water Res</p>
                    </div>
                    <p>{buildStats.fireRes}</p>
                </div>
                <div className={styles.thunderContainer}>
                    <div className={styles.resLeft}>
                        <span className={`${styles.statsIcon} ${styles.thunder}`}></span>
                        <p>Thunder Res</p>
                    </div>
                    <p>{buildStats.fireRes}</p>
                </div>
                <div className={styles.iceContainer}>
                    <div className={styles.resLeft}>
                        <span className={`${styles.statsIcon} ${styles.ice}`}></span>
                        <p>Ice Res</p>
                    </div>
                    <p>{buildStats.fireRes}</p>
                </div>
                <div className={styles.dragonContainer}>
                    <div className={styles.resLeft}>
                        <span className={`${styles.statsIcon} ${styles.dragon}`}></span>
                        <p>Dragon Res</p>
                    </div>
                    <p>{buildStats.fireRes}</p>
                </div>
            </div>
        </div>
    )
}