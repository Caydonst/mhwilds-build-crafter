import styles from "../page.module.css";
import React from "react";
import type {BuildWeapon, SlotLevel, Build} from "@/app/api/types/types"

interface Props {
    build: Build;
}

export default function Weapon({ build }: Props) {

    function isSlotLevel(x: number): x is SlotLevel {
        return x === 1 || x === 2 || x === 3;
    }

    // Weapon (assumes your Build type has been updated to include weapon)
    const weapon: BuildWeapon | null = build.weapon ?? null;
    const weaponSlots: SlotLevel[] =
        weapon?.slots?.filter((x): x is SlotLevel => isSlotLevel(x)) ?? [];

    return (
        <div className={styles.buildPieceContainer}>
            <div className={styles.pieceContainerHeader}>
                <span className={`${styles.buildPieceIcon} ${styles[weapon.kind === null ? "sword-shield" : weapon.kind]}`} />
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
    )
}