"use client"
import styles from "./page.module.css"
import {useGameData} from "@/app/hooks/useGameData";
import React, {useState, useEffect, useMemo, useRef} from "react";
import ArmorPiece from "@/app/components/builder/build/buildComponents/armorPiece";
import GearSelector from "./components/gearSelector"
import WeaponSelector from "./components/weaponSelector"
import type {BuilderBuild, DecoPlacement, Skill as SkillType, ArmorSet, BuildDecorations} from "@/app/api/types/types"
import Skill from "@/app/components/builder/build/buildComponents/skill";
import GearPiece from "@/app/builder/components/gearPiece";
import DecoSelector from "./components/decoSelector"
import StatsComponent from "./components/statsComponent";
import SkillsComponent from "@/app/builder/components/skillsComponent";
import { GlobeAsiaAustraliaIcon, InboxArrowDownIcon } from "@heroicons/react/24/solid"
import {testSaveBuild, getBuild, checkUser, getBuildForRedirect, checkBuildLimit} from "@/lib/actions";
import AuthContainer from "@/app/components/authContainer/authContainer";
import { useSearchParams, useRouter } from "next/navigation";
import isEqual from "lodash/isEqual";
import SaveBuildContainer from "@/app/components/saveBuildContainer/saveBuildContainer"
import {updateBuild} from "@/app/builder/components/helperFunctions";
import {createClient} from "@/lib/supabase/client";
import {User} from "@supabase/auth-js";
import BuildsFull from "@/app/components/buildsFullComponent/buildsFull";

type ArmorSlotKey = "weapon" | "head" | "chest" | "arms" | "waist" | "legs" | "charm";

