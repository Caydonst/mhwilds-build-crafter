import styles from "@/app/components/builder/buildBreakdown/page.module.css";
import Skill from "@/app/components/builder/build/buildComponents/skill";
import React from "react";
import {Armor, ArmorSkill, CharmRank, Skill as SkillType} from "@/app/api/types/types";

interface Props {
    skillData: SkillType[] | null;
    buildStats: any;
}

export default function GearPieceBreakdown({ buildStats, skillData }: Props) {

    function getMaxLvl(skill: ArmorSkill) {
        return skill.skill.ranks[skill.skill.ranks.length-1].level;
    }

    console.log(buildStats);

    return (
        <>
            <div className={styles.gearPieceStatsContainer}>
                <div className={styles.gearPieceStats}>
                    <div className={styles.defense}>
                        <div className={styles.left}>
                            <span></span>
                            <p>Defense</p>
                        </div>
                        <div className={styles.right}>
                            <p>{buildStats.defense}</p>
                        </div>
                    </div>
                    <div className={styles.res}>
                        <div className={styles.left}>
                            <span></span>
                            <p>Fire Res</p>
                        </div>
                        <div className={styles.right}>
                            <p>{buildStats.resistances?.fire}</p>
                        </div>
                    </div>
                    <div className={styles.res}>
                        <div className={styles.left}>
                            <span></span>
                            <p>Water Res</p>
                        </div>
                        <div className={styles.right}>
                            <p>{buildStats.resistances?.water}</p>
                        </div>
                    </div>
                    <div className={styles.res}>
                        <div className={styles.left}>
                            <span></span>
                            <p>Thunder Res</p>
                        </div>
                        <div className={styles.right}>
                            <p>{buildStats.resistances?.thunder}</p>
                        </div>
                    </div>
                    <div className={styles.res}>
                        <div className={styles.left}>
                            <span></span>
                            <p>Ice Res</p>
                        </div>
                        <div className={styles.right}>
                            <p>{buildStats.resistances?.ice}</p>
                        </div>
                    </div>
                    <div className={styles.res}>
                        <div className={styles.left}>
                            <span></span>
                            <p>Dragon Res</p>
                        </div>
                        <div className={styles.right}>
                            <p>{buildStats.resistances?.dragon}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}