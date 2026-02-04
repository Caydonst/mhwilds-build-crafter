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
type BonusType = {
    id: number;
    count: number;
}

export default function SkillsComponent({ build, skills, armorSets }: Props) {
    const [equipSkillsOpen, setEquipSkillsOpen] = useState(true);
    const [bonusSkillsOpen, setBonusSkillsOpen] = useState(true);
    const [groupSkillsOpen, setGroupSkillsOpen] = useState(true);
    const [equipSkillsHeight, setEquipSkillsHeight] = useState<number>(70);
    const [bonusSkillsHeight, setBonusSkillsHeight] = useState<number>(70);
    const [groupSkillsHeight, setGroupSkillsHeight] = useState<number>(70);
    const equipSkillsRef = useRef<HTMLDivElement>(null);
    const bonusSkillsRef = useRef<HTMLDivElement>(null);
    const groupSkillsRef = useRef<HTMLDivElement>(null);

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
    /*

    const setBonuses = useMemo(() => {
        const bonusesArray: BonusType[] = [];
        const activeBonuses = [];
        const pieces = [build.head, build.chest, build.arms, build.waist, build.legs];

        for (const piece of pieces) {
            const setId = piece?.armorSet?.id;
            if (setId) {
                let found;
                bonusesArray.forEach((bonus: BonusType) => {
                    if (bonus.id === setId) {
                        found = true;
                        bonus.count++;
                    }
                })
                if (!found) {
                    bonusesArray.push({ id: setId, count: 1 })
                }
            }
        }

        for (const bonus of bonusesArray) {
            Object.values(armorSets).forEach((set) => {
                if (set.id === bonus.id) {
                    if (set.bonus) {
                        if (!activeBonuses.some(bonus => bonus.id === set.id)) {
                            activeBonuses.push({ bonus: set.bonus, ranks: [] });
                        }
                        set.groupBonus.ranks.forEach((rank) => {
                            if (bonus.count >= rank.pieces) {
                                activeBonuses.forEach((bonus) => {
                                    if (bonus.bonus.id === set.bonus.id) {
                                        bonus.ranks.push(rank);
                                    }
                                })
                            }
                        })
                    }
                }
            })
        }

        return {activeBonuses, bonusesArray};
    }, [build, armorSets]);

    const groupBonuses = useMemo(() => {
        const bonusesArray: BonusType[] = [];
        const activeBonuses = [];
        const pieces = [build.head, build.chest, build.arms, build.waist, build.legs];

        for (const piece of pieces) {
            const setId = piece?.armorSet?.id;
            if (setId) {
                let found;
                bonusesArray.forEach((bonus: BonusType) => {
                    if (bonus.id === setId) {
                        found = true;
                        bonus.count++;
                    }
                })
                if (!found) {
                    bonusesArray.push({ id: setId, count: 1 })
                }
            }
        }

        for (const bonus of bonusesArray) {
            Object.values(armorSets).forEach((set) => {
                if (set.id === bonus.id) {
                    if (set.groupBonus) {
                        if (!activeBonuses.some(bonus => bonus.id === set.id)) {
                            activeBonuses.push({ bonus: set.groupBonus, ranks: [] });
                        }
                        set.groupBonus.ranks.forEach((rank) => {
                            if (bonus.count >= rank.pieces) {
                                activeBonuses.forEach((bonus) => {
                                    if (bonus.bonus.id === set.groupBonus.id) {
                                        bonus.ranks.push(rank);
                                    }
                                })
                            }
                        })
                    }
                }
            })
        }

        return {activeBonuses, bonusesArray};
    }, [build, armorSets]);

    console.log("Set Bonuses")
    console.log(setBonuses.activeBonuses);
    console.log(setBonuses.bonusesArray);

    console.log("Group Bonuses")
    console.log(groupBonuses.activeBonuses);
    console.log(groupBonuses.bonusesArray);

     */

    useLayoutEffect(() => {
        const equipSkillsContent = equipSkillsRef.current;
        if (!equipSkillsContent) return;

        const openHeight1 = 70 + equipSkillsContent.scrollHeight; // header(50) + content
        setEquipSkillsHeight(equipSkillsOpen ? openHeight1 : 70);

        const bonusSkillsContent = bonusSkillsRef.current;
        if (!bonusSkillsContent) return;

        const openHeight2 = 70 + bonusSkillsContent.scrollHeight; // header(50) + content
        setBonusSkillsHeight(bonusSkillsOpen ? openHeight2 : 70);

        const groupSkillsContent = groupSkillsRef.current;
        if (!groupSkillsContent) return;

        const openHeight3 = 70 + groupSkillsContent.scrollHeight; // header(50) + content
        setGroupSkillsHeight(groupSkillsOpen ? openHeight3 : 70);
    }, [equipSkillsOpen, bonusSkillsOpen, groupSkillsOpen, aggregatedSkills.length]);

    return (
        <div className={styles.skillsComponentContainer}>
            <div className={styles.equipmentSkillsContainer} style={{ height: equipSkillsHeight }}>
                <div className={styles.equipSkillsHeader} onClick={() => setEquipSkillsOpen(!equipSkillsOpen)}>
                    <p>Equipment Skills</p>
                    <span className={equipSkillsOpen ? styles.rotated : ""}><ChevronDownIcon className={styles.chevronIcon} /></span>
                </div>
                <div ref={equipSkillsRef} className={styles.equipSkillsContent}>
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
            <div className={styles.equipmentSkillsContainer} style={{ height: bonusSkillsHeight }}>
                <div className={styles.equipSkillsHeader} onClick={() => setBonusSkillsOpen(!bonusSkillsOpen)}>
                    <p>Set Bonus Skills</p>
                    <span className={equipSkillsOpen ? styles.rotated : ""}><ChevronDownIcon className={styles.chevronIcon} /></span>
                </div>
                <div ref={bonusSkillsRef} className={styles.equipSkillsContent}>
                    <p className={styles.noSkills}>Coming soon</p>
                </div>
            </div>
            <div className={styles.equipmentSkillsContainer} style={{ height: groupSkillsHeight }}>
                <div className={styles.equipSkillsHeader} onClick={() => setGroupSkillsOpen(!groupSkillsOpen)}>
                    <p>Group Skills</p>
                    <span className={equipSkillsOpen ? styles.rotated : ""}><ChevronDownIcon className={styles.chevronIcon} /></span>
                </div>
                <div ref={groupSkillsRef} className={styles.equipSkillsContent}>
                    <p className={styles.noSkills}>Coming soon</p>
                </div>
            </div>
        </div>
    )
}