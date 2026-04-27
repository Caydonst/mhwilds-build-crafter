import styles from "./page.module.css"
import {
    type Armor,
    BuilderBuild,
    type CharmRank,
    type CustomCharm,
    type Weapon,
    SavedBuild,
    type WeaponKind
} from "@/app/api/types/types";
import React from "react";
import {ArrowUpRightIcon, TrashIcon} from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import {deleteBuild} from "@/lib/actions";

type ArmorSlotKey = "weapon" | "head" | "chest" | "arms" | "waist" | "legs" | "charm";
type GearSlotKey = "head" | "chest" | "arms" | "waist" | "legs" | "charm";
type WeaponArmorCharm = Weapon | Armor | CharmRank | CustomCharm;

type Props = {
    build: SavedBuild;
    setSavedBuilds: React.Dispatch<React.SetStateAction<SavedBuild[]>>;
    setDeletePopup: React.Dispatch<React.SetStateAction<boolean>>;
    setToDelete: React.Dispatch<React.SetStateAction<number | null>>;
}

export default function BuildCard({ build, setSavedBuilds, setDeletePopup, setToDelete }: Props) {
    const slots: ArmorSlotKey[] = ["weapon", "head", "arms", "chest", "legs", "waist", "charm"]

    const weaponLabelMap: Record<Exclude<WeaponKind, null>, string> = {
        "bow": "Bow",
        "charge-blade": "Charge Blade",
        "dual-blades": "Dual Blades",
        "great-sword": "Great Sword",
        "gunlance": "Gunlance",
        "hammer": "Hammer",
        "heavy-bowgun": "Heavy Bowgun",
        "hunting-horn": "Hunting Horn",
        "insect-glaive": "Insect Glaive",
        "lance": "Lance",
        "light-bowgun": "Light Bowgun",
        "long-sword": "Long Sword",
        "switch-axe": "Switch Axe",
        "sword-shield": "Sword & Shield",
    };

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
        return !!piece && "specials" in piece;
    }

    function isArmorPiece(piece: WeaponArmorCharm | null | undefined): piece is Armor {
        return !!piece && "kind" in piece;
    }

    function isCharmRank(piece: WeaponArmorCharm | null | undefined): piece is CharmRank {
        return !!piece && "charm" in piece && !("kind" in piece);
    }
    function isCustomCharm(piece: WeaponArmorCharm | null | undefined): piece is CustomCharm {
        return !!piece && "customCharm" in piece;
    }

    const armorIndex: Record<GearSlotKey, number> = {
        head: 14,
        chest: 15,
        arms: 16,
        waist: 17,
        legs: 18,
        charm: 19,
    };

    function getIcon(gearPiece: WeaponArmorCharm | null, slot: ArmorSlotKey) {
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
            if (slot !== "weapon") {
                bgPos = `calc((-64px * ${armorIndex[slot]}) * var(--build-icon-size)) calc((-64px * ${rarity}) * var(--build-icon-size))`;
            }
        }

        return bgPos;
    }
    console.log("BUILLDDDDD")
    console.log(build);

    console.log("buildCard error")
    console.log(build);

    return (
        <div className={styles.savedBuildContainer}>
            <div className={styles.buildContainerTop}>
                <div className={styles.headerInfo}>
                    <div className={styles.weaponKindContainer}>
                        {build?.build_data.weapon?.kind ? (
                            <p>{weaponLabelMap[build.build_data.weapon.kind]}</p>
                        ) : (
                            <p>None</p>
                        )}
                    </div>
                    {/*
                    <div className={styles.timeSavedContainer}>
                        <p>Saved 2h ago</p>
                    </div>
                    */}
                </div>
                <div className={styles.buildTitleContainer}>
                    <div className={styles.titleIconContainer}>
                        {build?.build_data.weapon?.kind ? (
                            <span className={`${styles.buildPieceIcon}`}
                                  style={{backgroundPosition: `calc((-64px * ${weaponIndex[build.build_data.weapon.kind]}) * var(--build-icon-size)) calc((-64px * ${build.build_data.weapon.rarity}) * var(--build-icon-size))`}}/>
                        ) : (
                            <span className={styles.buildPieceIcon} style={{backgroundPosition: getIcon(build.build_data.weapon, "weapon")}}></span>
                        )}
                    </div>
                    <div className={styles.titleInfoContainer}>
                        <h2 className={styles.title}>{build.build_name}</h2>
                        {build.build_data.weapon !== null ? (
                            <p className={styles.weaponName}>{build.build_data.weapon.name}</p>
                        ) : (
                            <p className={styles.weaponName}>None</p>
                        )}
                    </div>
                </div>
            </div>
            <div className={styles.equipmentContainer}>
                <p>Equipment</p>
                {slots.map((slot, i) => (
                    build.build_data[slot] !== null ? (
                        <div key={i} className={styles.pieceContainer}>
                            {slot === "weapon" && build?.build_data.weapon?.kind ? (
                                <>
                                    <span className={`${styles.buildPieceIcon}`}
                                          style={{backgroundPosition: `calc((-64px * ${weaponIndex[build.build_data.weapon.kind]}) * var(--build-icon-size)) calc((-64px * ${build.build_data[slot].rarity}) * var(--build-icon-size))`}}
                                    />
                                    <p>{build.build_data[slot].name}</p>
                                </>
                            ) : (
                                <>
                                    <span className={styles.buildPieceIcon} style={{backgroundPosition: getIcon(build.build_data[slot], slot)}}></span>
                                    <p>{build.build_data[slot].name}</p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div key={i} className={styles.pieceContainer}>
                            <span className={styles.buildPieceIcon} style={{backgroundPosition: getIcon(build.build_data[slot], slot)}}></span>
                            None
                        </div>
                    )
                ))}
            </div>
            <div className={styles.footer}>
                <a className={styles.editBtn} target={"_blank"} href={`/builder?build=${build.id}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M384 64C366.3 64 352 78.3 352 96C352 113.7 366.3 128 384 128L466.7 128L265.3 329.4C252.8 341.9 252.8 362.2 265.3 374.7C277.8 387.2 298.1 387.2 310.6 374.7L512 173.3L512 256C512 273.7 526.3 288 544 288C561.7 288 576 273.7 576 256L576 96C576 78.3 561.7 64 544 64L384 64zM144 160C99.8 160 64 195.8 64 240L64 496C64 540.2 99.8 576 144 576L400 576C444.2 576 480 540.2 480 496L480 416C480 398.3 465.7 384 448 384C430.3 384 416 398.3 416 416L416 496C416 504.8 408.8 512 400 512L144 512C135.2 512 128 504.8 128 496L128 240C128 231.2 135.2 224 144 224L224 224C241.7 224 256 209.7 256 192C256 174.3 241.7 160 224 160L144 160z"/></svg>
                    View
                </a>
                <button className={styles.deleteBtn} onClick={() => {
                    setDeletePopup(true)
                    setToDelete(build.id)
                }}><TrashIcon /></button>
            </div>
        </div>
    )
}