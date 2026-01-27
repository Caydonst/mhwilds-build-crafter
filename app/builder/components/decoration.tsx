import styles from "./page.module.css"
import type {Decoration as DecoType} from "@/app/api/types/types"
import React from "react";

interface Props {
    deco: DecoType;
    addDecoration: (decoration: DecoType) => void;
}

export default function Decoration({ deco, addDecoration }: Props) {
    return (
        <div className={styles.decorationContainer} onClick={() => addDecoration(deco)}>
            <span className={`${styles.decoIcon} ${styles[`deco${deco.slot}`]}`} />
            <div className={styles.decoInfo}>
                <p className={styles.decoName}>{deco.name}</p>
                <p className={styles.decoSkills}>
                    {deco.skills.map((skill, i) => (
                        <p key={i} className={styles.decoSkill}>{skill.skill.name} {skill.level}</p>
                    ))}
                </p>
            </div>
        </div>
    )
}