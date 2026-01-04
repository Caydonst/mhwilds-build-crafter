import styles from "./page.module.css"
import React from "react";

type props = {
    openConfirmContainer: boolean
    setOpenConfirmContainer: React.Dispatch<React.SetStateAction<boolean>>
    closeBuilder: () => void
}

export default function CancelConfirm({ openConfirmContainer, setOpenConfirmContainer, closeBuilder }: props) {
    return (
        <div className={`${styles.cancelConfirmWrapper} ${openConfirmContainer ? styles.open : ""}`}>
            <div className={styles.cancelConfirmContainer}>
                <p>Cancel build?</p>
                <div className={styles.btnContainer}>
                    <button className={styles.noBtn} onClick={() => setOpenConfirmContainer(false)}>No</button>
                    <button className={styles.yesBtn} onClick={() => closeBuilder()}>Yes</button>
                </div>
            </div>
        </div>
    )
}