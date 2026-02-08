import styles from "./page.module.css"
import React, {useLayoutEffect, useMemo, useRef, useState} from "react";
import {BuilderBuild, type Skill as SkillType, ArmorSet} from "@/app/api/types/types";
import {addDecoSkillsToAggregate, addSkillLevel} from "@/app/components/builder/build/buildComponents/helperFunctions";
import Skill from "@/app/components/builder/build/buildComponents/skill";
import {ChevronDownIcon} from "@heroicons/react/24/outline"
import {findBonuses} from "./helperFunctions"

interface Props {
    build: BuilderBuild;
    skills: SkillType[];
    armorSets: ArmorSet[];
}

export default function SkillsComponent({ build, skills, armorSets }: Props) {
    const [equipSkillsOpen, setEquipSkillsOpen] = useState(true);
    const [bonusSkillsOpen, setBonusSkillsOpen] = useState(true);
    const [groupSkillsOpen, setGroupSkillsOpen] = useState(true);
    //const [equipSkillsHeight, setEquipSkillsHeight] = useState<number>(70);
    //const [bonusSkillsHeight, setBonusSkillsHeight] = useState<number>(70);
    //const [groupSkillsHeight, setGroupSkillsHeight] = useState<number>(70);
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


    const getBonuses = useMemo(() => {
        const bonuses = findBonuses(build, armorSets);
        return bonuses;
    }, [build, armorSets]);

    console.log("Bonuses")
    console.log(getBonuses.bonusesArray);
    console.log(getBonuses.groupBonuses);
    console.log(getBonuses.setBonuses);

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

    const bonusSkillsHeight = useCollapsibleHeight(
        bonusSkillsRef,
        bonusSkillsOpen
    );

    const groupSkillsHeight = useCollapsibleHeight(
        groupSkillsRef,
        groupSkillsOpen
    );

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
                    <span className={bonusSkillsOpen ? styles.rotated : ""}><ChevronDownIcon className={styles.chevronIcon} /></span>
                </div>
                <div ref={bonusSkillsRef} className={styles.equipSkillsContent}>
                    {getBonuses.setBonuses.length > 0 ? (
                        getBonuses.setBonuses.map((bonus) => (
                                <div key={bonus.bonus.id} className={styles.bonusSkillsContainer}>
                                    <span className={`${styles.skillIcon} ${styles.setBonusSkill}`}></span>
                                    <div className={styles.bonusSkill}>
                                        <p className={styles.bonusSkillTitle}>{bonus.bonus.skill.name}</p>
                                        <div className={styles.bonusSkillRanksContainer}>
                                            {bonus.bonus.ranks.map((rank, i) => {
                                                const isActive = i in bonus.ranks;
                                                return (
                                                    <p key={rank.id} className={isActive ? `${styles.rank} ${styles.active}` : `${styles.rank} ${styles.notActive}`}>{rank.skill.name}</p>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))
                    ) : (
                        <p className={styles.noSkills}>None</p>
                    )}
                </div>
            </div>
            <div className={styles.equipmentSkillsContainer} style={{ height: groupSkillsHeight }}>
                <div className={styles.equipSkillsHeader} onClick={() => setGroupSkillsOpen(!groupSkillsOpen)}>
                    <p>Group Skills</p>
                    <span className={groupSkillsOpen ? styles.rotated : ""}><ChevronDownIcon className={styles.chevronIcon} /></span>
                </div>
                <div ref={groupSkillsRef} className={styles.equipSkillsContent}>
                    {getBonuses.groupBonuses.length > 0 ? (
                        getBonuses.groupBonuses.map((bonus) => (
                            <div key={bonus.bonus.id} className={styles.bonusSkillsContainer}>
                                <span className={`${styles.skillIcon} ${styles.setBonusSkill}`}></span>
                                <div className={styles.bonusSkill}>
                                    <p className={styles.bonusSkillTitle}>{bonus.bonus.skill.name}</p>
                                    <div className={styles.bonusSkillRanksContainer}>
                                        {bonus.bonus.ranks.map((rank, i) => {
                                            const isActive = i in bonus.ranks;
                                            return (
                                                <p key={rank.id} className={isActive ? `${styles.rank} ${styles.active}` : `${styles.rank} ${styles.notActive}`}>{rank.skill.name}</p>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className={styles.noSkills}>None</p>
                    )}
                </div>
            </div>
        </div>
    )
}