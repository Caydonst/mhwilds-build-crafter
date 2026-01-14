import styles from "./page.module.css";
import React, { useState } from "react";
import type { Build } from "@/app/api/types/types";
import type { Skill } from "@/app/api/types/types";

type props = {
    index: number;
    build: Build;
    skillData: Skill[] | null;
};

export default function Build({ index, build, skillData }: props) {
    const [weaponIndex] = useState({
        "bow": 13,
        "charge-blade": 9,
        "dual-blades": 3,
        "great-sword": 1,
        "gunlance": 5,
        "hammer": 6,
        "heavy-bowgun": 12,
        "hunting-horn": 7,
        "insect-glaive": 10,
        "lance": 4,
        "light-bowgun": 11,
        "long-sword": 2,
        "switch-axe": 8,
        "sword-shield": 0,
    });

    const [armorIndex] = useState({
        head: 14,
        chest: 15,
        arms: 16,
        waist: 17,
        legs: 18,
        charm: 19,
    });

    function findSkillIcon(skill: Skill) {
        const foundSkill = skillData?.find((thisSkill) => thisSkill.id === skill.id);
        return foundSkill?.icon.id;
    }

    const pieces = [
        build.armor.head,
        build.armor.chest,
        build.armor.arms,
        build.armor.waist,
        build.armor.legs,
        build.armor.charm,
    ].filter(Boolean);

    // Aggregate skills: { [skillId]: { skill, totalLevel: [current, max] } }
    const aggregatedSkillsMap: Record<number, { skill: Skill; totalLevel: number[] }> = {};

    // --- 1) Armor/charm skills ---
    pieces.forEach((piece: any) => {
        piece.skills.forEach((s: any) => {
            if (s.skill.kind === "set") return;

            const id = s.skill.id;
            const fullSkill = skillData?.find((sk) => sk.id === id);
            const maxSkillLevel = fullSkill?.ranks?.[fullSkill.ranks.length - 1]?.level ?? 0;

            if (!aggregatedSkillsMap[id]) {
                aggregatedSkillsMap[id] = { skill: fullSkill ?? s.skill, totalLevel: [0, maxSkillLevel] };
            } else if (!aggregatedSkillsMap[id].totalLevel[1]) {
                aggregatedSkillsMap[id].totalLevel[1] = maxSkillLevel;
            }

            aggregatedSkillsMap[id].totalLevel[0] += s.level;
        });
    });

    // helper to add deco skills into aggregate map
    const addDecoSkillsToAggregate = (placements: any[] | undefined) => {
        if (!placements?.length) return;

        placements.forEach((placement) => {
            const deco = placement?.decoration;
            if (!deco) return;

            deco.skills.forEach((ds: any) => {
                const id = ds.skill?.id;
                if (!id) return;

                const fullSkill = skillData?.find((sk) => sk.id === id);
                const maxSkillLevel = fullSkill?.ranks?.[fullSkill.ranks.length - 1]?.level ?? 0;

                if (!aggregatedSkillsMap[id]) {
                    aggregatedSkillsMap[id] = {
                        skill: fullSkill ?? ds.skill,
                        totalLevel: [0, maxSkillLevel],
                    };
                } else if (!aggregatedSkillsMap[id].totalLevel[1]) {
                    aggregatedSkillsMap[id].totalLevel[1] = maxSkillLevel;
                }

                aggregatedSkillsMap[id].totalLevel[0] += ds.level ?? 0;
            });
        });
    };

    // --- 2) Armor decorations skills ---
    const armorSlots = ["head", "chest", "arms", "waist", "legs"] as const;
    armorSlots.forEach((slot) => addDecoSkillsToAggregate(build.decorations?.[slot]));

    // --- 3) Weapon decorations skills (NEW) ---
    addDecoSkillsToAggregate(build.decorations?.weapon);

    const setBonusSkills: Skill[] = [];
    build.bonuses.skillSetBonuses.forEach((setSkill) => {
        const skill = skillData?.find((s) => s.id === setSkill);
        if (skill) setBonusSkills.push(skill);
    });

    const groupBonusSkills: Skill[] = [];
    build.bonuses.groupBonuses.forEach((setSkill) => {
        const skill = skillData?.find((s) => s.id === setSkill);
        if (skill) groupBonusSkills.push(skill);
    });

    const aggregatedSkills = Object.values(aggregatedSkillsMap);

    // NEW: convenient refs
    const weapon = (build as any).weapon; // if your Build type not updated yet
    const weaponSlots: (1 | 2 | 3)[] = (weapon?.slots ?? []) as any[];

    return (
        <div className={styles.buildContainer}>
            <h2 className={styles.buildHeader}>Build {index + 1}</h2>

            <div className={styles.gearContainer}>
                {/* =========================
            WEAPON CARD (NEW)
        ========================= */}
                {weapon && (
                    <div className={styles.buildPieceContainer}>
                        <div className={styles.pieceContainerHeader}>
              <span
                  className={`${styles.buildPieceIcon} ${styles[weapon.kind]}`}

              />
                            <div className={styles.buildPieceInfo}>
                                <p className={styles.pieceTitle}>{weapon?.name}</p>
                                <p className={`${styles.pieceRarity} ${styles[`rarity${weapon?.rarity}`]}`}>
                                    {weapon?.rarity ? `Rarity ${weapon.rarity}` : "Weapon"}
                                </p>
                            </div>
                        </div>

                        {/* Weapon deco slots */}
                        {weaponSlots.length > 0 && (
                            <div className={styles.decoSlotsContainer}>
                                {weaponSlots.map((s, i) => {
                                    const placement = build.decorations?.weapon?.[i];
                                    return (
                                        <div key={i} className={styles.slot}>
                                            <span className={`${styles.decoIcon} ${styles[`deco${s}`]}`} />
                                            {placement && placement.slotLevel <= s && <p>{placement.decoration?.name}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* =========================
            ARMOR + CHARM CARDS
        ========================= */}
                {(Object.entries(build.armor) as Array<
                    ["head" | "chest" | "arms" | "waist" | "legs" | "charm", any]
                >).map(([slotKey, armorSlot]) => (
                    <div key={slotKey} className={styles.buildPieceContainer}>
                        <div className={styles.pieceContainerHeader}>
              <span
                  className={styles.buildPieceIcon}
                  style={{
                      backgroundPosition: `calc((-64px * ${
                          armorSlot !== null &&
                          ("charm" in armorSlot ? armorIndex["charm"] : armorIndex[armorSlot.kind])
                      }) * var(--build-icon-size)) calc((-64px * ${armorSlot?.rarity}) * var(--build-icon-size))`,
                  }}
              />
                            <div className={styles.buildPieceInfo}>
                                <p className={styles.pieceTitle}>{armorSlot?.name}</p>
                                <p className={`${styles.pieceRarity} ${styles[`rarity${armorSlot?.rarity}`]}`}>
                                    {`Rarity ${armorSlot?.rarity}`}
                                </p>
                            </div>
                        </div>

                        {/* ✅ Decorations only for THIS piece */}
                        {slotKey !== "charm" && "slots" in armorSlot && armorSlot.slots?.length > 0 && (
                            <div className={styles.decoSlotsContainer}>
                                {armorSlot.slots.map((s: 1 | 2 | 3, i: number) => {
                                    const placement = build.decorations?.[slotKey]?.[i];
                                    return (
                                        <div key={i} className={styles.slot}>
                                            <span className={`${styles.decoIcon} ${styles[`deco${s}`]}`} />
                                            {placement && placement.slotLevel <= s && <p>{placement.decoration?.name}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* =========================
          SKILLS
      ========================= */}
            <div className={styles.skillsContainer}>
                <div className={styles.equipSkillsContainer}>
                    <p className={styles.equipSkillsText}>Equipment Skills</p>
                    {aggregatedSkills.map(({ skill, totalLevel }) => (
                        <div key={skill.id} className={styles.skill}>
                            <span className={`${styles.skillIcon} ${styles[`skill${findSkillIcon(skill)}`]}`}></span>
                            <div className={styles.skillInfo}>
                                <p>{skill.name}</p>
                                <div className={styles.separator}></div>
                                <div className={styles.skillLvlContainer}>
                                    {Array.from({ length: totalLevel[1] }).map((_, i) => {
                                        const reversedIndex = totalLevel[1] - 1 - i;
                                        return (
                                            <div
                                                key={i}
                                                className={reversedIndex < totalLevel[0] ? styles.filled : styles.empty}
                                            ></div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {setBonusSkills.length > 0 && (
                    <div className={styles.setBonusSkillsContainer}>
                        <p className={styles.setBonusSkillsText}>Set Bonus Skills</p>
                        {setBonusSkills.map((skill: Skill) => (
                            <div key={skill.id} className={styles.skill}>
                                <span className={`${styles.skillIcon} ${styles[`skill${findSkillIcon(skill)}`]}`}></span>
                                <div className={styles.skillInfo}>
                                    <p>{skill.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {groupBonusSkills.length > 0 && (
                    <div className={styles.setBonusSkillsContainer}>
                        <p className={styles.setBonusSkillsText}>Group Skills</p>
                        {groupBonusSkills.map((skill: Skill) => (
                            <div key={skill.id} className={styles.skill}>
                                <span className={`${styles.skillIcon} ${styles[`skill${findSkillIcon(skill)}`]}`}></span>
                                <div className={styles.skillInfo}>
                                    <p>{skill.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
