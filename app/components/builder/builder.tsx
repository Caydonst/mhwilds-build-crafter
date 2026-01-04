import styles from "./page.module.css"
import React, {useEffect, useState} from "react";
import CancelConfirm from "./cancelConfirm/cancelConfirm"
import SkillSelector from "./skillSelector/skillSelector"
import {ChevronDownIcon, ChevronRightIcon, XMarkIcon} from "@heroicons/react/24/outline";
import {generateBuild} from "@/app/api/buildGenerator/buildGenerator"
import type {Skill, Build as BuildType} from "@/app/api/types/types"
import Build from "./build/build"


type SkillFilter = {
    id: number;
    name: string;
    level: number;
}

type props = {
    builderOpen: boolean;
    setBuilderOpen: React.Dispatch<React.SetStateAction<boolean>>;
    skillData: Skill[];
}

export default function Builder({ builderOpen, setBuilderOpen, skillData }: props) {
    const [openConfirmContainer, setOpenConfirmContainer] = useState(false);
    const [skillFilters, setSkillFilters] = useState<SkillFilter[]>([{id: 0, name: "Select", level: 1}]);
    const [weapons, setWeapons] = useState<string[]>();
    const [weaponNames, setWeaponNames] = useState<string[]>(["Bow", "Charge Blade", "Dual Blades", "Great Sword", "Gunlance", "Hammer", "Heavy Bowgun", "Hunting Horn", "Insect Glaive", "Lance", "Light Bowgun", "Long Sword", "Switch Axe", "Sword & Shield"]);
    const [selectedWeapon, setSelectedWeapon] = useState(null);
    const [openWeaponSelectorDropdown, setOpenWeaponSelectorDropdown] = useState(false);
    const [id, setId] = useState<number>(0);
    const [generatedBuilds, setGeneratedBuilds] = useState<Build[]>([]);

    function closeBuilder() {
        setBuilderOpen(false);
        setOpenConfirmContainer(false);
    }

    function updateSkillFilters(id: number) {
        setSkillFilters(prev => [...prev, {id: id+1, name: "Select"}])
        setId(id);

    }

    function hasValidSkill() {
        if (selectedWeapon) {
            for (const { name } of skillFilters) {
                if (name !== "Select") {
                    return true;
                }
            }
        } else {
            return false;
        }
    }

    useEffect(() => {
        console.log(skillFilters);
    }, [skillFilters]);

    const removeSkillFilter = React.useCallback((idToRemove: number) => {
        setSkillFilters(prev => prev.filter(skill => skill.id !== idToRemove));
    }, []);

    console.log(skillFilters[skillFilters.length-1]);

    useEffect(() => {
        async function loadKinds() {
            const res = await fetch("https://wilds.mhdb.io/en/weapons");
            const weapons = await res.json();
            setWeapons([...new Set(weapons.map(w => w.kind))]);
        }

        loadKinds();
    }, []);

    function generateBuilds(skillFilters: SkillFilter[], selectedWeapon: any) {
        const builds = generateBuild(skillFilters, selectedWeapon)
        console.log(builds);
        setGeneratedBuilds(builds);
    }

    return (
        <div className={styles.builderWrapper}>
            <div className={styles.builderContainer}>
                <div className={styles.buildGeneratorHeader}>
                    Build Generator
                </div>
                <div className={styles.mainContainer}>
                    <div className={styles.buildInfoContainer}>
                        <div className={styles.buildNameContainer}>
                            <label className={styles.buildNameLabel} htmlFor={"buildName"}>Build Name</label>
                            <input className={styles.buildNameInput} id={"buildName"} name={"buildName"} type={"text"} placeholder={"Build name"} />
                        </div>
                        <div className={styles.buildWeaponContainer}>
                            <p>Select Weapon:</p>
                            <div className={styles.weaponSelector} onClick={() => setOpenWeaponSelectorDropdown(!openWeaponSelectorDropdown)}>
                                {selectedWeapon ? (
                                    <>
                                        <div className={styles.weaponSelectorLeft}>
                                            <span className={`${styles.weaponIcon} ${styles[`${selectedWeapon}`]}`}></span>
                                            {weaponNames[weapons.indexOf(selectedWeapon)]}
                                        </div>
                                        <ChevronDownIcon className={styles.dropDownIcon} />
                                    </>
                                ) : (
                                    <>
                                    <span>
                                        Select
                                    </span>
                                        <ChevronDownIcon className={styles.dropDownIcon} />
                                    </>
                                )}
                                {openWeaponSelectorDropdown && (
                                    <div className={`${styles.weaponDropdown} ${openWeaponSelectorDropdown ? styles.open : ""}`}>
                                        {weapons?.map((weapon, index) => (
                                            <button key={index} onClick={() => setSelectedWeapon(weapon)}><span className={`${styles.weaponIcon} ${styles[`${weapon}`]}`} />{weaponNames[index]}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.skillSelectorContainer}>
                            <p>Select Skills:</p>
                            {skillFilters.map((skill: SkillFilter) => (
                                <SkillSelector key={skill.id} id={skill.id} thisSkill={skill} skillFilters={skillFilters} setSkillFilters={setSkillFilters} skillData={skillData} onRemove={removeSkillFilter} />
                            ))}
                            <button className={styles.addSkillBtn} onClick={() => updateSkillFilters(id+1)}>+ Skill Filter</button>
                        </div>
                        <div className={styles.generateBuildsBtnContainer}>
                            <button className={styles.generateBuildsBtn} disabled={!hasValidSkill()} onClick={() => generateBuilds(skillFilters, selectedWeapon)}>Generate Builds</button>
                            {!hasValidSkill() && (
                                <p>Select a weapon and add skills to generate builds.</p>
                            )}
                        </div>
                    </div>
                    <div className={styles.generatedBuildsContainer}>
                        <div className={styles.header}>Generated Builds</div>
                        <div className={styles.generatedBuilds}>
                            {generatedBuilds.length > 0 ? (
                                <div className={styles.buildsContainer}>
                                    {generatedBuilds.map((build: BuildType, index: number) => (
                                        <Build build={build} key={index} />
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.noBuildsMsg}>No builds for this configuration.</p>
                            )}
                        </div>
                    </div>
                    <div className={styles.centerArrow}><ChevronRightIcon /></div>
                    <hr />
                </div>
                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={() => setOpenConfirmContainer(true)}>Cancel</button>
                    <button className={styles.saveBtn}>Save</button>
                </div>
            </div>
            <CancelConfirm
                openConfirmContainer={openConfirmContainer}
                setOpenConfirmContainer={setOpenConfirmContainer}
                closeBuilder={closeBuilder}
            />
        </div>
    )
}