"use client";

import styles from "./page.module.css";
import { XMarkIcon } from "@heroicons/react/24/solid";
import React from "react";
import { checkName } from "./helperFunctions";

type Props = {
    saveBuildOpen: boolean;
    setSaveBuildOpen: React.Dispatch<React.SetStateAction<boolean>>;
    buildName: string;
    setBuildName: React.Dispatch<React.SetStateAction<string>>;
    saveBuild: () => void;
    saveBuildLoading: boolean;
};

export default function SaveBuildContainer({
    saveBuildOpen,
    setSaveBuildOpen,
    buildName,
    setBuildName,
    saveBuild,
    saveBuildLoading,
}: Props) {
    function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;

        if (value.length <= 30) {
            setBuildName(value);
        }
    }

    return (
        <div
            className={
                saveBuildOpen
                    ? `${styles.saveBuildWrapper} ${styles.open}`
                    : styles.saveBuildWrapper
            }
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    setSaveBuildOpen(false);
                }
            }}
        >
            <div className={styles.saveBuildContainer}>
                <button
                    type="button"
                    className={styles.closeBtn}
                    onClick={() => setSaveBuildOpen(false)}
                    aria-label="Close save build dialog"
                >
                    <XMarkIcon />
                </button>

                <div className={styles.header}>
                    <span>SAVE BUILD</span>
                    <h3>Name your build</h3>
                    <p>
                        Give your build a name so you can easily find it later.
                    </p>
                </div>

                <div className={styles.buildInfoContainer}>
                    <div className={styles.buildNameContainer}>
                        <div className={styles.inputHeader}>
                            <label htmlFor="build-name">
                                Build name
                            </label>

                            <span>{buildName.length}/30</span>
                        </div>

                        <input
                            id="build-name"
                            type="text"
                            placeholder="Enter a build name..."
                            value={buildName}
                            onChange={handleNameChange}
                            maxLength={30}
                            autoComplete="off"
                        />

                        <button
                            type="button"
                            className={styles.saveBtn}
                            disabled={
                                !checkName(buildName) ||
                                saveBuildLoading
                            }
                            onClick={saveBuild}
                        >
                            {saveBuildLoading ? (
                                <span className={styles.spinner} />
                            ) : (
                                <span>Save Build</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}