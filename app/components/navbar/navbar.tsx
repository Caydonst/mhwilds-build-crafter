import styles from "./page.module.css"

export default function Navbar() {
    return (
        <div className={styles.navbarContainer}>
            <div className={styles.navButtons}>
                <button className={styles.builderBtn}>
                    Builder
                </button>
                <button className={styles.generatorBtn}>Generator</button>
                <div className={styles.builderHoverContainer}>
                    <div className={styles.inner}></div>
                </div>
                <div className={styles.generatorHoverContainer}>
                    <div className={styles.inner}></div>
                </div>
            </div>
        </div>
    )
}