import styles from "./page.module.css"
import type {Build, SlotLevel, Armor, CharmRank, Weapon} from "@/app/api/types/types";
import React from "react";

type ArmorSlotKey = "weapon" | "head" | "chest" | "arms" | "waist" | "legs" | "charm";
type GearSlotKey = "head" | "chest" | "arms" | "waist" | "legs" | "charm";
type WeaponArmorCharm = Weapon | Armor | CharmRank;
const ARMOR_KINDS = ["head", "chest", "arms", "waist", "legs"] as const;
type ArmorKind = typeof ARMOR_KINDS[number];

interface Props {
    gearPiece: WeaponArmorCharm | null
    slotKey: ArmorSlotKey;
    build: Build | null;
    openGearSelector: (slot: ArmorSlotKey) => void;
    openWeaponSelector: (slot: ArmorSlotKey) => void;
}

export default function GearPiece({ gearPiece, slotKey, build, openGearSelector, openWeaponSelector }: Props) {

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

    type WeaponKind = typeof weapons[number];

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
    let armorSlots

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

        const ZEROS = [0, 0, 0] as const;
        // Normalize armor slots to SlotLevel[]
        armorSlots =
            isArmorPiece(gearPiece)
                ? ([...gearPiece.slots.filter(isSlotLevel), ...ZEROS].slice(0, 3))
                : [...ZEROS];
    }

    if (!isArmorPiece(gearPiece) && !isCharmRank(gearPiece)) {
        console.log(gearPiece?.kind)
    }

    function test(slot: string) {
        console.log("deco click");
        console.log(slot);
    }

    return (
        <div className={styles.buildPieceContainer}>
            {gearPiece !== null ? (
                <>
                    {(isWeaponPiece(gearPiece) && gearPiece.kind && weapons.includes(gearPiece.kind) ? (
                        <div className={styles.pieceContainerHeader} onClick={() => openWeaponSelector(slotKey)}>
                            <span className={`${styles.buildPieceIcon}`} style={{ backgroundPosition: `calc((-64px * ${weaponIndex[gearPiece.kind]}) * var(--build-icon-size)) calc((-64px * ${rarity}) * var(--build-icon-size))` }} />
                            <div className={styles.buildPieceInfo}>
                                <p className={styles.pieceTitle}>{gearPiece.name}</p>
                                <div className={styles.gearPieceSkillsContainer}>

                                    {gearPiece.skills.map((skill, i) => (
                                        <p key={i}>{skill.skill.name} {skill.level}</p>
                                    ))}
                                </div>
                            </div>
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
                                        <p key={i}>{skill.skill.name} {skill.level}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* ✅ Decorations only for THIS piece */}
                    {(isWeaponPiece(gearPiece) || isArmorPiece(gearPiece)) && gearPiece.slots.length > 0 && (
                        <>
                            <div className={styles.decoSlotsContainer}>
                                {gearPiece.slots.map((s, i) => {
                                    //const placement = build?.decorations?.[slotKey as ArmorSlotKey]?.[i];
                                    const key = `${slotKey}-slot-${i}`;
                                    return (
                                        <div key={key} className={styles.slot} onClick={() => test(slotKey)}>
                                            {s === 0 ? (
                                                <div className={styles.decoDash}>
                                                    <p>-</p>
                                                </div>
                                            ) : (
                                                <span className={`${styles.decoIcon} ${styles[`deco${s}`]}`} />
                                            )}
                                            {/*{placement && placement.slotLevel <= s && (
                                                <p>{placement.decoration?.name ?? ""}</p>
                                            )}*/}
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
                    <div className={styles.pieceContainerHeader} onClick={() => openGearSelector(slotKey)}>
                  <span
                      className={styles.buildPieceIcon}
                      style={{ backgroundPosition: bgPos }}
                  />
                        <div className={styles.buildPieceInfo}>
                            <p className={styles.pieceTitle}>None</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}