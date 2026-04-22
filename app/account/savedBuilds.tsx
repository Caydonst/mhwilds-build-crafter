import styles from "./page.module.css"
import {User} from "@supabase/auth-js";
import React, {useEffect, useState} from "react";
import {TrashIcon, PencilSquareIcon, PlusIcon} from "@heroicons/react/24/outline"
import type {Armor, BuilderBuild, CharmRank, CustomCharm, Weapon, SavedBuild} from "@/app/api/types/types";
import BuildCard from "./buildCard"
import Link from "next/link";

type Props = {
    savedBuilds: SavedBuild[];
    setSavedBuilds: React.Dispatch<React.SetStateAction<SavedBuild[]>>;
    setDeletePopup: React.Dispatch<React.SetStateAction<boolean>>;
    setToDelete: React.Dispatch<React.SetStateAction<number | null>>;
}

export default function SavedBuilds({ savedBuilds, setSavedBuilds, setDeletePopup, setToDelete }: Props) {

    return (
        <div className={styles.contentContainer}>
            <div className={styles.contentHeader}>
                <h2>Saved Builds</h2>
                <p>Manage your saved builds</p>
            </div>
            <div className={styles.buildsCounterContainer}>
                <p>{savedBuilds.length} / 20 Builds</p>
            </div>
            <div className={styles.savedBuildsContainer}>
                {savedBuilds.length > 0 ? (
                    savedBuilds.map((savedBuild, i) => (
                        <BuildCard key={i} build={savedBuild} setSavedBuilds={setSavedBuilds} setDeletePopup={setDeletePopup} setToDelete={setToDelete} />
                    ))
                ) : (
                    <p className={styles.noBuilds}>No saved builds.</p>
                )}
                <Link className={styles.newBuildBtn} href={"/builder"}><PlusIcon /></Link>
            </div>
        </div>
    )
}