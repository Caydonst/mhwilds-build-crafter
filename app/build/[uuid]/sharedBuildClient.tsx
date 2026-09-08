"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import type {
    BuilderBuild,
    DecoPlacement,
} from "@/app/api/types/types";

import { useGameData } from "@/app/hooks/useGameData";

import GearPiece from "@/app/builder/components/gearPiece";
import SkillsComponent from "@/app/builder/components/skillsComponent";
import StatsComponent from "@/app/builder/components/statsComponent";

import builderStyles from "@/app/builder/page.module.css";
import styles from "./page.module.css";

type Props = {
    build: BuilderBuild;
    buildName: string;
};

type ArmorSlotKey =
    | "weapon"
    | "head"
    | "chest"
    | "arms"
    | "waist"
    | "legs"
    | "charm";

export default function SharedBuildClient({
    build,
    buildName,
}: Props) {
    const router = useRouter();

    const {
        skills,
        armorBySlot,
        isLoading,
    } = useGameData();

    const [selectedPage, setSelectedPage] = useState<
        "gear" | "skills" | "stats"
    >("gear");

    /*
     * GearPiece still expects a setter because the normal builder
     * uses the same component. Since readOnly=true prevents all
     * editing controls, this copy should never actually be changed.
     */
    const [viewBuild, setViewBuild] = useState<BuilderBuild>(build);

    const ARMOR_SLOTS: ArmorSlotKey[] = [
        "weapon",
        "head",
        "chest",
        "arms",
        "waist",
        "legs",
        "charm",
    ];

    function openInBuilder() {
        localStorage.setItem(
            "savedBuild",
            JSON.stringify(build),
        );

        router.push("/builder");
    }

    /*
     * These are required by GearPiece but won't be called because
     * readOnly is enabled.
     */
    function noopGearSelector(_slot: ArmorSlotKey) { }

    function noopDecoSelector(
        _slotLevel: number,
        _decoKind: string,
        _slot: ArmorSlotKey,
        _slotIndex: number,
    ) { }

    function noopDeleteBuildItem(
        _slot: ArmorSlotKey,
    ) { }

    function noopDeleteDecoration(
        _slot: ArmorSlotKey,
        _slotIndex: number,
    ) { }

    if (isLoading || !armorBySlot) {
        return (
            <main className={builderStyles.builderPageWrapper}>
                <div className={builderStyles.spinnerContainer}>
                    <span className={builderStyles.spinnerWrapper}>
                        <span
                            className={builderStyles.spinner}
                        />
                        Loading build...
                    </span>
                </div>
            </main>
        );
    }

    return (
        <main className={builderStyles.builderPageWrapper}>
            {/* DESKTOP HEADER */}
            <div className={styles.desktopHeader}>
                <div className={styles.headerInner}>
                    <div className={styles.sharedHeader}>
                        <div className={styles.buildInfo}>
                            <h1>{`< Shared build >`}</h1>
                        </div>

                        <button
                            type="button"
                            className={styles.openBuilderBtn}
                            onClick={openInBuilder}
                        >
                            Open in Builder
                            <ArrowRightIcon />
                        </button>
                    </div>
                </div>

                <div className={builderStyles.headerRoutes}>
                    <div
                        className={
                            builderStyles.skillsHeaderDesktop
                        }
                    >
                        Skills
                    </div>

                    <div
                        className={
                            builderStyles.gearHeaderDesktop
                        }
                    >
                        Gear
                    </div>

                    <div
                        className={
                            builderStyles.statsHeaderDesktop
                        }
                    >
                        Stats
                    </div>
                </div>
            </div>

            {/* MOBILE HEADER */}
            <div className={styles.mobileHeader}>
                <div className={styles.buildInfo}>
                    <h1>{`< Shared build >`}</h1>
                </div>

                <button
                    type="button"
                    className={styles.openBuilderBtn}
                    onClick={openInBuilder}
                    aria-label="Open in Builder"
                >
                    Open in builder
                    <ArrowRightIcon />
                </button>
            </div>

            {/* MOBILE ROUTES */}
            <div className={builderStyles.mobileFooter}>
                <div className={builderStyles.mobileRoutes}>
                    <button
                        className={`${builderStyles.gearHeaderMobile} ${selectedPage === "gear"
                                ? builderStyles.selected
                                : ""
                            }`}
                        onClick={() => setSelectedPage("gear")}
                    >
                        Gear
                    </button>

                    <button
                        className={`${builderStyles.skillsHeaderMobile} ${selectedPage === "skills"
                                ? builderStyles.selected
                                : ""
                            }`}
                        onClick={() => setSelectedPage("skills")}
                    >
                        Skills
                    </button>

                    <button
                        className={`${builderStyles.statsHeaderMobile} ${selectedPage === "stats"
                                ? builderStyles.selected
                                : ""
                            }`}
                        onClick={() => setSelectedPage("stats")}
                    >
                        Stats
                    </button>
                </div>

                <div
                    className={builderStyles.slider}
                    style={{
                        transform: `translateX(${selectedPage === "gear"
                                ? 0
                                : selectedPage === "skills"
                                    ? 100
                                    : 200
                            }%)`,
                    }}
                />
            </div>

            {/* DESKTOP BUILD */}
            <div
                className={
                    builderStyles.builderPageInnerDesktop
                }
            >
                <div className={builderStyles.skillsContainer}>
                    <SkillsComponent
                        build={viewBuild}
                        skills={skills}
                        armorSets={armorBySlot.armorSets}
                    />
                </div>

                <div className={builderStyles.gearContainer}>
                    <div className={styles.gearOverlay}></div>
                    <div
                        className={
                            builderStyles.skillBonusRefContainer
                        }
                    >
                        <div
                            className={
                                builderStyles.setBonusRef
                            }
                        >
                            <span />
                            <p>Set bonus skill</p>
                        </div>

                        <div
                            className={
                                builderStyles.groupBonusRef
                            }
                        >
                            <span />
                            <p>Group skill</p>
                        </div>
                    </div>

                    {ARMOR_SLOTS.map((slot) => (
                        <GearPiece
                            key={slot}
                            slotKey={slot}
                            gearPiece={viewBuild[slot]}
                            build={viewBuild}
                            setBuild={setViewBuild}
                            armorSets={
                                armorBySlot.armorSets
                            }
                            deleteBuildItem={
                                noopDeleteBuildItem
                            }
                            openGearSelector={
                                noopGearSelector
                            }
                            openWeaponSelector={
                                noopGearSelector
                            }
                            openDecoSelector={
                                noopDecoSelector
                            }
                            deleteDecoration={
                                noopDeleteDecoration
                            }
                            readOnly
                        />
                    ))}
                </div>

                <div className={builderStyles.statsContainer}>
                    <StatsComponent build={viewBuild} />
                </div>
            </div>

            {/* MOBILE BUILD */}
            <div
                className={
                    builderStyles.builderPageInnerMobile
                }
            >
                {selectedPage === "gear" && (
                    <div
                        className={
                            builderStyles.gearContainer
                        }
                    >
                        <div
                            className={
                                builderStyles.skillBonusRefContainer
                            }
                        >
                            <div
                                className={
                                    builderStyles.setBonusRef
                                }
                            >
                                <span />
                                <p>Set bonus skill</p>
                            </div>

                            <div
                                className={
                                    builderStyles.groupBonusRef
                                }
                            >
                                <span />
                                <p>Group skill</p>
                            </div>
                        </div>

                        {ARMOR_SLOTS.map((slot) => (
                            <GearPiece
                                key={slot}
                                slotKey={slot}
                                gearPiece={viewBuild[slot]}
                                build={viewBuild}
                                setBuild={setViewBuild}
                                armorSets={
                                    armorBySlot.armorSets
                                }
                                deleteBuildItem={
                                    noopDeleteBuildItem
                                }
                                openGearSelector={
                                    noopGearSelector
                                }
                                openWeaponSelector={
                                    noopGearSelector
                                }
                                openDecoSelector={
                                    noopDecoSelector
                                }
                                deleteDecoration={
                                    noopDeleteDecoration
                                }
                                readOnly
                            />
                        ))}
                    </div>
                )}

                {selectedPage === "skills" && (
                    <div
                        className={
                            builderStyles.skillsContainer
                        }
                    >
                        <SkillsComponent
                            build={viewBuild}
                            skills={skills}
                            armorSets={
                                armorBySlot.armorSets
                            }
                        />
                    </div>
                )}

                {selectedPage === "stats" && (
                    <div
                        className={
                            builderStyles.statsContainer
                        }
                    >
                        <StatsComponent
                            build={viewBuild}
                        />
                    </div>
                )}
            </div>
        </main>
    );
}