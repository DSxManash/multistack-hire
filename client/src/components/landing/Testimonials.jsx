import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { fadeUp, staggerContainer } from './motion'

const testimonials = [
  {
    quote: "Evaluating candidates based on GitHub histories and LeetCode performance used to take hours. Multistack Hire automates this aggregation and ranks engineers accurately. Our hire-to-interview ratio improved by 40%.",
    author: "Elena Rostova",
    role: "Lead Tech Recruiter",
    company: "NexaLabs",
    stars: 5,
    avatarText: "ER"
  },
  {
    quote: "By modeling GitHub activity, problem-solving depth, and text CV parameters under a gradient boosted model, this platform provides a highly calibrated, bias-free benchmark for candidate suitability.",
    author: "Dr. Albert Sterling",
    role: "Associate Professor",
    company: "HR-Tech Research Group",
    stars: 5,
    avatarText: "AS"
  },
  {
    quote: "Setting up my candidate profile was extremely smooth. I just linked my GitHub and LeetCode accounts, and the parsed CV matched my profile perfectly. It's the fairest technical assessment I've seen.",
    author: "Devon K.",
    role: "Senior React Engineer",
    company: "CloudScale Inc.",
    stars: 5,
    avatarText: "DK"
  }
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-20 sm:py-28 overflow-hidden bg-slate-50/50 dark:bg-slate-900/10 border-y border-slate-200/60 dark:border-slate-800/60">
      
      {/* Grid background effect */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:20px_20px]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
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
            Social Proof
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Trusted by Recruiters, Academics, and Engineers
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
            See what professionals are saying about our machine-learning assessment model.
          </p>
        </motion.div>

        {/* Grid layout */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className="mt-16 grid gap-6 md:grid-cols-3"
        >
          {testimonials.map((test) => (
            <motion.div
              key={test.author}
              variants={fadeUp}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-brand-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700/80"
            >
              <div>
                {/* Rating stars */}
                <div className="flex gap-0.5 text-amber-500 mb-4">
                  {[...Array(test.stars)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>

                {/* Quote symbol */}
                <Quote className="absolute right-6 top-6 h-8 w-8 text-slate-100 group-hover:text-brand-50/60 transition-colors dark:text-slate-900 dark:group-hover:text-brand-950/40 -z-0" />

                <p className="relative z-10 text-sm leading-relaxed text-slate-600 dark:text-slate-455">
                  "{test.quote}"
                </p>
              </div>

              {/* Profile section */}
              <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800/80">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-400">
                  {test.avatarText}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {test.author}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {test.role} · <span className="font-semibold text-slate-750 dark:text-slate-350">{test.company}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
