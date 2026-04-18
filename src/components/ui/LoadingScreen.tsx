'use client';

import { motion } from 'framer-motion';

interface LoadingScreenProps {
  fullScreen?: boolean;
  message?: string;
}

export default function LoadingScreen({ fullScreen = true, message }: LoadingScreenProps) {
  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? 'fixed inset-0 z-50' : 'w-full h-full'
      } bg-gradient-to-b from-indigo-900 via-indigo-950 to-black`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(99, 102, 241, 0.3)',
                '0 0 40px rgba(99, 102, 241, 0.5)',
                '0 0 20px rgba(99, 102, 241, 0.3)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="rounded-2xl"
          >
            <img
              src="/logo.svg"
              alt="Super Book Logo"
              className="h-24 w-24 bg-transparent"
            />
          </motion.div>
        </motion.div>

        {message && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-white/80 text-sm font-medium"
          >
            {message}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-indigo-400 rounded-full"
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
