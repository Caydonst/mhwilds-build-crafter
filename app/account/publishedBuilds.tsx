import styles from "./page.module.css"
import {User} from "@supabase/auth-js";

type Props = {
    user: User;
}

export default function PublishedBuilds({ user }: Props) {
    return (
        <div className={styles.contentContainer}>
            <div className={styles.contentHeader}>
                <h2>Published Builds</h2>
                <p>Manage your published builds</p>
            </div>
            <div className={styles.comingSoonContainer}>
                <div className={styles.comingSoon}>Coming Soon</div>
            </div>

        </div>
    )
}