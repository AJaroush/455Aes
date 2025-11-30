import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Code, Users, Heart, Github, ExternalLink, Award, Zap, User, File, Lock, Key, Hash, Star, CheckCircle } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Shield,
      title: 'Complete AES Implementation',
      description: 'Full implementation of AES-128, AES-192, and AES-256 with all operations'
    },
    {
      icon: File,
      title: 'File Encryption',
      description: 'Encrypt files of any type with drag-and-drop support and automatic download'
    },
    {
      icon: Key,
      title: 'Password-Based Keys',
      description: 'PBKDF2 key derivation for secure password-to-key conversion'
    },
    {
      icon: Lock,
      title: 'Secure Key Generation',
      description: 'Cryptographically secure random key and IV generation'
    },
    {
      icon: Hash,
      title: 'Integrity Verification',
      description: 'SHA-256 checksums for file integrity verification'
    },
    {
      icon: Code,
      title: 'Interactive Visualization',
      description: 'Watch encryption happen step-by-step with beautiful matrix animations'
    },
    {
      icon: Users,
      title: 'Educational Focus',
      description: 'Designed for learning with tutorials, explanations, and examples'
    },
    {
      icon: Zap,
      title: 'Modern Interface',
      description: 'Built with React and modern web technologies for the best experience'
    }
  ];

  const technologies = [
    { name: 'React', description: 'Frontend framework' },
    { name: 'Framer Motion', description: 'Animations' },
    { name: 'Tailwind CSS', description: 'Styling' },
    { name: 'Python', description: 'Backend implementation' },
    { name: 'Flask', description: 'Web server' },
    { name: 'JavaScript', description: 'Client-side logic' }
  ];

  const stats = [
    { label: 'AES Variants', value: '3', icon: Shield },
    { label: 'Operations', value: '4', icon: Code },
    { label: 'Rounds Visualized', value: '10-14', icon: Zap },
    { label: 'Version', value: '2.0.0', icon: Star }
  ];

  const changelog = [
    {
      version: '2.0.0',
      date: '2025',
      features: [
        'File encryption/decryption with drag-and-drop',
        'Password-based key derivation (PBKDF2)',
        'Secure random key generation',
        'SHA-256 integrity verification',
        'Encryption history tracking',
        'Enhanced UI with tooltips and validation',
        'Copy/Save key functionality',
        'Professional polish and error handling'
      ]
    },
    {
      version: '1.0.0',
      date: '2025',
      features: [
        'Initial release',
        'AES-128/192/256 encryption',
        'Interactive round visualization',
        'Key expansion visualization',
        'Matrix state visualization'
      ]
    }
  ];

  const teamMembers = [
    { name: 'Ahmad Jaroush', role: 'Developer' },
    { name: 'Carl Wakim', role: 'Developer' },
    { name: 'Lea Nasrallah', role: 'Developer' },
    { name: 'Yasmina El Jamal', role: 'Developer' },
    { name: 'Tatiana Kaado', role: 'Developer' }
  ];

  return (
    <div className="pt-16 min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-8"
          >
            <Shield className="h-10 w-10 text-white" />
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="gradient-text">About AES Tool</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            A comprehensive AES encryption tool developed for educational purposes. 
            This project demonstrates the Advanced Encryption Standard (AES) implementation 
            with interactive visualizations and step-by-step encryption processes.
          </p>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 border-clean mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Development Team</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              This project was developed by a team of computer science students 
              as part of an educational cryptography course.
            </p>
          </div>

          <div className="flex flex-nowrap justify-center gap-6 overflow-x-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center p-6 glass rounded-xl border-clean hover:border-accent transition-all duration-300 flex-shrink-0 w-[180px]"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg mb-4">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">{member.name}</div>
                <div className="text-cyan-600 dark:text-cyan-300 text-sm">{member.role}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 border-clean mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Project Goals</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              To provide a practical understanding of AES encryption through 
              interactive demonstrations and educational visualizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-center p-6 glass rounded-xl border-clean"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="glass rounded-xl p-6 border-clean hover:border-accent transition-all duration-300"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg mb-4">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 border-clean mb-16"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-8">Technology Stack</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {technologies.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center p-4 glass rounded-lg border-clean hover:border-accent transition-all duration-300"
              >
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">{tech.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{tech.description}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Educational Impact */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 border-clean mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Educational Impact</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              This tool demonstrates AES encryption implementation for educational purposes, 
              showing the step-by-step process of data encryption.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Students</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Educational tool for computer science students learning about encryption algorithms.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Developers</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Useful for developers who need to understand AES implementation details.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Educators</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Valuable resource for cryptography instructors and course materials.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Project Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 border-clean mb-16"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-6">
              <Github className="h-8 w-8 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">Project Information</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
              This educational project demonstrates AES encryption implementation 
              and is available for academic and learning purposes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary inline-flex items-center space-x-2 px-6 py-3 rounded-lg"
              >
                <Github className="h-5 w-5" />
                <span>View on GitHub</span>
                <ExternalLink className="h-4 w-4" />
              </motion.a>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary inline-flex items-center space-x-2 px-6 py-3 rounded-lg"
              >
                <Heart className="h-5 w-5" />
                <span>Contribute</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Changelog */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 border-clean mb-16"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-8">Version History</h2>
          
          <div className="space-y-6">
            {changelog.map((release, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="p-6 glass rounded-xl border-clean"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                      <span className="text-white font-bold">v{release.version}</span>
                    </div>
                    <span className="text-gray-400">{release.date}</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {release.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start space-x-2 text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="glass rounded-xl p-6 border-clean mb-6">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Shield className="h-8 w-8 text-cyan-400" />
              <div className="text-left">
                <div className="text-2xl font-bold text-white">AES Encryption Tool</div>
                <div className="text-cyan-300">Version 2.0.0</div>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Professional-grade AES encryption with file support, password-based keys, and interactive visualizations
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <span>✓ AES-128/192/256</span>
              <span>✓ File Encryption</span>
              <span>✓ PBKDF2 Key Derivation</span>
              <span>✓ SHA-256 Integrity</span>
            </div>
          </div>
          <p className="text-gray-300 mb-4">
            Developed for educational and professional use
          </p>
          <p className="text-white/60 text-sm">
            © 2025 AES Encryption Tool v2.0.0
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
