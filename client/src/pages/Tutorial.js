import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronDown, 
  Lock, 
  ArrowRight, 
  Key,
  Shield,
  Eye,
  Play,
  CheckCircle,
  Code,
  Info,
  AlertTriangle,
  Zap,
  File,
  Users,
  TrendingUp,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Tutorial = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});
  const [copiedCode, setCopiedCode] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(prev => ({ ...prev, [id]: true }));
    toast.success('Code copied!');
    setTimeout(() => {
      setCopiedCode(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const tutorialSteps = [
    {
      title: 'What is AES?',
      content: 'The Advanced Encryption Standard (AES) is a symmetric encryption algorithm used worldwide to secure data.',
      icon: Shield
    },
    {
      title: 'AES Variants',
      content: 'AES comes in three variants: AES-128 (10 rounds), AES-192 (12 rounds), and AES-256 (14 rounds).',
      icon: Key
    },
    {
      title: 'Four Main Operations',
      content: 'AES uses four operations: SubBytes, ShiftRows, MixColumns, and AddRoundKey.',
      icon: Lock
    },
    {
      title: 'Try It Yourself',
      content: 'Use our interactive tool to encrypt your own data and see the process step by step.',
      icon: Play
    }
  ];

  const sections = [
    {
      id: 'introduction',
      title: 'Introduction to AES',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            The Advanced Encryption Standard (AES) is a symmetric block cipher algorithm that encrypts and decrypts data in fixed-size blocks. 
            It was established by the U.S. National Institute of Standards and Technology (NIST) in 2001 and has become the global standard for encryption.
          </p>
          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg border border-gray-200 dark:border-white/10">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <Info className="h-4 w-4 mr-2 text-cyan-600 dark:text-cyan-400" />
              Key Facts
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• Block size: 128 bits (16 bytes)</li>
              <li>• Key sizes: 128, 192, or 256 bits</li>
              <li>• Symmetric encryption (same key for encrypt/decrypt)</li>
              <li>• Used by governments, banks, and tech companies worldwide</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'operations',
      title: 'AES Operations Explained',
      icon: Zap,
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-300">
            AES uses four fundamental operations that transform the data in each round. Understanding these operations is key to understanding AES.
          </p>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-4 rounded-lg border border-cyan-500/20">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">1. SubBytes (Substitution)</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Each byte in the state matrix is replaced with another byte using a lookup table called the S-box. 
                This provides non-linearity to the cipher.
              </p>
              <div className="bg-gray-900 dark:bg-black p-3 rounded font-mono text-xs text-green-400 overflow-x-auto">
                <div className="flex items-center justify-between mb-2">
                  <span>Example: Byte 0x19 → 0xD4</span>
                  <button
                    onClick={() => copyToClipboard('0x19 → S-box → 0xD4', 'subbytes')}
                    className="text-gray-400 hover:text-white"
                  >
                    {copiedCode.subbytes ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-lg border border-purple-500/20">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">2. ShiftRows (Permutation)</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Rows of the state matrix are cyclically shifted left. Row 0 stays unchanged, Row 1 shifts by 1, 
                Row 2 by 2, and Row 3 by 3 positions.
              </p>
              <div className="bg-gray-900 dark:bg-black p-3 rounded font-mono text-xs text-purple-400 overflow-x-auto">
                <div className="flex items-center justify-between mb-2">
                  <span>Before: [a b c d] → After: [a b c d] (no shift)</span>
                  <button
                    onClick={() => copyToClipboard('[a b c d] → [b c d a]', 'shiftrows')}
                    className="text-gray-400 hover:text-white"
                  >
                    {copiedCode.shiftrows ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <span className="text-gray-500">Row 1: [e f g h] → [f g h e]</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-4 rounded-lg border border-green-500/20">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">3. MixColumns (Mixing)</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Each column is multiplied by a fixed matrix using Galois Field (GF) arithmetic. 
                This operation mixes the bytes within each column.
              </p>
              <div className="bg-gray-900 dark:bg-black p-3 rounded font-mono text-xs text-green-400 overflow-x-auto">
                <div className="flex items-center justify-between mb-2">
                  <span>Uses GF(2⁸) multiplication</span>
                  <button
                    onClick={() => copyToClipboard('Column × Fixed Matrix = New Column', 'mixcolumns')}
                    className="text-gray-400 hover:text-white"
                  >
                    {copiedCode.mixcolumns ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 p-4 rounded-lg border border-orange-500/20">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">4. AddRoundKey (XOR)</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Each byte of the state is XORed with the corresponding byte of the round key. 
                This is the only operation that uses the encryption key.
              </p>
              <div className="bg-gray-900 dark:bg-black p-3 rounded font-mono text-xs text-orange-400 overflow-x-auto">
                <div className="flex items-center justify-between mb-2">
                  <span>State ⊕ RoundKey = New State</span>
                  <button
                    onClick={() => copyToClipboard('State ⊕ RoundKey = New State', 'addroundkey')}
                    className="text-gray-400 hover:text-white"
                  >
                    {copiedCode.addroundkey ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'rounds',
      title: 'AES Rounds & Key Expansion',
      icon: Key,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            AES performs multiple rounds of transformation. The number of rounds depends on the key size, 
            and each round uses a different round key derived from the original key.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-cyan-500/10 p-4 rounded-lg border border-cyan-500/20">
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">AES-128</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">10 rounds</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Key: 16 bytes</div>
            </div>
            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">AES-192</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">12 rounds</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Key: 24 bytes</div>
            </div>
            <div className="bg-pink-500/10 p-4 rounded-lg border border-pink-500/20">
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400 mb-1">AES-256</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">14 rounds</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Key: 32 bytes</div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg border border-gray-200 dark:border-white/10">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Key Expansion Process</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              The original key is expanded into multiple round keys using the key expansion algorithm:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <li>Original key is split into words (4 bytes each)</li>
              <li>Each round key is generated from previous words</li>
              <li>Uses rotation, S-box substitution, and XOR with round constants</li>
              <li>Produces (Nr + 1) round keys, where Nr is the number of rounds</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'modes',
      title: 'AES Modes of Operation',
      icon: File,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            AES can operate in different modes to handle data larger than a single block. Each mode has different security and performance characteristics.
          </p>
          
          <div className="space-y-3">
            <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                    CBC (Cipher Block Chaining)
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Each block is XORed with the previous ciphertext block before encryption. Requires an Initialization Vector (IV).
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ✓ Secure for most use cases<br/>
                    ✓ Recommended for file encryption<br/>
                    ✗ Cannot be parallelized
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600 dark:text-yellow-400" />
                    ECB (Electronic Codebook)
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Each block is encrypted independently with the same key. Simple but less secure.
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ✓ Simple and fast<br/>
                    ✗ Not secure for repeated patterns<br/>
                    ✗ Not recommended for production
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Best Practices</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <li>• Always use CBC mode for file encryption</li>
              <li>• Generate a random IV for each encryption</li>
              <li>• Never reuse the same IV with the same key</li>
              <li>• Use PKCS7 padding for block alignment</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Security Features & Best Practices',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            AES is considered secure when implemented correctly. Here are important security considerations and best practices.
          </p>
          
          <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <Shield className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
              Why AES is Secure
            </h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <li>✓ Resistant to known cryptanalytic attacks</li>
              <li>✓ No practical attacks faster than brute force</li>
              <li>✓ Efficient implementation on various platforms</li>
              <li>✓ Widely tested and analyzed by cryptographers</li>
            </ul>
          </div>

          <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-red-600 dark:text-red-400" />
              Common Mistakes to Avoid
            </h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <li>✗ Using weak or predictable keys</li>
              <li>✗ Reusing IVs with the same key</li>
              <li>✗ Using ECB mode for sensitive data</li>
              <li>✗ Storing keys in plaintext</li>
              <li>✗ Using insecure key derivation methods</li>
            </ul>
          </div>

          <div className="bg-cyan-500/10 p-4 rounded-lg border border-cyan-500/20">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Key Management</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Proper key management is crucial for security:
            </p>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <li>• Generate keys using cryptographically secure random number generators</li>
              <li>• Use PBKDF2 or similar for password-based key derivation</li>
              <li>• Store keys securely (use key management systems)</li>
              <li>• Rotate keys periodically</li>
              <li>• Never share keys over insecure channels</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'examples',
      title: 'Practical Examples & Use Cases',
      icon: Code,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Here are real-world examples of how AES is used and what you can do with our tool.
          </p>
          
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg border border-gray-200 dark:border-white/10">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <File className="h-4 w-4 mr-2 text-cyan-600 dark:text-cyan-400" />
                File Encryption
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Encrypt sensitive files before storing or transmitting them:
              </p>
              <div className="bg-gray-900 dark:bg-black p-3 rounded font-mono text-xs text-green-400 overflow-x-auto">
                <div className="flex items-center justify-between mb-1">
                  <span>1. Upload your file</span>
                  <button
                    onClick={() => copyToClipboard('Upload file → Select AES variant → Encrypt', 'file-example')}
                    className="text-gray-400 hover:text-white"
                  >
                    {copiedCode['file-example'] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <div className="text-gray-500">2. Choose AES-256 for maximum security</div>
                <div className="text-gray-500">3. Download encrypted file</div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg border border-gray-200 dark:border-white/10">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <Key className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                Password-Based Encryption
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Use a password instead of a hex key (PBKDF2 key derivation):
              </p>
              <div className="bg-gray-900 dark:bg-black p-3 rounded font-mono text-xs text-purple-400 overflow-x-auto">
                <div className="flex items-center justify-between mb-1">
                  <span>Password: "MySecurePassword123"</span>
                  <button
                    onClick={() => copyToClipboard('Password → PBKDF2 → AES Key', 'password-example')}
                    className="text-gray-400 hover:text-white"
                  >
                    {copiedCode['password-example'] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <div className="text-gray-500">→ PBKDF2 (100,000 iterations)</div>
                <div className="text-gray-500">→ AES-256 encryption key</div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg border border-gray-200 dark:border-white/10">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                Common Use Cases
              </h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <li>• Encrypting database backups</li>
                <li>• Securing API communications</li>
                <li>• Protecting sensitive documents</li>
                <li>• Encrypting hard drives (with additional layers)</li>
                <li>• Securing cloud storage</li>
                <li>• Protecting email attachments</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'comparison',
      title: 'AES Variants Comparison',
      icon: TrendingUp,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Compare the three AES variants to choose the right one for your needs.
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-white/5">
                  <th className="border border-gray-200 dark:border-white/10 p-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Variant</th>
                  <th className="border border-gray-200 dark:border-white/10 p-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Key Size</th>
                  <th className="border border-gray-200 dark:border-white/10 p-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Rounds</th>
                  <th className="border border-gray-200 dark:border-white/10 p-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Security</th>
                  <th className="border border-gray-200 dark:border-white/10 p-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Performance</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="border border-gray-200 dark:border-white/10 p-3 text-sm font-medium text-gray-900 dark:text-white">AES-128</td>
                  <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-gray-600 dark:text-gray-300">128 bits</td>
                  <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-gray-600 dark:text-gray-300">10</td>
                  <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-green-600 dark:text-green-400">High</td>
                  <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-gray-600 dark:text-gray-300">Fastest</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="border border-gray-200 dark:border-white/10 p-3 text-sm font-medium text-gray-900 dark:text-white">AES-192</td>
                  <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-gray-600 dark:text-gray-300">192 bits</td>
                  <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-gray-600 dark:text-gray-300">12</td>
                  <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-green-600 dark:text-green-400">Very High</td>
                  <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-gray-600 dark:text-gray-300">Medium</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="border border-gray-200 dark:border-white/10 p-3 text-sm font-medium text-gray-900 dark:text-white">AES-256</td>
                  <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-gray-600 dark:text-gray-300">256 bits</td>
                  <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-gray-600 dark:text-gray-300">14</td>
                  <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-green-600 dark:text-green-400">Highest</td>
                  <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-gray-600 dark:text-gray-300">Slowest</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Recommendations</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <li>• <strong>AES-128</strong>: Good for most applications, fastest performance</li>
              <li>• <strong>AES-192</strong>: Balance between security and performance</li>
              <li>• <strong>AES-256</strong>: Maximum security, recommended for highly sensitive data</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

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
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="gradient-text">AES Tutorial</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Learn about the Advanced Encryption Standard through interactive examples and step-by-step explanations
          </p>
        </motion.div>

        {/* Tutorial Steps */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Quick Start Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tutorialSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`glass rounded-xl p-6 border-clean cursor-pointer transition-all duration-300 ${
                    activeStep === index ? 'border-accent bg-cyan-500/10' : 'hover:border-accent'
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${
                      activeStep === index 
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500' 
                        : 'bg-gray-100 dark:bg-white/10'
                    }`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {activeStep === index && <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{step.content}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Learn More</h2>
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass rounded-xl border-clean overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {section.icon && (
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <section.icon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{section.title}</h3>
                </div>
                {expandedSections[section.id] ? (
                  <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                )}
              </button>
              
              {expandedSections[section.id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6"
                >
                  {typeof section.content === 'string' ? (
                    <p className="text-gray-600 dark:text-gray-300">{section.content}</p>
                  ) : (
                    section.content
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="glass rounded-2xl p-8 border-clean">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ready to Try AES?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Use our interactive encryption tool to see AES in action
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

export default Tutorial;
