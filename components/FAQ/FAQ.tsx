"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, MessageSquare, ArrowRight } from "lucide-react";
import styles from "./FAQ.module.scss";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "How do I log in using Netscape session cookies (.JSON)?",
    answer:
      "When you purchase an account, your delivery bundle includes a Netscape/JSON cookie snippet. You can import this into any modern browser extension (like Cookie-Editor) or antidetect browsers (such as AdsPower, Dolphin{anty}, or Multilogin). Importing the cookie authenticates you immediately into the session without triggering password reset checkpoint gates.",
  },
  {
    question: "Which payment methods are accepted in Nigeria?",
    answer:
      "We accept instant Nigerian Naira (₦) payments through Guaranty Trust Bank (direct GTB transfer and *737# USSD) as well as Paypoint / Monnify dynamic virtual accounts and Nigerian debit cards. No international dollar card or cryptocurrency is required.",
  },
  {
    question: "How fast will I receive my account credentials after paying?",
    answer:
      "Delivery is 100% automated. In under 30 seconds after your payment is confirmed, the system packages your login credentials, session cookies, ProtonMail OGE access, and 2FA recovery secrets, sending them straight to your email. You can also download the JSON bundle directly on your screen.",
  },
  {
    question: "How does the 24-hour Replacement Warranty work?",
    answer:
      "During the 24-hour warranty window, you can log in, verify followers, test ad accounts, and check security parameters. If you encounter an invalid password or unexpected checkpoint, our automated system provides an instant replacement or refund with zero hassles.",
  },
  {
    question: "Do accounts come with original email (OGE) access?",
    answer:
      "Yes! Our high-trust aged profiles include the original registration email credentials (primarily ProtonMail or Microsoft Outlook) and 2FA backup codes. This ensures 100% permanent ownership and prevents any previous owner from recovering the account.",
  },
  {
    question: "Can I resell these accounts or connect via API?",
    answer:
      "Absolutely. We provide a developer-friendly REST API for resellers and digital marketing agencies. You can fund your dashboard in Naira, configure your desired markup (e.g. 50%), and automate account dispatch to your own customers with full white-label support.",
  },
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className={styles.faqSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader} data-aos="fade-up">
          <div className={styles.badge}>
            <HelpCircle size={13} />
            <span>Got Questions?</span>
          </div>
          <h2 className={styles.title}>
            Frequently Asked <span className={styles.highlight}>Questions</span>
          </h2>
          <p className={styles.subtitle}>
            Everything you need to know about buying aged social media logs,
            using session cookies, and our automated replacement warranty.
          </p>
        </div>

        {/* Accordion List */}
        <div className={styles.accordionList} data-aos="fade-up">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`${styles.accordionItem} ${
                  isOpen ? styles.itemOpen : ""
                }`}
              >
                <button
                  type="button"
                  className={styles.questionButton}
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    size={18}
                    className={`${styles.chevronIcon} ${
                      isOpen ? styles.chevronRotated : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className={styles.answerContent}>
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Callout */}
        <div className={styles.supportCallout} data-aos="fade-up">
          <div className={styles.supportText}>
            <h4>Need specialized account setups or custom volume?</h4>
            <p>
              Our verification specialists are available 24/7 on Telegram and WhatsApp.
            </p>
          </div>
          <a
            href="https://t.me/sterlinglogs"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.supportBtn}
          >
            <MessageSquare size={16} />
            <span>Chat on Telegram</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
