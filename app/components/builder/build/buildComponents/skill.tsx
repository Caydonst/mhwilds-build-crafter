import styles from "../page.module.css"
import type {Skill as SkillType} from "@/app/api/types/types"

interface props {
    skill: SkillType;
    skillData: SkillType[] | null;
    totalLevel: [current: number, max: number];
}

export default function Skill({skill, skillData, totalLevel}: props) {

    const findSkillIcon = (skill: SkillType): number => {
        const foundSkill = skillData?.find((thisSkill) => thisSkill.id === skill.id);
        return foundSkill?.icon.id ?? 0;
    };

    const iconId = findSkillIcon(skill);

    return (
        <div className={styles.skill}>
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