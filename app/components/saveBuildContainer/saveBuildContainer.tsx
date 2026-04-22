import styles from "./page.module.css"
import {XMarkIcon} from "@heroicons/react/24/solid"
import React from "react";
import {checkName} from "./helperFunctions"

type Props = {
    saveBuildOpen: boolean;
    setSaveBuildOpen: React.Dispatch<React.SetStateAction<boolean>>;
    buildName: string;
    setBuildName: React.Dispatch<React.SetStateAction<string>>;
    saveBuild: () => void;
    saveBuildLoading: boolean;
}

export default function SaveBuildContainer({ saveBuildOpen, setSaveBuildOpen, buildName, setBuildName, saveBuild, saveBuildLoading }: Props) {

    function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;

        if (value.length <= 30) {
            setBuildName(value);
        }
    }

    return (
        <div className={saveBuildOpen ? `${styles.saveBuildWrapper} ${styles.open}` : styles.saveBuildWrapper}>
            <div className={styles.saveBuildContainer}>
                <h3>Build Name</h3>
                <div className={styles.buildInfoContainer}>
                    <div className={styles.buildNameContainer}>
                        <input type={"text"} placeholder={"Build Name"} value={buildName} onChange={(e) => handleNameChange(e)} />
                        <button className={styles.saveBtn} disabled={!checkName(buildName) || saveBuildLoading} onClick={() => {
                            saveBuild()
                        }}>
                            {saveBuildLoading ? (
                                <div className={styles.spinnerContainer}>
                                    <span className={styles.spinnerWrapper}>
                                        <span className={styles.spinner}></span>
                                    </span>
                                </div>
                            ) : (
                                <p>Save</p>
                            )}
                        </button>
                    </div>
                </div>
                <button className={styles.closeBtn} onClick={() => setSaveBuildOpen(false)}><XMarkIcon /></button>
            </div>
        </div>
    )
}