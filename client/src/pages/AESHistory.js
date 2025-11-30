/**
 * AES History Page Component
 * 
 * Educational timeline of the Advanced Encryption Standard (AES)
 * 
 * Content:
 * - Historical timeline from DES to AES selection
 * - AES competition and selection process
 * - Adoption and standardization
 * - Modern usage and importance
 * - Key milestones and achievements
 * 
 * Features:
 * - Visual timeline with animated entries
 * - Historical context and background
 * - Educational information about AES development
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calendar,
  Globe,
  Trophy,
  Rocket,
  Building2,
  Award,
  Star,
  AlertTriangle,
  Shield,
  Users,
  Zap,
  ArrowRight,
  Lock,
  Eye,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

const AESHistory = () => {
  return (
    <div className="pt-16 min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl mb-8">
            <Calendar className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="gradient-text">History of AES</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            The fascinating journey of AES from its inception to becoming the global encryption standard
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative mb-16">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-purple-500 to-green-500"></div>
          
          <div className="space-y-8">
            {/* 1970s - DES */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative flex items-start space-x-4"
            >
              <div className="relative z-10 flex-shrink-0">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full border-4 border-white dark:border-black shadow-lg">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex-1 pt-2">
                <div className="glass rounded-xl p-5 border-clean">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">1977 - DES Era</h4>
                    <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-white/10 rounded text-gray-600 dark:text-gray-400">1970s</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Data Encryption Standard (DES) was published by NIST. It used a 56-bit key and became the first 
                    widely adopted encryption standard. DES was developed by IBM and based on the Lucifer cipher.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-red-500/20 text-red-600 dark:text-red-400 rounded">56-bit key</span>
                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded">Vulnerable</span>
                    <span className="text-xs px-2 py-1 bg-gray-500/20 text-gray-600 dark:text-gray-400 rounded">First Standard</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 1990s - DES Weakness */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex items-start space-x-4"
            >
              <div className="relative z-10 flex-shrink-0">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full border-4 border-white dark:border-black shadow-lg">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex-1 pt-2">
                <div className="glass rounded-xl p-5 border-clean">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">1990s - DES Vulnerabilities</h4>
                    <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-white/10 rounded text-gray-600 dark:text-gray-400">1990s</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    DES became vulnerable to brute-force attacks due to its short key length. In 1998, DES was cracked 
                    in 56 hours using specialized hardware (EFF's Deep Crack). Triple DES (3DES) was introduced as a temporary solution, 
                    applying DES three times with different keys.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-red-500/20 text-red-600 dark:text-red-400 rounded">Brute-force attack</span>
                    <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded">3DES solution</span>
                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded">56 hours crack</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 1997 - AES Competition */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative flex items-start space-x-4"
            >
              <div className="relative z-10 flex-shrink-0">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full border-4 border-white dark:border-black shadow-lg">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex-1 pt-2">
                <div className="glass rounded-xl p-5 border-clean">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">1997 - AES Competition Begins</h4>
                    <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-white/10 rounded text-gray-600 dark:text-gray-400">1997</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    NIST announced a competition to find a replacement for DES. The Advanced Encryption Standard (AES) 
                    competition was open to cryptographers worldwide, receiving 15 submissions from 12 countries. 
                    The competition was transparent and open to public scrutiny.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded">15 algorithms</span>
                    <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded">Global competition</span>
                    <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded">12 countries</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 1998-1999 - Finalists */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative flex items-start space-x-4"
            >
              <div className="relative z-10 flex-shrink-0">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full border-4 border-white dark:border-black shadow-lg">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex-1 pt-2">
                <div className="glass rounded-xl p-5 border-clean">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">1998-1999 - Finalists Selected</h4>
                    <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-white/10 rounded text-gray-600 dark:text-gray-400">1998-1999</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    After rigorous analysis and public evaluation, five finalists were selected: MARS (IBM), RC6 (RSA), 
                    Rijndael (Belgium), Serpent (UK/Israel/Norway), and Twofish (USA). Each was thoroughly evaluated for 
                    security, performance, and implementation characteristics.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
                    {[
                      { name: 'MARS', country: 'USA', highlight: false },
                      { name: 'RC6', country: 'USA', highlight: false },
                      { name: 'Rijndael', country: 'Belgium', highlight: true },
                      { name: 'Serpent', country: 'Multi', highlight: false },
                      { name: 'Twofish', country: 'USA', highlight: false }
                    ].map((item, idx) => (
                      <div key={idx} className={`text-xs px-2 py-2 rounded text-center ${
                        item.highlight 
                          ? 'bg-green-500/20 text-green-600 dark:text-green-400 font-semibold border border-green-500/30' 
                          : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10'
                      }`}>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-[10px] mt-1 opacity-75">{item.country}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 2000 - Rijndael Selected */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="relative flex items-start space-x-4"
            >
              <div className="relative z-10 flex-shrink-0">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full border-4 border-white dark:border-black shadow-lg">
                  <Award className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex-1 pt-2">
                <div className="glass rounded-xl p-5 border-clean border-green-500/30 bg-green-500/5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                      <Star className="h-4 w-4 mr-2 text-yellow-500" />
                      2000 - Rijndael Selected
                    </h4>
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded font-semibold">2000</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Rijndael, designed by Belgian cryptographers Joan Daemen and Vincent Rijmen, was selected as the winner. 
                    It was chosen for its excellent combination of security, performance, and flexibility. Rijndael became AES, 
                    though AES only supports block sizes of 128 bits (Rijndael supported variable block sizes).
                  </p>
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-3 rounded-lg border border-green-500/30">
                    <div className="flex items-center space-x-2 text-sm mb-2">
                      <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-gray-600 dark:text-gray-300">
                        <strong className="text-gray-900 dark:text-white">Creators:</strong> Joan Daemen & Vincent Rijmen
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Katholieke Universiteit Leuven, Belgium
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 2001 - AES Standardized */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="relative flex items-start space-x-4"
            >
              <div className="relative z-10 flex-shrink-0">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full border-4 border-white dark:border-black shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex-1 pt-2">
                <div className="glass rounded-xl p-5 border-clean">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">2001 - AES Standardized</h4>
                    <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-white/10 rounded text-gray-600 dark:text-gray-400">2001</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    AES was officially published as FIPS 197 (Federal Information Processing Standard) by NIST on November 26, 2001. 
                    It became the mandatory encryption standard for U.S. government agencies handling sensitive information. 
                    AES-256 is approved for top-secret classified information.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded">FIPS 197</span>
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded">U.S. Standard</span>
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded">Nov 26, 2001</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 2000s-Present - Global Adoption */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="relative flex items-start space-x-4"
            >
              <div className="relative z-10 flex-shrink-0">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full border-4 border-white dark:border-black shadow-lg">
                  <Globe className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex-1 pt-2">
                <div className="glass rounded-xl p-5 border-clean">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">2000s-Present - Global Adoption</h4>
                    <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-white/10 rounded text-gray-600 dark:text-gray-400">2000s+</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    AES became the de facto encryption standard worldwide. It's used by governments, financial institutions, 
                    tech companies, and millions of applications. AES-256 is approved for top-secret U.S. government information 
                    and is widely used in SSL/TLS, VPNs, disk encryption, and secure communications.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                    {[
                      { icon: Building2, label: 'Governments', bgClass: 'bg-blue-500/10', borderClass: 'border-blue-500/20', iconClass: 'text-blue-600 dark:text-blue-400' },
                      { icon: Users, label: 'Banks', bgClass: 'bg-green-500/10', borderClass: 'border-green-500/20', iconClass: 'text-green-600 dark:text-green-400' },
                      { icon: Zap, label: 'Tech Companies', bgClass: 'bg-purple-500/10', borderClass: 'border-purple-500/20', iconClass: 'text-purple-600 dark:text-purple-400' },
                      { icon: Shield, label: 'Security', bgClass: 'bg-cyan-500/10', borderClass: 'border-cyan-500/20', iconClass: 'text-cyan-600 dark:text-cyan-400' }
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div key={idx} className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${item.bgClass} ${item.borderClass}`}>
                          <Icon className={`h-4 w-4 ${item.iconClass}`} />
                          <span className="text-xs text-gray-600 dark:text-gray-300">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Key Milestones Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          <div className="glass rounded-xl p-6 border-clean text-center">
            <div className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">15</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Initial Submissions</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">From 12 countries</div>
          </div>
          <div className="glass rounded-xl p-6 border-clean text-center">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">5</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Finalists</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">After rigorous evaluation</div>
          </div>
          <div className="glass rounded-xl p-6 border-clean text-center">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">1</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Winner (Rijndael)</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Selected in 2000</div>
          </div>
        </motion.div>

        {/* Why Rijndael Won */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-6 rounded-xl border border-green-500/20 mb-12"
        >
          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center text-xl">
            <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
            Why Rijndael Won the Competition
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Excellent security properties and resistance to attacks',
              'Fast software implementation on various CPUs',
              'Efficient hardware implementation',
              'Simple and elegant design (easy to understand)',
              'Good performance on 8-bit to 64-bit platforms',
              'Flexible key sizes (128, 192, 256 bits)',
              'Low memory requirements',
              'Suitable for both software and hardware'
            ].map((reason, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Impact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="glass rounded-xl p-6 border-clean mb-12"
        >
          <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-xl flex items-center">
            <Globe className="h-6 w-6 mr-2 text-cyan-600 dark:text-cyan-400" />
            Global Impact
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Where AES is Used</h5>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <li>• SSL/TLS encryption (HTTPS)</li>
                <li>• VPN protocols (IPSec, OpenVPN)</li>
                <li>• Disk encryption (BitLocker, FileVault)</li>
                <li>• Wi-Fi security (WPA2, WPA3)</li>
                <li>• Database encryption</li>
                <li>• Cloud storage encryption</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Adoption by Industry</h5>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <li>• U.S. Government (NSA approved)</li>
                <li>• Financial institutions worldwide</li>
                <li>• Major tech companies (Google, Microsoft, Apple)</li>
                <li>• Healthcare systems</li>
                <li>• Military and defense</li>
                <li>• Critical infrastructure</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="text-center"
        >
          <div className="glass rounded-2xl p-8 border-clean">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ready to Explore AES?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Try our interactive encryption tool to see AES in action
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/encrypt">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary inline-flex items-center space-x-2 px-6 py-3 rounded-lg"
                >
                  <Lock className="h-5 w-5" />
                  <span>Start Encrypting</span>
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </Link>
              
              <Link to="/decrypt">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary inline-flex items-center space-x-2 px-6 py-3 rounded-lg"
                >
                  <Eye className="h-5 w-5" />
                  <span>Try Decryption</span>
                </motion.button>
              </Link>
              
              <Link to="/compare">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary inline-flex items-center space-x-2 px-6 py-3 rounded-lg"
                >
                  <TrendingUp className="h-5 w-5" />
                  <span>Compare Variants</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AESHistory;

