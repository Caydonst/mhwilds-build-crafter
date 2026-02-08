import styles from "./page.module.css"
import {XMarkIcon} from "@heroicons/react/24/outline";
import Decoration from "./decoration";
import type {Decoration as DecoType, BuilderBuild, BuildDecorations} from "@/app/api/types/types"
import React, {useMemo, useState} from "react";
import {useGameData} from "@/app/hooks/useGameData";

type ArmorSlotKey = "weapon" | "head" | "chest" | "arms" | "waist" | "legs" | "charm";

interface Props {
    decoSlotIndex: number;
    slotLevel: number;
    kind: string;
    decoSelectorOpen: boolean;
    setDecoSelectorOpen: React.Dispatch<React.SetStateAction<boolean>>;
    build: BuilderBuild;
    setBuild: React.Dispatch<React.SetStateAction<BuilderBuild>>;
    type: ArmorSlotKey;
}

export default function DecoSelector({ decoSlotIndex, slotLevel, kind, decoSelectorOpen, setDecoSelectorOpen, build, setBuild, type }: Props) {
    const { decorations, isLoading, error } = useGameData();
    const [searchQuery, setSearchQuery] = useState<string>("");

    const DEFAULT_DECOS: BuildDecorations = {
        weapon: [],
        head: [],
        chest: [],
        arms: [],
        waist: [],
        legs: [],
    };

    const thisKind = useMemo(() => {
        return kind === "weapon" ? "weapon" : "armor"
    }, [kind])

    const filteredDecos = useMemo(() => {
        const targetKind = kind === "weapon" ? "weapon" : "armor"; // or just kind, if kind is already "weapon"|"armor"

        return decorations
            .filter((deco) => deco.kind === targetKind && deco.slot <= slotLevel)
            .sort((a, b) => b.slot - a.slot);
    }, [decorations, kind, slotLevel]);

    function addDecoration(decoration: DecoType) {
        if (!decoration) return;

        setBuild((prev) => {
            const decos = prev.decorations ?? DEFAULT_DECOS;

            if (type === "charm") return prev;

            const nextSlot = [...decos[type]]; // copy array
            nextSlot[decoSlotIndex] = { slotLevel: decoration.slot, decoration }; // set at index

            return {
                ...prev,
                decorations: {
                    ...decos,
                    [type]: nextSlot,
                },
            };
        });
        setDecoSelectorOpen(false);
    }

    function updateSearchQuery(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchQuery(event.target.value);
    }

    const searchedDecos = React.useMemo(() => {
        const query = searchQuery.toLowerCase();

        return (filteredDecos ?? []).filter(piece =>
            piece.name.toLowerCase().includes(query)
        );
    }, [searchQuery, filteredDecos]);

    return (
        <div className={decoSelectorOpen ? `${styles.gearSelectorContainer} ${styles.open}` : styles.gearSelectorContainer}>
            <div className={styles.gearSelectorInner}>
                <div className={styles.info}>
                    <div className={styles.header}>
                        <p>Select Decoration</p>
                        <button onClick={() => setDecoSelectorOpen(false)}><XMarkIcon /></button>
                    </div>
                    <div className={styles.searchContainer}>
                        <p>{thisKind.charAt(0).toUpperCase() + thisKind.slice(1)} Decoration</p>
                        <input type={"text"} placeholder={"Search"} value={searchQuery} onChange={(e) => updateSearchQuery(e)} />
                    </div>
                </div>
                <div className={styles.main}>
                    <div className={styles.mainInner}>
                        {searchedDecos && searchedDecos.map((deco: DecoType, i) => (
                            <div key={i} className={styles.decoContainer}>
                                <Decoration deco={deco} addDecoration={addDecoration} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}