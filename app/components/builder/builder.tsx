import styles from "./page.module.css"
import React, {useEffect, useRef, useState} from "react";
import CancelConfirm from "./cancelConfirm/cancelConfirm"
import SkillSelector from "./skillSelector/skillSelector"
import {ChevronDownIcon, ChevronRightIcon, XMarkIcon} from "@heroicons/react/24/outline";
import {generateBuild} from "@/app/api/buildGenerator/buildGenerator"
import type {Skill, Build as BuildType, Weapon, SkillFilter} from "@/app/api/types/types"
import Build from "./build/build"

type props = {
    builderOpen: boolean;
    setBuilderOpen: React.Dispatch<React.SetStateAction<boolean>>;
    weaponData: Weapon[] | null;
    skillData: Skill[] | null;
}

export default function Builder({ builderOpen, setBuilderOpen, weaponData, skillData }: props) {
    const [openConfirmContainer, setOpenConfirmContainer] = useState(false);
    const [skillFilters, setSkillFilters] = useState<SkillFilter[]>([{id: 0, skillId: -1, name: "Select", level: 1}]);
    const [weapons, setWeapons] = useState<string[]>();
    const [weaponNames, setWeaponNames] = useState<string[]>(["Bow", "Charge Blade", "Dual Blades", "Great Sword", "Gunlance", "Hammer", "Heavy Bowgun", "Hunting Horn", "Insect Glaive", "Lance", "Light Bowgun", "Long Sword", "Switch Axe", "Sword & Shield"]);
    const [weaponKind, setWeaponKind] = useState<string | null>(null);
    const [openWeaponSelectorDropdown, setOpenWeaponSelectorDropdown] = useState(false);
    const [id, setId] = useState<number>(0);
    const [generatedBuilds, setGeneratedBuilds] = useState<BuildType[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const weaponDropdownRef = useRef<HTMLDivElement | null>(null);

    function closeBuilder() {
        setBuilderOpen(false);
        setOpenConfirmContainer(false);
    }

    function updateSkillFilters(id: number) {
        const newId = id+1;
        setSkillFilters(prev => [...prev, {id: newId, skillId: -1, name: "Select", level: 1}]);
        setId(newId);
    }

    function hasValidSkill() {
        if (weaponKind) {
            for (const { name } of skillFilters) {
                if (name !== "Select") {
                    return true;
                }
            }
        } else {
            return false;
        }
    }

    function updateWeapon(weapon: string) {
        setWeaponKind(weapon)
        setOpenWeaponSelectorDropdown(false);
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
            if (weaponData) {
                setWeapons([...new Set(weaponData.map(w => w.kind))]);
            }
        }

        loadKinds().then(() => {return});
    }, [weaponData]);

    async function generateBuilds(skillFilters: SkillFilter[], weaponKind: string | null) {
        setIsGenerating(true);

        try {
            const builds = await new Promise<BuildType[]>((resolve) => {
                // Yield to the event loop so React can paint "isGenerating = true"
                setTimeout(() => {
                    const result = generateBuild(skillFilters, weaponKind);
                    resolve(result);
                }, 100);
            });

            console.log(builds);
            setGeneratedBuilds(builds);
        } finally {
            setIsGenerating(false);
        }
    }

    useEffect(() => {
        if (!openWeaponSelectorDropdown) return;

        function handleClickOutside(e: MouseEvent) {
            if (
                weaponDropdownRef.current &&
                !weaponDropdownRef.current.contains(e.target as Node)
            ) {
                setOpenWeaponSelectorDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openWeaponSelectorDropdown]);

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
                        <div className={styles.weaponSelectorContainer}>
                            <p className={styles.weaponS}>Select Weapon:</p>
                            <div className={styles.weaponSelectorWrapper} ref={weaponDropdownRef}>
                                <div className={styles.weaponSelector} onClick={() => setOpenWeaponSelectorDropdown(!openWeaponSelectorDropdown)}>
                                    {weaponKind ? (
                                        <>
                                            <div className={styles.weaponSelectorLeft}>
                                                <span className={`${styles.weaponIcon} ${styles[`${weaponKind}`]}`}></span>
                                                {weapons && (
                                                    <span>{weaponNames[weapons.indexOf(weaponKind)]}</span>
                                                )}
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
                                </div>
                                {openWeaponSelectorDropdown && (
                                    <div className={`${styles.weaponDropdown} ${openWeaponSelectorDropdown ? styles.open : ""}`}>
                                        {weapons?.map((weapon, index) => (
                                            <button key={index} onClick={() => updateWeapon(weapon)}><span className={`${styles.weaponIcon} ${styles[`${weapon}`]}`} />{weaponNames[index]}</button>
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
                            <button className={styles.addSkillBtn} onClick={() => updateSkillFilters(id)}>+ Skill Filter</button>
                        </div>
                        <div className={styles.generateBuildsBtnContainer}>
                            <button
                                className={styles.generateBuildsBtn}
                                disabled={!hasValidSkill() || isGenerating}
                                onClick={() => generateBuilds(skillFilters, weaponKind)}
                            >
                                {isGenerating ? (
                                    <span className={styles.spinnerWrapper}>
                                        <span className={styles.spinner}></span>
                                        Generating...
                                    </span>
                                ) : (
                                    "Generate Builds"
                                )}
                            </button>
                            {!hasValidSkill() && !isGenerating && (
                                <p>Select a weapon and add skills to generate builds.</p>
                            )}
                        </div>
                    </div>
                    <div className={styles.generatedBuildsContainer}>
                        <div className={styles.header}>Generated Builds</div>
                        <div className={styles.generatedBuilds}>
                            {isGenerating ? (
                                <span className={styles.spinnerWrapperBuildsContainer}>
                                    <span className={styles.spinnerBuildsContainer}></span>
                                </span>
                            ) : (
                                generatedBuilds.length > 0 ? (
                                    <div className={styles.buildsContainer}>
                                        {generatedBuilds.map((build: BuildType, index: number) => (
                                            <Build build={build} skillData={skillData} key={index} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className={styles.noBuildsMsg}>No builds for this configuration.</p>
                                )
                            )}

                        </div>
                    </div>

                    <hr />
                </div>
                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={() => setOpenConfirmContainer(true)}>Cancel</button>
                    {/*<button className={styles.saveBtn}>Save</button>*/}
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