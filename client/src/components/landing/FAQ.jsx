import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { fadeUp } from './motion'

const faqs = [
  {
    question: "How is the GitHub suitability score calculated?",
    answer: "Our pipeline pulls public repository stats, commit frequencies, code language diversity, and contribution histories. These signals are parsed and normalized relative to engineering roles to yield a robust, commit-by-commit assessment."
  },
  {
    question: "How does LeetCode grading factor in difficulty levels?",
    answer: "We query public LeetCode APIs to retrieve counts of Solved Problems across Easy, Medium, and Hard tiers, alongside their community reputation score. Higher difficulty solutions carry weighted logits in our predictive model."
  },
  {
    question: "How does the Resume NLP parser map keyword matching?",
    answer: "Our backend runs CV text content through specialized NLP filters. It identifies skill entities, years of experience, and graduation terms, then maps them against target job descriptions for automated alignment."
  },
  {
    question: "Why was XGBoost chosen as the core ranking model?",
    answer: "Gradient boosting trees are exceptionally effective at capturing non-linear interactions between disparate features (such as high LeetCode scores offsetting short CV histories, or vice versa) without losing calibration."
  },
  {
    question: "How is developer profile data secured?",
    answer: "We only retrieve public data using public username handles (never asking for private credentials). Uploaded resume PDFs are stored securely within local sandboxed S3 buckets (MinIO) and are encrypted at rest."
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  function toggleFaq(index) {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="relative py-20 sm:py-28 overflow-hidden dark:bg-slate-950">
      
      {/* Background decorations */}
      <div className="absolute top-1/2 right-1/4 -z-10 h-80 w-80 rounded-full bg-brand-400/5 blur-3xl" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          custom={0}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
            Support
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
            Answers to common questions about candidate analytics, security, and models.
          </p>
        </motion.div>

        {/* Collapsible FAQ Accordion */}
        <div className="mt-16 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-950"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between p-5 text-left font-bold text-slate-850 transition-colors hover:text-brand-650 dark:text-slate-200 dark:hover:text-brand-400"
                >
                  <span className="flex items-center gap-3 text-sm sm:text-base leading-tight">
                    <HelpCircle className="h-4.5 w-4.5 text-brand-650 dark:text-brand-400 shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4.5 w-4.5 text-slate-400 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-brand-500' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-100 p-5 text-sm leading-relaxed text-slate-500 dark:border-slate-800/80 dark:text-slate-405">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
