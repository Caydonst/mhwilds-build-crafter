import styles from "./page.module.css"
import {BuilderBuild, type Weapon} from "@/app/api/types/types"
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

    type Sharpness = NonNullable<Weapon["sharpness"]>;
    type SharpnessKey = keyof Sharpness;
    const sharpnessList: SharpnessKey[] = ["red", "orange", "yellow", "green", "blue", "white", "purple"];


    const buildStats = useMemo(() => {
        const newStats = updateStats(build);
        return newStats;
    }, [build]);

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

    function clickEffect(e: React.MouseEvent<HTMLDivElement>) {
        const button = e.currentTarget;

        const rect = button.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement("span");
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 800);
    }

    return (
        <div className={styles.statsInner}>
            <div className={styles.equipmentSkillsContainer} style={{ height: equipSkillsHeight }}>
                <div className={styles.equipSkillsHeader} onClick={(e) => {
                    setEquipSkillsOpen(!equipSkillsOpen);
                    clickEffect(e);
                }}>
                    <p>Attack</p>
                    <div className={equipSkillsOpen ? `${styles.chevronContainer} ${styles.rotated}` : ""}><ChevronDownIcon className={styles.chevronIcon} /></div>
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
                                        {sharpnessList.map(sharpness => (
                                            <div key={sharpness} className={`${styles.sharpnessColor} ${styles[sharpness]}`}
                                                 style={{ width: `${(build.weapon?.sharpness?.[sharpness] ?? 0 / 400) * 150}px` }}></div>
                                        ))}


                                    </div>
                                )}
                                {build.weapon && build.weapon.sharpness && (
                                    <div className={styles.sharpnessNumbers}>
                                        {sharpnessList.map(sharpness => (
                                            build.weapon?.sharpness?.[sharpness] !== 0 && (
                                                <div key={sharpness} className={`${styles.sharpnessNumber} ${styles[sharpness]}`}>{build.weapon?.sharpness?.[sharpness]}</div>
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
                <div className={styles.equipSkillsHeader} onClick={(e) => {
                    setDefenseOpen(!defenseOpen);
                    clickEffect(e);
                }}>
                    <p>Defense</p>
                    <div className={defenseOpen ? `${styles.chevronContainer} ${styles.rotated}` : ""}><ChevronDownIcon className={styles.chevronIcon} /></div>
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