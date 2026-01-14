import styles from "./page.module.css";
import React from "react";
import type {
    Build,
    Skill,
    Armor,
    CharmRank,
    DecoPlacement,
    SlotLevel,
    BuildWeapon,
    DecorationSkill,
} from "@/app/api/types/types";

type Props = {
    index: number;
    build: Build;
    skillData: Skill[] | null;
};

type ArmorSlotKey = "head" | "chest" | "arms" | "waist" | "legs";
type GearSlotKey = ArmorSlotKey | "charm";

type ArmorOrCharm = Armor | CharmRank;

type AggregatedSkill = {
    skill: Skill;
    totalLevel: [current: number, max: number];
};

const ARMOR_SLOTS: readonly ArmorSlotKey[] = ["head", "chest", "arms", "waist", "legs"] as const;

function isSlotLevel(x: number): x is SlotLevel {
    return x === 1 || x === 2 || x === 3;
}

function isArmorPiece(piece: ArmorOrCharm | null | undefined): piece is Armor {
    return !!piece && "kind" in piece && "slots" in piece;
}

function isCharmRank(piece: ArmorOrCharm | null | undefined): piece is CharmRank {
    return !!piece && "charm" in piece && !("kind" in piece);
}

function getMaxSkillLevel(skillData: Skill[] | null, skillId: number): number {
    const fullSkill = skillData?.find((sk) => sk.id === skillId);
    return fullSkill?.ranks?.[fullSkill.ranks.length - 1]?.level ?? 0;
}

function findFullSkill(skillData: Skill[] | null, skillId: number): Skill | null {
    return skillData?.find((sk) => sk.id === skillId) ?? null;
}

