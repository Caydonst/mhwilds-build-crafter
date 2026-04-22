"use client"
import styles from "./page.module.css"
import Logo from "@/app/assets/logo3.png"
import { ChevronDownIcon, XMarkIcon, Bars3Icon, ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/solid"
import { UserCircleIcon } from "@heroicons/react/24/outline"
import React, {useEffect, useState} from "react";
import {signInWithEmail, signInWithGoogle, testSaveBuild} from "@/lib/actions"
import { createClient } from "@/lib/supabase/client";
import {User} from "@supabase/auth-js";
import AuthContainer from "@/app/components/authContainer/authContainer";
import SideNav from "@/app/components/sideNav/sideNav";
import Link from "next/link";

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [sideNavOpen, setSideNavOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [openUserOptions, setOpenUserOptions] = useState<boolean>(false);
    const [logoutPopup, setLogoutPopup] = useState<boolean>(false);
    const [avatarFailed, setAvatarFailed] = useState(false);

    const avatarUrl = user?.user_metadata?.avatar_url;
    const fullName = user?.user_metadata?.full_name;


    async function logout() {
        const supabase = createClient();
        await supabase.auth.signOut();

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
        }

        checkUser();

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (!mounted) return;
                setUser(session?.user ?? null);
            }
        );

        return () => {
            mounted = false;
            listener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (sideNavOpen || logoutPopup || openUserOptions) {
            document.body.classList.add("no-scroll");
        } else {
            document.body.classList.remove("no-scroll");
        }
    }, [sideNavOpen, logoutPopup, openUserOptions])

    return (
        <div className={styles.navbarContainer}>
            <div className={styles.navInner}>
                <div className={styles.navLeft}>
                    <Link className={styles.logoContainer} href={"/"}>
                        <img src={Logo.src} />
                        <h1>Builder</h1>
                    </Link>
                    <div className={styles.navButtons}>
                        <Link href={"/"}>Home</Link>
                        <Link className={styles.builderBtn} href={"/builder"}>
                            Builder
                        </Link>
                    </div>
                    <hr className={styles.navbarBreak} />
                    <a className={styles.discordBtn} href={"https://discord.gg/SeWbg3xqXP"} target="_blank">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M524.5 133.8C524.3 133.5 524.1 133.2 523.7 133.1C485.6 115.6 445.3 103.1 404 96C403.6 95.9 403.2 96 402.9 96.1C402.6 96.2 402.3 96.5 402.1 96.9C396.6 106.8 391.6 117.1 387.2 127.5C342.6 120.7 297.3 120.7 252.8 127.5C248.3 117 243.3 106.8 237.7 96.9C237.5 96.6 237.2 96.3 236.9 96.1C236.6 95.9 236.2 95.9 235.8 95.9C194.5 103 154.2 115.5 116.1 133C115.8 133.1 115.5 133.4 115.3 133.7C39.1 247.5 18.2 358.6 28.4 468.2C28.4 468.5 28.5 468.7 28.6 469C28.7 469.3 28.9 469.4 29.1 469.6C73.5 502.5 123.1 527.6 175.9 543.8C176.3 543.9 176.7 543.9 177 543.8C177.3 543.7 177.7 543.4 177.9 543.1C189.2 527.7 199.3 511.3 207.9 494.3C208 494.1 208.1 493.8 208.1 493.5C208.1 493.2 208.1 493 208 492.7C207.9 492.4 207.8 492.2 207.6 492.1C207.4 492 207.2 491.8 206.9 491.7C191.1 485.6 175.7 478.3 161 469.8C160.7 469.6 160.5 469.4 160.3 469.2C160.1 469 160 468.6 160 468.3C160 468 160 467.7 160.2 467.4C160.4 467.1 160.5 466.9 160.8 466.7C163.9 464.4 167 462 169.9 459.6C170.2 459.4 170.5 459.2 170.8 459.2C171.1 459.2 171.5 459.2 171.8 459.3C268 503.2 372.2 503.2 467.3 459.3C467.6 459.2 468 459.1 468.3 459.1C468.6 459.1 469 459.3 469.2 459.5C472.1 461.9 475.2 464.4 478.3 466.7C478.5 466.9 478.7 467.1 478.9 467.4C479.1 467.7 479.1 468 479.1 468.3C479.1 468.6 479 468.9 478.8 469.2C478.6 469.5 478.4 469.7 478.2 469.8C463.5 478.4 448.2 485.7 432.3 491.6C432.1 491.7 431.8 491.8 431.6 492C431.4 492.2 431.3 492.4 431.2 492.7C431.1 493 431.1 493.2 431.1 493.5C431.1 493.8 431.2 494 431.3 494.3C440.1 511.3 450.1 527.6 461.3 543.1C461.5 543.4 461.9 543.7 462.2 543.8C462.5 543.9 463 543.9 463.3 543.8C516.2 527.6 565.9 502.5 610.4 469.6C610.6 469.4 610.8 469.2 610.9 469C611 468.8 611.1 468.5 611.1 468.2C623.4 341.4 590.6 231.3 524.2 133.7zM222.5 401.5C193.5 401.5 169.7 374.9 169.7 342.3C169.7 309.7 193.1 283.1 222.5 283.1C252.2 283.1 275.8 309.9 275.3 342.3C275.3 375 251.9 401.5 222.5 401.5zM417.9 401.5C388.9 401.5 365.1 374.9 365.1 342.3C365.1 309.7 388.5 283.1 417.9 283.1C447.6 283.1 471.2 309.9 470.7 342.3C470.7 375 447.5 401.5 417.9 401.5z"/></svg>
                    </a>
                </div>
                <div className={styles.navRight}>
                    <div className={styles.userBtnWrapper}>
                        {user && user.user_metadata?.avatar_url ? (
                            <>
                                <button className={styles.userBtn}>
                                    <ChevronDownIcon className={styles.userBtnIcon} />
                                    <p>{user.user_metadata.full_name}</p>
                                    <span className={styles.userImgContainer}>
                                    {avatarUrl && !avatarFailed ? (
                                        <img
                                            src={avatarUrl}
                                            alt={fullName ? `${fullName}'s avatar` : "User avatar"}
                                            onError={() => setAvatarFailed(true)}
                                        />
                                        ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M240 192C240 147.8 275.8 112 320 112C364.2 112 400 147.8 400 192C400 236.2 364.2 272 320 272C275.8 272 240 236.2 240 192zM448 192C448 121.3 390.7 64 320 64C249.3 64 192 121.3 192 192C192 262.7 249.3 320 320 320C390.7 320 448 262.7 448 192zM144 544C144 473.3 201.3 416 272 416L368 416C438.7 416 496 473.3 496 544L496 552C496 565.3 506.7 576 520 576C533.3 576 544 565.3 544 552L544 544C544 446.8 465.2 368 368 368L272 368C174.8 368 96 446.8 96 544L96 552C96 565.3 106.7 576 120 576C133.3 576 144 565.3 144 552L144 544z"/></svg>
                                    )}
                                </span>
                                </button>
                                <div className={styles.userHoverContainer}>
                                    <div className={styles.hoverContainerTop}>
                                        <Link className={styles.profileBtn} href={"/account"}><UserCircleIcon className={styles.icon} />Account</Link>
                                    </div>
                                    <hr />
                                    <div className={styles.logoutBtnContainer}>
                                        <button className={styles.logoutBtn} onClick={() => setLogoutPopup(true)}><ArrowRightStartOnRectangleIcon className={styles.icon} />Log out</button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <button className={styles.accountBtn} onClick={() => setOpen(prev => !prev)}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M240 192C240 147.8 275.8 112 320 112C364.2 112 400 147.8 400 192C400 236.2 364.2 272 320 272C275.8 272 240 236.2 240 192zM448 192C448 121.3 390.7 64 320 64C249.3 64 192 121.3 192 192C192 262.7 249.3 320 320 320C390.7 320 448 262.7 448 192zM144 544C144 473.3 201.3 416 272 416L368 416C438.7 416 496 473.3 496 544L496 552C496 565.3 506.7 576 520 576C533.3 576 544 565.3 544 552L544 544C544 446.8 465.2 368 368 368L272 368C174.8 368 96 446.8 96 544L96 552C96 565.3 106.7 576 120 576C133.3 576 144 565.3 144 552L144 544z"/></svg>
                                Account
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className={styles.navInnerMobile}>
                <div className={styles.navRight}>
                    <button className={styles.sideNavBtn} onClick={() => setSideNavOpen(true)}><Bars3Icon /></button>
                </div>
                <Link className={styles.logoContainer} href={"/"}>
                    <img src={Logo.src} />
                    <h1>Builder</h1>
                </Link>
                <div className={styles.navRight}>
                    {user && user.user_metadata?.avatar_url ? (
                        <>
                            <button className={styles.userBtnMobile} onClick={() => setOpenUserOptions(true)}>
                                <span className={styles.userImgContainerMobile}>
                                    {avatarUrl && !avatarFailed ? (
                                        <img
                                            src={avatarUrl}
                                            alt={fullName ? `${fullName}'s avatar` : "User avatar"}
                                            onError={() => setAvatarFailed(true)}
                                        />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M240 192C240 147.8 275.8 112 320 112C364.2 112 400 147.8 400 192C400 236.2 364.2 272 320 272C275.8 272 240 236.2 240 192zM448 192C448 121.3 390.7 64 320 64C249.3 64 192 121.3 192 192C192 262.7 249.3 320 320 320C390.7 320 448 262.7 448 192zM144 544C144 473.3 201.3 416 272 416L368 416C438.7 416 496 473.3 496 544L496 552C496 565.3 506.7 576 520 576C533.3 576 544 565.3 544 552L544 544C544 446.8 465.2 368 368 368L272 368C174.8 368 96 446.8 96 544L96 552C96 565.3 106.7 576 120 576C133.3 576 144 565.3 144 552L144 544z"/></svg>
                                    )}
                                </span>
                            </button>
                            <div className={openUserOptions ? `${styles.userOptionsContainerMobileWrapper} ${styles.open}` : styles.userOptionsContainerMobileWrapper} onClick={() => setOpenUserOptions(false)}>
                                <div className={openUserOptions ? `${styles.userOptionsContainerMobile} ${styles.open}` : styles.userOptionsContainerMobile} onClick={(e) => e.stopPropagation()}>
                                    <button className={styles.closeUserOptionsBtn} onClick={() => setOpenUserOptions(false)}><ChevronDownIcon /></button>
                                    <div className={styles.buttonsContainer}>
                                        <Link className={styles.profileBtn} href={"/account"} onClick={() => {
                                            setOpenUserOptions(false);
                                        }}><UserCircleIcon className={styles.icon} />Account</Link>
                                        <button className={styles.logoutBtn} onClick={() => {
                                            setLogoutPopup(true)
                                        }}><ArrowRightStartOnRectangleIcon className={styles.icon} />Log out</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <button className={styles.accountBtn} onClick={() => setOpen(prev => !prev)}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M240 192C240 147.8 275.8 112 320 112C364.2 112 400 147.8 400 192C400 236.2 364.2 272 320 272C275.8 272 240 236.2 240 192zM448 192C448 121.3 390.7 64 320 64C249.3 64 192 121.3 192 192C192 262.7 249.3 320 320 320C390.7 320 448 262.7 448 192zM144 544C144 473.3 201.3 416 272 416L368 416C438.7 416 496 473.3 496 544L496 552C496 565.3 506.7 576 520 576C533.3 576 544 565.3 544 552L544 544C544 446.8 465.2 368 368 368L272 368C174.8 368 96 446.8 96 544L96 552C96 565.3 106.7 576 120 576C133.3 576 144 565.3 144 552L144 544z"/></svg>
                        </button>
                    )}
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
            <SideNav open={sideNavOpen} setOpen={setSideNavOpen} />
            <AuthContainer open={open} setOpen={setOpen} />
        </div>
    )
}