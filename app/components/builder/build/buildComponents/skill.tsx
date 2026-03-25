import styles from "../page.module.css"
import type {Skill as SkillType} from "@/app/api/types/types"
import {InformationCircleIcon} from "@heroicons/react/24/outline";
import React, {useRef} from "react";

interface props {
    skill: SkillType;
    skillData: SkillType[] | null;
    totalLevel: [current: number, max: number];
    setHovering: React.Dispatch<React.SetStateAction<boolean>>;
    handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
    setHoveredSkill: React.Dispatch<React.SetStateAction<SkillType | null>>;
    setHoveredSkillLevel: React.Dispatch<React.SetStateAction<number>>;
}

export default function Skill({skill, skillData, totalLevel, setHovering, handleMouseMove, setHoveredSkill, setHoveredSkillLevel}: props) {


    const findSkillIcon = (skill: SkillType): number => {
        const foundSkill = skillData?.find((thisSkill) => thisSkill.id === skill.id);
        return foundSkill?.icon.id ?? 0;
    };

    const iconId = findSkillIcon(skill);

    return (
        <div className={styles.skill} onMouseMove={handleMouseMove} onMouseEnter={() => {
            setHovering(true);
            setHoveredSkill(skill);
            setHoveredSkillLevel(totalLevel[0])
        }} onMouseLeave={() => setHovering(false)}>
            <span className={`${styles.skillIcon} ${styles[`skill${iconId}`]}`} />
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
    )
}