export default function Build({ index, build, skillData }: Props) {
    // If you still want sprite index maps, keep as consts (no need for useState)
    const armorIndex: Record<GearSlotKey, number> = {
        head: 14,
        chest: 15,
        arms: 16,
        waist: 17,
        legs: 18,
        charm: 19,
    };

    const findSkillIcon = (skill: Skill): number => {
        const foundSkill = skillData?.find((thisSkill) => thisSkill.id === skill.id);
        return foundSkill?.icon.id ?? 0;
    };

    // --- Aggregate skills: { [skillId]: { skill, totalLevel: [current, max] } }
    const aggregatedSkillsMap: Record<number, AggregatedSkill> = {};

    const addSkillLevel = (skillId: number, add: number, fallbackSkill: Skill | null) => {
        const fullSkill = findFullSkill(skillData, skillId);
        const max = getMaxSkillLevel(skillData, skillId);

        if (!aggregatedSkillsMap[skillId]) {
            // Prefer full skill object (has ranks/icons), else fallback
            const chosenSkill = fullSkill ?? fallbackSkill;
            if (!chosenSkill) return;

            aggregatedSkillsMap[skillId] = {
                skill: chosenSkill,
                totalLevel: [0, max],
            };
        } else if (aggregatedSkillsMap[skillId].totalLevel[1] === 0 && max > 0) {
            aggregatedSkillsMap[skillId].totalLevel[1] = max;
        }

        aggregatedSkillsMap[skillId].totalLevel[0] += add;
    };

    // --- 1) Armor/charm skills ---
    const pieces: ArmorOrCharm[] = [
        build.armor.head,
        build.armor.chest,
        build.armor.arms,
        build.armor.waist,
        build.armor.legs,
        build.armor.charm,
    ].filter((p): p is ArmorOrCharm => Boolean(p));

    for (const piece of pieces) {
        for (const s of piece.skills) {

            const id = s.skill?.id;
            if (!id) continue;

            // s.skill is NOT your full Skill type, so use skillData as source of truth if present
            addSkillLevel(id, s.level ?? 0, findFullSkill(skillData, id));
        }
    }

    // helper to add deco skills into aggregate map
    const addDecoSkillsToAggregate = (placements?: ReadonlyArray<DecoPlacement>) => {
        if (!placements?.length) return;

        for (const placement of placements) {
            const deco = placement.decoration;
            if (!deco) continue;

            for (const ds of deco.skills as DecorationSkill[]) {
                const id = ds.skill?.id;
                if (!id) continue;

                addSkillLevel(id, ds.level ?? 0, findFullSkill(skillData, id));
            }
        }
    };

    // --- 2) Armor decorations skills ---
    for (const slot of ARMOR_SLOTS) {
        addDecoSkillsToAggregate(build.decorations?.[slot]);
    }

    // --- 3) Weapon decorations skills (NEW) ---
    addDecoSkillsToAggregate(build.decorations?.weapon);

    // --- Bonuses ---
    const setBonusSkills: Skill[] = [];
    for (const setSkillId of build.bonuses.skillSetBonuses) {
        const sk = skillData?.find((s) => s.id === setSkillId);
        if (sk) setBonusSkills.push(sk);
    }

    const groupBonusSkills: Skill[] = [];
    for (const groupSkillId of build.bonuses.groupBonuses) {
        const sk = skillData?.find((s) => s.id === groupSkillId);
        if (sk) groupBonusSkills.push(sk);
    }

    const aggregatedSkills = Object.values(aggregatedSkillsMap);

    // Weapon (assumes your Build type has been updated to include weapon)
    const weapon: BuildWeapon | null = build.weapon ?? null;
    const weaponSlots: SlotLevel[] =
        weapon?.slots?.filter((x): x is SlotLevel => isSlotLevel(x)) ?? [];

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
                            <span className={styles.buildPieceIcon} />
                            <div className={styles.buildPieceInfo}>
                                <p className={styles.pieceTitle}>{weapon.name}</p>
                                <p className={`${styles.pieceRarity} ${styles[`rarity${weapon.rarity}`]}`}>
                                    {`Rarity ${weapon.rarity}`}
                                </p>
                            </div>
                        </div>

                        {/* Weapon deco slots */}
                        {weaponSlots.length > 0 && (
                            <div className={styles.decoSlotsContainer}>
                                {weaponSlots.map((s, i) => {
                                    const placement = build.decorations?.weapon?.[i];
                                    const key = `weapon-slot-${i}`;
                                    return (
                                        <div key={key} className={styles.slot}>
                                            <span className={`${styles.decoIcon} ${styles[`deco${s}`]}`} />
                                            {placement && placement.slotLevel <= s && (
                                                <p>{placement.decoration?.name ?? ""}</p>
                                            )}
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
                {(Object.entries(build.armor) as Array<[GearSlotKey, ArmorOrCharm]>).map(
                    ([slotKey, gearPiece]) => {
                        const rarity = gearPiece?.rarity ?? 0;

                        // sprite row index: charm uses fixed, armor uses kind lookup
                        const spriteX =
                            slotKey === "charm"
                                ? armorIndex.charm
                                : isArmorPiece(gearPiece)
                                    ? armorIndex[gearPiece.kind]
                                    : armorIndex.charm;

                        const bgPos = `calc((-64px * ${spriteX}) * var(--build-icon-size)) calc((-64px * ${rarity}) * var(--build-icon-size))`;

                        const showSlots = slotKey !== "charm" && isArmorPiece(gearPiece) && gearPiece.slots.length > 0;

                        // Normalize armor slots to SlotLevel[]
                        const armorSlots: SlotLevel[] =
                            showSlots && isArmorPiece(gearPiece)
                                ? gearPiece.slots.filter((x): x is SlotLevel => isSlotLevel(x))
                                : [];

                        return (
                            <div key={slotKey} className={styles.buildPieceContainer}>
                                <div className={styles.pieceContainerHeader}>
                  <span
                      className={styles.buildPieceIcon}
                      style={{ backgroundPosition: bgPos }}
                  />
                                    <div className={styles.buildPieceInfo}>
                                        <p className={styles.pieceTitle}>{gearPiece?.name ?? ""}</p>
                                        <p className={`${styles.pieceRarity} ${styles[`rarity${rarity}`]}`}>
                                            {`Rarity ${rarity}`}
                                        </p>
                                    </div>
                                </div>

                                {/* ✅ Decorations only for THIS piece */}
                                {showSlots && (
                                    <div className={styles.decoSlotsContainer}>
                                        {armorSlots.map((s, i) => {
                                            const placement = build.decorations?.[slotKey as ArmorSlotKey]?.[i];
                                            const key = `${slotKey}-slot-${i}`;
                                            return (
                                                <div key={key} className={styles.slot}>
                                                    <span className={`${styles.decoIcon} ${styles[`deco${s}`]}`} />
                                                    {placement && placement.slotLevel <= s && (
                                                        <p>{placement.decoration?.name ?? ""}</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Optional: you can render charm info differently if you want */}
                                {slotKey === "charm" && isCharmRank(gearPiece) && null}
                            </div>
                        );
                    }
                )}
            </div>

            {/* =========================
          SKILLS
      ========================= */}
            <div className={styles.skillsContainer}>
                <div className={styles.equipSkillsContainer}>
                    <p className={styles.equipSkillsText}>Equipment Skills</p>

                    {aggregatedSkills.map(({ skill, totalLevel }) => {
                        const iconId = findSkillIcon(skill);
                        return (
                            <div key={skill.id} className={styles.skill}>
                                <span className={`${styles.skillIcon} ${styles[`skill${iconId}`]}`} />
                                <div className={styles.skillInfo}>
                                    <p>{skill.name}</p>
                                    <div className={styles.separator} />
                                    <div className={styles.skillLvlContainer}>
                                        {Array.from({ length: totalLevel[1] }).map((_, i) => {
                                            const reversedIndex = totalLevel[1] - 1 - i;
                                            const key = `${skill.id}-lvl-${i}`;
                                            return (
                                                <div
                                                    key={key}
                                                    className={reversedIndex < totalLevel[0] ? styles.filled : styles.empty}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {setBonusSkills.length > 0 && (
                    <div className={styles.setBonusSkillsContainer}>
                        <p className={styles.setBonusSkillsText}>Set Bonus Skills</p>
                        {setBonusSkills.map((skill) => {
                            const iconId = findSkillIcon(skill);
                            return (
                                <div key={skill.id} className={styles.skill}>
                                    <span className={`${styles.skillIcon} ${styles[`skill${iconId}`]}`} />
                                    <div className={styles.skillInfo}>
                                        <p>{skill.name}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {groupBonusSkills.length > 0 && (
                    <div className={styles.setBonusSkillsContainer}>
                        <p className={styles.setBonusSkillsText}>Group Skills</p>
                        {groupBonusSkills.map((skill) => {
                            const iconId = findSkillIcon(skill);
                            return (
                                <div key={skill.id} className={styles.skill}>
                                    <span className={`${styles.skillIcon} ${styles[`skill${iconId}`]}`} />
                                    <div className={styles.skillInfo}>
                                        <p>{skill.name}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
