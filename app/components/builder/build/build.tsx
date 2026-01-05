import styles from "./page.module.css"
import React from "react";
import type {Build} from "@/app/api/types/types"
import type {Skill} from "@/app/api/types/types"

type props = {
    build: Build;
    skillData: Skill[]
}

export default function Build({ build, skillData }: props) {

    function findSkillIcon(skill) {
        const foundSkill = skillData.find(thisSkill => thisSkill.ranks.find(rank => rank.id === skill.id))
        console.log(skill.id)
        return foundSkill?.icon.id;
    }

    return (
        <div className={styles.buildContainer}>
            <div className={styles.buildWeaponContainer}>
                <div className={styles.weaponContainerHeader}>
                    <span
                        className={styles.buildWeaponIcon}
                        style={{backgroundPosition: `calc((-64px * 9) * var(--build-icon-size)) calc((-64px * ${build.weapon?.rarity}) * var(--build-icon-size))`}}
                    />
                    <div className={styles.buildWeaponInfo}>
                        <p className={`${styles.weaponTitle}`}>{build.weapon?.name}</p>
                        <p className={`${styles.weaponRarity} ${styles[`rarity${build.weapon?.rarity}`]}`}>{`Rarity ${build.weapon?.rarity}`}</p>
                    </div>
                </div>
                <div className={styles.skillsContainer}>
                    {build.weapon?.skills.map((skill, index) => (
                        <div key={index} className={styles.skill}>
                            <span className={`${styles.skillIcon} ${styles[`skill${findSkillIcon(skill)}`]}`}></span>
                            <div className={styles.skillInfo}>
                                <p>{skill.skill.name}</p>
                                <p>{skill.level}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}