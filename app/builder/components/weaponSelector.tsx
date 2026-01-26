import styles from "./page.module.css"
import {ChevronDownIcon, XMarkIcon} from "@heroicons/react/24/outline"
import React, {useEffect, useMemo, useRef, useState} from "react";
import {useGameData} from "@/app/hooks/useGameData";
import ArmorPiece from "@/app/components/builder/build/buildComponents/armorPiece"
import type {Armor, CharmRank, WeaponKind, BuilderBuild, Weapon} from "@/app/api/types/types";

type ArmorSlotKey = "weapon" | "head" | "chest" | "arms" | "waist" | "legs" | "charm";

interface Props {
    weaponSelectorOpen: boolean;
    setWeaponSelectorOpen: React.Dispatch<React.SetStateAction<boolean>>;
    type: ArmorSlotKey;
    build: BuilderBuild;
    setBuild: React.Dispatch<React.SetStateAction<BuilderBuild>>;
}

export default function WeaponSelector({ weaponSelectorOpen, setWeaponSelectorOpen, type, build, setBuild }: Props) {
    const [weaponFilter, setWeaponFilter] = useState("charge-blade");
    const [weaponKind, setWeaponKind] = useState<WeaponKind>(null);
    const [openWeaponSelectorDropdown, setOpenWeaponSelectorDropdown] = useState(false);
    const { weapons } = useGameData();

    const weaponDropdownRef = useRef<HTMLDivElement | null>(null);

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

    const weaponData = useMemo<Array<Exclude<WeaponKind, null>>>(() => {
        if (!weapons) return [];

        const kinds = weapons
            .map((w) => w.kind)
            .filter((k): k is Exclude<WeaponKind, null> => k !== null);

        return Array.from(new Set(kinds));
    }, [weapons]);

    const filteredWeapons = useMemo(
        () => (weapons ? weapons.filter(w => w.kind === weaponFilter) : []),
        [weapons, weaponFilter]
    );


    function updateWeapon(weapon: Exclude<WeaponKind, null>) {
        setWeaponKind(weapon);
        setOpenWeaponSelectorDropdown(false);
        setWeaponFilter(weapon)
    }

    function addWeapon(weapon: Weapon) {
        setBuild(prev => ({ ...prev, weapon: weapon }));
        setWeaponSelectorOpen(false);

    }

    useEffect(() => {
        if (!openWeaponSelectorDropdown) return;

        function handleClickOutside(e: MouseEvent) {
            if (weaponDropdownRef.current && !weaponDropdownRef.current.contains(e.target as Node)) {
                setOpenWeaponSelectorDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openWeaponSelectorDropdown]);

    return (
        <div className={weaponSelectorOpen ? `${styles.gearSelectorContainer} ${styles.open}` : styles.gearSelectorContainer}>
            <div className={styles.gearSelectorInner}>
                <div className={styles.info}>
                    <div className={styles.header}>
                        <p>Gear Search</p>
                        <button onClick={() => setWeaponSelectorOpen(false)}><XMarkIcon /></button>
                    </div>
                    <div className={styles.searchContainer}>
                        <p>Weapon</p>
                        <div className={styles.inputFilterContainer}>
                            <input type={"text"} placeholder={"Search"} />
                            <div className={styles.weaponSelectorWrapper} ref={weaponDropdownRef}>
                                <div
                                    className={styles.weaponSelector}
                                    onClick={() => setOpenWeaponSelectorDropdown((prev) => !prev)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            setOpenWeaponSelectorDropdown((prev) => !prev);
                                        }
                                    }}
                                >
                                    {weaponFilter && (
                                        <>
                                            <div className={styles.weaponSelectorLeft}>
                                                <span className={`${styles.weaponIcon} ${styles[weaponFilter]}`} />
                                            </div>
                                            <ChevronDownIcon className={styles.dropDownIcon} />
                                        </>
                                    )}
                                </div>

                                {openWeaponSelectorDropdown && (
                                    <div className={`${styles.weaponDropdown} ${styles.open}`}>
                                        {weaponData.map((weapon) => (
                                            <button key={weapon} type="button" onClick={() => updateWeapon(weapon)}>
                                                <span className={`${styles.weaponIcon} ${styles[weapon]}`} />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.main}>
                    <div className={styles.mainInner}>
                        {}
                        {filteredWeapons && filteredWeapons.map((piece, i) => (
                            <div key={i} className={styles.gearContainer} onClick={() => addWeapon(piece)}>
                                <ArmorPiece gearPiece={piece} slotKey={type} build={null} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}