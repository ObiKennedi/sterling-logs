import React from "react";
import {
  Cookie,
  MailCheck,
  CreditCard,
  Users2,
  Code2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import styles from "./Features.module.scss";

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  pill: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: <Cookie size={26} />,
    title: "Netscape Session Cookies (.JSON)",
    description:
      "Bypass password checkpoint triggers. Every account log comes with full cookie exports, session IDs, and auth tokens for instant 1-click browser login.",
    pill: "Zero Checkpoint Trigger",
  },
  {
    icon: <MailCheck size={26} />,
    title: "Original Email (OGE) Included",
    description:
      "Complete ownership control. Receive the original registration email credentials (ProtonMail / Outlook) with 2FA backup codes so you never get locked out.",
    pill: "100% Account Recovery Proof",
  },
  {
    icon: <CreditCard size={26} />,
    title: "GTBank & Paypoint Direct Naira",
    description:
      "No international dollar card needed. Pay locally in Naira (₦) using Guaranty Trust Bank *737# USSD, direct GTB transfer, or Paypoint virtual accounts.",
    pill: "Instant Local Settlement",
  },
  {
    icon: <Users2 size={26} />,
    title: "Real & Organic Tier-1 Reach",
    description:
      "Zero bot traffic. Aged accounts created with authentic activity, organic followers, and seasoned profiles from Tier-1 geos (US, UK, Europe, Worldwide).",
    pill: "High Authority Profiles",
  },
  {
    icon: <Code2 size={26} />,
    title: "Developer & Reseller API Ready",
    description:
      "Automate your agency or resell logs directly to your own customers with our unified REST API, customizable profit markups, and instant order webhooks.",
    pill: "Full REST API Access",
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className={styles.featuresSection}>
      <div className={styles.ambientGlowLeft} />
      <div className={styles.ambientGlowRight} />

      <div className={styles.container}>
        <div className={styles.sectionHeader} data-aos="fade-up">
          <div className={styles.badge}>
            <Sparkles size={13} />
            <span>Built For Scale &amp; Security</span>
          </div>
          <h2 className={styles.title}>
            Why Top Media Buyers Choose{" "}
            <span className={styles.highlight}>Sterling Logs</span>
          </h2>
          <p className={styles.subtitle}>
            Engineered specifically for media buyers, growth hackers, and marketing
            agencies who demand verified, ban-resistant social media accounts.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {FEATURES.map((feat, index) => (
            <div
              key={feat.title}
              className={styles.featureCard}
              data-aos="fade-up"
              data-aos-delay={index * 80}
            >
              <div className={styles.iconWrapper}>{feat.icon}</div>
              <h3 className={styles.featureTitle}>{feat.title}</h3>
              <p className={styles.featureDesc}>{feat.description}</p>
              <span className={styles.featurePill}>
                <CheckCircle2 size={13} />
                {feat.pill}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
