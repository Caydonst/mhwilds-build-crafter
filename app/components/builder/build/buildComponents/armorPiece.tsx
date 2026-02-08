import styles from "../page.module.css"
import type {Build, SlotLevel, Armor, CharmRank, Weapon} from "@/app/api/types/types";
import React from "react";

type ArmorSlotKey = "head" | "chest" | "arms" | "waist" | "legs";
type GearSlotKey = ArmorSlotKey | "charm";
type WeaponArmorCharm = Weapon | Armor | CharmRank;
const ARMOR_KINDS = ["head", "chest", "arms", "waist", "legs"] as const;
type ArmorKind = typeof ARMOR_KINDS[number];

interface Props {
    gearPiece: WeaponArmorCharm | null
    slotKey: string;
    build: Build | null;
}

export default function ArmorPiece({ gearPiece, slotKey, build }: Props) {

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
        return !!piece && weapons.includes((piece as any).kind);
    }

    function isArmorPiece(piece: WeaponArmorCharm | null | undefined): piece is Armor {
        return !!piece && ARMOR_KINDS.includes((piece as any).kind);
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
            slotKey === "charm"
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

    return (
        <div className={styles.buildPieceContainer}>
            {gearPiece !== null ? (
                <>
                    {(isWeaponPiece(gearPiece) && gearPiece.kind && weapons.includes(gearPiece.kind) ? (
                        <div className={styles.pieceContainerHeader}>
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
                                        <p key={i}>{skill.skill.name} {skill.level}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.pieceContainerHeader}>
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
                    <div className={styles.decoSlotsContainer}>
                        {!isCharmRank(gearPiece) && gearPiece.slots.map((s, i) => {
                            const placement = build?.decorations?.[slotKey as ArmorSlotKey]?.[i];
                            const key = `${slotKey}-slot-${i}`;
                            return (
                                <div key={key} className={styles.slot}>
                                    {s === 0 ? (
                                        <div className={styles.decoDash}>
                                            <p>-</p>
                                        </div>
                                    ) : (
                                        <span className={`${styles.decoIcon} ${styles[`deco${s}`]}`} />
                                    )}
                                    {placement && placement.slotLevel <= s && (
                                        <p>{placement.decoration?.name ?? ""}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Optional: you can render charm info differently if you want */}
                    {slotKey === "charm" && isCharmRank(gearPiece) && null}
                </>
            ) : (
                <>
                    <div className={styles.pieceContainerHeader}>
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