import styles from "./page.module.css";
import React, { useMemo, useCallback, useEffect, useRef, useState } from "react";
import CancelConfirm from "./cancelConfirm/cancelConfirm";
import SkillSelector from "./skillSelector/skillSelector";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import type { Build as BuildType, Skill, SkillFilter, Weapon, WeaponKind } from "@/app/api/types/types";
import Build from "./build/build";

type Props = {
    builderOpen: boolean;
    setBuilderOpen: React.Dispatch<React.SetStateAction<boolean>>;
    weaponData: Weapon[] | null;
    skillData: Skill[] | null;
};

type WorkerProgress = {
    tried: number;
    total: number;
    found: number;
    pruned: number;
};

type WorkerMessage =
    | { type: "progress"; payload: WorkerProgress }
    | { type: "done"; payload: BuildType[] }
    | { type: "error"; payload: string };

const weaponLabelMap: Record<Exclude<WeaponKind, null>, string> = {
    bow: "Bow",
    "charge-blade": "Charge Blade",
    "dual-blades": "Dual Blades",
    "great-sword": "Great Sword",
    gunlance: "Gunlance",
    hammer: "Hammer",
    "heavy-bowgun": "Heavy Bowgun",
    "hunting-horn": "Hunting Horn",
    "insect-glaive": "Insect Glaive",
    lance: "Lance",
    "light-bowgun": "Light Bowgun",
    "long-sword": "Long Sword",
    "switch-axe": "Switch Axe",
    "sword-shield": "Sword & Shield",
};

