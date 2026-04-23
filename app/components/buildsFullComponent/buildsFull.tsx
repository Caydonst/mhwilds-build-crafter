import styles from "./page.module.css"
import {XMarkIcon} from "@heroicons/react/24/solid"
import {UserCircleIcon} from "@heroicons/react/24/outline"
import React from "react";
import Link from "next/link";

type Props = {
    buildsFullOpen: boolean;
    setBuildsFullOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function BuildsFull({buildsFullOpen, setBuildsFullOpen}: Props) {
    return (
        <div className={buildsFullOpen ? `${styles.buildsFullWrapper} ${styles.open}` : styles.buildsFullWrapper}>
            <div className={styles.buildsFullContainer}>
                <p>Build limit reached.</p>
                <Link href={"/account"}><UserCircleIcon />Account</Link>
                <button className={styles.closeBtn} onClick={() => setBuildsFullOpen(false)}><XMarkIcon /></button>
            </div>
        </div>
    )
}