import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer} aria-label="Site footer">
      <div className={styles.inner}>
        <div className={styles.top}>
          <p className={styles.eyebrow}>
            <span className={styles.dot} aria-hidden="true" />
            Available for work
          </p>

          <h2 className={styles.headline}>
            Let&rsquo;s build something <em>that matters.</em>
          </h2>
        </div>
      </div>
    </footer>
  );
}
