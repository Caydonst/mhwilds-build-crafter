import styles from "./page.module.css";
import { ArrowLeftIcon, ChevronDownIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useRef, useState } from "react";
import { Weapon, type WeaponKind } from "@/app/api/types/types";
import { CreateArtian } from "@/app/components/artianCreator/helperFunctions";
import { useGameData } from "@/app/hooks/useGameData";

type Props = {
  showArtian: boolean;
  setShowArtian: React.Dispatch<React.SetStateAction<boolean>>;
  addWeapon: (weapon: Weapon) => void;
};
type PartType = {
  0: string;
  1: string;
  2: string;
};
type ReinforcementType = {
  reinforcement: string;
  lvl: string;
};
type ReinforcementsType = {
  0: ReinforcementType;
  1: ReinforcementType;
  2: ReinforcementType;
  3: ReinforcementType;
  4: ReinforcementType;
};
type BonusesType = {
  setBonus: string;
  groupBonus: string;
};
type Artian = {
  element: string;
  elementDamage: number;
  kind: string;
  type: string;
  raw: number;
  affinity: number;
  parts: PartType;
  reinforcements: ReinforcementsType;
  tarredDevice?: string;
  bonuses?: BonusesType;
};

export default function ArtianCreator({
  showArtian,
  setShowArtian,
  addWeapon,
}: Props) {
  const { skills } = useGameData();
  const [sliderAmount, setSliderAmount] = useState(0);
  const [part1, setPart1] = useState<"attack" | "affinity">("attack");
  const [part2, setPart2] = useState<"attack" | "affinity">("attack");
  const [part3, setPart3] = useState<"attack" | "affinity">("attack");
  const [artian, setArtian] = useState("Artian");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [elementDropdown, setElementDropdown] = useState(false);
  const [element, setElement] = useState("fire");
  const [reinforcements, setReinforcements] = useState<
    Record<number, ReinforcementType>
  >({
    0: { reinforcement: "Select", lvl: "Lvl" },
    1: { reinforcement: "Select", lvl: "Lvl" },
    2: { reinforcement: "Select", lvl: "Lvl" },
    3: { reinforcement: "Select", lvl: "Lvl" },
    4: { reinforcement: "Select", lvl: "Lvl" },
  });
  const [weaponKind, setWeaponKind] = useState("charge-blade");
  const [lvlListMap, setLvlListMap] = useState<Record<string, string[]>>({
    "Attack Boost": ["I", "II", "III", "EX"],
    "Affinity Boost": ["I", "II", "III", "EX"],
    "Sharpness Boost": ["I", "EX"],
    "Element Boost": ["I", "II", "EX"],
    "Ammo Boost": ["I", "EX"],
  });
  const [tarredDevice, setTarredDevice] = useState("Attack Focus");
  const [setBonusSkills, setSetBonusSkills] = useState(
    skills.filter((skill) => skill.kind === "set"),
  );
  const [groupBonusSkills, setGroupBonusSkills] = useState(
    skills.filter((skill) => skill.kind === "group"),
  );
  const [setBonus, setSetBonus] = useState(setBonusSkills[0].name);
  const [groupBonus, setGroupBonus] = useState(groupBonusSkills[0].name);

  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const weaponLabelMap: Record<Exclude<WeaponKind, null>, string> = {
    bow: "Bow",
    "charge-blade": "Charge Blade",
    "dual-blades": "Dual Blades",
    "great-sword": "Great Sword",
    gunlance: "Gunlance",
    hammer: "Hammer",
    "heavy-bowgun": "Heavy Bowgun",
    "hunting-horn": "Hunting Horn",
    "insect-glaive": "Insect Glaive",
    lance: "Lance",
    "light-bowgun": "Light Bowgun",
    "long-sword": "Long Sword",
    "switch-axe": "Switch Axe",
    "sword-shield": "Sword & Shield",
  };

  const artianWeaponStats: Artian = {
    element: element,
    elementDamage: getElementDamage(),
    kind: weaponKind,
    type: artian,
    raw: 190,
    affinity: 5,
    parts: {
      0: part1,
      1: part2,
      2: part3,
    },
    reinforcements: {
      0: {
        reinforcement: reinforcements[0].reinforcement,
        lvl: reinforcements[0].lvl,
      },
      1: {
        reinforcement: reinforcements[1].reinforcement,
        lvl: reinforcements[1].lvl,
      },
      2: {
        reinforcement: reinforcements[2].reinforcement,
        lvl: reinforcements[2].lvl,
      },
      3: {
        reinforcement: reinforcements[3].reinforcement,
        lvl: reinforcements[3].lvl,
      },
      4: {
        reinforcement: reinforcements[4].reinforcement,
        lvl: reinforcements[4].lvl,
      },
    },
    bonuses: {
      setBonus: setBonus,
      groupBonus: groupBonus,
    },
    tarredDevice: tarredDevice,
  };

  function getElementDamage() {
    switch (element) {
      case "fire":
        return 300;
      case "water":
        return 300;
      case "thunder":
        return 300;
      case "ice":
        return 300;
      case "dragon":
        return 300;
      case "poison":
        return 150;
      case "paralysis":
        return 100;
      case "sleep":
        return 100;
      case "blast":
        return 150;
      default:
        return 0;
    }
  }

  const tarredDevices = ["Attack Focus", "Affinity Focus", "Element Focus"];

  const elements = [
    "fire",
    "water",
    "thunder",
    "ice",
    "dragon",
    "poison",
    "paralysis",
    "sleep",
    "blast",
  ];

  function handleElementClick(element: string) {
    setOpenDropdown((prev) =>
      prev === "elementDropdown" ? null : "elementDropdown",
    );
    setElementDropdown(!elementDropdown);
    setElement(element);
  }

  const reinforcementList = [
    "Attack Boost",
    "Affinity Boost",
    "Sharpness Boost",
    "Element Boost",
    "Ammo Boost",
  ];

  function handleReinforcementClick(index: number, reinforcement: string) {
    setReinforcements((prev) => {
      const next = {
        ...prev,
        [index]: { ...prev[index], reinforcement, lvl: "Lvl" },
      };

      checkReinforcementLevels(next); // uses updated state
      return next;
    });
  }

  function handleLvlClick(index: number, lvl: string, reinforcement: string) {
    setReinforcements((prev) => {
      const next = {
        ...prev,
        [index]: { ...prev[index], lvl },
      };

      checkReinforcementLevels(next); // uses updated state
      return next;
    });
  }

  function changeArtian(val: number, type: string) {
    setSliderAmount(val);
    setArtian(type);
  }

  function addArtian() {
    const weapon: Weapon = CreateArtian(artianWeaponStats);
    addWeapon(weapon);
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

  function checkReinforcementLevels(nextReinforcements: typeof reinforcements) {
    const reinforcementsMap: Record<string, number> = {
      "Attack Boost": 0,
      "Affinity Boost": 0,
      "Sharpness Boost": 0,
      "Element Boost": 0,
      "Ammo Boost": 0,
    };

    Object.values(nextReinforcements).forEach((item) => {
      if (item.lvl === "EX") {
        reinforcementsMap[item.reinforcement] += 1;
      }
    });

    Object.entries(reinforcementsMap).forEach(([key, value]) => {
      if (value >= 2) {
        setLvlListMap((prev) => ({
          ...prev,
          [key]: prev[key].filter((l) => l !== "EX"),
        }));
      } else if (value < 2) {
        setLvlListMap((prev) => {
          const existing = prev[key] ?? [];

          // prevent duplicates
          if (existing.includes("EX")) return prev;

          return {
            ...prev,
            [key]: [...existing, "EX"],
          };
        });
      }
    });
  }

  return (
    <div
      className={
        showArtian
          ? `${styles.artianContainerWrapper} ${styles.open}`
          : styles.artianContainerWrapper
      }
    >
      <div className={styles.artianHeader}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => setShowArtian(false)}
        >
          <ChevronLeftIcon />
          <span>Back to Weapons</span>
        </button>

        <div className={styles.artianHeaderTitle}>
          <span>CUSTOM EQUIPMENT</span>

          <h2>Create Artian Weapon</h2>

          <p>Configure your weapon type, parts, reinforcements, and bonuses.</p>
        </div>
      </div>

      <div className={styles.artianContainer}>
        <section className={styles.artianSetupSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h3>Weapon</h3>
              <p>Choose the weapon type and Artian variant.</p>
            </div>
          </div>

          <div className={styles.weaponSelectorWrapper}>
            <div
              className={styles.reinforcement}
              ref={(el) => {
                dropdownRefs.current["weaponSelectorDropdown"] = el;
              }}
            >
              <button
                type="button"
                className={styles.reinforcementInner}
                onClick={() =>
                  setOpenDropdown((prev) =>
                    prev === "weaponSelectorDropdown"
                      ? null
                      : "weaponSelectorDropdown",
                  )
                }
              >
                <div className={styles.reinforcementInnerLeft}>
                  <span
                    className={`${styles.weaponIcon} ${styles[weaponKind]}`}
                  />

                  <span>
                    {weaponLabelMap[weaponKind as Exclude<WeaponKind, null>]}
                  </span>
                </div>

                <ChevronDownIcon
                  className={`${styles.chevronIcon} ${
                    openDropdown === "weaponSelectorDropdown"
                      ? styles.rotated
                      : ""
                  }`}
                />
              </button>

              {openDropdown === "weaponSelectorDropdown" && (
                <div className={styles.reinforcementDropdown}>
                  {Object.entries(weaponLabelMap).map(([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setWeaponKind(key);
                        setOpenDropdown(null);
                      }}
                    >
                      <span className={`${styles.weaponIcon} ${styles[key]}`} />

                      <span>{value}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.artianSelectorWrapper}>
            <div className={styles.artianSelectorContainer}>
              <div
                className={styles.slider}
                style={{
                  transform: `translateX(${sliderAmount}%)`,
                }}
              />

              <button
                type="button"
                className={
                  artian === "Artian"
                    ? `${styles.selectorBtn} ${styles.selected}`
                    : styles.selectorBtn
                }
                onClick={() => changeArtian(0, "Artian")}
              >
                Artian
              </button>

              <button
                type="button"
                className={
                  artian === "Gogma Artian"
                    ? `${styles.selectorBtn} ${styles.selected}`
                    : styles.selectorBtn
                }
                onClick={() => changeArtian(100, "Gogma Artian")}
              >
                Gogma Artian
              </button>
            </div>
          </div>
        </section>

        <section className={styles.artianSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h3>Parts</h3>

              <p>Select an element and configure each Artian part.</p>
            </div>
          </div>

          <div
            className={styles.reinforcement}
            ref={(el) => {
              dropdownRefs.current.elementDropdown = el;
            }}
          >
            <button
              type="button"
              className={styles.reinforcementInner}
              onClick={() =>
                setOpenDropdown((prev) =>
                  prev === "elementDropdown" ? null : "elementDropdown",
                )
              }
            >
              <div className={styles.reinforcementInnerLeft}>
                <span className={`${styles.statsIcon} ${styles[element]}`} />

                <span>
                  {element.charAt(0).toUpperCase() + element.slice(1)}
                </span>
              </div>

              <ChevronDownIcon
                className={`${styles.chevronIcon} ${
                  openDropdown === "elementDropdown" ? styles.rotated : ""
                }`}
              />
            </button>

            {openDropdown === "elementDropdown" && (
              <div className={styles.reinforcementDropdown}>
                {elements.map((thisElement) => (
                  <button
                    key={thisElement}
                    type="button"
                    onClick={() => handleElementClick(thisElement)}
                  >
                    <span
                      className={`${styles.statsIcon} ${styles[thisElement]}`}
                    />

                    <span>
                      {thisElement.charAt(0).toUpperCase() +
                        thisElement.slice(1)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.partsGrid}>
            {[
              {
                number: 1,
                value: part1,
                setter: setPart1,
              },
              {
                number: 2,
                value: part2,
                setter: setPart2,
              },
              {
                number: 3,
                value: part3,
                setter: setPart3,
              },
            ].map((part) => (
              <div key={part.number} className={styles.partRow}>
                <div className={styles.partRowHeader}>Part {part.number}</div>

                <div className={styles.partContainer}>
                  <button
                    type="button"
                    className={`${styles.part} ${
                      part.value === "attack" ? styles.selected : ""
                    }`}
                    onClick={() => part.setter("attack")}
                  >
                    Attack
                  </button>

                  <button
                    type="button"
                    className={`${styles.part} ${
                      part.value === "affinity" ? styles.selected : ""
                    }`}
                    onClick={() => part.setter("affinity")}
                  >
                    Affinity
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {artian === "Gogma Artian" && (
          <>
            <section className={styles.artianSection}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3>Tarred Device</h3>

                  <p>Choose the primary focus of your Gogma Artian weapon.</p>
                </div>
              </div>

              <div
                className={styles.reinforcement}
                ref={(el) => {
                  dropdownRefs.current["tarredDeviceDropdown"] = el;
                }}
              >
                <button
                  type="button"
                  className={styles.reinforcementInner}
                  onClick={() =>
                    setOpenDropdown((prev) =>
                      prev === "tarredDeviceDropdown"
                        ? null
                        : "tarredDeviceDropdown",
                    )
                  }
                >
                  <span>{tarredDevice}</span>

                  <ChevronDownIcon
                    className={`${styles.chevronIcon} ${
                      openDropdown === "tarredDeviceDropdown"
                        ? styles.rotated
                        : ""
                    }`}
                  />
                </button>

                {openDropdown === "tarredDeviceDropdown" && (
                  <div className={styles.reinforcementDropdown}>
                    {tarredDevices.map((device) => (
                      <button
                        key={device}
                        type="button"
                        onClick={() => {
                          setTarredDevice(device);

                          setOpenDropdown(null);
                        }}
                      >
                        {device}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className={styles.artianSection}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3>Bonuses</h3>

                  <p>Select a set bonus and group skill.</p>
                </div>
              </div>

              <div className={styles.bonusSelectors}>
                <div className={styles.bonusField}>
                  <span>Set Bonus</span>

                  <div
                    className={styles.reinforcement}
                    ref={(el) => {
                      dropdownRefs.current["setBonusDropdown"] = el;
                    }}
                  >
                    <button
                      type="button"
                      className={styles.reinforcementInner}
                      onClick={() =>
                        setOpenDropdown((prev) =>
                          prev === "setBonusDropdown"
                            ? null
                            : "setBonusDropdown",
                        )
                      }
                    >
                      <div className={styles.reinforcementInnerLeft}>
                        <span
                          className={`${styles.skillIcon} ${styles.setBonusSkill}`}
                        />

                        <span>{setBonus}</span>
                      </div>

                      <ChevronDownIcon className={styles.chevronIcon} />
                    </button>

                    {openDropdown === "setBonusDropdown" && (
                      <div className={styles.reinforcementDropdown}>
                        {setBonusSkills.map((skill) => (
                          <button
                            key={skill.id}
                            type="button"
                            onClick={() => {
                              setSetBonus(skill.name);

                              setOpenDropdown(null);
                            }}
                          >
                            <span
                              className={`${styles.skillIcon} ${styles.setBonusSkill}`}
                            />

                            {skill.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.bonusField}>
                  <span>Group Skill</span>

                  <div
                    className={styles.reinforcement}
                    ref={(el) => {
                      dropdownRefs.current["setGroupDropdown"] = el;
                    }}
                  >
                    <button
                      type="button"
                      className={styles.reinforcementInner}
                      onClick={() =>
                        setOpenDropdown((prev) =>
                          prev === "setGroupDropdown"
                            ? null
                            : "setGroupDropdown",
                        )
                      }
                    >
                      <div className={styles.reinforcementInnerLeft}>
                        <span
                          className={`${styles.skillIcon} ${styles.groupSkill}`}
                        />

                        <span>{groupBonus}</span>
                      </div>

                      <ChevronDownIcon className={styles.chevronIcon} />
                    </button>

                    {openDropdown === "setGroupDropdown" && (
                      <div className={styles.reinforcementDropdown}>
                        {groupBonusSkills.map((skill) => (
                          <button
                            key={skill.id}
                            type="button"
                            onClick={() => {
                              setGroupBonus(skill.name);

                              setOpenDropdown(null);
                            }}
                          >
                            <span
                              className={`${styles.skillIcon} ${styles.groupSkill}`}
                            />

                            {skill.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        <section className={styles.artianSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h3>Reinforcements</h3>

              <p>Configure all five reinforcement slots.</p>
            </div>

            <span className={styles.sectionCount}>
              {
                Object.values(reinforcements).filter(
                  (item) => item.reinforcement !== "Select",
                ).length
              }
              /5
            </span>
          </div>

          <div className={styles.reinforcementList}>
            {Array.from({
              length: 5,
            }).map((_, dropdownIndex) => {
              const reinforcementKey = `reinforcement-${dropdownIndex}`;

              const lvlKey = `reinforcement-${dropdownIndex}-lvl`;

              const isReinforcementOpen = openDropdown === reinforcementKey;

              const isLvlOpen = openDropdown === lvlKey;

              return (
                <div key={dropdownIndex} className={styles.reinforcementRow}>
                  <span className={styles.reinforcementNumber}>
                    {dropdownIndex + 1}
                  </span>

                  <div
                    ref={(el) => {
                      dropdownRefs.current[reinforcementKey] = el;
                    }}
                    className={styles.reinforcement}
                  >
                    <button
                      type="button"
                      className={styles.reinforcementInner}
                      onClick={() =>
                        setOpenDropdown((prev) =>
                          prev === reinforcementKey ? null : reinforcementKey,
                        )
                      }
                    >
                      <span>{reinforcements[dropdownIndex].reinforcement}</span>

                      <ChevronDownIcon
                        className={`${styles.chevronIcon} ${
                          isReinforcementOpen ? styles.rotated : ""
                        }`}
                      />
                    </button>

                    {isReinforcementOpen && (
                      <div className={styles.reinforcementDropdown}>
                        {reinforcementList.map((reinforcement) => (
                          <button
                            key={reinforcement}
                            type="button"
                            onClick={() => {
                              handleReinforcementClick(
                                dropdownIndex,
                                reinforcement,
                              );

                              setOpenDropdown(null);
                            }}
                          >
                            {reinforcement}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {artian === "Gogma Artian" &&
                    reinforcements[dropdownIndex].reinforcement !==
                      "Select" && (
                      <div
                        ref={(el) => {
                          dropdownRefs.current[lvlKey] = el;
                        }}
                        className={styles.lvlWrapper}
                      >
                        <button
                          type="button"
                          className={styles.lvlContainer}
                          onClick={() =>
                            setOpenDropdown((prev) =>
                              prev === lvlKey ? null : lvlKey,
                            )
                          }
                        >
                          <span>{reinforcements[dropdownIndex].lvl}</span>

                          <ChevronDownIcon
                            className={`${styles.chevronIcon} ${
                              isLvlOpen ? styles.rotated : ""
                            }`}
                          />
                        </button>

                        {isLvlOpen && (
                          <div
                            className={`${styles.reinforcementDropdown} ${styles.levelDropdown}`}
                          >
                            {lvlListMap[
                              reinforcements[dropdownIndex].reinforcement
                            ]?.map((lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                className={
                                  reinforcements[dropdownIndex].lvl === lvl
                                    ? styles.activeLevel
                                    : ""
                                }
                                onClick={() => {
                                  handleLvlClick(
                                    dropdownIndex,
                                    lvl,
                                    reinforcements[dropdownIndex].reinforcement,
                                  );

                                  setOpenDropdown(null);
                                }}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className={styles.artianFooter}>
        <button
          type="button"
          className={styles.addBtn}
          onClick={addArtian}
          disabled={!checkReinforcements()}
        >
          Equip Weapon
        </button>
      </div>
    </div>
  );
}
