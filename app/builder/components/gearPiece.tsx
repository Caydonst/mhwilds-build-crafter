import styles from "./page.module.css"
import type {BuilderBuild, SlotLevel, Armor, CharmRank, Weapon, ArmorSet} from "@/app/api/types/types";
import React, {useMemo} from "react";
import {XMarkIcon} from "@heroicons/react/24/outline";
import {findGearPieceBonuses} from "./helperFunctions"

type ArmorSlotKey = "weapon" | "head" | "chest" | "arms" | "waist" | "legs" | "charm";
type GearSlotKey = "head" | "chest" | "arms" | "waist" | "legs" | "charm";
type WeaponArmorCharm = Weapon | Armor | CharmRank;
const ARMOR_KINDS = ["head", "chest", "arms", "waist", "legs"] as const;
type ArmorKind = typeof ARMOR_KINDS[number];

interface Props {
    gearPiece: WeaponArmorCharm | null
    slotKey: ArmorSlotKey;
    build: BuilderBuild | null;
    armorSets: ArmorSet[];
    deleteBuildItem: (slotKey: ArmorSlotKey) => void;
    openGearSelector: (slot: ArmorSlotKey) => void;
    openWeaponSelector: (slot: ArmorSlotKey) => void;
    openDecoSelector: (slotLevel: number, decoKind: string, slotKey: ArmorSlotKey, slotIndex: number) => void;
    deleteDecoration: (slot: ArmorSlotKey, slotIndex: number) => void;
}

