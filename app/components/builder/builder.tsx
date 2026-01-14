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
    const [progress, setProgress] = useState({ tried: 0, total: 0, found: 0, pruned: 0 });

    const weaponDropdownRef = useRef<HTMLDivElement | null>(null);
    const workerRef = useRef<Worker | null>(null);

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

    const removeSkillFilter = React.useCallback((idToRemove: number) => {
        setSkillFilters(prev => prev.filter(skill => skill.id !== idToRemove));
    }, []);

    useEffect(() => {
        async function loadKinds() {
            if (weaponData) {
                setWeapons([...new Set(weaponData.map(w => w.kind))]);
            }
        }

        loadKinds().then(() => {return});
    }, [weaponData]);

    async function generateBuilds(skillFilters: SkillFilter[], weaponKind: string | null) {
        // kill any previous run
        workerRef.current?.terminate();

        setIsGenerating(true);
        setProgress({ tried: 0, total: 0, found: 0, pruned: 0 });

        const worker = new Worker(
            new URL("@/app/api/buildGenerator/buildWorker.ts", import.meta.url)
        );
        workerRef.current = worker;

        worker.onmessage = (e) => {
            const { type, payload } = e.data;

            if (type === "progress") {
                setProgress(payload);
                return;
            }

            if (type === "done") {
                setGeneratedBuilds(payload);
                setIsGenerating(false);
                worker.terminate();
                workerRef.current = null;
                return;
            }

            if (type === "error") {
                console.error("Worker generator error:", payload);
                setIsGenerating(false);
                worker.terminate();
                workerRef.current = null;
            }
        };

        worker.onerror = (err) => {
            console.error("Worker error:", err);
            setIsGenerating(false);
            worker.terminate();
            workerRef.current = null;
        };

        worker.postMessage({ skillFilters, weaponKind });
    }

    function cancelGenerate() {
        workerRef.current?.terminate();
        workerRef.current = null;
        setIsGenerating(false);
    }

    useEffect(() => {
        console.log(generatedBuilds)
    }, [generatedBuilds]);


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

    const pct =
        progress.total > 0 ? (progress.tried / progress.total) * 100 : 0;

    const width = progress.tried > 0 ? Math.max(pct, 1) : 0; // min 1%

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
                                <div className={styles.progressContainer}>
                                    <div className={styles.progress}>
                                        <span className={styles.spinnerWrapper}>
                                        <span className={styles.spinner}></span>
                                        Generating builds...
                                    </span>
                                    </div>
                                    <div className={styles.buildsFoundContainer}>
                                        <h3>Builds Found</h3>
                                        <p>{progress.found} / 10</p>
                                    </div>
                                    <button onClick={cancelGenerate}>Cancel</button>
                                    {/*<div>Pruned: {progress.pruned.toLocaleString()}</div>*/}
                                </div>
                            ) : (
                                generatedBuilds.length > 0 ? (
                                    <div className={styles.buildsContainer}>
                                        {generatedBuilds.map((build: BuildType, index: number) => (
                                            <Build key={index} index={index} build={build} skillData={skillData} />
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