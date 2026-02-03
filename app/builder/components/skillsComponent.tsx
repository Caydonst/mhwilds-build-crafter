import styles from "./page.module.css"
import React, {useLayoutEffect, useMemo, useRef, useState} from "react";
import {BuilderBuild, type Skill as SkillType, ArmorSet} from "@/app/api/types/types";
import {addDecoSkillsToAggregate, addSkillLevel} from "@/app/components/builder/build/buildComponents/helperFunctions";
import Skill from "@/app/components/builder/build/buildComponents/skill";
import {ChevronDownIcon} from "@heroicons/react/24/outline"

interface Props {
    build: BuilderBuild;
    skills: SkillType[];
    armorSets: ArmorSet[];
}

export default function SkillsComponent({ build, skills, armorSets }: Props) {
    const [equipSkillsOpen, setEquipSkillsOpen] = useState(true);
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number>(70);

    type AggregatedSkill = {
        skill: SkillType;
        totalLevel: [current: number, max: number];
    };

    const aggregatedSkills = useMemo(() => {
        const map: Record<number, AggregatedSkill> = {};
        const pieces = [build.weapon, build.head, build.chest, build.arms, build.waist, build.legs, build.charm];

        for (const piece of pieces) {
            if (!piece) continue;
            for (const s of piece.skills) {
                const id = s.skill?.id;
                if (!id) continue;
                addSkillLevel(skills, id, s.level ?? 0, map);
            }
        }

        if (build.decorations) {
            (Object.keys(build.decorations) as (keyof typeof build.decorations)[]).forEach((slot) => {
                addDecoSkillsToAggregate(skills, map, build.decorations[slot]);
            });
        }

        return Object.values(map).sort((a, b) => b.totalLevel[0] - a.totalLevel[0]);
    }, [build, skills]);

    const bonuses = useMemo(() => {
        const bonusesArray: number[] = [];
        const pieces = [build.head, build.chest, build.arms, build.waist, build.legs];

        for (const piece of pieces) {
            const setName = piece?.armorSet?.id;
            if (setName) bonusesArray.push(setName);
        }

        for (const bonus of bonusesArray) {
            Object.values(armorSets).forEach((set) => {
                if (set.id === bonus) {
                    console.log(set.bonus)
                    console.log(set.groupBonus)
                }
            })
        }

        return bonusesArray;
    }, [build, armorSets]);

    console.log(bonuses);

    useLayoutEffect(() => {
        const content = contentRef.current;
        if (!content) return;

        const openHeight = 70 + content.scrollHeight; // header(50) + content
        setHeight(equipSkillsOpen ? openHeight : 70);
    }, [equipSkillsOpen, aggregatedSkills.length]);

    return (
        <div className={styles.skillsComponentContainer}>
            <div className={styles.equipmentSkillsContainer} style={{ height }}>
                <div className={styles.equipSkillsHeader} onClick={() => setEquipSkillsOpen(!equipSkillsOpen)}>
                    <p>Equipment Skills</p>
                    <span className={equipSkillsOpen ? styles.rotated : ""}><ChevronDownIcon className={styles.chevronIcon} /></span>
                </div>
                <div ref={contentRef} className={styles.equipSkillsContent}>
                    {aggregatedSkills.length > 0 ? (
                        aggregatedSkills.map(({ skill, totalLevel }) => {
                            return (
                                <Skill key={skill.id} skill={skill} skillData={skills} totalLevel={totalLevel} />
                            );
                        })
                    ) : (
                        <p className={styles.noSkills}>None</p>
                    )}
                </div>
            </div>
            <div className={styles.equipmentSkillsContainer}>
                <div className={styles.equipSkillsHeader}>
                    <p>Set Bonus Skills</p>
                    <span className={equipSkillsOpen ? styles.rotated : ""}><ChevronDownIcon className={styles.chevronIcon} /></span>
                </div>
                <div className={styles.equipSkillsContent}>
                    <p className={styles.noSkills}>Coming soon</p>
                </div>
            </div>
            <div className={styles.equipmentSkillsContainer}>
                <div className={styles.equipSkillsHeader}>
                    <p>Group Skills</p>
                    <span className={equipSkillsOpen ? styles.rotated : ""}><ChevronDownIcon className={styles.chevronIcon} /></span>
                </div>
                <div className={styles.equipSkillsContent}>
                    <p className={styles.noSkills}>Coming soon</p>
                </div>
            </div>
        </div>
    )
}