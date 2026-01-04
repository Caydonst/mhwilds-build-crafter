"use client"
import Image from "next/image";
import styles from "./page.module.css";
import {useEffect, useState} from "react";
import Builder from "@/app/components/builder/builder"
import fetchAll from "@/app/api/buildGenerator/buildGenerator"

export default function Home() {
    const [skillData, setSkillData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [builderOpen, setBuilderOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchAll();
                setSkillData(response)
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData()
    }, [])

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <main className={styles.homeContainer}>
            <div className={styles.buildsContainer}>
                <h1>My Builds</h1>
                <button className={styles.customBuildBtn} onClick={() => setBuilderOpen(true)}>+ Custom Build</button>
            </div>
            {builderOpen &&
                <Builder builderOpen={builderOpen} setBuilderOpen={setBuilderOpen} skillData={skillData} />
            }
        </main>
    );
}
