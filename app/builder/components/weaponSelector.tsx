import styles from "./page.module.css";
import {
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { useGameData } from "@/app/hooks/useGameData";

import ArmorPiece from "@/app/components/builder/build/buildComponents/armorPiece";
import type {
  WeaponKind,
  BuilderBuild,
  Weapon,
  DecoPlacement,
} from "@/app/api/types/types";

import { armorBySlot } from "@/app/api/apiCalls/apiCalls";
import ArtianCreator from "@/app/components/artianCreator/artianCreator";

import { setBaseElement } from "@/app/components/builder/build/buildComponents/helperFunctions";

type ArmorSlotKey =
  | "weapon"
  | "head"
  | "chest"
  | "arms"
  | "waist"
  | "legs"
  | "charm";

interface Props {
  weaponSelectorOpen: boolean;
  setWeaponSelectorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  type: ArmorSlotKey;
  build: BuilderBuild;
  setBuild: React.Dispatch<React.SetStateAction<BuilderBuild>>;
}

export default function WeaponSelector({
  weaponSelectorOpen,
  setWeaponSelectorOpen,
  type,
  build,
  setBuild,
}: Props) {
  const [weaponFilter, setWeaponFilter] =
    useState<Exclude<WeaponKind, null>>("charge-blade");

  const [openWeaponSelectorDropdown, setOpenWeaponSelectorDropdown] =
    useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [showArtian, setShowArtian] = useState(false);

  const { weapons } = useGameData();

  const weaponDropdownRef = useRef<HTMLDivElement | null>(null);

  const weaponData = useMemo<Array<Exclude<WeaponKind, null>>>(() => {
    if (!weapons) return [];

    const kinds = weapons
      .map((weapon) => weapon.kind)
      .filter((kind): kind is Exclude<WeaponKind, null> => kind !== null);

    return Array.from(new Set(kinds));
  }, [weapons]);

  const filteredWeapons = useMemo(() => {
    if (!weapons) return [];

    return weapons.filter((weapon) => weapon.kind === weaponFilter);
  }, [weapons, weaponFilter]);

  const searchedWeapons = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return filteredWeapons;
    }

    return filteredWeapons.filter((piece) =>
      piece.name.toLowerCase().includes(query),
    );
  }, [searchQuery, filteredWeapons]);

  function updateWeapon(weapon: Exclude<WeaponKind, null>) {
    setWeaponFilter(weapon);
    setOpenWeaponSelectorDropdown(false);
    setSearchQuery("");
  }

  function addWeapon(weapon: Weapon) {
    setBuild((prev) => {
      const emptySlots: DecoPlacement[] = weapon.slots.map(() => ({
        slotLevel: 1,
        decoration: null,
      }));

      return {
        ...prev,
        weapon,
        decorations: {
          ...prev.decorations,
          weapon: emptySlots,
        },
      };
    });

    if (weapon.specials[0]) {
      setBaseElement(weapon.specials[0].damage.display);
    }

    setWeaponSelectorOpen(false);
  }

  useEffect(() => {
    if (!openWeaponSelectorDropdown) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        weaponDropdownRef.current &&
        !weaponDropdownRef.current.contains(e.target as Node)
      ) {
        setOpenWeaponSelectorDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openWeaponSelectorDropdown]);

  return (
    <div
      className={
        weaponSelectorOpen
          ? `${styles.gearSelectorContainer} ${styles.open}`
          : styles.gearSelectorContainer
      }
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setWeaponSelectorOpen(false);
        }
      }}
    >
      <div className={styles.gearSelectorInnerWrapper}>
        <div className={styles.gearSelectorInner}>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => setWeaponSelectorOpen(false)}
            aria-label="Close weapon selector"
          >
            <XMarkIcon />
          </button>

          <div className={styles.info}>
            <div className={styles.header}>
              <div className={styles.headerText}>
                <span>EQUIPMENT</span>

                <h2>Select Weapon</h2>

                <p>Choose a weapon for your build.</p>
              </div>
            </div>

            <div className={styles.searchContainer}>
              <div className={styles.searchToolbar}>
                <div className={styles.searchInputWrapper}>
                  <MagnifyingGlassIcon />

                  <input
                    type="text"
                    placeholder="Search weapons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div
                  className={styles.weaponSelectorWrapper}
                  ref={weaponDropdownRef}
                >
                  <button
                    type="button"
                    className={styles.weaponSelector}
                    onClick={() =>
                      setOpenWeaponSelectorDropdown((prev) => !prev)
                    }
                  >
                    <span
                      className={`${styles.weaponIcon} ${styles[weaponFilter]}`}
                    />

                    <ChevronUpDownIcon className={styles.dropDownIcon} />
                  </button>

                  {openWeaponSelectorDropdown && (
                    <div className={`${styles.weaponDropdown} ${styles.open}`}>
                      {weaponData.map((weapon) => (
                        <button
                          key={weapon}
                          type="button"
                          className={
                            weapon === weaponFilter ? styles.selectedWeapon : ""
                          }
                          onClick={() => updateWeapon(weapon)}
                        >
                          <span
                            className={`${styles.weaponIcon} ${styles[weapon]}`}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                className={styles.artianWeaponBtn}
                onClick={() => setShowArtian(true)}
              >
                <span>+</span>
                Create Artian Weapon
              </button>
            </div>
          </div>

          <div className={styles.main}>
            <div className={styles.resultsHeader}>
              <p>
                {searchedWeapons.length}{" "}
                {searchedWeapons.length === 1 ? "weapon" : "weapons"}
              </p>
            </div>

            <div className={styles.mainInner}>
              {searchedWeapons.length > 0 ? (
                searchedWeapons.map((piece, i) => (
                  <button
                    key={piece.id ?? i}
                    type="button"
                    className={styles.gearContainer}
                    onClick={() => addWeapon(piece)}
                  >
                    <ArmorPiece
                      gearPiece={piece}
                      armorSets={armorBySlot.armorSets}
                      slotKey={type}
                      build={null}
                    />
                  </button>
                ))
              ) : (
                <div className={styles.noResults}>
                  <h3>No weapons found</h3>

                  <p>Try another search or weapon type.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <ArtianCreator
          showArtian={showArtian}
          setShowArtian={setShowArtian}
          addWeapon={addWeapon}
        />
      </div>
    </div>
  );
}
