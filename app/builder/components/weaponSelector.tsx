import styles from "./page.module.css"
import {ChevronDownIcon, XMarkIcon} from "@heroicons/react/24/outline"
import React, {useEffect, useMemo, useRef, useState} from "react";
import {useGameData} from "@/app/hooks/useGameData";
import ArmorPiece from "@/app/components/builder/build/buildComponents/armorPiece"
import type {Armor, CharmRank, WeaponKind, BuilderBuild, Weapon, DecoPlacement} from "@/app/api/types/types";
import {armorBySlot} from "@/app/api/apiCalls/apiCalls";
import ArtianCreator from "@/app/components/artianCreator/artianCreator"

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
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [showArtian, setShowArtian] = useState<boolean>(false);
    const { weapons } = useGameData();

    const weaponDropdownRef = useRef<HTMLDivElement | null>(null);

    const weaponData = useMemo<Array<Exclude<WeaponKind, null>>>(() => {
        if (!weapons) return [];

        const kinds = weapons
            .map((w) => w.kind)
            .filter((k): k is Exclude<WeaponKind, null> => k !== null && k !== weaponFilter);

        return Array.from(new Set(kinds));
    }, [weapons, weaponFilter]);

    const filteredWeapons = useMemo(
        () => (weapons ? weapons.filter(w => w.kind === weaponFilter) : []),
        [weapons, weaponFilter]
    );

    function updateSearchQuery(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchQuery(event.target.value);
    }

    const searchedWeapons = React.useMemo(() => {
        const query = searchQuery.toLowerCase();

        return (filteredWeapons ?? []).filter(piece =>
            piece.name.toLowerCase().startsWith(query)
        );
    }, [searchQuery, filteredWeapons]);


    function updateWeapon(weapon: Exclude<WeaponKind, null>) {
        setWeaponKind(weapon);
        setOpenWeaponSelectorDropdown(false);
        setWeaponFilter(weapon)
    }

    function addWeapon(weapon: Weapon) {
        setBuild((prev) => {
            if (!("slots" in weapon)) {
                return {
                    ...prev,
                    weapon: weapon,
                };
            }

            const emptySlots: DecoPlacement[] = weapon.slots.map(() => ({
                slotLevel: 1,
                decoration: null,
            }));

            return {
                ...prev,
                weapon: weapon,

                decorations: {
                    ...prev.decorations,
                    weapon: emptySlots,
                },
            };
        });

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
            <div className={styles.gearSelectorInnerWrapper}>
                <div className={`${styles.gearSelectorInner} ${
                    showArtian ? styles.slideLeft : styles.slideRight
                }`}>
                    <div className={styles.info}>
                        <div className={styles.header}>
                            <p>Gear Search</p>
                        </div>
                        <div className={styles.searchContainer}>
                            <p>Weapon</p>
                            <div className={styles.inputFilterContainer}>
                                <input type={"text"} placeholder={"Search"} onChange={(e) => updateSearchQuery(e)} />
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
                            <button className={styles.artianWeaponBtn} onClick={() => setShowArtian(true)}>+ Artian Weapon</button>
                        </div>
                    </div>
                    <div className={styles.main}>
                        <div className={styles.mainInner}>
                            {searchedWeapons && searchedWeapons.map((piece, i) => (
                                <div key={i} className={styles.gearContainer} onClick={() => addWeapon(piece)}>
                                    <ArmorPiece gearPiece={piece} armorSets={armorBySlot.armorSets} slotKey={type} build={null} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <ArtianCreator showArtian={showArtian} setShowArtian={setShowArtian} addWeapon={addWeapon} />
                <button className={styles.closeBtn} onClick={() => setWeaponSelectorOpen(false)}><XMarkIcon /></button>
            </div>
        </div>
    )
}