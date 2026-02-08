import styles from "./page.module.css"
import {BuilderBuild} from "@/app/api/types/types"
import React, {useEffect, useMemo, useRef, useState} from "react";
import {ChevronDownIcon} from "@heroicons/react/24/outline";
import Skill from "@/app/components/builder/build/buildComponents/skill";
import {updateStats} from "@/app/builder/components/helperFunctions";

interface Props {
    build: BuilderBuild;
}

export default function StatsComponent({ build }: Props) {
    const [equipSkillsOpen, setEquipSkillsOpen] = useState(true);
    const [defenseOpen, setDefenseOpen] = useState(true);
    const equipSkillsRef = useRef<HTMLDivElement>(null);
    const defenseRef = useRef<HTMLDivElement>(null);

    const buildStats = useMemo(() => {
        const newStats = updateStats(build);
        return newStats;
    }, [build]);

    function calcRaw() {}
    function calcElement() {}
    function calcAffinity() {}

    function calcDefenses() {}

    function useCollapsibleHeight(
        ref: React.RefObject<HTMLElement | null>,
        isOpen: boolean,
        headerHeight = 70
    ) {
        const [height, setHeight] = React.useState(headerHeight);

        React.useLayoutEffect(() => {
            const el = ref.current;
            if (!el) return;

            const updateHeight = () => {
                setHeight(isOpen ? headerHeight + el.scrollHeight : headerHeight);
            };

            // Initial measurement
            updateHeight();

            const observer = new ResizeObserver(updateHeight);
            observer.observe(el);

            return () => observer.disconnect();
        }, [ref, isOpen, headerHeight]);

        return height;
    }

    const equipSkillsHeight = useCollapsibleHeight(
        equipSkillsRef,
        equipSkillsOpen
    );

    const defenseHeight = useCollapsibleHeight(
        defenseRef,
        defenseOpen
    );

    return (
        <div className={styles.statsInner}>
            <div className={styles.equipmentSkillsContainer} style={{ height: equipSkillsHeight }}>
                <div className={styles.equipSkillsHeader} onClick={() => setEquipSkillsOpen(!equipSkillsOpen)}>
                    <p>Attack</p>
                    <span className={equipSkillsOpen ? styles.rotated : ""}><ChevronDownIcon className={styles.chevronIcon} /></span>
                </div>
                <div ref={equipSkillsRef} className={styles.equipSkillsContent}>
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
                        <p>{buildStats.affinity}%</p>
                    </div>
                    <div className={styles.elementContainer}>
                        <div className={styles.elementContainerLeft}>
                            <span className={`${styles.statsIcon} ${styles.elementIcon}`}></span>
                            <p>Element</p>
                        </div>
                        <div className={styles.elementContainerRight}>
                            {buildStats.element !== "None" ? (
                                <>
                                    <span className={`${styles.statsIcon} ${styles[buildStats.element]}`}></span>
                                    <p>{buildStats.elementDamage}</p>
                                </>
                            ) : (
                                <p>None</p>
                            )}
                        </div>
                    </div>
                    <div className={styles.sharpnessContainer}>
                        <h4>Sharpness</h4>
                        {(build.weapon && build.weapon.sharpness) ? (
                            <>
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
                            </>
                        ) : (
                            <p>None</p>
                        )}
                    </div>
                </div>
            </div>
            <div className={styles.equipmentSkillsContainer} style={{ height: defenseHeight }}>
                <div className={styles.equipSkillsHeader} onClick={() => setDefenseOpen(!defenseOpen)}>
                    <p>Defense</p>
                    <span className={equipSkillsOpen ? styles.rotated : ""}><ChevronDownIcon className={styles.chevronIcon} /></span>
                </div>
                <div ref={defenseRef} className={styles.equipSkillsContent}>
                    <div className={styles.defenseChild}>
                        <div className={styles.resLeft}>
                            <span className={`${styles.statsIcon} ${styles.defenseIcon}`}></span>
                            <p>Defense</p>
                        </div>
                        <p>{buildStats.defense}</p>
                    </div>
                    <div className={styles.defenseChild}>
                        <div className={styles.resLeft}>
                            <span className={`${styles.statsIcon} ${styles.fire}`}></span>
                            <p>Fire Res</p>
                        </div>
                        <p>{buildStats.fire}</p>
                    </div>
                    <div className={styles.defenseChild}>
                        <div className={styles.resLeft}>
                            <span className={`${styles.statsIcon} ${styles.water}`}></span>
                            <p>Water Res</p>
                        </div>
                        <p>{buildStats.water}</p>
                    </div>
                    <div className={styles.defenseChild}>
                        <div className={styles.resLeft}>
                            <span className={`${styles.statsIcon} ${styles.thunder}`}></span>
                            <p>Thunder Res</p>
                        </div>
                        <p>{buildStats.thunder}</p>
                    </div>
                    <div className={styles.defenseChild}>
                        <div className={styles.resLeft}>
                            <span className={`${styles.statsIcon} ${styles.ice}`}></span>
                            <p>Ice Res</p>
                        </div>
                        <p>{buildStats.ice}</p>
                    </div>
                    <div className={styles.defenseChild}>
                        <div className={styles.resLeft}>
                            <span className={`${styles.statsIcon} ${styles.dragon}`}></span>
                            <p>Dragon Res</p>
                        </div>
                        <p>{buildStats.dragon}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}