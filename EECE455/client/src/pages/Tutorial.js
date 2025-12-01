import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Play, ChevronRight, ChevronDown, CheckCircle, Info, Zap } from 'lucide-react';

const Tutorial = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const tutorialSteps = [
    {
      id: 0,
      title: 'What is AES?',
      content: {
        description: 'Advanced Encryption Standard (AES) is a symmetric encryption algorithm used worldwide.',
        details: [
          'AES was established by the U.S. National Institute of Standards and Technology (NIST) in 2001',
          'It replaced the Data Encryption Standard (DES) due to security concerns',
          'AES is based on the Rijndael cipher developed by Belgian cryptographers',
          'It supports three key sizes: 128, 192, and 256 bits',
          'AES is used in many applications including SSL/TLS, Wi-Fi security, and file encryption'
        ],
        example: 'AES-128 means the key is 128 bits (16 bytes) long'
      }
    },
    {
      id: 1,
      title: 'AES Structure',
      content: {
        description: 'AES operates on a 4×4 matrix of bytes called the "state".',
        details: [
          'The state matrix is initialized with the plaintext',
          'Each round transforms the state through four operations',
          'AES-128 has 10 rounds, AES-192 has 12 rounds, AES-256 has 14 rounds',
          'The first and last rounds are slightly different from the middle rounds',
          'Each round uses a different round key derived from the original key'
        ],
        example: 'State: [54 4F 4E 20] [77 6E 69 54] [6F 65 6E 77] [20 20 65 6F]'
      }
    },
    {
      id: 2,
      title: 'SubBytes Operation',
      content: {
        description: 'SubBytes replaces each byte in the state with its corresponding value from the S-box.',
        details: [
          'The S-box is a fixed 16×16 lookup table',
          'It provides non-linearity to resist differential and linear cryptanalysis',
          'Each byte is treated as a polynomial in GF(2^8)',
          'The transformation is invertible for decryption',
          'This is the only non-linear operation in AES'
        ],
        example: 'Byte 0x53 becomes 0xED through S-box substitution'
      }
    },
    {
      id: 3,
      title: 'ShiftRows Operation',
      content: {
        description: 'ShiftRows cyclically shifts the rows of the state matrix to the left.',
        details: [
          'Row 0: no shift (0 positions)',
          'Row 1: shift left by 1 position',
          'Row 2: shift left by 2 positions',
          'Row 3: shift left by 3 positions',
          'This provides diffusion across the state matrix'
        ],
        example: 'Row 1: [A B C D] becomes [B C D A]'
      }
    },
    {
      id: 4,
      title: 'MixColumns Operation',
      content: {
        description: 'MixColumns multiplies each column by a fixed polynomial in GF(2^8).',
        details: [
          'Uses Galois field multiplication (GF(2^8))',
          'Each column is treated as a polynomial',
          'Multiplied by the fixed polynomial c(x) = 03x³ + 01x² + 01x + 02',
          'This operation is omitted in the final round',
          'Provides diffusion within each column'
        ],
        example: 'Column multiplication using matrix: [[02, 03, 01, 01], [01, 02, 03, 01], [01, 01, 02, 03], [03, 01, 01, 02]]'
      }
    },
    {
      id: 5,
      title: 'AddRoundKey Operation',
      content: {
        description: 'AddRoundKey XORs the state with the round key.',
        details: [
          'This is the only operation that uses the secret key',
          'Each round uses a different round key',
          'Round keys are derived from the original key using key expansion',
          'The operation is its own inverse (A ⊕ B ⊕ B = A)',
          'Provides the actual encryption/decryption'
        ],
        example: 'State[i][j] = State[i][j] ⊕ RoundKey[i][j]'
      }
    },
    {
      id: 6,
      title: 'Key Expansion',
      content: {
        description: 'Key expansion generates round keys from the original encryption key.',
        details: [
          'Uses the Rijndael key schedule',
          'For every 4th word, applies RotWord, SubWord, and XOR with Rcon',
          'RotWord: circular left shift of the word',
          'SubWord: applies S-box to each byte',
          'Rcon: round constant for each round'
        ],
        example: 'w[i] = w[i-4] ⊕ g(w[i-1]) where g() is the key expansion function'
      }
    },
    {
      id: 7,
      title: 'AES Variants',
      content: {
        description: 'AES supports three key sizes with different security levels.',
        details: [
          'AES-128: 128-bit key, 10 rounds, most common',
          'AES-192: 192-bit key, 12 rounds, medium security',
          'AES-256: 256-bit key, 14 rounds, highest security',
          'All variants use the same operations, just different number of rounds',
          'Larger keys provide better security but slower performance'
        ],
        example: 'AES-256 is recommended for highly sensitive data'
      }
    }
  ];

  const handleStepComplete = (stepId) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const handleNext = () => {
    if (activeStep < tutorialSteps.length - 1) {
      handleStepComplete(activeStep);
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const TutorialStep = ({ step, isActive, isCompleted }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`glass rounded-xl p-6 border transition-all duration-300 ${
        isActive
          ? 'border-blue-500/50 bg-blue-500/10'
          : isCompleted
          ? 'border-green-500/50 bg-green-500/10'
          : 'border-white/20 hover:border-white/40'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isCompleted
              ? 'bg-green-500'
              : isActive
              ? 'bg-blue-500'
              : 'bg-white/10'
          }`}>
            {isCompleted ? (
              <CheckCircle className="h-5 w-5 text-white" />
            ) : (
              <span className="text-white font-bold">{step.id + 1}</span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white">{step.title}</h3>
        </div>
        {isActive && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleStepComplete(step.id)}
            className="p-2 glass rounded-lg text-white hover:bg-white/20 transition-all duration-300"
          >
            <CheckCircle className="h-5 w-5" />
          </motion.button>
        )}
      </div>

      <div className="space-y-4">
        <p className="text-blue-200 text-lg leading-relaxed">
          {step.content.description}
        </p>

        <div className="space-y-2">
          {step.content.details.map((detail, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="flex items-start space-x-3"
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
              <span className="text-white/90">{detail}</span>
            </motion.div>
          ))}
        </div>

        {step.content.example && (
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="h-4 w-4 text-blue-400" />
              <span className="text-blue-300 font-medium">Example:</span>
            </div>
            <p className="text-white font-mono text-sm">{step.content.example}</p>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="gradient-text">AES Tutorial</span>
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Learn the Advanced Encryption Standard step by step with interactive examples
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Progress Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="glass rounded-2xl p-6 border border-white/20 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <BookOpen className="h-5 w-5 mr-3 text-blue-400" />
                Tutorial Steps
              </h2>

              <div className="space-y-3">
                {tutorialSteps.map((step, index) => (
                  <motion.button
                    key={step.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveStep(step.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all duration-300 ${
                      activeStep === step.id
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : completedSteps.has(step.id)
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        completedSteps.has(step.id)
                          ? 'bg-green-500 text-white'
                          : activeStep === step.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/20 text-white/80'
                      }`}>
                        {completedSteps.has(step.id) ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          step.id + 1
                        )}
                      </div>
                      <span className="font-medium">{step.title}</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Progress */}
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-sm">Progress</span>
                  <span className="text-blue-300 text-sm font-mono">
                    {completedSteps.size}/{tutorialSteps.length}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedSteps.size / tutorialSteps.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TutorialStep
                  step={tutorialSteps[activeStep]}
                  isActive={true}
                  isCompleted={completedSteps.has(activeStep)}
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrevious}
                disabled={activeStep === 0}
                className="flex items-center space-x-2 px-6 py-3 glass text-white rounded-lg hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                <span>Previous</span>
              </motion.button>

              <div className="text-white/60 font-mono text-sm">
                Step {activeStep + 1} of {tutorialSteps.length}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                disabled={activeStep === tutorialSteps.length - 1}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>

            {/* Completion Message */}
            {completedSteps.size === tutorialSteps.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mt-8 p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl border border-green-500/30 text-center"
              >
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  Congratulations!
                </h3>
                <p className="text-blue-200 mb-4">
                  You've completed the AES tutorial. You now understand the fundamentals of the Advanced Encryption Standard.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                >
                  <Zap className="h-4 w-4" />
                  <span>Try Encryption Now</span>
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
