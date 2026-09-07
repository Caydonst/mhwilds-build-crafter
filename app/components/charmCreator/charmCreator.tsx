import styles from "./page.module.css";

import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { useGameData } from "@/app/hooks/useGameData";

import type { BuilderBuild, DecoPlacement, Skill } from "@/app/api/types/types";

import { createCharm } from "./helperFunctions";

type Props = {
  charmCreatorOpen: boolean;
  setCharmCreatorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setGearSelectorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setBuild: React.Dispatch<React.SetStateAction<BuilderBuild>>;
  build: BuilderBuild;
};

type CharmSkill = {
  id: number;
  skillId: number;
  name: string;
  level: number;
};

const DECO_SLOT_OPTIONS = [
  ["None"],
  ["1"],
  ["1", "1"],
  ["2"],
  ["2", "1"],
  ["3"],
  ["W1"],
  ["W1", "1"],
  ["W1", "1", "1"],
];

export default function CharmCreator({
  charmCreatorOpen,
  setCharmCreatorOpen,
  setGearSelectorOpen,
  setBuild,
}: Props) {
  const { skills } = useGameData();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [skillList, setSkillList] = useState<CharmSkill[]>([
    {
      id: 0,
      skillId: -1,
      name: "Select skill",
      level: 1,
    },
  ]);

  const [currentSkillId, setCurrentSkillId] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedDecoCard, setSelectedDecoCard] = useState(0);

  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const validSkills = useMemo(
    () =>
      skills.filter(
        (skill) => skill.kind === "weapon" || skill.kind === "armor",
      ),
    [skills],
  );

  const filteredSkills = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return validSkills
      .filter(
        (skill) => !skillList.some((selected) => selected.skillId === skill.id),
      )
      .filter((skill) => skill.name.toLowerCase().includes(query))
      .sort((a, b) => a.icon.id - b.icon.id);
  }, [validSkills, skillList, searchQuery]);

  function addSkill() {
    if (skillList.length >= 3) {
      return;
    }

    const newId = currentSkillId + 1;

    setSkillList((prev) => [
      ...prev,
      {
        id: newId,
        skillId: -1,
        name: "Select skill",
        level: 1,
      },
    ]);

    setCurrentSkillId(newId);
  }

  function deleteSkill(id: number) {
    setSkillList((prev) => prev.filter((skill) => skill.id !== id));

    setOpenDropdown(null);
  }

  function getSkillLevels(skill: CharmSkill) {
    const foundSkill = skills.find(
      (currentSkill) => currentSkill.id === skill.skillId,
    );

    if (!foundSkill) {
      return [];
    }

    return foundSkill.ranks.map((rank) => rank.level);
  }

  function handleSkillClick(currentSkill: CharmSkill, chosenSkill: Skill) {
    setSkillList((prev) =>
      prev.map((skill) =>
        skill.id === currentSkill.id
          ? {
              ...skill,
              skillId: chosenSkill.id,
              name: chosenSkill.name,
              level: 1,
            }
          : skill,
      ),
    );

    setSearchQuery("");
    setOpenDropdown(null);
  }

  function changeSkillLevel(skill: CharmSkill, level: number) {
    setSkillList((prev) =>
      prev.map((currentSkill) =>
        currentSkill.id === skill.id
          ? {
              ...currentSkill,
              level,
            }
          : currentSkill,
      ),
    );

    setOpenDropdown(null);
  }

  function checkCharmReqs() {
    return skillList.some((skill) => skill.skillId !== -1);
  }

  function findSkillIcon(skillId: number) {
    const foundSkill = skills.find((skill) => skill.id === skillId);

    return foundSkill?.icon.id ?? 0;
  }

  function constructCharm() {
    const charmSuccessful = createCharm(
      skillList,
      skills,
      DECO_SLOT_OPTIONS[selectedDecoCard],
    );

    if (!charmSuccessful) {
      return;
    }

    setBuild((prev) => {
      const emptySlots: DecoPlacement[] = charmSuccessful.slots.map(() => ({
        slotLevel: 1,
        decoration: null,
      }));

      return {
        ...prev,

        charm: charmSuccessful,

        decorations: {
          ...prev.decorations,
          charm: emptySlots,
        },
      };
    });

    setCharmCreatorOpen(false);
    setGearSelectorOpen(false);
  }

  function closeCreator() {
    setOpenDropdown(null);
    setSearchQuery("");
    setCharmCreatorOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!openDropdown) {
        return;
      }

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
    <div
      className={
        charmCreatorOpen
          ? `${styles.charmCreatorWrapper} ${styles.open}`
          : styles.charmCreatorWrapper
      }
    >
      <div className={styles.charmCreatorHeader}>
        <button type="button" className={styles.backBtn} onClick={closeCreator}>
          <ChevronLeftIcon />

          <span>Back to Charms</span>
        </button>

        <div className={styles.charmHeaderTitle}>
          <span>CUSTOM EQUIPMENT</span>

          <h2>Create Custom Charm</h2>

          <p>
            Choose up to three skills and configure the charm&apos;s decoration
            slots.
          </p>
        </div>
      </div>

      <div className={styles.charmCreatorInner}>
        <section className={styles.charmSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h3>Skills</h3>

              <p>Add up to three skills and choose their levels.</p>
            </div>

            <span className={styles.sectionCount}>
              {skillList.length}
              /3
            </span>
          </div>

          <div className={styles.skillsContainer}>
            {skillList.map((skill, index) => {
              const skillKey = `skill-${skill.id}`;

              const lvlKey = `skill-${skill.id}-lvl`;

              const isSkillOpen = openDropdown === skillKey;

              const isLvlOpen = openDropdown === lvlKey;

              return (
                <div key={skill.id} className={styles.skillRow}>
                  <div
                    ref={(el) => {
                      dropdownRefs.current[skillKey] = el;
                    }}
                    className={styles.reinforcement}
                  >
                    <button
                      type="button"
                      className={styles.reinforcementInner}
                      onClick={() =>
                        setOpenDropdown((prev) =>
                          prev === skillKey ? null : skillKey,
                        )
                      }
                    >
                      <div className={styles.reinforcementInnerLeft}>
                        {skill.skillId !== -1 && (
                          <span
                            className={`${styles.skillIcon} ${
                              styles[`skill${findSkillIcon(skill.skillId)}`]
                            }`}
                          />
                        )}

                        <span>{skill.name}</span>
                      </div>

                      <ChevronDownIcon
                        className={`${styles.chevronIcon} ${
                          isSkillOpen ? styles.rotated : ""
                        }`}
                      />
                    </button>

                    {isSkillOpen && (
                      <div className={styles.reinforcementDropdown}>
                        <div className={styles.dropdownSearch}>
                          <MagnifyingGlassIcon />

                          <input
                            type="text"
                            placeholder="Search skills..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                          />
                        </div>

                        <div className={styles.dropdownSkillsContainer}>
                          {filteredSkills.length > 0 ? (
                            filteredSkills.map((value) => (
                              <button
                                key={value.id}
                                type="button"
                                onClick={() => handleSkillClick(skill, value)}
                              >
                                <span
                                  className={`${styles.skillIcon} ${
                                    styles[`skill${findSkillIcon(value.id)}`]
                                  }`}
                                />

                                <span>{value.name}</span>
                              </button>
                            ))
                          ) : (
                            <div className={styles.dropdownEmpty}>
                              No skills found.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {skill.skillId !== -1 && (
                    <div
                      ref={(el) => {
                        dropdownRefs.current[lvlKey] = el;
                      }}
                      className={styles.lvlWrapper}
                    >
                      <button
                        type="button"
                        className={styles.lvlContainer}
                        onClick={() =>
                          setOpenDropdown((prev) =>
                            prev === lvlKey ? null : lvlKey,
                          )
                        }
                      >
                        <span>Lv. {skill.level}</span>

                        <ChevronDownIcon
                          className={`${styles.chevronIcon} ${
                            isLvlOpen ? styles.rotated : ""
                          }`}
                        />
                      </button>

                      {isLvlOpen && (
                        <div
                          className={`${styles.reinforcementDropdown} ${styles.levelDropdown}`}
                        >
                          <div className={styles.skillLvlContainer}>
                            {getSkillLevels(skill).map((level) => (
                              <button
                                key={level}
                                type="button"
                                className={
                                  skill.level === level
                                    ? styles.activeLevel
                                    : ""
                                }
                                onClick={() => changeSkillLevel(skill, level)}
                              >
                                Lv. {level}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => deleteSkill(skill.id)}
                    disabled={skillList.length === 1}
                    aria-label={`Delete skill ${index + 1}`}
                  >
                    <XMarkIcon />
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              className={styles.addSkillBtn}
              disabled={skillList.length >= 3}
              onClick={addSkill}
            >
              <span>+</span>
              Add Skill
            </button>

            <div className={styles.msgContainer}>
              <InformationCircleIcon />

              <p className={styles.msg}>
                Custom charms can contain between one and three skills.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.charmSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h3>Decoration Slots</h3>

              <p>Select the slot layout for this charm.</p>
            </div>
          </div>

          <div className={styles.decoSlotsContainer}>
            {DECO_SLOT_OPTIONS.map((decoSlot, cardIndex) => (
              <button
                key={cardIndex}
                type="button"
                className={
                  selectedDecoCard === cardIndex
                    ? `${styles.decoCard} ${styles.selected}`
                    : styles.decoCard
                }
                onClick={() => setSelectedDecoCard(cardIndex)}
              >
                {decoSlot[0] === "None" ? (
                  <span className={styles.noSlots}>No slots</span>
                ) : (
                  decoSlot.map((slot, slotIndex) => (
                    <div
                      key={`${slot}-${slotIndex}`}
                      className={styles.decoSlot}
                    >
                      <span
                        className={`${styles.decoIcon} ${
                          styles[`deco${slot}`]
                        }`}
                      />

                      <span>{slot}</span>
                    </div>
                  ))
                )}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className={styles.charmFooter}>
        <div className={styles.charmFooterText}>
          <span>CUSTOM CHARM</span>

          <p>
            {skillList.filter((skill) => skill.skillId !== -1).length} selected{" "}
            {skillList.filter((skill) => skill.skillId !== -1).length === 1
              ? "skill"
              : "skills"}
          </p>
        </div>

        <button
          type="button"
          className={styles.addBtn}
          disabled={!checkCharmReqs()}
          onClick={constructCharm}
        >
          Equip Charm
        </button>
      </div>
    </div>
  );
}