export default function BuilderClient() {
    const { skills, armorBySlot, isLoading, error } = useGameData();
    const searchParams = useSearchParams();
    const buildId = searchParams.get("build");
    const shouldRestore = searchParams.get("restore") === "1";
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [pageLoading, setPageLoading] = useState<boolean>(false);
    const [weaponSelectorOpen, setWeaponSelectorOpen] = useState<boolean>(false);
    const [gearSelectorOpen, setGearSelectorOpen] = useState<boolean>(false);
    const [decoSelectorOpen, setDecoSelectorOpen] = useState<boolean>(false);
    const [slotLevel, setSlotLevel] = useState<number>(0);
    const [decoKind, setDecoKind] = useState<string>("weapon");
    const [decoSlotIndex, setDecoSlotIndex] = useState<number>(0);
    const [type, setType] = useState<ArmorSlotKey>("head")
    const [build, setBuild] = useState<BuilderBuild>({
        weapon: null,
        head: null,
        chest: null,
        arms: null,
        waist: null,
        legs: null,
        charm: null,
        decorations: {
            weapon: [],
            head: [],
            chest: [],
            arms: [],
            waist: [],
            legs: [],
            charm: [],
        },
    });
    const [savedBuild, setSavedBuild] = useState<BuilderBuild>();
    const [selectedPage, setSelectedPage] = useState<string>("gear");
    const [sliderAmount, setSliderAmount] = useState<number>(0);
    const [open, setOpen] = useState(false);
    const [saveBuildOpen, setSaveBuildOpen] = useState(false);
    const [buildName, setBuildName] = useState<string>("");
    const [saveBuildLoading, setSaveBuildLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [buildsFullOpen, setBuildsFullOpen] = useState<boolean>(false);

    const DEFAULT_DECOS: BuildDecorations = {
        weapon: [],
        head: [],
        chest: [],
        arms: [],
        waist: [],
        legs: [],
        charm: [],
    };

    useEffect(() => {
        const supabase = createClient();
        let mounted = true;

        async function checkCurrentUser() {
            const { data, error } = await supabase.auth.getUser();

            if (!mounted) return;

            if (error || !data.user) {
                setUser(null);
                router.replace("/builder");
            } else {
                setUser(data.user);
            }

            setLoading(false);
        }

        checkCurrentUser();

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (!mounted) return;

                const nextUser = session?.user ?? null;
                setUser(nextUser);
                setLoading(false);

                if (!nextUser) {
                    router.replace("/builder");
                    setSavedBuild({
                        weapon: null,
                        head: null,
                        chest: null,
                        arms: null,
                        waist: null,
                        legs: null,
                        charm: null,
                        decorations: {
                            weapon: [],
                            head: [],
                            chest: [],
                            arms: [],
                            waist: [],
                            legs: [],
                            charm: [],
                        },
                    })
                }
            }
        );

        return () => {
            mounted = false;
            listener.subscription.unsubscribe();
        };
    }, [router]);

    useEffect(() => {
        updateBuild(build);
    }, [build]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (params.get("restore") !== "1") return;

        try {
            const raw = sessionStorage.getItem("pendingBuildDraft");

            if (raw) {
                const draft = JSON.parse(raw) as BuilderBuild;
                setBuild(draft);
                sessionStorage.removeItem("pendingBuildDraft");
            }
        } catch (err) {
            console.error(err);
        } finally {
            router.replace("/builder");
        }
    }, [router]);

    /*
    useEffect(() => {
        if (searchParams.get("restore") !== "1") return;

        async function restore() {
            try {
                const raw = sessionStorage.getItem("pendingBuildDraft");

                if (raw) {
                    const draft = JSON.parse(raw) as BuilderBuild;
                    setBuild(draft);
                    sessionStorage.removeItem("pendingBuildDraft");
                }
            } catch (err) {
                console.error(err);
            } finally {
                // ALWAYS remove the query param
                router.replace("/builder");
            }
        }

        restore();
    }, [searchParams, router]);

     */

    useEffect(() => {
        if (!buildId) return;

        async function loadBuild() {
            try {
                setPageLoading(true);

                const user = await checkUser();

                if (!user) {
                    router.replace("/builder");
                    return;
                }

                const build = await getBuild(buildId);

                if (build) {
                    setBuild(build);
                    setSavedBuild(build);
                } else {
                    router.replace("/builder");
                    return;
                }
            } catch (err) {
                console.error(err);
                router.replace("/builder");
            } finally {
                setPageLoading(false);
            }
        }

        loadBuild();
    }, [buildId]);

    async function handleSave() {
        try {
            setLoading(true);

            const authenticated = await checkUser()

            if (authenticated) {
                if (buildId) {
                    await saveBuild();
                } else {
                    // True = build limit reached
                    if (await checkBuildLimit()) {
                        setBuildsFullOpen(true);
                    } else {
                        setSaveBuildOpen(true);
                    }
                }

            } else {
                setOpen(true);
            }
        } finally {
            setLoading(false);
        }
    }

    async function saveBuild() {
        try {
            if (buildId) {
                const saved = await testSaveBuild(build, buildName, buildId);

                if (saved) {
                    setSavedBuild(saved[0].build_data);
                    alert("Build saved!");
                    setLoading(false);
                }
            } else {
                setSaveBuildLoading(true);

                const saved = await testSaveBuild(build, buildName, null);

                if (saved) {
                    setSavedBuild(saved[0].build_data);
                    //alert("Build saved!");
                    router.replace(`/builder?build=${saved[0].id}`);
                    setSaveBuildOpen(false);
                    setLoading(false);
                }
            }

        } catch(error) {
            alert(error);
        } finally {
            setSaveBuildLoading(false);
        }
    }

    function updateSlider(page: string, amt: number) {
        setSelectedPage(page);
        setSliderAmount(amt);
    }

    useEffect(() => {
        if (weaponSelectorOpen || gearSelectorOpen || decoSelectorOpen) {
            document.body.classList.add("no-scroll");
        } else {
            document.body.classList.remove("no-scroll");
        }
    }, [weaponSelectorOpen, gearSelectorOpen, decoSelectorOpen]);

    const ARMOR_SLOTS: ArmorSlotKey[] = ["weapon", "head", "chest", "arms", "waist", "legs", "charm"]

    function openGearSelector(slot: ArmorSlotKey) {
        setType(slot)
        setGearSelectorOpen(true)
    }

    function openWeaponSelector(slot: ArmorSlotKey) {
        setType(slot)
        setWeaponSelectorOpen(true)
    }

    function openDecoSelector(slotLevel: number, decoKind: string, slot: ArmorSlotKey, slotIndex: number) {
        setType(slot);
        setSlotLevel(slotLevel);
        setDecoKind(decoKind);
        setDecoSlotIndex(slotIndex);
        setDecoSelectorOpen(true);
    }

    function deleteBuildItem(slotKey: ArmorSlotKey) {
        setBuild((prev) => {
            const emptySlots: DecoPlacement[] = [];

            return {
                ...prev,
                [slotKey]: null,
                decorations: {
                    ...prev.decorations,
                    [slotKey]: emptySlots,
                },
            };
        });
    }

    function deleteDecoration(slotKey: ArmorSlotKey, slotIndex: number) {
        setBuild((prev) => {
            const decos = prev.decorations ?? DEFAULT_DECOS;

            const nextSlot = [...prev.decorations[slotKey]];
            nextSlot[slotIndex] = {
                slotLevel: 1,
                decoration: null,
            };

            const nextDecorations = {
                ...decos,
                [slotKey]: nextSlot,
            };

            return {
                ...prev,
                decorations: nextDecorations,
            };
        });
    }

    function clickEffect(e: React.MouseEvent<HTMLButtonElement>) {
        const button = e.currentTarget;

        const rect = button.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement("span");
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 800);
    }

    return (
        <main className={styles.builderPageWrapper}>
            {isLoading || pageLoading ? (
                <div className={styles.spinnerContainer}>
                <span className={styles.spinnerWrapper}>
                    <span className={styles.spinner}></span>
                    Loading resources...
                </span>
                </div>
            ) : (
                <>
                    <div className={styles.desktopHeader}>
                        <div className={styles.headerInfoContainer}>
                            <p>Builder</p>
                            {/*
                        <button className={styles.publishBtn}>
                            <GlobeAsiaAustraliaIcon className={styles.publishIcon} />
                            Publish
                        </button>
                        */}
                            <button className={styles.saveBuildBtn} onClick={handleSave}
                                    disabled={loading || isEqual(build, savedBuild)}>
                                {loading ? (
                                    <div className={styles.saveSpinnerContainer}>
                                    <span className={styles.saveSpinnerWrapper}>
                                        <span className={styles.saveSpinner}></span>
                                    </span>
                                    </div>
                                ) : (
                                    <div className={styles.saveBtnInner}>
                                        <InboxArrowDownIcon className={styles.saveIcon}/>
                                        <span>Save</span>
                                    </div>
                                )}
                            </button>
                        </div>
                        <div className={styles.headerRoutes}>
                            <div className={styles.skillsHeaderDesktop}>Skills</div>
                            <div className={styles.gearHeaderDesktop}>Gear</div>
                            <div className={styles.statsHeaderDesktop}>Stats</div>
                        </div>
                    </div>
                    <div className={styles.mobileHeader}>
                        <div className={styles.headerInfoContainer}>
                            <p>Builder</p>
                            <div className={styles.headerInfoInner}>
                                {/*
                            <button className={styles.publishBtn}>
                                <GlobeAsiaAustraliaIcon className={styles.publishIcon} />
                                Publish
                            </button>
                            */}
                                <button className={styles.saveBuildBtn} onClick={handleSave}
                                        disabled={loading || isEqual(build, savedBuild)}>
                                    {loading ? (
                                        <div className={styles.saveSpinnerContainer}>
                                    <span className={styles.saveSpinnerWrapper}>
                                        <span className={styles.saveSpinner}></span>
                                    </span>
                                        </div>
                                    ) : (
                                        <div className={styles.saveBtnInner}>
                                            <InboxArrowDownIcon className={styles.saveIcon}/>
                                            <span>Save</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>

                    </div>
                    <div className={styles.mobileFooter}>
                        <div className={styles.mobileRoutes}>
                            <button
                                className={`${styles.gearHeaderMobile} ${selectedPage === "gear" ? styles.selected : ""}`}
                                onClick={(e) => {
                                    updateSlider("gear", 0);
                                    clickEffect(e);
                                }}
                            >
                                Gear
                            </button>

                            <button
                                className={`${styles.skillsHeaderMobile} ${selectedPage === "skills" ? styles.selected : ""}`}
                                onClick={(e) => {
                                    updateSlider("skills", 100);
                                    clickEffect(e);
                                }}
                            >
                                Skills
                            </button>

                            <button
                                className={`${styles.statsHeaderMobile} ${selectedPage === "stats" ? styles.selected : ""}`}
                                onClick={(e) => {
                                    updateSlider("stats", 200);
                                    clickEffect(e);
                                }}
                            >
                                Stats
                            </button>
                        </div>
                        <div className={styles.slider} style={{transform: `translateX(${sliderAmount}%)`}}></div>
                    </div>
                    <div className={styles.builderPageInnerDesktop}>
                        <div className={styles.skillsContainer}>
                            {armorBySlot && (
                                <SkillsComponent build={build} skills={skills} armorSets={armorBySlot.armorSets}/>
                            )}
                        </div>
                        <div className={styles.gearContainer}>
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
                            {armorBySlot && (
                                ARMOR_SLOTS.map((slot) => (
                                    <GearPiece key={slot} slotKey={slot} gearPiece={build[slot]} build={build}
                                               setBuild={setBuild} armorSets={armorBySlot.armorSets}
                                               deleteBuildItem={deleteBuildItem} openGearSelector={openGearSelector}
                                               openWeaponSelector={openWeaponSelector}
                                               openDecoSelector={openDecoSelector}
                                               deleteDecoration={deleteDecoration}/>
                                ))
                            )}
                        </div>
                        <div className={styles.statsContainer}>
                            <StatsComponent build={build}/>
                        </div>
                    </div>
                    <div className={styles.builderPageInnerMobile}>
                        {selectedPage === "gear" && (
                            <div className={styles.gearContainer}>
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
                                {armorBySlot && (
                                    ARMOR_SLOTS.map((slot) => (
                                        <GearPiece key={slot} slotKey={slot} gearPiece={build[slot]} build={build}
                                                   setBuild={setBuild} armorSets={armorBySlot.armorSets}
                                                   deleteBuildItem={deleteBuildItem}
                                                   openGearSelector={openGearSelector}
                                                   openWeaponSelector={openWeaponSelector}
                                                   openDecoSelector={openDecoSelector}
                                                   deleteDecoration={deleteDecoration}/>
                                    ))
                                )}
                            </div>
                        )}
                        {selectedPage === "skills" && (
                            <div className={styles.skillsContainer}>
                                {armorBySlot && (
                                    <SkillsComponent build={build} skills={skills}
                                                     armorSets={armorBySlot.armorSets}/>
                                )}
                            </div>
                        )}
                        {selectedPage === "stats" && (
                            <div className={styles.statsContainer}>
                                <StatsComponent build={build}/>
                            </div>
                        )}
                    </div>
                    {weaponSelectorOpen && (
                        <WeaponSelector weaponSelectorOpen={weaponSelectorOpen}
                                        setWeaponSelectorOpen={setWeaponSelectorOpen} type={type} build={build}
                                        setBuild={setBuild}/>
                    )}
                    {gearSelectorOpen && (
                        <GearSelector gearSelectorOpen={gearSelectorOpen} setGearSelectorOpen={setGearSelectorOpen}
                                      type={type} build={build} setBuild={setBuild}/>
                    )}
                    {decoSelectorOpen && (
                        <DecoSelector decoSlotIndex={decoSlotIndex} slotLevel={slotLevel} kind={decoKind}
                                      decoSelectorOpen={decoSelectorOpen} setDecoSelectorOpen={setDecoSelectorOpen}
                                      build={build} setBuild={setBuild} type={type}/>
                    )}
                </>
            )}
            <AuthContainer open={open} setOpen={setOpen} />
            <SaveBuildContainer saveBuildOpen={saveBuildOpen} setSaveBuildOpen={setSaveBuildOpen}
                                buildName={buildName} setBuildName={setBuildName} saveBuild={saveBuild} saveBuildLoading={saveBuildLoading} />
            <BuildsFull buildsFullOpen={buildsFullOpen} setBuildsFullOpen={setBuildsFullOpen} />
        </main>
    )
}