import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqData = [
  {
    category: 'Account & Authentication',
    items: [
      {
        question: 'How do I create a GitNest account?',
        answer: 'Creating a GitNest account is simple! Click on the "Start Contributing" button on the homepage, fill in your details (username, email, and password), and click register. You can also sign up using your GitHub account for instant authentication.'
      },
      {
        question: 'Can I sign in using GitHub?',
        answer: 'Yes! GitNest supports OAuth authentication with GitHub. Click the "Sign in with GitHub" option on the login page, authorize the application, and you\'ll be instantly logged in without needing a separate password.'
      },
      {
        question: 'How do I reset my password?',
        answer: 'On the login page, click "Forgot Password?" and enter your email address. You\'ll receive a password reset link via email. Click the link, set your new password, and you\'re done!'
      }
    ]
  },
  {
    category: 'Repository Management',
    items: [
      {
        question: 'How do I create a new repository?',
        answer: 'After logging in, navigate to your dashboard and click the "New Repository" button. Fill in the repository name, description, choose visibility (public/private), and click "Create". Your repository is now ready for development!'
      },
      {
        question: 'Can I make my repository private?',
        answer: 'Absolutely! When creating a repository, you can choose between public and private. You can also change the visibility anytime by going to Repository Settings and toggling the visibility option.'
      },
      {
        question: 'How do I delete a repository?',
        answer: 'Go to your repository settings, scroll to the "Danger Zone" section, and click "Delete Repository". Confirm your action by typing the repository name. Note: This action is permanent and cannot be undone.'
      }
    ]
  },
  {
    category: 'Collaboration',
    items: [
      {
        question: 'How can I invite collaborators to a project?',
        answer: 'In your repository settings, go to the "Collaborators" section and click "Invite Collaborator". Enter their username or email, select their role (Viewer, Contributor, Maintainer), and send the invitation. They\'ll receive an email to accept the invite.'
      },
      {
        question: 'How do pull requests work on GitNest?',
        answer: 'Create a new branch, make your changes, commit them, and push to your fork. Then open a pull request from your branch to the main branch. Maintainers can review your changes, add comments, and merge when approved.'
      },
      {
        question: 'Can multiple developers work on the same project?',
        answer: 'Yes! GitNest is built for collaboration. Multiple developers can work on different branches simultaneously, create pull requests, and collaborate through code reviews. Use branch protection rules to maintain code quality.'
      }
    ]
  },
  {
    category: 'General',
    items: [
      {
        question: 'Is GitNest free to use?',
        answer: 'Yes, GitNest is completely free! It\'s an open-source project built by the community. There are no subscription fees or hidden costs. Everyone can use all features without paying.'
      },
      {
        question: 'What technologies does GitNest support?',
        answer: 'GitNest is built with the MERN stack (MongoDB, Express, React, Node.js) and supports any programming language for your repositories. The platform is language-agnostic and works with TypeScript, Python, Java, Go, Rust, and more.'
      },
      {
        question: 'How can I report a bug or request a feature?',
        answer: 'Visit the GitNest repository and create an issue with a detailed description. For bugs, include steps to reproduce. For features, explain the use case and expected behavior. Our community will review and respond to your requests.'
      }
    ]
  }
];

function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <motion.div
      className="border border-zinc-200 dark:border-white/10 rounded-[24px] overflow-hidden bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl transition-all duration-300 hover:shadow-lg"
      layout
    >
      <motion.button
        onClick={onToggle}
        className="w-full px-6 py-5 md:px-8 md:py-6 flex items-start justify-between gap-4 text-left hover:bg-white/50 dark:hover:bg-white/[0.05] transition-colors"
        layout
      >
        <span className="text-base md:text-lg font-bold text-zinc-900 dark:text-white leading-relaxed">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 mt-1"
        >
          <ChevronDown className="w-5 h-5 text-[#00dc82]" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 md:px-8 md:py-5 border-t border-zinc-200 dark:border-white/5 bg-white/40 dark:bg-white/[0.02]">
              <p className="text-base md:text-[17px] leading-7 text-zinc-700 dark:text-zinc-300">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FAQCategory({ category, items }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-[#00dc82] to-[#4fd1ff]" />
        <h3 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
          {category}
        </h3>
      </div>

      <div className="space-y-3 md:space-y-4">
        {items.map((item, index) => (
          <FAQItem
            key={index}
            question={item.question}
            answer={item.answer}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <section
      id="faq"
      className="relative py-20 md:py-32 overflow-hidden border-t border-zinc-200 dark:border-white/5 bg-[#f7faf9] dark:bg-[#050816]"
    >
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* MAIN GRADIENT */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-r from-[#00dc82]/10 to-[#4fd1ff]/10 blur-3xl rounded-full" />

        {/* LEFT GLOW */}
        <div className="absolute left-[-100px] top-1/3 w-[300px] h-[300px] rounded-full bg-blue-200/25 blur-3xl" />

        {/* RIGHT GLOW */}
        <div className="absolute right-[-100px] bottom-1/3 w-[300px] h-[300px] rounded-full bg-cyan-400/10 blur-3xl" />

        {/* GRID PATTERN */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-24 text-center"
        >
          <div className="inline-flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full border border-[#00dc82]/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl shadow-lg mb-6 md:mb-8">
            <HelpCircle className="w-4 h-4 text-[#00dc82]" />
            <span className="text-xs md:text-sm font-medium tracking-[0.15em] uppercase bg-gradient-to-r from-[#00dc82] to-[#4fd1ff] bg-clip-text text-transparent">
              FAQ
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl leading-tight md:leading-[1.2] tracking-[-0.04em] font-black text-zinc-900 dark:text-white mb-4 md:mb-6">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-[#00dc82] via-[#36e4da] to-[#4fd1ff] bg-clip-text text-transparent">
              Questions
            </span>
          </h2>

          <p className="text-base md:text-lg lg:text-xl leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
            Find answers to common questions about GitNest, account management, repositories, collaboration, and more.
          </p>
        </motion.div>

        {/* FAQ CATEGORIES */}
        <div className="space-y-16 md:space-y-24">
          {faqData.map((category, index) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <FAQCategory
                category={category.category}
                items={category.items}
              />
            </motion.div>
          ))}
        </div>

        {/* CTA SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 md:mt-24 p-8 md:p-12 rounded-[32px] border border-[#00dc82]/20 bg-gradient-to-br from-[#00dc82]/5 to-[#4fd1ff]/5 dark:from-[#00dc82]/10 dark:to-[#4fd1ff]/10 backdrop-blur-xl text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-3 md:mb-4">
            Can't find what you're looking for?
          </h3>
          <p className="text-zinc-600 dark:text-zinc-300 mb-6 md:mb-8">
            Check out our complete documentation or reach out to our community on GitHub.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <a
              href="/documentation"
              className="px-6 md:px-8 py-3 md:py-4 rounded-[20px] bg-gradient-to-r from-[#00dc82] to-[#4fd1ff] text-black font-bold text-base md:text-lg shadow-[0_10px_30px_rgba(0,220,130,0.25)] hover:shadow-[0_15px_40px_rgba(0,220,130,0.35)] hover:scale-[1.02] transition-all duration-300"
            >
              View Documentation
            </a>
            <a
              href="https://github.com/gitnest"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 md:px-8 py-3 md:py-4 rounded-[20px] border border-zinc-200 dark:border-white/20 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl text-zinc-900 dark:text-white font-bold text-base md:text-lg hover:shadow-lg transition-all duration-300"
            >
              Join Community
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
