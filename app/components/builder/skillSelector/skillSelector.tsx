import styles from "./page.module.css"
import {ChevronDownIcon, ChevronUpIcon, XMarkIcon} from "@heroicons/react/24/outline"
import React, {useEffect, useState, useRef} from "react";
import type {Skill} from "@/app/api/types/types"

type SkillFilter = {
    id: number,
    name: string,
}

type props = {
    id: number;
    skillData: Skill[];
    onRemove: (id: number) => void;
    thisSkill: SkillFilter;
    skillFilters: SkillFilter[];
    setSkillFilters: React.Dispatch<React.SetStateAction<SkillFilter[]>>;
}

export default function SkillSelector({ id, thisSkill, skillFilters, setSkillFilters, skillData, onRemove }: props) {
    const [openSkillFilterDropdown, setOpenSkillFilterDropdown] = useState(false)
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
    const [searchQuery, setSearchQuery] = useState("");
    const [skillLevel, setSkillLevel] = useState(1);
    const [openSkillLvlDropdown, setOpenSkillLvlDropdown] = useState(false);

    const skillDropdownRef = useRef<HTMLDivElement | null>(null);
    const skillLvlDropdownRef = useRef<HTMLDivElement | null>(null);

    function selectSkill(skill: Skill) {
        console.log(skillFilters)
        const updatedSkillFilters = skillFilters.map(skillFilter => {
            if (skillFilter.id === id) {
                return {...skillFilter, name: skill.name, level: 1}
            }
            return skillFilter
        })
        setSkillFilters(updatedSkillFilters);
        setSelectedSkill(skill);
        setSkillLevel(1);
        setOpenSkillFilterDropdown(false);
        console.log(openSkillFilterDropdown);
    }

    function updateSearchQuery(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchQuery(event.target.value);
    }

    function updateSkillLvl(level: number) {
        const updatedSkillFilters = skillFilters.map(skillFilter => {
            if (skillFilter.id === id) {
                return {...skillFilter, level: level}
            }
            return skillFilter
        })
        setSkillFilters(updatedSkillFilters);
        console.log(selectedSkill);
        setSkillLevel(level);
        setOpenSkillLvlDropdown(false);
    }

    useEffect(() => {
        if (!openSkillFilterDropdown) return;

        function handleClickOutside(e: MouseEvent) {
            if (
                skillDropdownRef.current &&
                !skillDropdownRef.current.contains(e.target as Node)
            ) {
                setOpenSkillFilterDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openSkillFilterDropdown]);

    useEffect(() => {
        if (!openSkillLvlDropdown) return;

        function handleClickOutside(e: MouseEvent) {
            if (
                skillLvlDropdownRef.current &&
                !skillLvlDropdownRef.current.contains(e.target as Node)
            ) {
                setOpenSkillLvlDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openSkillLvlDropdown]);

    const filteredSkills = React.useMemo(
        () =>
            skillData
                .filter(skill =>
                    skill.name.toLowerCase().startsWith(searchQuery.toLowerCase())
                )
                .sort((a, b) => a.icon.id - b.icon.id),
        [skillData, searchQuery]
    );

    return (
        <div className={styles.skillFilterContainer}>
            <div className={styles.skillFilterWrapper} ref={skillDropdownRef}>
                <div className={styles.skillFilter} onClick={() => setOpenSkillFilterDropdown(!openSkillFilterDropdown)}>
                    {selectedSkill !== null ? (
                        <>
                            <div className={styles.skillFilterLeft}>
                                <span className={`${styles.skillIcon} ${styles[`skill${selectedSkill.icon.id}`]}`}></span>
                                {selectedSkill.name}
                            </div>
                            <ChevronDownIcon className={styles.dropDownIcon} />
                        </>
                    ) : (
                        <>
                        <span>
                            {thisSkill.name}
                        </span>
                            <ChevronDownIcon className={styles.dropDownIcon} />
                        </>
                    )}
                </div>
            </div>
            {openSkillFilterDropdown && (
                <div className={`${styles.skillFilterDropdown} ${openSkillFilterDropdown ? styles.open : ""}`} ref={skillDropdownRef}>
                    <div className={styles.searchContainer}>
                        <input type={"text"} placeholder={"Search"} value={searchQuery} onChange={(e) => updateSearchQuery(e)} />
                    </div>
                    <div className={styles.skillsContainer}>
                        {filteredSkills.map((skill, index) => (
                            <button key={index} onClick={() => selectSkill(skill)}><span className={`${styles.skillIcon} ${styles[`skill${skill.icon.id}`]}`} />{skill.name}</button>
                        ))}
                    </div>
                </div>
            )}
            {selectedSkill  &&
                <div className={styles.lvlSelectorWrapper} ref={skillLvlDropdownRef}>
                    <div className={styles.lvlSelectorContainer} onClick={() => setOpenSkillLvlDropdown(!openSkillLvlDropdown)}>
                        <p>Lvl</p>
                        <p>{skillLevel}</p>
                        <div className={styles.lvlSelector}>
                            <span className={styles.lvlDownBtn}><ChevronDownIcon /></span>
                        </div>
                    </div>
                    <div className={`${styles.skillLvlDropdown} ${openSkillLvlDropdown ? styles.open : ""}`}>
                        {selectedSkill &&
                            selectedSkill.ranks.map((rank, i) => (
                                <button key={i} onClick={() => updateSkillLvl(rank.level)}>{rank.level}</button>
                            ))
                        }
                    </div>
                </div>

            }
            <button className={styles.removeSkillFilterBtn} onClick={() => onRemove(id)}><XMarkIcon className={styles.xmarkIcon} /></button>
        </div>
    )
}