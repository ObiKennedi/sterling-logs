import React from "react";
import { Search, CreditCard, Send, Zap } from "lucide-react";
import styles from "./HowItWorks.module.scss";

interface StepItem {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tag: string;
}

const STEPS: StepItem[] = [
  {
    number: "01",
    title: "Select Verified Account",
    description:
      "Explore aged profiles across Instagram, Twitter/X, TikTok, and Facebook Ads. Review organic follower reach, year, and verification logs.",
    icon: <Search size={22} />,
    tag: "Real & Non-Bot Logs",
  },
  {
    number: "02",
    title: "Instant Naira Checkout",
    description:
      "Pay securely using Guaranty Trust Bank (GTB *737# USSD & transfer) or Paypoint dynamic virtual accounts. Direct Nigerian payment with zero FX fees.",
    icon: <CreditCard size={22} />,
    tag: "GTBank & Paypoint Ready",
  },
  {
    number: "03",
    title: "Automated Email Dispatch",
    description:
      "Within seconds of payment, the automated engine packages your Netscape session cookies (.JSON), login credentials, and ProtonMail OGE access.",
    icon: <Send size={22} />,
    tag: "Dispatched in < 30 Seconds",
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className={styles.howItWorksSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader} data-aos="fade-up">
          <div className={styles.badge}>
            <Zap size={13} />
            <span>Seamless 3-Step Pipeline</span>
          </div>
          <h2 className={styles.title}>
            How Sterling Logs <span className={styles.highlight}>Works</span>
          </h2>
          <p className={styles.subtitle}>
            From account selection to automated credential dispatch—experience the safest way to buy social media logs in Nigeria.
          </p>
        </div>

        <div className={styles.stepsGrid}>
          {STEPS.map((step, index) => (
            <div
              key={step.number}
              className={styles.stepCard}
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className={styles.stepTopRow}>
                <span className={styles.stepNumber}>{step.number}</span>
                <div className={styles.stepIconBox}>{step.icon}</div>
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.description}</p>
              <span className={styles.stepMetaTag}>{step.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
