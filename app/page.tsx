"use client";

import styles from "./page.module.css";
import Link from "next/link";

import {
  ChevronRightIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

import Logo from "@/app/assets/logo3.png";
import landingImg from "@/app/assets/image.png";

export default function Home() {
  return (
    <main className={styles.home}>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>
            <img src={Logo.src} alt="" />
            <span>Monster Hunter Wilds Build Planner</span>
          </div>

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

            <a href="#features" className={styles.secondaryButton}>
              Explore features
            </a>
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

            <div className={styles.previewImage}>
              <img
                src={landingImg.src}
                alt="Monster Hunter Wilds Builder interface"
              />
            </div>
          </div>

          <div className={`${styles.floatingBadge} ${styles.badgeOne}`}>
            <div className={styles.badgeIcon}>
              <ChartBarIcon />
            </div>

            <div>
              <span>Real-time</span>
              <strong>Stat Calculation</strong>
            </div>
          </div>

          <div className={`${styles.floatingBadge} ${styles.badgeTwo}`}>
            <div className={styles.badgeIcon}>
              <SparklesIcon />
            </div>

            <div>
              <span>Optimize</span>
              <strong>Skills & Gear</strong>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.featureSection} id="features">
        <div className={styles.sectionHeading}>
          <span>EVERYTHING IN ONE PLACE</span>
          <h2>Plan every part of your build.</h2>
          <p>
            Equip your gear, slot decorations, inspect activated skills and
            immediately see how your final stats change.
          </p>
        </div>

        <div className={styles.featureGrid}>
          <article className={styles.featureCard}>
            <div className={styles.featureNumber}>01</div>

            <div className={styles.featureIcon}>
              <WrenchScrewdriverIcon />
            </div>

            <h3>Build your loadout</h3>

            <p>
              Choose weapons, armor, charms, decorations, and equipment without
              constantly jumping between menus.
            </p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureNumber}>02</div>

            <div className={styles.featureIcon}>
              <SparklesIcon />
            </div>

            <h3>Track every skill</h3>

            <p>
              See equipment skills, set bonuses, group skills, decoration
              effects, and active skill levels at a glance.
            </p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureNumber}>03</div>

            <div className={styles.featureIcon}>
              <ChartBarIcon />
            </div>

            <h3>See the final numbers</h3>

            <p>
              Attack, affinity, sharpness, defense, resistances and other
              important stats update as your build changes.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.bottomCta}>
        <img src={Logo.src} alt="" />

        <div>
          <span>READY TO BUILD?</span>
          <h2>Create your next hunting setup.</h2>
        </div>

        <Link href="/builder" className={styles.primaryButton}>
          Open Builder
          <ChevronRightIcon />
        </Link>
      </section>
    </main>
  );
}