export default function Builder({ builderOpen, setBuilderOpen, weaponData, skillData }: Props) {
    const [openConfirmContainer, setOpenConfirmContainer] = useState(false);
    const [skillFilters, setSkillFilters] = useState<SkillFilter[]>([
        { id: 0, skillId: -1, name: "Select", level: 1 },
    ]);

    const [weaponKind, setWeaponKind] = useState<WeaponKind>(null);
    const [openWeaponSelectorDropdown, setOpenWeaponSelectorDropdown] = useState(false);

    const [id, setId] = useState(0);
    const [generatedBuilds, setGeneratedBuilds] = useState<BuildType[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState<WorkerProgress>({
        tried: 0,
        total: 0,
        found: 0,
        pruned: 0,
    });

    const weaponDropdownRef = useRef<HTMLDivElement | null>(null);
    const workerRef = useRef<Worker | null>(null);

    function closeBuilder() {
        setBuilderOpen(false);
        setOpenConfirmContainer(false);
    }

    function updateSkillFilters(currentId: number) {
        const newId = currentId + 1;
        setSkillFilters((prev) => [...prev, { id: newId, skillId: -1, name: "Select", level: 1 }]);
        setId(newId);
    }

    function hasValidSkill(): boolean {
        if (!weaponKind) return false;
        return skillFilters.some((f) => f.name !== "Select");
    }

    function updateWeapon(weapon: Exclude<WeaponKind, null>) {
        setWeaponKind(weapon);
        setOpenWeaponSelectorDropdown(false);
    }

    const removeSkillFilter = useCallback((idToRemove: number) => {
        setSkillFilters((prev) => prev.filter((skill) => skill.id !== idToRemove));
    }, []);

    const weapons = useMemo<Array<Exclude<WeaponKind, null>>>(() => {
        if (!weaponData) return [];

        const kinds = weaponData
            .map((w) => w.kind)
            .filter((k): k is Exclude<WeaponKind, null> => k !== null);

        return Array.from(new Set(kinds));
    }, [weaponData]);

    function generateBuilds(nextSkillFilters: SkillFilter[], nextWeaponKind: WeaponKind) {
        // kill any previous run
        workerRef.current?.terminate();

        setIsGenerating(true);
        setProgress({ tried: 0, total: 0, found: 0, pruned: 0 });

        const worker = new Worker(new URL("@/app/api/buildGenerator/buildWorker.ts", import.meta.url));
        workerRef.current = worker;

        worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
            const msg = e.data;

            if (msg.type === "progress") {
                setProgress(msg.payload);
                return;
            }

            if (msg.type === "done") {
                setGeneratedBuilds(msg.payload);
                setIsGenerating(false);
                worker.terminate();
                workerRef.current = null;
                return;
            }

            if (msg.type === "error") {
                // eslint-disable-next-line no-console
                console.error("Worker generator error:", msg.payload);
                setIsGenerating(false);
                worker.terminate();
                workerRef.current = null;
            }
        };

        worker.onerror = (err) => {
            // eslint-disable-next-line no-console
            console.error("Worker error:", err);
            setIsGenerating(false);
            worker.terminate();
            workerRef.current = null;
        };

        worker.postMessage({ skillFilters: nextSkillFilters, weaponKind: nextWeaponKind });
    }

    function cancelGenerate() {
        workerRef.current?.terminate();
        workerRef.current = null;
        setIsGenerating(false);
    }

    useEffect(() => {
        if (!openWeaponSelectorDropdown) return;

        function handleClickOutside(e: MouseEvent) {
            if (weaponDropdownRef.current && !weaponDropdownRef.current.contains(e.target as Node)) {
                setOpenWeaponSelectorDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openWeaponSelectorDropdown]);

    return (
        <div className={styles.builderWrapper}>
            <div className={styles.builderContainer}>
                <div className={styles.buildGeneratorHeader}>Build Generator</div>

                <div className={styles.mainContainer}>
                    <div className={styles.buildInfoContainer}>
                        <div className={styles.buildNameContainer}>
                            <label className={styles.buildNameLabel} htmlFor="buildName">
                                Build Name
                            </label>
                            <input
                                className={styles.buildNameInput}
                                id="buildName"
                                name="buildName"
                                type="text"
                                placeholder="Build name"
                            />
                        </div>

                        <div className={styles.weaponSelectorContainer}>
                            <p className={styles.weaponS}>Select Weapon:</p>

                            <div className={styles.weaponSelectorWrapper} ref={weaponDropdownRef}>
                                <div
                                    className={styles.weaponSelector}
                                    onClick={() => setOpenWeaponSelectorDropdown((prev) => !prev)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            setOpenWeaponSelectorDropdown((prev) => !prev);
                                        }
                                    }}
                                >
                                    {weaponKind ? (
                                        <>
                                            <div className={styles.weaponSelectorLeft}>
                                                <span className={`${styles.weaponIcon} ${styles[weaponKind]}`} />
                                                <span>{weaponLabelMap[weaponKind]}</span>
                                            </div>
                                            <ChevronDownIcon className={styles.dropDownIcon} />
                                        </>
                                    ) : (
                                        <>
                                            <span>Select</span>
                                            <ChevronDownIcon className={styles.dropDownIcon} />
                                        </>
                                    )}
                                </div>

                                {openWeaponSelectorDropdown && (
                                    <div className={`${styles.weaponDropdown} ${styles.open}`}>
                                        {weapons.map((weapon) => (
                                            <button key={weapon} type="button" onClick={() => updateWeapon(weapon)}>
                                                <span className={`${styles.weaponIcon} ${styles[weapon]}`} />
                                                {weaponLabelMap[weapon]}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.skillSelectorContainer}>
                            <p>Select Skills:</p>

                            {skillFilters.map((skill) => (
                                <SkillSelector
                                    key={skill.id}
                                    id={skill.id}
                                    thisSkill={skill}
                                    skillFilters={skillFilters}
                                    setSkillFilters={setSkillFilters}
                                    skillData={skillData}
                                    onRemove={removeSkillFilter}
                                />
                            ))}

                            <button className={styles.addSkillBtn} type="button" onClick={() => updateSkillFilters(id)}>
                                + Skill Filter
                            </button>
                        </div>

                        <div className={styles.generateBuildsBtnContainer}>
                            <button
                                className={styles.generateBuildsBtn}
                                type="button"
                                disabled={!hasValidSkill() || isGenerating}
                                onClick={() => generateBuilds(skillFilters, weaponKind)}
                            >
                                {isGenerating ? (
                                    <span className={styles.spinnerWrapper}>
                    <span className={styles.spinner} />
                    Generating...
                  </span>
                                ) : (
                                    "Generate Builds"
                                )}
                            </button>

                            {!hasValidSkill() && !isGenerating && <p>Select a weapon and add skills to generate builds.</p>}
                        </div>
                    </div>

                    <div className={styles.generatedBuildsContainer}>
                        <div className={styles.header}>Generated Builds</div>

                        <div className={styles.generatedBuilds}>
                            {isGenerating ? (
                                <div className={styles.progressContainer}>
                                    <div className={styles.progress}>
                    <span className={styles.spinnerWrapper}>
                      <span className={styles.spinner} />
                      Generating builds...
                    </span>
                                    </div>

                                    <div className={styles.buildsFoundContainer}>
                                        <h3>Builds Found</h3>
                                        <p>
                                            {progress.found} / 10
                                        </p>
                                    </div>

                                    <button type="button" onClick={cancelGenerate}>
                                        Cancel
                                    </button>
                                </div>
                            ) : generatedBuilds.length > 0 ? (
                                <div className={styles.buildsContainer}>
                                    {generatedBuilds.map((build, buildIndex) => (
                                        <Build key={buildIndex} index={buildIndex} build={build} skillData={skillData} />
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.noBuildsMsg}>No builds for this configuration.</p>
                            )}
                        </div>
                    </div>

                    <hr />
                </div>

                <div className={styles.footer}>
                    <button className={styles.cancelBtn} type="button" onClick={() => setOpenConfirmContainer(true)}>
                        Cancel
                    </button>
                </div>
            </div>

            <CancelConfirm
                openConfirmContainer={openConfirmContainer}
                setOpenConfirmContainer={setOpenConfirmContainer}
                closeBuilder={closeBuilder}
            />
        </div>
    );
}
