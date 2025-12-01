import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  GitCompare, 
  BookOpen, 
  Lock, 
  Eye, 
  Cpu, 
  Sparkles,
  ArrowRight,
  Play,
  Download,
  Star
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: 'AES-128/192/256',
      description: 'Complete implementation of all AES variants with round-by-round visualization',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Eye,
      title: 'Interactive Visualization',
      description: 'Watch encryption happen step-by-step with beautiful 4x4 state matrices',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Cpu,
      title: 'Key Expansion',
      description: 'Detailed view of how keys are expanded for each round',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: GitCompare,
      title: 'Compare Results',
      description: 'Compare different AES variants side-by-side',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: BookOpen,
      title: 'Educational Mode',
      description: 'Learn AES with interactive tutorials and explanations',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Sparkles,
      title: 'Advanced Features',
      description: 'File encryption, batch processing, and performance analysis',
      color: 'from-pink-500 to-rose-500'
    }
  ];

  const stats = [
    { label: 'AES Variants', value: '3', icon: Shield },
    { label: 'Rounds Visualized', value: '10-14', icon: Eye },
    { label: 'Matrix Operations', value: '4', icon: Cpu },
    { label: 'Educational Tools', value: '5+', icon: BookOpen }
  ];

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-8"
            >
              <Shield className="h-10 w-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="gradient-text">AES Encryption</span>
              <br />
              <span className="text-3xl md:text-5xl text-blue-300">Visualization Tool</span>
            </h1>
            
            <p className="text-xl text-blue-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience the Advanced Encryption Standard like never before. 
              Watch every step of the encryption process with stunning visualizations, 
              interactive matrices, and educational tools.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/encrypt"
                  className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Play className="h-5 w-5" />
                  <span>Start Encrypting</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/tutorial"
                  className="inline-flex items-center space-x-2 px-8 py-4 glass text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Learn AES</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-center glass rounded-xl p-6 border border-white/20"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-blue-300 font-medium">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Everything you need to understand, visualize, and work with AES encryption
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  className="glass rounded-xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 group"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-blue-200 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-12 border border-white/20"
          >
            <div className="flex justify-center mb-8">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Explore AES?
            </h2>
            <p className="text-xl text-blue-200 mb-8">
              Join thousands of students and professionals who use our tool to master AES encryption
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/encrypt"
                  className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Zap className="h-5 w-5" />
                  <span>Start Now</span>
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button className="inline-flex items-center space-x-2 px-8 py-4 glass text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 border border-white/20">
                  <Download className="h-5 w-5" />
                  <span>Download Tool</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
