import styles from "./page.module.css"
import {XMarkIcon} from "@heroicons/react/24/outline"
import React, {useState} from "react";
import {useGameData} from "@/app/hooks/useGameData";
import ArmorPiece from "@/app/components/builder/build/buildComponents/armorPiece"
import type {BuilderBuild, Armor, CharmRank, DecoPlacement, Skill} from "@/app/api/types/types";

type ArmorSlotKey = "weapon" | "head" | "chest" | "arms" | "waist" | "legs" | "charm";

interface Props {
    gearSelectorOpen: boolean;
    setGearSelectorOpen: React.Dispatch<React.SetStateAction<boolean>>;
    type: ArmorSlotKey;
    build: BuilderBuild;
    setBuild: React.Dispatch<React.SetStateAction<BuilderBuild>>;
}

export default function GearSelector({ gearSelectorOpen, setGearSelectorOpen, type, build, setBuild }: Props) {
    const { weapons, armorBySlot, charms } = useGameData();
    const [searchQuery, setSearchQuery] = useState<string>("");

    let gear: (Armor | CharmRank)[];

    if (type !== "weapon" && type !== "charm") {
        gear = armorBySlot?.[type] ?? [];
    } else if (type === "charm") {
        gear = charms
    }

    function addArmor(armor: Armor | CharmRank) {
        setBuild((prev) => {
            // If charm or no slots → just equip
            if (!("slots" in armor)) {
                return {
                    ...prev,
                    [type]: armor,
                };
            }

            // Create empty deco placements for this piece
            const emptySlots: DecoPlacement[] = armor.slots.map(() => ({
                slotLevel: 1,
                decoration: null,
            }));

            return {
                ...prev,
                [type]: armor,

                decorations: {
                    ...prev.decorations,
                    [type]: emptySlots,
                },
            };
        });

        setGearSelectorOpen(false);
    }

    function updateSearchQuery(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchQuery(event.target.value);
    }

   
    const filteredGear = React.useMemo(() => {
        const query = searchQuery.toLowerCase();

        return (gear ?? []).filter(piece =>
            piece.name.toLowerCase().startsWith(query)
        );
        // @ts-expect-error : Error
    }, [searchQuery, gear]);


    return (
        <div className={gearSelectorOpen ? `${styles.gearSelectorContainer} ${styles.open}` : styles.gearSelectorContainer}>
            <div className={styles.gearSelectorInner}>
                <div className={styles.info}>
                    <div className={styles.header}>
                        <p>Select Gear</p>
                        <button onClick={() => setGearSelectorOpen(false)}><XMarkIcon /></button>
                    </div>
                    <div className={styles.searchContainer}>
                        <p>{type.charAt(0).toUpperCase() + type.slice(1)}</p>
                        <input type={"text"} placeholder={"Search"} value={searchQuery} onChange={(e) => updateSearchQuery(e)} />
                    </div>
                </div>
                {type !== "charm" && (
                    <div className={styles.skillBonusRefContainer}>
                        <div className={styles.setBonusRef}>
                            <span></span>
                            <p>Set bonus skill</p>
                        </div>
                        <div className={styles.groupBonusRef}>
                            <span></span>
                            <p>Group skill</p>
                        </div>
                    </div>
                )}
                <div className={styles.main}>
                    <div className={styles.mainInner}>
                        {filteredGear && filteredGear.map((piece) => (
                            <div key={piece.id} className={styles.gearContainer} onClick={() => addArmor(piece)}>
                                {armorBySlot?.armorSets && (
                                    <ArmorPiece gearPiece={piece} armorSets={armorBySlot.armorSets} slotKey={type} build={null} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}