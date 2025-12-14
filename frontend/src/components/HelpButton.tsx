import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HelpButton = () => {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate('/help')}
      className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-40 hover:shadow-xl hover:scale-105 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-lg">💬</span>
      <span className="font-medium">Need Help?</span>
    </motion.button>
  );
};

export default HelpButton;
