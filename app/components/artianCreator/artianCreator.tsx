import styles from "./page.module.css"
import {ArrowLeftIcon, ChevronDownIcon} from "@heroicons/react/24/outline";
import React, {useEffect, useRef, useState} from "react";
import {Weapon, type WeaponKind} from "@/app/api/types/types";
import {CreateArtian} from "@/app/components/artianCreator/helperFunctions";

type Props = {
    showArtian: boolean;
    setShowArtian: React.Dispatch<React.SetStateAction<boolean>>;
    addWeapon: (weapon: Weapon) => void;
}
type PartType = {
    0: string;
    1: string;
    2: string;
}
type ReinforcementType = {
    reinforcement: string;
    lvl: string;
}
type ReinforcementsType = {
    0: ReinforcementType;
    1: ReinforcementType;
    2: ReinforcementType;
    3: ReinforcementType;
    4: ReinforcementType;
}
type Artian = {
    element: string;
    elementDamage: number;
    kind: string;
    type: string;
    raw: number;
    affinity: number;
    parts: PartType;
    reinforcements: ReinforcementsType;
}


export default function ArtianCreator({ showArtian, setShowArtian, addWeapon }: Props) {
    const [sliderAmount, setSliderAmount] = useState(0);
    const [part1, setPart1] = useState<"attack" | "affinity">("attack");
    const [part2, setPart2] = useState<"attack" | "affinity">("attack");
    const [part3, setPart3] = useState<"attack" | "affinity">("attack");
    const [artian, setArtian] = useState("Artian");
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const [elementDropdown, setElementDropdown] = useState(false);
    const [element, setElement] = useState("fire");
    const [reinforcements, setReinforcements] = useState<Record<number, ReinforcementType>>({
        0: {reinforcement: "Select", lvl: "Lvl"},
        1: {reinforcement: "Select", lvl: "Lvl"},
        2: {reinforcement: "Select", lvl: "Lvl"},
        3: {reinforcement: "Select", lvl: "Lvl"},
        4: {reinforcement: "Select", lvl: "Lvl"},
    });
    const [weaponKind, setWeaponKind] = useState("charge-blade");

    const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

    const artianWeaponStats: Artian = {
        element: element,
        elementDamage: getElementDamage(),
        kind: "charge-blade",
        type: artian,
        raw: 190,
        affinity: 5,
        parts: {
            0: part1,
            1: part2,
            2: part3,
        },
        reinforcements: {
            0: {reinforcement: reinforcements[0].reinforcement, lvl: reinforcements[0].reinforcement},
            1: {reinforcement: reinforcements[1].reinforcement, lvl: reinforcements[1].reinforcement},
            2: {reinforcement: reinforcements[2].reinforcement, lvl: reinforcements[2].reinforcement},
            3: {reinforcement: reinforcements[3].reinforcement, lvl: reinforcements[3].reinforcement},
            4: {reinforcement: reinforcements[4].reinforcement, lvl: reinforcements[4].reinforcement},
        }
    }

    function getElementDamage() {
        switch (element) {
            case "fire": return 300;
            case "water": return 300;
            case "thunder": return 300;
            case "ice": return 300;
            case "dragon": return 300;
            case "poison": return 150;
            case "paralysis": return 100;
            case "sleep": return 100;
            case "blast": return 150;
            default: return 0;
        }
    }

    const elements = ["fire", "water", "thunder", "ice", "dragon", "poison", "paralysis", "sleep", "blast"]

    function handleElementClick(element: string) {
        setOpenDropdown((prev) => (prev === "elementDropdown" ? null : "elementDropdown"));
        setElementDropdown(!elementDropdown);
        setElement(element);
    }

    const reinforcementList = ["Attack Boost", "Affinity Boost", "Sharpness Boost", "Element Boost", "Capacity Boost"];
    const lvlList = ["I", "II", "III", "EX"]

    function handleReinforcementClick(index: number, reinforcement: string) {
        setReinforcements(prev => ({
            ...prev, [index]: {...prev[index], reinforcement},
        }));
    }

    function handleLvlClick(index: number, lvl: string) {
        setReinforcements(prev => ({
            ...prev, [index]: {...prev[index], lvl},
        }));
    }

    function changeArtian(val: number, type: string) {
        setSliderAmount(val);
        setArtian(type);
    }

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (!openDropdown) return;

            const currentRef = dropdownRefs.current[openDropdown];

            if (currentRef && !currentRef.contains(e.target as Node)) {
                setOpenDropdown(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openDropdown]);

    function addArtian() {
        const weapon: Weapon = CreateArtian(artianWeaponStats);
        addWeapon(weapon);
    }

    function checkReinforcements() {
        if (artian === "Artian") {
            for (const [key, value] of Object.entries(reinforcements)) {
                if (value.reinforcement === "Select") {
                    return false;
                }
            }
        } else if (artian === "Gogma Artian") {
            for (const [key, value] of Object.entries(reinforcements)) {
                if (value.reinforcement === "Select" || value.lvl === "Lvl") {
                    return false;
                }
            }
        }
        return true;
    }

    return (
        <div className={`${styles.artianContainerWrapper} ${
                showArtian ? styles.slideLeft1 : styles.slideRight1
            }`}>
            <div className={styles.artianContainer}>
                <h3>Artian Creator</h3>
                <div className={styles.weaponSelectorWrapper}>
                    <div className={styles.reinforcement} ref={(el) => {dropdownRefs.current["weaponSelectorDropdown"] = el;}}>
                        <div className={styles.reinforcementInner} onClick={() => setOpenDropdown((prev) => (prev === "weaponSelectorDropdown" ? null : "weaponSelectorDropdown"))}>
                            <p>{weaponLabelMap[weaponKind]}</p>
                            <ChevronDownIcon className={styles.chevronIcon} />
                        </div>
                        {openDropdown === "weaponSelectorDropdown" && (
                            <div className={styles.reinforcementDropdown}>
                                {Object.entries(weaponLabelMap).map(([key, value]) => (
                                    <button key={key} onClick={() => {
                                        setWeaponKind(key);
                                        setOpenDropdown(null);
                                    }}>{value}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.artianSelectorWrapper}>
                    <div className={styles.artianSelectorContainer}>
                        <div className={`${styles.slider} ${artian === "Artian" ? styles.artian : styles.gogmaArtian}`} style={{ transform: `translateX(${sliderAmount}%)` }}></div>
                        <button className={styles.selectorBtn} onClick={() => changeArtian(0, "Artian")}>Artian</button>
                        <button className={styles.selectorBtn} onClick={() => changeArtian(100, "Gogma Artian")}>Gogma Artian</button>
                    </div>
                </div>
                <div className={styles.contentContainer}>
                    {artian === "Artian" && (
                        <div className={styles.contentArtian}>
                            <div className={styles.partSelectionContainer}>
                                <p>Part Selection</p>
                                <div className={styles.reinforcement} ref={(el) => {dropdownRefs.current["elementDropdown"] = el;}}>
                                    <div className={styles.reinforcementInner} onClick={() => setOpenDropdown((prev) => (prev === "elementDropdown" ? null : "elementDropdown"))}>
                                        <p>{element.charAt(0).toUpperCase() + element.slice(1)}</p>
                                        <ChevronDownIcon className={styles.chevronIcon} />
                                    </div>
                                    {openDropdown === "elementDropdown" && (
                                        <div className={styles.reinforcementDropdown}>
                                            {elements.map((element, i) => (
                                                <button key={i} onClick={() => handleElementClick(element)}>{element.charAt(0).toUpperCase() + element.slice(1)}</button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.partContainer}>
                                    <button
                                        className={`${styles.part} ${part1 === "attack" ? styles.selected : ""}`}
                                        onClick={() => setPart1("attack")}
                                    >
                                        Attack
                                    </button>

                                    <button
                                        className={`${styles.part} ${part1 === "affinity" ? styles.selected : ""}`}
                                        onClick={() => setPart1("affinity")}
                                    >
                                        Affinity
                                    </button>
                                </div>
                                <div className={styles.partContainer}>
                                    <button
                                        className={`${styles.part} ${part2 === "attack" ? styles.selected : ""}`}
                                        onClick={() => setPart2("attack")}
                                    >
                                        Attack
                                    </button>

                                    <button
                                        className={`${styles.part} ${part2 === "affinity" ? styles.selected : ""}`}
                                        onClick={() => setPart2("affinity")}
                                    >
                                        Affinity
                                    </button>
                                </div>
                                <div className={styles.partContainer}>
                                    <button
                                        className={`${styles.part} ${part3 === "attack" ? styles.selected : ""}`}
                                        onClick={() => setPart3("attack")}
                                    >
                                        Attack
                                    </button>

                                    <button
                                        className={`${styles.part} ${part3 === "affinity" ? styles.selected : ""}`}
                                        onClick={() => setPart3("affinity")}
                                    >
                                        Affinity
                                    </button>
                                </div>
                            </div>
                            <div className={styles.reinforcementsContainer}>
                                <p>Reinforcements</p>
                                {Array.from({length: 5}).map((item, dropdownIndex) => {
                                    const key = `reinforcement-${dropdownIndex}`;
                                    const isOpen = openDropdown === key;

                                    return (
                                        <div key={dropdownIndex} ref={(el) => {dropdownRefs.current[key] = el;}} className={styles.reinforcement}>
                                            <div className={styles.reinforcementInner} onClick={() => setOpenDropdown((prev) => (prev === key ? null : key))}>
                                                <p>{reinforcements[dropdownIndex].reinforcement}</p>
                                                <ChevronDownIcon className={styles.chevronIcon} />
                                            </div>
                                            {isOpen && (
                                                <div className={styles.reinforcementDropdown}>
                                                    {reinforcementList.map((reinforcement, reinforcementIndex) => (
                                                        <button key={reinforcementIndex} onClick={() => {
                                                            handleReinforcementClick(dropdownIndex, reinforcement);
                                                            setOpenDropdown(null); // close after pick
                                                        }}>
                                                            {reinforcement}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                    {artian === "Gogma Artian" && (
                        <div className={styles.contentGogmaArtian}>
                            <div className={styles.partSelectionContainer}>
                                <p>Part Selection</p>
                                <div className={styles.reinforcement} ref={(el) => {dropdownRefs.current["elementDropdown"] = el;}}>
                                    <div className={styles.reinforcementInner} onClick={() => setOpenDropdown((prev) => (prev === "elementDropdown" ? null : "elementDropdown"))}>
                                        <p>{element.charAt(0).toUpperCase() + element.slice(1)}</p>
                                        <ChevronDownIcon className={styles.chevronIcon} />
                                    </div>
                                    {openDropdown === "elementDropdown" && (
                                        <div className={styles.reinforcementDropdown}>
                                            {elements.map((element, i) => (
                                                <button key={i} onClick={() => handleElementClick(element)}>{element.charAt(0).toUpperCase() + element.slice(1)}</button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.partContainer}>
                                    <button
                                        className={`${styles.part} ${part1 === "attack" ? styles.selected : ""}`}
                                        onClick={() => setPart1("attack")}
                                    >
                                        Attack
                                    </button>

                                    <button
                                        className={`${styles.part} ${part1 === "affinity" ? styles.selected : ""}`}
                                        onClick={() => setPart1("affinity")}
                                    >
                                        Affinity
                                    </button>
                                </div>
                                <div className={styles.partContainer}>
                                    <button
                                        className={`${styles.part} ${part2 === "attack" ? styles.selected : ""}`}
                                        onClick={() => setPart2("attack")}
                                    >
                                        Attack
                                    </button>

                                    <button
                                        className={`${styles.part} ${part2 === "affinity" ? styles.selected : ""}`}
                                        onClick={() => setPart2("affinity")}
                                    >
                                        Affinity
                                    </button>
                                </div>
                                <div className={styles.partContainer}>
                                    <button
                                        className={`${styles.part} ${part3 === "attack" ? styles.selected : ""}`}
                                        onClick={() => setPart3("attack")}
                                    >
                                        Attack
                                    </button>

                                    <button
                                        className={`${styles.part} ${part3 === "affinity" ? styles.selected : ""}`}
                                        onClick={() => setPart3("affinity")}
                                    >
                                        Affinity
                                    </button>
                                </div>
                            </div>
                            <div className={styles.reinforcementsContainer}>
                                <p>Reinforcements</p>
                                {Array.from({length: 5}).map((item, dropdownIndex) => {
                                    const reinforcementKey = `reinforcement-${dropdownIndex}`;
                                    const lvlKey = `reinforcement-${dropdownIndex}-lvl`;
                                    const isReinforcementOpen = openDropdown === reinforcementKey;
                                    const isLvlOpen = openDropdown === lvlKey

                                    return (
                                        <div key={dropdownIndex} className={styles.reinforcementWrapper}>
                                            <div ref={(el) => {dropdownRefs.current[reinforcementKey] = el;}} className={styles.reinforcement}>
                                                <div className={styles.reinforcementInner} onClick={() => setOpenDropdown((prev) => (prev === reinforcementKey ? null : reinforcementKey))}>
                                                    <p>{reinforcements[dropdownIndex].reinforcement}</p>
                                                    <ChevronDownIcon className={styles.chevronIcon} />
                                                </div>
                                                {isReinforcementOpen && (
                                                    <div className={styles.reinforcementDropdown}>
                                                        {reinforcementList.map((reinforcement, reinforcementIndex) => (
                                                            <button key={reinforcementIndex} onClick={() => {
                                                                handleReinforcementClick(dropdownIndex, reinforcement);
                                                                setOpenDropdown(null); // close after pick
                                                            }}>
                                                                {reinforcement}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={styles.lvlWrapper} ref={(el) => {dropdownRefs.current[lvlKey] = el}}>
                                                <div className={styles.lvlContainer} onClick={() => setOpenDropdown((prev) => (prev === lvlKey ? null : lvlKey))}>
                                                    <p>{reinforcements[dropdownIndex].lvl}</p>
                                                    <ChevronDownIcon className={styles.chevronIcon} />
                                                </div>
                                                {isLvlOpen && (
                                                    <div className={styles.reinforcementDropdown}>
                                                        {lvlList.map((lvl, lvlIndex) => (
                                                            <button key={lvlIndex} onClick={() => {
                                                                handleLvlClick(dropdownIndex, lvl);
                                                                setOpenDropdown(null); // close after pick
                                                            }}>
                                                                {lvl}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <button className={styles.backBtn} onClick={() => setShowArtian(false)}><ArrowLeftIcon className={styles.arrowLeftIcon} /></button>
            <button className={styles.addBtn} onClick={() => addArtian()} disabled={!checkReinforcements()}>Add</button>
        </div>
    )
}