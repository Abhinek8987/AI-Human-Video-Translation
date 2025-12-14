import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AIAssistant from '../components/AIAssistant';

// Help topic cards data
const helpTopics = [
  {
    id: 1,
    title: 'Upload Issues',
    description: 'Troubleshoot video upload problems and requirements',
    icon: '📤',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    id: 2,
    title: 'Translation Problems',
    description: 'Resolve issues with translations and subtitles',
    icon: '🌐',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 3,
    title: 'Dashboard Help',
    description: 'Learn how to navigate and use your dashboard',
    icon: '📊',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    id: 4,
    title: 'Billing & Plans',
    description: 'Questions about subscriptions and payments',
    icon: '💳',
    gradient: 'from-emerald-500 to-teal-400',
  },
];

// FAQ items
const faqItems = [
  {
    question: 'How do I upload a video?',
    answer: 'Go to the Upload page, drag and drop your video file or click to browse. Supported formats include MP4, MOV, and AVI with a maximum size of 2GB.'
  },
  {
    question: 'How long does translation take?',
    answer: 'Processing time depends on video length. Typically, it takes about 1 minute per minute of video, plus 2-3 minutes for processing.'
  },
  {
    question: 'What languages are supported?',
    answer: 'We support over 50 languages including English, Spanish, French, German, Chinese, Japanese, Arabic, Hindi, Portuguese, Russian, and many more.'
  },
  {
    question: 'How do I download my translated video?',
    answer: 'Once processing is complete, go to the Status page and click the download button next to your completed translation.'
  },
  {
    question: 'What video formats are supported?',
    answer: 'We support MP4, MOV, and AVI formats. For best results, use MP4 with H.264 codec.'
  },
  {
    question: 'Can I translate videos longer than 1 hour?',
    answer: 'Yes, we support videos of any length. However, longer videos will take more time to process.'
  },
  {
    question: 'Is there a limit to how many videos I can translate?',
    answer: 'Free accounts can translate up to 5 videos per month. Paid plans offer higher limits and additional features.'
  },
  {
    question: 'How accurate are the translations?',
    answer: 'Our AI provides highly accurate translations, but results may vary based on audio quality and background noise. For best results, ensure clear audio.'
  },
  {
    question: 'Can I edit the translated subtitles?',
    answer: 'Yes, you can edit the translated subtitles before downloading your video using our built-in subtitle editor.'
  },
  {
    question: 'How do I change my account settings?',
    answer: 'Click on your profile picture in the top-right corner and select "Account Settings" to update your preferences and subscription.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers for subscription payments.'
  },
  {
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel your subscription anytime in the Account Settings page. Your subscription will remain active until the end of the current billing period.'
  },
];

const HelpPage = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white p-4 md:p-8">
      {/* Hero Section */}
      <motion.section 
        className="max-w-6xl mx-auto text-center py-16 md:py-24"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="inline-block text-4xl md:text-6xl font-bold mb-4"
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          💬
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
          Need Help?
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Find quick solutions or contact our support team.
        </p>
      </motion.section>

      {/* Help Topics Grid */}
      <section className="max-w-6xl mx-auto mb-20">
        <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">Help Topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {helpTopics.map((topic) => (
            <motion.div
              key={topic.id}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: topic.id * 0.1 }}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4 bg-gradient-to-br ${topic.gradient}`}>
                {topic.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{topic.title}</h3>
              <p className="text-gray-300 text-sm">{topic.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto mb-20">
        <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <motion.div 
              key={index}
              className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-medium">{item.question}</span>
                <motion.span
                  animate={{ rotate: activeFaq === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  ▼
                </motion.span>
              </button>
              <AnimatePresence>
                {activeFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 pt-2 text-gray-300">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Card */}
      <motion.section 
        className="max-w-2xl mx-auto bg-gradient-to-r from-purple-600/30 to-blue-600/30 backdrop-blur-lg rounded-2xl p-8 text-center mb-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold mb-4">Still stuck?</h2>
        <p className="text-gray-200 mb-6">Our support team is here to help you with any questions or issues.</p>
        <a 
          href="mailto:support@humantranslator.ai" 
          className="inline-block bg-white text-purple-900 font-medium px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all duration-300"
        >
          Email Support
        </a>
      </motion.section>

      {/* AI Chat Assistant */}
      <AIAssistant />
    </div>
  );
};

export default HelpPage;
