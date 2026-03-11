import styles from "./page.module.css"
import React, {useEffect, useRef, useState} from "react"
import {ChevronDownIcon} from "@heroicons/react/24/outline";
import {useGameData} from "@/app/hooks/useGameData";
import {XMarkIcon, InformationCircleIcon} from "@heroicons/react/24/outline";
import {type BuilderBuild, Skill} from "@/app/api/types/types";
import {createCharm} from "./helperFunctions"

type props = {
    charmCreatorOpen: boolean;
    setCharmCreatorOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setGearSelectorOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setBuild: React.Dispatch<React.SetStateAction<BuilderBuild>>;
    build: BuilderBuild;
}

type CharmSkill = {
    id: number;
    skillId: number;
    name: string;
    level: number;
}

export default function CharmCreator({ charmCreatorOpen, setCharmCreatorOpen, setGearSelectorOpen, setBuild, build }: props) {
    const { skills } = useGameData();

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [validSkills, setValidSkills] = useState(skills.filter(skill => skill.kind === "weapon" || skill.kind === "armor"));
    const [skillList, setSkillList] = useState<CharmSkill[]>([{ id: 0, skillId: -1, name: "Select", level: 1 }]);
    const [currentSkillId, setCurrentSkillId] = useState(0);
    const [decoList, setDecoList] = useState([0]);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [allDecoSlots, setAllDecoSlots] = useState([
        ["None"],
        ["1"],
        ["1", "1"],
        ["2"],
        ["2", "1"],
        ["3"],
        ["W1"],
        ["W1", "1"],
        ["W1", "1", "1"],
    ]);
    const [selectedDecoCard, setSelectedDecoCard] = useState<number>(0);

    function addSkill() {
        const newId = currentSkillId + 1;
        setSkillList(prev => [...prev, { id: newId, skillId: -1, name: "Select", level: 1 }]);
        setCurrentSkillId(newId);
    }

    function deleteSkill(index: number) {
        setSkillList(prev => prev.filter(skill => skill.id !== index));
    }

    function getSkillLevel(skill: CharmSkill) {
        const foundSkill = skills.find(s => s.id === skill.skillId);
        console.log(foundSkill);
        const skillRanks = [];
        if (foundSkill) {
            for (const rank of foundSkill.ranks) {
                skillRanks.push(rank.level);
            }
        }

        console.log("Skill ranks: " + skillRanks);

        return skillRanks;
    }

    function handleSkillClick(currentSkill: CharmSkill, chosenSkill: Skill) {
        setSearchQuery("");
        const newSkillList = skillList.map(s => {
            if (s.id === currentSkill.id) {
                return {
                    ...s,
                    skillId: chosenSkill.id,
                    name: chosenSkill.name,
                }
            } else {
                return s;
            }
        });

        console.log(newSkillList);

        setSkillList(newSkillList);
    }

    function changeSkillLevel(skill: CharmSkill, lvl: number) {
        const newSkillList = skillList.map(s => {
            if (s.id !== skill.id) {
                return s;
            } else {
                return {
                    ...s,
                    level: lvl,
                }
            }
        })

        setSkillList(newSkillList);
    }

    function checkCharmReqs() {
        let reqsMet = false;
        for (const skill of skillList) {
            if (skill.name !== "Select") {
                reqsMet = true;
            }
        }

        return reqsMet;
    }

    const findSkillIcon = (skillId: number): number => {
        const foundSkill = skills?.find((thisSkill) => thisSkill.id === skillId);
        return foundSkill?.icon.id ?? 0;
    };

    function updateSearchQuery(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchQuery(event.target.value);
    }

    const filteredSkills = React.useMemo(
        () =>
            (validSkills ?? [])
                .filter((skill: Skill) =>
                    !skillList.some((f) => f.skillId === skill.id)
                )
                .filter(skill =>
                    skill.name.toLowerCase().startsWith(searchQuery.toLowerCase())
                )
                .sort((a, b) => a.icon.id - b.icon.id),
        [validSkills, skillList, searchQuery]
    );

    function constructCharm() {
        const charmSuccessful = createCharm(skillList, skills, allDecoSlots[selectedDecoCard]);
        if (charmSuccessful) {
            setBuild(prev => ({...prev, charm: charmSuccessful}))
            setGearSelectorOpen(false);
        }
    }

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (!openDropdown) return;

            const currentRef = dropdownRefs.current[openDropdown];

            if (currentRef && !currentRef.contains(e.target as Node)) {
                setOpenDropdown(null);
                setSearchQuery("");
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openDropdown]);

    return (
        <div className={charmCreatorOpen ? `${styles.charmCreatorWrapper} ${styles.open}` : styles.charmCreatorWrapper}>
            <div className={styles.charmCreatorInner}>
                <h3>Charm Creator</h3>
                <div className={styles.skillsContainer}>
                    <p>Skills</p>
                    {skillList.map((skill, dropdownIndex) => {
                        const skillKey = `skill-${dropdownIndex}`;
                        const lvlKey = `skill-${dropdownIndex}-lvl`;
                        const isSkillOpen = openDropdown === skillKey;
                        const isLvlOpen = openDropdown === lvlKey

                        return (
                            <div key={dropdownIndex} className={styles.reinforcementWrapper}>
                                <div ref={(el) => {dropdownRefs.current[skillKey] = el;}} className={styles.reinforcement}>
                                    <div className={styles.reinforcementInner} onClick={() => setOpenDropdown((prev) => (prev === skillKey ? null : skillKey))}>
                                        <div className={styles.reinforcementInnerLeft}>
                                            {skill.skillId !== -1 && (
                                                <span className={`${styles.skillIcon} ${styles[`skill${findSkillIcon(skill.skillId)}`]}`}></span>
                                            )}
                                            <p>{skill.name}</p>
                                        </div>
                                        <ChevronDownIcon className={styles.chevronIcon} />
                                    </div>
                                    {isSkillOpen && (
                                        <div className={styles.reinforcementDropdown}>
                                            <div className={styles.searchContainer}>
                                                <input type={"text"} placeholder={"Search"} value={searchQuery} onChange={(e) => updateSearchQuery(e)} />
                                            </div>
                                            <div className={styles.dropdownSkillsContainer}>
                                                {Object.entries(filteredSkills).map(([key, value]) => (
                                                    <button key={key} onClick={() => {
                                                        handleSkillClick(skill, value);
                                                        setOpenDropdown(null);
                                                    }}><span className={`${styles.skillIcon} ${styles[`skill${findSkillIcon(value.id)}`]}`}></span>{value.name}</button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {skillList[dropdownIndex].name !== "Select" && (
                                    <div className={styles.lvlWrapper} ref={(el) => {dropdownRefs.current[lvlKey] = el}}>
                                        <div className={styles.lvlContainer} onClick={() => setOpenDropdown((prev) => (prev === lvlKey ? null : lvlKey))}>
                                            <p>{skillList[dropdownIndex].level}</p>
                                            <ChevronDownIcon className={styles.chevronIcon} />
                                        </div>
                                        {isLvlOpen && (
                                            <div className={styles.reinforcementDropdown}>
                                                <div className={styles.skillLvlContainer}>
                                                    {getSkillLevel(skill).map((lvl: number, index: number) => (
                                                        <button key={index} onClick={() => {
                                                            changeSkillLevel(skill, lvl);
                                                            setOpenDropdown(null); // close after pick
                                                        }}>
                                                            {lvl}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <button className={styles.deleteBtn} onClick={() => deleteSkill(skill.id)}><XMarkIcon /></button>
                            </div>
                        )
                    })}
                    <button className={styles.addSkillBtn} disabled={skillList.length === 3} onClick={() => addSkill()}>+ Skill</button>
                    <div className={styles.msgContainer}>
                        <span><InformationCircleIcon /></span>
                        <p className={styles.msg}>Crafted charms can have 1-3 skills. You will be unable to add more than 3 skills.</p>
                    </div>
                </div>
                <div className={styles.decoContainer}>
                    <p>Decoration Slots</p>
                    <div className={styles.decoSlotsContainer}>
                        {allDecoSlots.map((decoSlot, decoCardIndex) => (
                            <div key={decoCardIndex} className={selectedDecoCard === decoCardIndex ? `${styles.decoCard} ${styles.selected}` : styles.decoCard} onClick={() => setSelectedDecoCard(decoCardIndex)}>
                                {decoSlot.map((slot, decoSlotIndex) => (
                                    <div key={decoSlotIndex} className={styles.decoSlot}>
                                        <span className={`${styles.decoIcon} ${styles[`deco${slot}`]}`}></span>
                                        <p>{slot}</p>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className={styles.msgContainer}>
                        <span><InformationCircleIcon /></span>
                        <p className={styles.msg}> Crafted charms can have 1-3 decoration slots. Enter the level into each slot. If you would not like to utilize a slot, leave it empty.</p>
                    </div>
                </div>
                <div className={styles.addBtnContainer}>
                    <button className={styles.addBtn} disabled={!checkCharmReqs()} onClick={() => constructCharm()}>Equip</button>
                </div>
            </div>
            <button className={styles.backBtn} onClick={() => setCharmCreatorOpen(false)}><ChevronDownIcon className={styles.arrowLeftIcon} /></button>
        </div>
    )
}