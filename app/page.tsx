"use client";

import styles from "./page.module.css";
import Link from "next/link";

import {
  ChevronRightIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

import landingImg from "@/app/assets/image.png";

export default function Home() {
  return (
    <main className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>
            Build smarter.
            <br />
            <span>Hunt stronger.</span>
          </h1>

          <p className={styles.heroDescription}>
            Craft, compare, and optimize your Monster Hunter Wilds builds with
            real-time stats, skills, decorations, and equipment calculations.
          </p>

          <div className={styles.actions}>
            <Link href="/builder" className={styles.primaryButton}>
              Open Builder
              <ChevronRightIcon />
            </Link>

            <Link href="/builder" className={styles.secondaryButton}>
              Start building
            </Link>
          </div>

          <div className={styles.featurePills}>
            <div>
              <ChartBarIcon />
              <span>Live stat calculations</span>
            </div>

            <div>
              <WrenchScrewdriverIcon />
              <span>Complete loadout builder</span>
            </div>

            <div>
              <SparklesIcon />
              <span>Skill optimization</span>
            </div>
          </div>
        </div>

        <div className={styles.previewArea}>
          <div className={styles.previewFrame}>
            <div className={styles.previewVideo}>
              <video
                src="/builder-preview.mp4"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
