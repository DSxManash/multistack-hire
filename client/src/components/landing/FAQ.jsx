import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { fadeUp } from './motion'

const faqs = [
  {
    question: 'How is the GitHub suitability signal calculated?',
    answer:
      'We request public GitHub profile data using the candidate’s username (no private credentials). Scoring uses followers, public repository count, language diversity across owned repos, and account age in days.',
  },
  {
    question: 'How does LeetCode factor into the score?',
    answer:
      'We fetch public LeetCode stats for the candidate’s username and use the counts of easy, medium, and hard problems solved as model features. Other profile fields may be stored for display but are not part of the 12-feature scoring vector.',
  },
  {
    question: 'What does the resume parser extract?',
    answer:
      'Uploaded PDF resumes are stored in MinIO, then processed with NLP to count skills, projects, internships, certifications, and CGPA. The resulting score is profile-based; it is not matched against individual job descriptions.',
  },
  {
    question: 'How does the XGBoost model produce a ranking score?',
    answer:
      'A trained gradient-boosting model receives the 12-feature vector and predicts a suitability score between 0 and 100. If the model file cannot be loaded, the system falls back to a simple rule-based blend of GitHub, LeetCode, and CV signals.',
  },
  {
    question: 'How is developer profile data secured?',
    answer:
      'We only use public usernames for GitHub and LeetCode—never private API tokens. Resume PDFs are uploaded by candidates and stored in MinIO object storage, with access mediated through authenticated application endpoints.',
  },
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
                    className={`h-4.5 w-4.5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-500' : ''
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
