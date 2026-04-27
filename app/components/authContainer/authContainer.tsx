"use client"
import styles from "./page.module.css"
import {signInWithEmail} from "@/lib/actions";
import {createClient} from "@/lib/supabase/client";
import React, {useEffect, useState} from "react";
import {XMarkIcon} from "@heroicons/react/24/solid"
import Logo from "@/app/assets/logo3.png"

type Props = {
    open: boolean | null;
    setOpen: React.Dispatch<React.SetStateAction<boolean>> | null;
}


export default function AuthContainer({open, setOpen}: Props) {
    const [email, setEmail] = useState("");

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

    useEffect(() => {
        if (open) {
            document.body.classList.add("no-scroll");
        } else {
            document.body.classList.remove("no-scroll");
        }
    }, [open]);

    function closeAuthContainer() {
        if (setOpen) setOpen(false);
    }

    return (
        <div className={open ? `${styles.authContainerWrapper} ${styles.open}` : `${styles.authContainerWrapper}`}>
            <div className={open ? `${styles.authContainer} ${styles.open}` : `${styles.authContainer}`}>
                <div className={styles.authHeader}>
                    <div className={styles.logoContainer}>
                        <img src={Logo.src} />
                        <h1>Builder</h1>
                    </div>
                    <h2>Sign in</h2>
                    <p>Sign in or create an account</p>
                </div>
                <button className={styles.googleBtn} onClick={() => googleLogin()}>
                    <img src={"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/40px-Google_%22G%22_logo.svg.png"} />
                    Continue with Google
                </button>
                {/*
                <div className={styles.dividerContainer}>
                    <hr />
                    <p>or</p>
                    <hr />
                </div>
                <div className={styles.emailLoginContainer}>
                    <input
                        placeholder="Email address"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                signIn().catch((err) => alert(err));
                            }
                        }}
                    />
                    <button onClick={() => signIn()}>Continue</button>
                </div>
                */}
                <button className={styles.closeBtn} onClick={() => closeAuthContainer()}><XMarkIcon /></button>
            </div>
        </div>
    )
}