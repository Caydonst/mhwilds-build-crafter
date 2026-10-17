import styles from "./page.module.css";
import React, {
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import CancelConfirm from "./cancelConfirm/cancelConfirm";
import SkillSelector from "./skillSelector/skillSelector";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type {
  Build as BuildType,
  Skill,
  SkillFilter,
  Weapon,
  WeaponKind,
} from "@/app/api/types/types";
import Build from "./build/build";
import BuildBreakdown from "./buildBreakdown/buildBreakdown";

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
  | { type: "build_found"; payload: BuildType }
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

export default function Builder({
  builderOpen,
  setBuilderOpen,
  weaponData,
  skillData,
}: Props) {
  const [openConfirmContainer, setOpenConfirmContainer] = useState(false);
  const [skillFilters, setSkillFilters] = useState<SkillFilter[]>([
    { id: 0, skillId: -1, name: "Select", level: 1 },
  ]);

  const [weaponKind, setWeaponKind] = useState<WeaponKind>(null);
  const [isArtianWeapon, setIsArtianWeapon] = useState(false);

  const [setBonusFilter, setSetBonusFilter] = useState<SkillFilter>({
    id: 1000,
    skillId: -1,
    name: "Select",
    level: 1,
  });

  const [groupBonusFilter, setGroupBonusFilter] = useState<SkillFilter>({
    id: 1001,
    skillId: -1,
    name: "Select",
    level: 1,
  });
  const [generatedArtianConfig, setGeneratedArtianConfig] = useState<{
    enabled: boolean;
    weaponKind: WeaponKind;
    setBonusSkillId: number | null;
    groupBonusSkillId: number | null;
  } | null>(null);
  const [openWeaponSelectorDropdown, setOpenWeaponSelectorDropdown] =
    useState(false);

  const [id, setId] = useState(0);
  const [generatedBuilds, setGeneratedBuilds] = useState<BuildType[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<WorkerProgress>({
    tried: 0,
    total: 0,
    found: 0,
    pruned: 0,
  });
  const [buildBreakdownOpen, setBuildBreakdownOpen] = useState(false);
  const [selectedBuild, setSelectedBuild] = useState<BuildType | null>(null);

  const weaponDropdownRef = useRef<HTMLDivElement | null>(null);
  const workerRef = useRef<Worker | null>(null);

  function closeBuilder() {
    setBuilderOpen(false);
    setOpenConfirmContainer(false);
  }

  function updateSkillFilters(currentId: number) {
    const newId = currentId + 1;
    setSkillFilters((prev) => [
      ...prev,
      { id: newId, skillId: -1, name: "Select", level: 1 },
    ]);
    setId(newId);
  }

  function hasValidSkill(): boolean {
    if (!weaponKind) {
      return false;
    }

    const hasNormalSkill = skillFilters.some((filter) => filter.skillId !== -1);

    if (!hasNormalSkill) {
      return false;
    }

    if (isArtianWeapon) {
      const hasSetBonus = setBonusFilter.skillId !== -1;

      const hasGroupBonus = groupBonusFilter.skillId !== -1;

      if (!hasSetBonus || !hasGroupBonus) {
        return false;
      }
    }

    return true;
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

  const setBonusSkills = useMemo(() => {
    return (skillData ?? []).filter((skill) => skill.kind === "set");
  }, [skillData]);

  const groupBonusSkills = useMemo(() => {
    return (skillData ?? []).filter((skill) => skill.kind === "group");
  }, [skillData]);

  function generateBuilds(
    nextSkillFilters: SkillFilter[],
    nextWeaponKind: WeaponKind,
  ) {

    const config = {
      enabled: isArtianWeapon,
      weaponKind: nextWeaponKind,
      setBonusSkillId: isArtianWeapon ? setBonusFilter.skillId : null,
      groupBonusSkillId: isArtianWeapon ? groupBonusFilter.skillId : null,
    };

    setGeneratedArtianConfig(config);
    // kill any previous run
    workerRef.current?.terminate();

    setIsGenerating(true);

    setGeneratedBuilds([]);

    setProgress({
      tried: 0,
      total: 0,
      found: 0,
      pruned: 0,
    });

    const worker = new Worker(
      new URL("@/app/api/buildGenerator/buildWorker.ts", import.meta.url),
    );
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const msg = e.data;

      if (msg.type === "progress") {
        setProgress(msg.payload);
        return;
      }

      if (msg.type === "build_found") {
        setGeneratedBuilds((prev) => [...prev, msg.payload]);

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

    worker.postMessage({
      skillFilters: nextSkillFilters,
      weaponKind: nextWeaponKind,
      artian: {
        enabled: config.enabled,
        setBonusSkillId: config.setBonusSkillId,
        groupBonusSkillId: config.groupBonusSkillId,
      },
    });
  }

  function cancelGenerate() {
    workerRef.current?.terminate();
    workerRef.current = null;
    setIsGenerating(false);
  }

  function toggleArtianWeapon() {
    setIsArtianWeapon((prev) => {
      const next = !prev;

      if (!next) {
        setSetBonusFilter({
          id: 1000,
          skillId: -1,
          name: "Select",
          level: 1,
        });

        setGroupBonusFilter({
          id: 1001,
          skillId: -1,
          name: "Select",
          level: 1,
        });
      }

      return next;
    });
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
          Generator
          <span>Beta</span>
        </div>

        <div className={styles.mainContainer}>
          <div className={styles.buildInfoContainer}>
            <div className={styles.weaponSelectorContainer}>
              <p className={styles.weaponS}>Select Weapon</p>

              <div
                className={styles.weaponSelectorWrapper}
                ref={weaponDropdownRef}
              >
                <button
                  type="button"
                  className={styles.weaponSelector}
                  onClick={() => setOpenWeaponSelectorDropdown((prev) => !prev)}
                >
                  <div className={styles.weaponSelectorLeft}>
                    {weaponKind && (
                      <span
                        className={`${styles.weaponIcon} ${styles[weaponKind]}`}
                      />
                    )}

                    <span>
                      {weaponKind
                        ? weaponLabelMap[weaponKind]
                        : "Select weapon"}
                    </span>
                  </div>

                  <ChevronDownIcon
                    className={`${styles.weaponChevronIcon} ${
                      openWeaponSelectorDropdown ? styles.rotated : ""
                    }`}
                  />
                </button>

                {openWeaponSelectorDropdown && (
                  <div className={styles.weaponDropdown}>
                    <div className={styles.weaponDropdownList}>
                      {weapons.map((weapon) => (
                        <button
                          key={weapon}
                          type="button"
                          className={
                            weaponKind === weapon ? styles.selectedWeapon : ""
                          }
                          onClick={() => updateWeapon(weapon)}
                        >
                          <span
                            className={`${styles.weaponIcon} ${styles[weapon]}`}
                          />

                          <span>{weaponLabelMap[weapon]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <label className={styles.artianCheckbox}>
                <input
                  type="checkbox"
                  checked={isArtianWeapon}
                  onChange={toggleArtianWeapon}
                />

                <span className={styles.artianCheckboxBox}>
                  <span className={styles.artianCheckboxCheck} />
                </span>

                <span className={styles.artianCheckboxText}>
                  <span className={styles.artianCheckboxLabel}>
                    Use Artian weapon
                  </span>

                  <span className={styles.artianCheckboxDescription}>
                    Include an Artian weapon with selected bonus skills.
                  </span>
                </span>
              </label>
              {isArtianWeapon && (
                <div className={styles.artianOptions}>
                  <div className={styles.artianOptionsHeader}>
                    <span className={styles.artianOptionsEyebrow}>
                      Artian Weapon
                    </span>

                    <p>
                      Select the bonus skills for the generated Artian weapon.
                    </p>
                  </div>

                  <div className={styles.artianSkillField}>
                    <span className={styles.artianSkillLabel}>
                      Set Bonus Skill
                    </span>

                    <SkillSelector
                      id={setBonusFilter.id}
                      thisSkill={setBonusFilter}
                      skillFilters={[setBonusFilter]}
                      setSkillFilters={(value) => {
                        const next =
                          typeof value === "function"
                            ? value([setBonusFilter])
                            : value;

                        if (next[0]) {
                          setSetBonusFilter(next[0]);
                        }
                      }}
                      skillData={setBonusSkills}
                      onRemove={() =>
                        setSetBonusFilter({
                          id: 1000,
                          skillId: -1,
                          name: "Select",
                          level: 1,
                        })
                      }
                      hideLevel
                    />
                  </div>

                  <div className={styles.artianSkillField}>
                    <span className={styles.artianSkillLabel}>Group Skill</span>

                    <SkillSelector
                      id={groupBonusFilter.id}
                      thisSkill={groupBonusFilter}
                      skillFilters={[groupBonusFilter]}
                      setSkillFilters={(value) => {
                        const next =
                          typeof value === "function"
                            ? value([groupBonusFilter])
                            : value;

                        if (next[0]) {
                          setGroupBonusFilter(next[0]);
                        }
                      }}
                      skillData={groupBonusSkills}
                      onRemove={() =>
                        setGroupBonusFilter({
                          id: 1001,
                          skillId: -1,
                          name: "Select",
                          level: 1,
                        })
                      }
                      hideLevel
                    />
                  </div>
                </div>
              )}
            </div>

            <div className={styles.skillSelectorContainer}>
              <p>Select Skills</p>

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

              <button
                className={styles.addSkillBtn}
                type="button"
                onClick={() => updateSkillFilters(id)}
              >
                + Add skill
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
                  "Generate builds"
                )}
              </button>

              {!hasValidSkill() && !isGenerating && (
                <p>
                  {!weaponKind
                    ? "Select a weapon to continue."
                    : !skillFilters.some((filter) => filter.skillId !== -1)
                      ? "Add at least one skill to generate builds."
                      : isArtianWeapon && setBonusFilter.skillId === -1
                        ? "Select an Artian set bonus skill."
                        : isArtianWeapon && groupBonusFilter.skillId === -1
                          ? "Select an Artian group skill."
                          : "Complete the required options to generate builds."}
                </p>
              )}
            </div>
          </div>

          <div className={styles.generatedBuildsContainer}>
            <div className={styles.generatedBuilds}>
              {isGenerating && (
                <div className={styles.progressContainer}>
                  <div className={styles.progress}>
                    <span className={styles.spinnerWrapper}>
                      <span className={styles.spinner} />
                      Generating builds...
                    </span>
                  </div>
                  {/*
                  <div className={styles.buildsFoundContainer}>
                    <h3>Builds Found</h3>
                    <p>{generatedBuilds.length} / 10</p>
                  </div>
                  */}
                  <button type="button" onClick={cancelGenerate}>
                    Cancel
                  </button>
                </div>
              )}

              {generatedBuilds.length > 0 ? (
                <div className={styles.buildsContainer}>
                  {generatedBuilds.map((build, buildIndex) => (
                    <Build
                      key={buildIndex}
                      index={buildIndex}
                      build={build}
                      skillData={skillData}
                      setBuildBreakdownOpen={setBuildBreakdownOpen}
                      setSelectedBuild={setSelectedBuild}
                      artianConfig={generatedArtianConfig ?? {
                        enabled: false,
                        weaponKind: null,
                        setBonusSkillId: null,
                        groupBonusSkillId: null,
                      }}
                    />
                  ))}
                </div>
              ) : (
                !isGenerating && (
                  <p className={styles.noBuildsMsg}>
                    No builds for this skill configuration.
                  </p>
                )
              )}
            </div>
          </div>

          <hr />
        </div>
      </div>
      {buildBreakdownOpen && (
        <BuildBreakdown
          setBuildBreakdownOpen={setBuildBreakdownOpen}
          build={selectedBuild}
          skillData={skillData}
        />
      )}
      <CancelConfirm
        openConfirmContainer={openConfirmContainer}
        setOpenConfirmContainer={setOpenConfirmContainer}
        closeBuilder={closeBuilder}
      />
    </div>
  );
}
