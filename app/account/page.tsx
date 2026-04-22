"use client"
import styles from "./page.module.css"
import React, {useEffect, useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {User} from "@supabase/auth-js";
import AuthContainer from "@/app/components/authContainer/authContainer";
import {UserCircleIcon} from "@heroicons/react/24/outline";
import {GlobeAsiaAustraliaIcon, InboxArrowDownIcon, XMarkIcon} from "@heroicons/react/24/solid";
import {signInWithEmail, getData, deleteBuild} from "@/lib/actions";
import Account from "@/app/account/account";
import SavedBuilds from "@/app/account/savedBuilds";
import PublishedBuilds from "@/app/account/publishedBuilds";
import { SavedBuild } from "@/app/api/types/types"

export default function AccountPage() {
    const [user, setUser] = useState<User | null>(null);
    const [email, setEmail] = useState("");
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [selected, setSelected] = useState<string>("Account");
    const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>([]);
    const [deletePopup, setDeletePopup] = useState<boolean>(false);
    const [toDelete, setToDelete] = useState<number | null>(null);
    const [logoutPopup, setLogoutPopup] = useState<boolean>(false);

    async function signIn() {
        try {
            await signInWithEmail(email);
        } catch (error) {
            alert(error);
        }
    }

    async function googleLogin() {
        const supabase = createClient();

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.href
            },
        });

        if (error) {
            console.error(error.message);
        }
    }

    async function logout() {
        const supabase = createClient();
        await supabase.auth.signOut();
    }

    /*
    useEffect(() => {
        const supabase = createClient();

        const { data: listener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === "SIGNED_IN") {
                    if (session && session.user) {
                        console.log("User:", session.user);
                        setUser(session.user);
                    }
                }
                if (event === "SIGNED_OUT") {
                    setUser(null);
                }
            }
        );

        return () => listener.subscription.unsubscribe();
    }, []);

     */

    async function removeBuild(id: number | null) {
        deleteBuild(id);
        setSavedBuilds(prev => prev.filter(build => build.id !== id));
    }

    useEffect(() => {
        const supabase = createClient();
        let mounted = true;

        async function checkUser() {
            const { data, error } = await supabase.auth.getUser();

            if (!mounted) return;

            if (error) {
                setUser(null);
            } else {
                setUser(data.user);
            }

            setLoading(false);
        }

        checkUser();

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (!mounted) return;
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => {
            mounted = false;
            listener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!user) {
            return;
        }

        async function getBuilds() {
            const userData = await getData(user);
            console.log("User data: ", userData);

            if (userData) {
                setSavedBuilds(userData);
            }
        }

        getBuilds();
    }, [user]);

    useEffect(() => {
        if (deletePopup || logoutPopup) {
            document.body.classList.add("no-scroll");
        } else {
            document.body.classList.remove("no-scroll");
        }
    }, [deletePopup, logoutPopup]);

    return (
        <div className={styles.profilePageContainer}>
            {loading ? (
                <div className={styles.spinnerContainer}>
                    <span className={styles.spinnerWrapper}>
                        <span className={styles.spinner}></span>
                    </span>
                </div>
            ) : (
                user !== null ? (
                    <div className={styles.profilePageInner}>
                        <div className={styles.profileNavContainer}>
                            <button className={selected === "Account" ? `${styles.navButton} ${styles.selected}` : styles.navButton} onClick={() => setSelected("Account")}><UserCircleIcon className={styles.icon} />Account</button>
                            <button className={selected === "Saved" ? `${styles.navButton} ${styles.selected}` : styles.navButton} onClick={() => setSelected("Saved")}><InboxArrowDownIcon className={styles.icon} />Saved</button>
                            <button className={selected === "Published" ? `${styles.navButton} ${styles.selected}` : styles.navButton} onClick={() => setSelected("Published")}><GlobeAsiaAustraliaIcon className={styles.icon} />Published <div>Coming Soon</div></button>
                        </div>
                        <hr />
                        <div className={styles.profileContentContainer}>
                            {selected === "Account" && (
                                <Account user={user} setLogoutPopup={setLogoutPopup} />
                            )}
                            {selected === "Saved" && (
                                <SavedBuilds savedBuilds={savedBuilds} setSavedBuilds={setSavedBuilds} setDeletePopup={setDeletePopup} setToDelete={setToDelete} />
                            )}
                            {selected === "Published" && (
                                <PublishedBuilds user={user} />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={styles.authContainer}>
                        <p>Sign in to access your account</p>
                        <button onClick={() => setOpen(true)}>Sign in</button>
                    </div>
                )
            )}
            <AuthContainer open={open} setOpen={setOpen} />
            <div className={deletePopup ? `${styles.deleteBuildPopupWrapper} ${styles.open}` : styles.deleteBuildPopupWrapper}>
                <div className={styles.deleteBuildPopup}>
                    <h3>Delete?</h3>
                    <p>Are you sure you want to delete this build?</p>
                    <div className={styles.optionsContainer}>
                        <button className={styles.noBtn} onClick={() => setDeletePopup(false)}>No</button>
                        <button className={styles.yesBtn} onClick={() => {
                            removeBuild(toDelete)
                            setDeletePopup(false)
                        }}>Yes</button>
                    </div>
                    <button className={styles.closeBtn} onClick={() => setDeletePopup(false)}><XMarkIcon /></button>
                </div>
            </div>

            <div className={logoutPopup ? `${styles.deleteBuildPopupWrapper} ${styles.open}` : styles.deleteBuildPopupWrapper}>
                <div className={styles.deleteBuildPopup}>
                    <h3>Log out?</h3>
                    <p>Are you sure you want to log out of the platform?</p>
                    <div className={styles.optionsContainer}>
                        <button className={styles.noBtn} onClick={() => setLogoutPopup(false)}>No</button>
                        <button className={styles.yesBtn} onClick={() => {
                            logout()
                            setLogoutPopup(false)
                        }}>Yes</button>
                    </div>
                    <button className={styles.closeBtn} onClick={() => setLogoutPopup(false)}><XMarkIcon /></button>
                </div>
            </div>
        </div>
    )
}