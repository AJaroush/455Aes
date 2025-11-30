import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  Unlock,
  BookOpen, 
  ArrowRight,
  Lock,
  Eye,
  Key,
  File,
  CheckCircle,
  Star,
  Users,
  Award,
  TrendingUp
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Zap,
      title: 'AES Encryption',
      description: 'Encrypt data with AES-128, AES-192, or AES-256. Support for text and file encryption with password-based keys.',
      link: '/encrypt',
      color: 'from-cyan-500 to-blue-500',
      highlights: ['File Encryption', 'Password Keys', 'Real-time Visualization']
    },
    {
      icon: Unlock,
      title: 'AES Decryption',
      description: 'Decrypt encrypted data with full round-by-round visualization. Supports CBC and ECB modes.',
      link: '/decrypt',
      color: 'from-purple-500 to-pink-500',
      highlights: ['File Decryption', 'CBC/ECB Support', 'Step-by-step View']
    },
    {
      icon: BookOpen,
      title: 'Interactive Tutorial',
      description: 'Learn AES step by step with visualizations and detailed explanations',
      link: '/tutorial',
      color: 'from-purple-500 to-pink-500',
      highlights: ['Step-by-step', 'Visual Learning', 'Educational']
    }
  ];

  const keyFeatures = [
    {
      icon: File,
      title: 'File Encryption',
      description: 'Encrypt files of any type with drag-and-drop support',
      color: 'text-cyan-400'
    },
    {
      icon: Key,
      title: 'Password-Based Keys',
      description: 'Use PBKDF2 to derive secure keys from passwords',
      color: 'text-purple-400'
    },
    {
      icon: Shield,
      title: 'Multiple AES Variants',
      description: 'Support for AES-128, AES-192, and AES-256',
      color: 'text-blue-400'
    },
    {
      icon: Eye,
      title: 'Interactive Visualization',
      description: 'Watch encryption happen round-by-round with beautiful animations',
      color: 'text-pink-400'
    },
    {
      icon: Lock,
      title: 'Secure & Private',
      description: 'All processing happens client-side. Your data never leaves your browser.',
      color: 'text-green-400'
    },
    {
      icon: TrendingUp,
      title: 'Performance Metrics',
      description: 'Track encryption speed and efficiency in real-time',
      color: 'text-yellow-400'
    }
  ];

  const stats = [
    { label: 'AES Variants', value: '3' },
    { label: 'Key Modes', value: '2' },
    { label: 'File Support', value: '100%' },
    { label: 'Version', value: '2.0.0' }
  ];

  return (
    <div className="pt-16 min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl mb-8">
              <Shield className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">AES Encryption</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-6 leading-relaxed">
              Professional-grade AES encryption tool with file support, password-based keys, 
              and interactive visualizations. Perfect for education and secure data protection.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span>100% Client-Side</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span>No Data Collection</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span>Open Source</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span>Free Forever</span>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            {stats.map((stat, index) => (
              <div key={index} className="glass rounded-xl p-6 border-clean">
                <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          >
            <Link
              to="/encrypt"
              className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg flex items-center space-x-2 group"
            >
              <Zap className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              <span>Start Encrypting</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to="/decrypt"
              className="px-8 py-4 rounded-xl font-semibold text-lg flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all group"
            >
              <Unlock className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              <span>Start Decrypting</span>
            </Link>
            
            <Link
              to="/tutorial"
              className="btn-secondary px-8 py-4 rounded-xl font-semibold text-lg flex items-center space-x-2"
            >
              <BookOpen className="h-5 w-5" />
              <span>Learn AES</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to understand and work with AES encryption
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Link
                    to={feature.link}
                    className="block glass rounded-2xl p-8 border-clean hover:border-accent transition-all duration-300 card-hover h-full"
                  >
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{feature.description}</p>
                    
                    {feature.highlights && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {feature.highlights.map((highlight, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded text-xs text-gray-600 dark:text-gray-400">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center text-cyan-600 dark:text-cyan-400 font-medium">
                      <span>Explore</span>
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Our AES Tool?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need for secure encryption and learning
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass rounded-xl p-6 border-clean hover:border-accent transition-all duration-300"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 bg-gray-100 dark:bg-white/5`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">How AES Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              The Advanced Encryption Standard uses four main operations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Lock, title: 'SubBytes', description: 'Non-linear substitution using S-box' },
              { icon: ArrowRight, title: 'ShiftRows', description: 'Cyclic left shift of rows' },
              { icon: Key, title: 'MixColumns', description: 'Linear transformation of columns' },
              { icon: Shield, title: 'AddRoundKey', description: 'XOR with round key' }
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl mb-6">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass rounded-xl p-6 border-clean">
                <Users className="h-12 w-12 text-cyan-600 dark:text-cyan-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">1000+</div>
                <div className="text-gray-600 dark:text-gray-400">Students Learning</div>
              </div>
              <div className="glass rounded-xl p-6 border-clean">
                <Award className="h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">4.9/5</div>
                <div className="text-gray-600 dark:text-gray-400">User Rating</div>
              </div>
              <div className="glass rounded-xl p-6 border-clean">
                <Star className="h-12 w-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">100%</div>
                <div className="text-gray-600 dark:text-gray-400">Open Source</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">AES Tool</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Professional-grade AES encryption tool for education and secure data protection.
              </p>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link to="/encrypt" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">Encrypt</Link>
                <Link to="/decrypt" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">Decrypt</Link>
                <Link to="/tutorial" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">Tutorial</Link>
                <Link to="/about" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">About</Link>
              </div>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Features</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div>✓ File Encryption</div>
                <div>✓ Password-Based Keys</div>
                <div>✓ Interactive Visualization</div>
                <div>✓ Multiple AES Variants</div>
              </div>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-gray-200 dark:border-white/10">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © 2025 AES Encryption Tool v2.0.0 • Built for learning cryptography
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
