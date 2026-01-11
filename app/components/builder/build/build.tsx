import styles from "./page.module.css"
import React, {useState} from "react";
import type {Build} from "@/app/api/types/types"
import type {Skill} from "@/app/api/types/types"

type props = {
    build: Build;
    skillData: Skill[] | null
}

export default function Build({ build, skillData }: props) {
    const [weaponIndex, setWeaponIndex] = useState(
        {
            "bow": 13,
            "charge-blade": 9,
            "dual-blades": 3,
            "great-sword": 1,
            "gunlance": 5,
            "hammer": 6,
            "heavy-bowgun": 12,
            "hunting-horn": 7,
            "insect-glaive": 10,
            "lance": 4,
            "light-bowgun": 11,
            "long-sword": 2,
            "switch-axe": 8,
            "sword-shield": 0
        }
    )
    const [armorIndex, setArmorIndex] = useState(
        {
            "head": 14,
            "chest": 15,
            "arms": 16,
            "waist": 17,
            "legs": 18,
            "charm": 19,
        }
    )

    function findSkillIcon(skill: Skill) {
        //console.log(`Skill:`)
        //console.log(skill)
        const foundSkill = skillData?.find(thisSkill => thisSkill.id === skill.id)
        //console.log(foundSkill?.icon.id)
        return foundSkill?.icon.id;
    }

    const pieces = [
        build.head,
        build.chest,
        build.arms,
        build.waist,
        build.legs,
        build.charm,
    ].filter(Boolean); // remove null/undefined

// Aggregate skills: { [skillId]: { skill, totalLevel } }
    const aggregatedSkillsMap: Record<number, { skill: Skill; totalLevel: number }> = {};

    pieces.forEach(piece => {
        piece.skills.forEach((s: any) => {
            const id = s.skill.id;
            if (!aggregatedSkillsMap[id]) {
                aggregatedSkillsMap[id] = { skill: s.skill, totalLevel: 0 };
            }
            aggregatedSkillsMap[id].totalLevel += s.level;
        });
    });

// Turn map into array for rendering (you can sort if you want)
    const aggregatedSkills = Object.values(aggregatedSkillsMap);

    return (
        <div className={styles.buildContainer}>
            {Object.values(build).map((slot, index)  => (
                <div key={index} className={styles.buildPieceContainer}>
                    <div className={styles.pieceContainerHeader}>
                        <span
                            className={styles.buildPieceIcon}
                            style={{backgroundPosition: `calc((-64px * ${slot !== null && ("charm" in slot ? armorIndex["charm"] : armorIndex[slot.kind])}) * var(--build-icon-size)) calc((-64px * ${slot?.rarity}) * var(--build-icon-size))`}}
                        />
                        <div className={styles.buildPieceInfo}>
                            <p className={`${styles.pieceTitle}`}>{slot?.name}</p>
                            <p className={`${styles.pieceRarity} ${styles[`rarity${slot?.rarity}`]}`}>{`Rarity ${slot?.rarity}`}</p>
                        </div>
                    </div>
                    <div className={styles.decoSlotsContainer}>
                        {"slots" in slot && slot?.slots.map((s, index) => (
                            <div key={index} className={styles.slot}>
                                <span className={`${styles.decoIcon} ${styles[`deco${s}`]}`}></span>
                            </div>
                        ))}
                    </div>
                    {/*<div className={styles.skillsContainer}>
                    {build.legs?.skills.map((skill, index) => (
                        <div key={index} className={styles.skill}>
                            <span className={`${styles.skillIcon} ${styles[`skill${findSkillIcon(skill)}`]}`}></span>
                            <div className={styles.skillInfo}>
                                <p>{skill.skill.name}</p>
                                <div className={styles.separator}></div>
                                <p>{`Lvl ${skill.level}`}</p>
                            </div>
                        </div>
                    ))}
                </div>*/}
                </div>
            ))}

            <div className={styles.skillsContainer}>
                {aggregatedSkills.map(({ skill, totalLevel }) => (
                    <div key={skill.id} className={styles.skill}>
            <span
                className={`${styles.skillIcon} ${styles[`skill${findSkillIcon(skill)}`]}`}
            ></span>
                        <div className={styles.skillInfo}>
                            <p>{skill.name}</p>
                            <div className={styles.separator}></div>
                            <div className={styles.skillLvlContainer}>
                                {Array.from({ length: totalLevel }).map((_, i) => (
                                    <div key={i} className={styles.skillLvl}>
                                        <div></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}