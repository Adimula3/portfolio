"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const EMAIL_LINK = "mailto:Kolawoleolayinka16@gmail.com";
const LINKEDIN_LINK = "https://www.linkedin.com/in/olayinka-kolawole-84189a188/";
const META_LINK = "https://wa.me/2349064819280";

// RollLink — per-letter slide-up hover (same as Landing nav)
function RollLink({ href, children, target, active }) {
  const text = String(children);
  return (
    <Link
      href={href}
      className={`roll-link${active ? " roll-link--active" : ""}`}
      aria-label={text}
      {...(target ? { target, rel: "noopener noreferrer" } : {})}
    >
      <span aria-hidden="true">
        {Array.from(text).map((char, i) => (
          <span
            key={i}
            className="roll-letter"
            data-letter={char}
            style={{ transitionDelay: `${i * 0.015}s` }}
          >
            {char}
          </span>
        ))}
      </span>
    </Link>
  );
}

// Navbar is pure HTML — no GSAP here.
// Landing.jsx controls opacity/y via ScrollTrigger.
export default function Navbar() {
  const pathname = usePathname();
  const isAbout = pathname === "/about";

  return (
    <header className="site-header">
      <nav className="site-nav">
        <Link href="/" className="site-logo">YINKA.KLW</Link>

        <div className="nav-roll-links">
          <RollLink href="/about" active={isAbout}>About</RollLink>
          <RollLink href={EMAIL_LINK}>Email</RollLink>
          <RollLink href={LINKEDIN_LINK} target="_blank">in</RollLink>
          <RollLink href={META_LINK} target="_blank">Meta</RollLink>
        </div>
      </nav>
    </header>
  );
}