export default function GearPiece({ gearPiece, slotKey, build, armorSets, deleteBuildItem, openGearSelector, openWeaponSelector, openDecoSelector, deleteDecoration }: Props) {

    const weapons = [
        "bow",
        "charge-blade",
        "dual-blades",
        "great-sword",
        "gunlance",
        "hammer",
        "heavy-bowgun",
        "hunting-horn",
        "insect-glaive",
        "lance",
        "light-bowgun",
        "long-sword",
        "switch-axe",
        "sword-shield",
    ]
    const weaponIndex: Record<string, number> = {
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
    }

    function isWeaponPiece(piece: WeaponArmorCharm | null | undefined): piece is Weapon {
        return !!piece && "kind" in piece;
    }

    function isArmorPiece(piece: WeaponArmorCharm | null | undefined): piece is Armor {
        return !!piece && "kind" in piece;
    }

    function isCharmRank(piece: WeaponArmorCharm | null | undefined): piece is CharmRank {
        return !!piece && "charm" in piece && !("kind" in piece);
    }

    function isSlotLevel(x: number): x is SlotLevel {
        return x === 1 || x === 2 || x === 3;
    }

    const armorIndex: Record<GearSlotKey, number> = {
        head: 14,
        chest: 15,
        arms: 16,
        waist: 17,
        legs: 18,
        charm: 19,
    };

    let rarity;
    let bgPos

    if (gearPiece) {
        rarity = gearPiece?.rarity ?? 0;

        // sprite row index: charm uses fixed, armor uses kind lookup
        const spriteX =
            isCharmRank(gearPiece)
                ? armorIndex.charm
                : isArmorPiece(gearPiece)
                    ? armorIndex[gearPiece.kind]
                    : armorIndex.charm;

        bgPos = `calc((-64px * ${spriteX}) * var(--build-icon-size)) calc((-64px * ${rarity}) * var(--build-icon-size))`;

    } else {
        rarity = 0
        if (slotKey !== "weapon") {
            bgPos = `calc((-64px * ${armorIndex[slotKey]}) * var(--build-icon-size)) calc((-64px * ${rarity}) * var(--build-icon-size))`;
        }
    }

    const findBonuses = useMemo(() => {
        if (isArmorPiece(gearPiece) && armorSets) {
            return findGearPieceBonuses(gearPiece, armorSets);
        }
    }, [gearPiece, armorSets])

    return (
        <div className={styles.buildPieceContainer}>
            {gearPiece !== null ? (
                <>
                    {(isWeaponPiece(gearPiece) && gearPiece.kind && weapons.includes(gearPiece.kind) ? (
                        <div className={styles.pieceContainerHeader} onClick={() => openWeaponSelector(slotKey)}>
                            <span className={`${styles.buildPieceIcon}`} style={{ backgroundPosition: `calc((-64px * ${weaponIndex[gearPiece.kind]}) * var(--build-icon-size)) calc((-64px * ${rarity}) * var(--build-icon-size))` }} />
                            <div className={styles.buildPieceInfo}>
                                <p className={styles.pieceTitle}>{gearPiece.name}</p>
                                <div className={styles.weaponStatsContainer}>
                                    <div className={styles.rawValContainer}>
                                        <span className={`${styles.statsIcon} ${styles.damageIcon}`}></span>
                                        <p>{gearPiece.damage.raw}</p>
                                    </div>
                                    <div className={styles.affinityValContainer}>
                                        <span  className={`${styles.statsIcon} ${styles.affinityIcon}`}></span>
                                        <p>{gearPiece.affinity}%</p>
                                    </div>
                                    {gearPiece.specials.length !== 0 && (
                                        <div className={styles.elementValContainer}>
                                            {gearPiece.specials[0].hasOwnProperty("status") ? (
                                                <>
                                                    <span className={`${styles.statsIcon} ${styles[`${gearPiece.specials[0].status}`]}`}></span>
                                                    <p>{gearPiece.specials[0].damage.display}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <span className={`${styles.statsIcon} ${styles[`${gearPiece.specials[0].element}`]}`}></span>
                                                    <p>{gearPiece.specials[0].damage.display}</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {gearPiece.sharpness && (
                                    <div className={styles.weaponSharpness}>
                                        {Object.entries(gearPiece.sharpness).map(([color, value]) => (
                                            <div key={color} className={`${styles.sharpnessColor} ${styles[color]}`} style={{ width: `${(value / 400) * 150}px`}}></div>
                                        ))}
                                    </div>
                                )}
                                <div className={styles.gearPieceSkillsContainer}>
                                    {gearPiece.skills.map((skill, i) => (
                                        <p key={i} className={styles.notEX}>{skill.skill.name} {skill.level}</p>
                                    ))}
                                    {gearPiece.reinforcements?.map((reinforcement, i) => (
                                        <p key={i} className={`${reinforcement.lvl === "EX" ? styles.EX : styles.notEX}`}>{reinforcement.reinforcement} {reinforcement.lvl}</p>
                                    ))}
                                </div>
                            </div>
                            <button className={styles.deleteBtn} onClick={(e) => {e.stopPropagation(); deleteBuildItem(slotKey);}}><XMarkIcon /></button>
                        </div>
                    ) : (
                        <div className={styles.pieceContainerHeader} onClick={() => openGearSelector(slotKey)}>
                  <span
                      className={styles.buildPieceIcon}
                      style={{ backgroundPosition: bgPos }}
                  />
                            <div className={styles.buildPieceInfo}>
                                <p className={styles.pieceTitle}>{gearPiece?.name ?? ""}</p>
                                <div className={styles.gearPieceSkillsContainer}>

                                    {gearPiece.skills.map((skill, i) => (
                                        "kind" in skill.skill && skill.skill.kind !== "set" && (
                                            <p key={i}>{skill.skill.name} {skill.level}</p>
                                        )
                                    ))}

                                    {findBonuses?.setBonuses.map((bonus, i) => (
                                        <p key={i} className={styles.setBonusSkillName}>{bonus}</p>
                                    ))}
                                    {findBonuses?.groupBonuses.map((bonus, i) => (
                                        <p key={i} className={styles.groupSkillName}>{bonus}</p>
                                    ))}
                                </div>
                            </div>
                            <button className={styles.deleteBtn} onClick={(e) => {e.stopPropagation(); deleteBuildItem(slotKey);}}><XMarkIcon /></button>
                        </div>
                    ))}

                    {/* ✅ Decorations only for THIS piece */}
                    {(isWeaponPiece(gearPiece) || isArmorPiece(gearPiece)) && gearPiece.slots.length > 0 && (
                        <>
                            <div className={styles.decoSlotsContainer}>
                                {gearPiece.slots.map((s, i) => {
                                    const key = `${slotKey}-slot-${i}`;
                                    let placement;
                                    if (slotKey !== "charm") {
                                        placement = build?.decorations?.[slotKey]?.[i];
                                    }
                                    const canFit = placement?.slotLevel != null && placement.slotLevel <= s; // optional check

                                    return (
                                        <div
                                            key={key}
                                            className={styles.slot}
                                            onClick={() => openDecoSelector(s, slotKey === "weapon" ? "weapon" : "armor", slotKey, i)}
                                        >
                                            <span className={`${styles.decoIcon} ${styles[`deco${s}`]}`} />

                                            {/* Inlaid deco display */}
                                            {s > 0 && placement?.decoration && canFit && (
                                                <div className={styles.slottedDeco}>
                                                    <p className={styles.inlaidDecoName}>{placement.decoration.name}</p>
                                                    <button className={styles.decoDeleteBtn} onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteDecoration(slotKey, i);
                                                    }}><XMarkIcon /></button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Optional: you can render charm info differently if you want */}
                    {isCharmRank(gearPiece) && null}
                </>
            ) : (
                <>
                    {slotKey === "weapon" ? (
                        <div className={styles.pieceContainerHeader} onClick={() => openWeaponSelector(slotKey)}>
                            <span className={styles.buildPieceIcon} style={{ backgroundPosition: bgPos }}></span>
                            <div className={styles.buildPieceInfo}>
                                <p className={styles.pieceTitle}>None</p>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.pieceContainerHeader} onClick={() => openGearSelector(slotKey)}>
                            <span className={styles.buildPieceIcon} style={{ backgroundPosition: bgPos }}></span>
                            <div className={styles.buildPieceInfo}>
                                <p className={styles.pieceTitle}>None</p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}