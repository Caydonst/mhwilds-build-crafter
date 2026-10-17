import styles from "./page.module.css";

import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import React, { useEffect, useMemo, useRef, useState } from "react";

import type { Skill, SkillFilter } from "@/app/api/types/types";

type Props = {
  id: number;
  skillData: Skill[] | null;
  onRemove: (id: number) => void;
  thisSkill: SkillFilter;
  skillFilters: SkillFilter[];
  setSkillFilters: React.Dispatch<React.SetStateAction<SkillFilter[]>>;
  hideLevel?: boolean;
};

export default function SkillSelector({
  id,
  thisSkill,
  skillFilters,
  setSkillFilters,
  skillData,
  onRemove,
  hideLevel = false,
}: Props) {
  const [openDropdown, setOpenDropdown] = useState<"skill" | "level" | null>(
    null,
  );

  const [searchQuery, setSearchQuery] = useState("");

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selectedSkill = useMemo(() => {
    if (thisSkill.skillId === -1) {
      return null;
    }

    return skillData?.find((skill) => skill.id === thisSkill.skillId) ?? null;
  }, [skillData, thisSkill.skillId]);

  const filteredSkills = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return (skillData ?? [])
      .filter(
        (skill) =>
          !skillFilters.some(
            (filter) => filter.skillId === skill.id && filter.id !== id,
          ),
      )
      .filter((skill) => skill.name.toLowerCase().includes(query))
      .sort((a, b) => a.icon.id - b.icon.id);
  }, [skillData, skillFilters, searchQuery, id]);

  function selectSkill(skill: Skill) {
    setSkillFilters((prev) =>
      prev.map((filter) =>
        filter.id === id
          ? {
              ...filter,
              skillId: skill.id,
              name: skill.name,
              level: 1,
            }
          : filter,
      ),
    );

    setSearchQuery("");
    setOpenDropdown(null);
  }

  function updateSkillLevel(level: number) {
    setSkillFilters((prev) =>
      prev.map((filter) =>
        filter.id === id
          ? {
              ...filter,
              level,
            }
          : filter,
      ),
    );

    setOpenDropdown(null);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.skillFilterContainer} ref={wrapperRef}>
      <div className={styles.skillFilterWrapper}>
        <button
          type="button"
          className={styles.skillFilter}
          onClick={() =>
            setOpenDropdown((prev) => (prev === "skill" ? null : "skill"))
          }
        >
          <div className={styles.skillFilterLeft}>
            {selectedSkill && (
              <span
                className={`${styles.skillIcon} ${
                  styles[`skill${selectedSkill.icon.id}`]
                }`}
              />
            )}

            <span>{selectedSkill ? selectedSkill.name : "Select skill"}</span>
          </div>

          <ChevronDownIcon
            className={`${styles.skillChevronIcon} ${
              openDropdown === "skill" ? styles.rotated : ""
            }`}
          />
        </button>

        {openDropdown === "skill" && (
          <div className={styles.skillFilterDropdown}>
            <div className={styles.skillDropdownSearch}>
              <MagnifyingGlassIcon />

              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.skillDropdownList}>
              {filteredSkills.length > 0 ? (
                filteredSkills.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => selectSkill(skill)}
                  >
                    <span
                      className={`${styles.skillIcon} ${
                        styles[`skill${skill.icon.id}`]
                      }`}
                    />

                    <span>{skill.name}</span>
                  </button>
                ))
              ) : (
                <div className={styles.skillDropdownEmpty}>
                  No skills found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedSkill && !hideLevel && (
        <div className={styles.skillLevelWrapper}>
          <button
            type="button"
            className={styles.skillLevelButton}
            onClick={() =>
              setOpenDropdown((prev) => (prev === "level" ? null : "level"))
            }
          >
            <span>Lv. {thisSkill.level}</span>

            <ChevronDownIcon
              className={`${styles.skillChevronIcon} ${
                openDropdown === "level" ? styles.rotated : ""
              }`}
            />
          </button>

          {openDropdown === "level" && (
            <div className={styles.skillLevelDropdown}>
              {selectedSkill.ranks.map((rank) => (
                <button
                  key={rank.level}
                  type="button"
                  className={
                    thisSkill.level === rank.level ? styles.activeLevel : ""
                  }
                  onClick={() => updateSkillLevel(rank.level)}
                >
                  Lv. {rank.level}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {!hideLevel && (
        <button
          type="button"
          className={styles.removeSkillFilterBtn}
          onClick={() => onRemove(id)}
          aria-label="Remove skill"
        >
          <XMarkIcon />
        </button>
      )}
      
    </div>
  );
}
