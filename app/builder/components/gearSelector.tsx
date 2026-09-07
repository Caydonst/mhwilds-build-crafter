import styles from "./page.module.css";

import {
    MagnifyingGlassIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

import React, {
    useMemo,
    useState,
} from "react";

import { useGameData } from "@/app/hooks/useGameData";

import ArmorPiece from "@/app/components/builder/build/buildComponents/armorPiece";

import type {
    BuilderBuild,
    Armor,
    CharmRank,
    DecoPlacement,
} from "@/app/api/types/types";

import CharmCreator from "@/app/components/charmCreator/charmCreator";

type ArmorSlotKey =
    | "weapon"
    | "head"
    | "chest"
    | "arms"
    | "waist"
    | "legs"
    | "charm";

interface Props {
    gearSelectorOpen: boolean;
    setGearSelectorOpen: React.Dispatch<
        React.SetStateAction<boolean>
    >;
    type: ArmorSlotKey;
    build: BuilderBuild;
    setBuild: React.Dispatch<
        React.SetStateAction<BuilderBuild>
    >;
}

export default function GearSelector({
    gearSelectorOpen,
    setGearSelectorOpen,
    type,
    build,
    setBuild,
}: Props) {
    const {
        armorBySlot,
        charms,
    } = useGameData();

    const [searchQuery, setSearchQuery] =
        useState("");

    const [
        charmCreatorOpen,
        setCharmCreatorOpen,
    ] = useState(false);

    const gear = useMemo<
        (Armor | CharmRank)[]
    >(() => {
        if (type === "charm") {
            return charms ?? [];
        }

        if (type !== "weapon") {
            return armorBySlot?.[type] ?? [];
        }

        return [];
    }, [
        type,
        charms,
        armorBySlot,
    ]);

    const filteredGear = useMemo(() => {
        const query = searchQuery
            .trim()
            .toLowerCase();

        if (!query) {
            return gear;
        }

        return gear.filter((piece) =>
            piece.name
                .toLowerCase()
                .includes(query),
        );
    }, [
        searchQuery,
        gear,
    ]);

    const formattedType =
        type.charAt(0).toUpperCase() +
        type.slice(1);

    function addArmor(
        armor: Armor | CharmRank,
    ) {
        setBuild((prev) => {
            if (!("slots" in armor)) {
                return {
                    ...prev,
                    [type]: armor,
                };
            }

            const emptySlots: DecoPlacement[] =
                armor.slots.map(() => ({
                    slotLevel: 1,
                    decoration: null,
                }));

            const equippedArmor = {
                ...armor,
                transcendence: false,
            };

            return {
                ...prev,
                [type]: equippedArmor,

                decorations: {
                    ...prev.decorations,
                    [type]: emptySlots,
                },
            };
        });

        setGearSelectorOpen(false);
    }

    return (
        <div
            className={
                gearSelectorOpen
                    ? `${styles.gearSelectorContainer} ${styles.open}`
                    : styles.gearSelectorContainer
            }
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    setGearSelectorOpen(false);
                }
            }}
        >
            <div
                className={
                    styles.gearSelectorInnerWrapper
                }
            >
                <div
                    className={
                        styles.gearSelectorInner
                    }
                >
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={() =>
                            setGearSelectorOpen(false)
                        }
                        aria-label="Close gear selector"
                    >
                        <XMarkIcon />
                    </button>

                    <div className={styles.info}>
                        <div
                            className={
                                styles.header
                            }
                        >
                            <div
                                className={
                                    styles.headerText
                                }
                            >
                                <span>
                                    EQUIPMENT
                                </span>

                                <h2>
                                    Select{" "}
                                    {formattedType}
                                </h2>

                                <p>
                                    Choose a{" "}
                                    {type === "charm"
                                        ? "charm"
                                        : "piece of armor"}{" "}
                                    for your build.
                                </p>
                            </div>
                        </div>

                        <div
                            className={
                                styles.searchContainer
                            }
                        >
                            <div
                                className={
                                    styles.searchInputWrapper
                                }
                            >
                                <MagnifyingGlassIcon />

                                <input
                                    type="text"
                                    placeholder={`Search ${formattedType.toLowerCase()}...`}
                                    value={
                                        searchQuery
                                    }
                                    onChange={(e) =>
                                        setSearchQuery(
                                            e.target
                                                .value,
                                        )
                                    }
                                />
                            </div>

                            {type === "charm" && (
                                <button
                                    type="button"
                                    className={
                                        styles.artianWeaponBtn
                                    }
                                    onClick={() =>
                                        setCharmCreatorOpen(
                                            true,
                                        )
                                    }
                                >
                                    <span>+</span>
                                    Create Custom Charm
                                </button>
                            )}
                        </div>
                    </div>

                    {type !== "charm" && (
                        <div
                            className={
                                styles.bonusLegend
                            }
                        >
                            <div
                                className={
                                    styles.setBonusRef
                                }
                            >
                                <span />
                                <p>
                                    Set bonus skill
                                </p>
                            </div>

                            <div
                                className={
                                    styles.groupBonusRef
                                }
                            >
                                <span />
                                <p>
                                    Group skill
                                </p>
                            </div>
                        </div>
                    )}

                    <div
                        className={
                            styles.main
                        }
                    >
                        <div
                            className={
                                styles.resultsHeader
                            }
                        >
                            <p>
                                {
                                    filteredGear.length
                                }{" "}
                                {filteredGear.length ===
                                    1
                                    ? "result"
                                    : "results"}
                            </p>
                        </div>

                        <div
                            className={
                                styles.mainInner
                            }
                        >
                            {filteredGear.length >
                                0 ? (
                                filteredGear.map(
                                    (piece) => (
                                        <button
                                            key={
                                                piece.id
                                            }
                                            type="button"
                                            className={
                                                styles.gearContainer
                                            }
                                            onClick={() =>
                                                addArmor(
                                                    piece,
                                                )
                                            }
                                        >
                                            {armorBySlot?.armorSets && (
                                                <ArmorPiece
                                                    gearPiece={
                                                        piece
                                                    }
                                                    armorSets={
                                                        armorBySlot
                                                            .armorSets
                                                    }
                                                    slotKey={
                                                        type
                                                    }
                                                    build={
                                                        null
                                                    }
                                                />
                                            )}
                                        </button>
                                    ),
                                )
                            ) : (
                                <div
                                    className={
                                        styles.noResults
                                    }
                                >
                                    <h3>
                                        No gear found
                                    </h3>

                                    <p>
                                        Try another
                                        search.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <CharmCreator
                    charmCreatorOpen={
                        charmCreatorOpen
                    }
                    setCharmCreatorOpen={
                        setCharmCreatorOpen
                    }
                    setGearSelectorOpen={
                        setGearSelectorOpen
                    }
                    setBuild={setBuild}
                    build={build}
                />
            </div>
        </div>
    );
}