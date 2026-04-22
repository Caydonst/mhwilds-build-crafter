import styles from "../page.module.css"
import type {Skill as SkillType} from "@/app/api/types/types"
import {InformationCircleIcon} from "@heroicons/react/24/outline";
import {ChevronDownIcon} from "@heroicons/react/24/solid";
import React, {useRef, useState} from "react";

interface props {
    skill: SkillType;
    skillData: SkillType[] | null;
    totalLevel: [current: number, max: number];
    clickEffect: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function Skill({skill, skillData, totalLevel, clickEffect}: props) {
    const [openSkillDesc, setOpenSkillDesc] = useState(false);

    const findSkillIcon = (skill: SkillType): number => {
        const foundSkill = skillData?.find((thisSkill) => thisSkill.id === skill.id);
        return foundSkill?.icon.id ?? 0;
    };

    const iconId = findSkillIcon(skill);

    return (
        <div className={openSkillDesc ? `${styles.skill} ${styles.open}` : styles.skill}>
            <div className={styles.skillHeader} onClick={(e) => {
                setOpenSkillDesc(prev => !prev);
                clickEffect(e);
            }}>
                <div className={styles.headerInfo}>
                    <div className={`${styles.skillIcon} ${styles[`skill${iconId}`]}`} />
                    <div className={styles.skillInfo}>
                        <p>{skill.name}</p>
                        {skill.kind !== "set" && (
                            <div className={styles.skillLvlContainerWrapper}>
                                <div className={styles.skillLvlContainer}>
                                    {Array.from({ length: totalLevel[1] }).map((_, i) => {
                                        const key = `${skill.id}-lvl-${i}`;
                                        return (
                                            <div className={styles.skillLvlWrapper} key={key}>
                                                <div
                                                    key={key}
                                                    className={i < totalLevel[0] ? styles.filled : styles.empty}
                                                />
                                            </div>

                                        );
                                    })}
                                </div>

                                <p className={totalLevel[0] === totalLevel[1] ? styles.maxLvl : styles.notMaxLvl}>Lv {totalLevel[0]}</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.chevronDownIcon}>
                    <ChevronDownIcon className={styles.icon} />
                </div>
            </div>
            <div className={styles.skillDesc}>
                {skill.ranks.map((rank, i) => (
                    <div key={i} className={rank.level === totalLevel[0] ? `${styles.rankContainer} ${styles.activeSkillLevel}` : `${styles.rankContainer}`}>
                        <p>Level {rank.level}</p>
                        <p>{rank.description}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}