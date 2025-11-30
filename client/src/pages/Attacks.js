/**
 * Attacks Page Component
 * 
 * Educational page about AES attacks and vulnerabilities
 * 
 * Content Sections:
 * - Theoretical Attacks: Related-key attacks, differential cryptanalysis, etc.
 * - Side-Channel Attacks: Timing attacks, power analysis, cache attacks
 * - Implementation Attacks: Fault injection, key recovery
 * - Real-World Attacks: Historical attacks on AES implementations
 * - Protocol-Level Attacks: Padding oracle, chosen-plaintext attacks
 * - Best Practices: Recommendations for secure AES usage
 * 
 * Features:
 * - Expandable/collapsible sections
 * - Severity indicators
 * - Mitigation strategies
 * - Affected AES variants
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye, 
  Target,
  AlertCircle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Key,
  Clock,
  Cpu,
  FileText
} from 'lucide-react';

const Attacks = () => {
  // Track which attack sections are expanded
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const attackCategories = [
    {
      id: 'theoretical',
      title: 'Theoretical Attacks',
      icon: Target,
      color: 'from-red-500 to-orange-500',
      attacks: [
        {
          id: 'related-key',
          name: 'Related-Key Attacks',
          severity: 'Medium',
          description: 'Attacks that exploit weaknesses when multiple keys are related in a predictable way.',
          details: [
            'AES-192 and AES-256 are vulnerable to related-key attacks',
            'Requires attacker to have access to encryption/decryption with related keys',
            'The attacker can derive relationships between keys',
            'Practical impact is limited as related keys are rarely used in practice',
            'AES-128 is more resistant to these attacks'
          ],
          mitigation: 'Use independent, randomly generated keys. Avoid key derivation schemes that create predictable key relationships.',
          affected: ['AES-192', 'AES-256']
        },
        {
          id: 'meet-middle',
          name: 'Meet-in-the-Middle Attack',
          severity: 'Low',
          description: 'A cryptanalytic technique that attempts to find a key by meeting in the middle of encryption and decryption.',
          details: [
            'Works by encrypting from one end and decrypting from the other',
            'Requires significant computational resources',
            'More effective against reduced-round versions of AES',
            'Full AES (10/12/14 rounds) is resistant to this attack',
            'Theoretical attack with limited practical applicability'
          ],
          mitigation: 'Use full-round AES implementations. Ensure proper key management and rotation.',
          affected: ['All variants (theoretical)']
        },
        {
          id: 'differential',
          name: 'Differential Cryptanalysis',
          severity: 'Low',
          description: 'A chosen-plaintext attack that analyzes how differences in input affect differences in output.',
          details: [
            'Requires large number of chosen plaintext-ciphertext pairs',
            'AES was specifically designed to resist differential cryptanalysis',
            'The S-box and MixColumns operations provide strong resistance',
            'Would require 2^126 operations for AES-128 (computationally infeasible)',
            'More of a theoretical concern than practical threat'
          ],
          mitigation: 'AES design already incorporates resistance. Use proper implementation without modifications.',
          affected: ['All variants (theoretical)']
        },
        {
          id: 'linear',
          name: 'Linear Cryptanalysis',
          severity: 'Low',
          description: 'A known-plaintext attack that exploits linear approximations of non-linear components.',
          details: [
            'Requires large number of known plaintext-ciphertext pairs',
            'AES S-box provides strong resistance to linear cryptanalysis',
            'Would require 2^126 operations for AES-128 (computationally infeasible)',
            'The MixColumns operation adds additional resistance',
            'Not a practical threat to properly implemented AES'
          ],
          mitigation: 'AES design provides inherent resistance. Ensure standard implementation without weaknesses.',
          affected: ['All variants (theoretical)']
        }
      ]
    },
    {
      id: 'side-channel',
      title: 'Side-Channel Attacks',
      icon: Eye,
      color: 'from-purple-500 to-pink-500',
      attacks: [
        {
          id: 'timing',
          name: 'Timing Attacks',
          severity: 'High',
          description: 'Attacks that exploit timing variations in cryptographic operations to infer secret information.',
          details: [
            'Measures time taken for encryption/decryption operations',
            'Can reveal information about key bits or intermediate values',
            'Cache timing attacks exploit CPU cache behavior',
            'Branch prediction timing can leak information',
            'Requires precise timing measurements and multiple operations'
          ],
          mitigation: 'Use constant-time implementations. Avoid data-dependent branches and table lookups. Use hardware acceleration.',
          affected: ['All variants (implementation-dependent)']
        },
        {
          id: 'power',
          name: 'Power Analysis Attacks',
          severity: 'High',
          description: 'Attacks that analyze power consumption patterns during cryptographic operations.',
          details: [
            'Simple Power Analysis (SPA): Direct observation of power consumption',
            'Differential Power Analysis (DPA): Statistical analysis of power traces',
            'Correlation Power Analysis (CPA): More advanced statistical techniques',
            'Requires physical access to the device',
            'Can extract secret keys from embedded systems'
          ],
          mitigation: 'Use power analysis resistant implementations. Add noise, use masking techniques, or hardware security modules.',
          affected: ['All variants (hardware-dependent)']
        },
        {
          id: 'electromagnetic',
          name: 'Electromagnetic Analysis',
          severity: 'Medium',
          description: 'Attacks that analyze electromagnetic emissions from cryptographic devices.',
          details: [
            'Similar to power analysis but uses EM emissions',
            'Can be performed at a distance (near-field)',
            'Requires specialized equipment',
            'More difficult than power analysis but still effective',
            'Can reveal key information from smart cards and embedded devices'
          ],
          mitigation: 'Use EM shielding, reduce EM emissions, implement countermeasures similar to power analysis.',
          affected: ['All variants (hardware-dependent)']
        },
        {
          id: 'cache',
          name: 'Cache Attacks',
          severity: 'High',
          description: 'Attacks that exploit CPU cache behavior to extract secret information.',
          details: [
            'Flush+Reload: Attacker flushes cache and monitors reload timing',
            'Prime+Probe: Attacker primes cache and probes access patterns',
            'Spectre/Meltdown variants exploit speculative execution',
            'Can extract keys from shared systems (cloud, VMs)',
            'Does not require physical access'
          ],
          mitigation: 'Use constant-time implementations. Disable hyperthreading. Use cache partitioning. Keep systems updated.',
          affected: ['All variants (implementation-dependent)']
        }
      ]
    },
    {
      id: 'implementation',
      title: 'Implementation Attacks',
      icon: Cpu,
      color: 'from-blue-500 to-cyan-500',
      attacks: [
        {
          id: 'padding-oracle',
          name: 'Padding Oracle Attack',
          severity: 'High',
          description: 'Attacks that exploit error messages or timing differences related to padding validation.',
          details: [
            'Exploits differences in error messages for invalid padding',
            'Can decrypt ciphertext without knowing the key',
            'Works against CBC mode with PKCS#7 padding',
            'Requires ability to submit ciphertext and observe errors',
            'Can be performed remotely if error messages leak information'
          ],
          mitigation: 'Use authenticated encryption (GCM, CCM). Validate padding in constant time. Don\'t leak error information.',
          affected: ['CBC mode', 'CFB mode', 'OFB mode']
        },
        {
          id: 'chosen-ciphertext',
          name: 'Chosen-Ciphertext Attack',
          severity: 'Medium',
          description: 'Attacks where the attacker can choose ciphertexts and observe decryption results.',
          details: [
            'Attacker submits chosen ciphertexts to decryption oracle',
            'Observes decryption results or error messages',
            'Can reveal information about the key or plaintext',
            'Padding oracle attacks are a type of chosen-ciphertext attack',
            'Requires access to decryption functionality'
          ],
          mitigation: 'Use authenticated encryption modes. Implement proper access controls. Validate and sanitize inputs.',
          affected: ['ECB mode', 'CBC mode (without authentication)']
        },
        {
          id: 'key-recovery',
          name: 'Key Recovery Attacks',
          severity: 'Critical',
          description: 'Attacks that attempt to recover the encryption key directly.',
          details: [
            'Brute force: Try all possible keys (computationally infeasible for AES)',
            'Weak key attacks: Exploit weak or predictable keys',
            'Key schedule weaknesses: Exploit flaws in key expansion',
            'Side-channel attacks can lead to key recovery',
            'Most dangerous type of attack if successful'
          ],
          mitigation: 'Use strong, randomly generated keys. Implement proper key management. Use key derivation functions (PBKDF2, Argon2).',
          affected: ['All variants (key-dependent)']
        },
        {
          id: 'fault',
          name: 'Fault Injection Attacks',
          severity: 'High',
          description: 'Attacks that introduce faults (errors) during computation to extract secret information.',
          details: [
            'Voltage glitching: Temporarily reduce voltage to cause errors',
            'Clock glitching: Manipulate clock signal',
            'Laser fault injection: Use laser to cause bit flips',
            'Can bypass security checks or extract keys',
            'Requires physical access to the device'
          ],
          mitigation: 'Use fault detection mechanisms. Implement redundant computations. Use tamper-resistant hardware.',
          affected: ['All variants (hardware-dependent)']
        }
      ]
    },
    {
      id: 'real-world',
      title: 'Real-World Attacks',
      icon: AlertCircle,
      color: 'from-red-600 to-red-500',
      attacks: [
        {
          id: 'padding-oracle-real',
          name: 'Padding Oracle Attack on ASP.NET (2010)',
          severity: 'Critical',
          description: 'A practical padding oracle attack that affected millions of ASP.NET applications.',
          details: [
            'Discovered by security researchers Juliano Rizzo and Thai Duong',
            'Exploited error messages in ASP.NET that revealed padding validation failures',
            'Allowed attackers to decrypt any ciphertext without knowing the key',
            'Affected all ASP.NET applications using default encryption',
            'Microsoft issued emergency patches (MS10-070)',
            'Demonstrated that padding oracle attacks are practical, not just theoretical'
          ],
          mitigation: 'Microsoft patched the vulnerability. Use authenticated encryption modes. Validate padding in constant time.',
          affected: ['ASP.NET applications', 'CBC mode implementations'],
          year: '2010'
        },
        {
          id: 'bleichenbacher',
          name: 'BEAST Attack (2011)',
          severity: 'High',
          description: 'Browser Exploit Against SSL/TLS attack that exploited CBC mode weaknesses.',
          details: [
            'Discovered by Thai Duong and Juliano Rizzo',
            'Exploited predictable IVs in TLS 1.0 CBC mode',
            'Allowed attackers to decrypt HTTPS traffic',
            'Affected millions of websites using TLS 1.0',
            'Required JavaScript injection (man-in-the-middle)',
            'Led to deprecation of TLS 1.0 and 1.1'
          ],
          mitigation: 'Upgrade to TLS 1.2 or higher. Use authenticated encryption (AEAD ciphers). Disable TLS 1.0/1.1.',
          affected: ['TLS 1.0', 'TLS 1.1', 'CBC mode in SSL/TLS'],
          year: '2011'
        },
        {
          id: 'lucky-13',
          name: 'Lucky 13 Attack (2013)',
          severity: 'High',
          description: 'A timing attack against TLS implementations using CBC mode with HMAC.',
          details: [
            'Discovered by Nadhem AlFardan and Kenny Paterson',
            'Exploited timing differences in MAC verification',
            'Could decrypt HTTPS traffic by measuring response times',
            'Affected OpenSSL, GnuTLS, and other TLS implementations',
            'Required millions of requests but was practical',
            'Demonstrated importance of constant-time implementations'
          ],
          mitigation: 'Use constant-time MAC verification. Upgrade TLS libraries. Prefer AEAD ciphers (GCM, ChaCha20-Poly1305).',
          affected: ['TLS implementations', 'CBC-HMAC mode'],
          year: '2013'
        },
        {
          id: 'cache-timing',
          name: 'CacheBleed Attack (2016)',
          severity: 'High',
          description: 'A cache-based side-channel attack that extracted AES keys from OpenSSL.',
          details: [
            'Discovered by Yuval Yarom and Daniel Genkin',
            'Exploited CPU cache timing to extract AES keys',
            'Affected OpenSSL implementations on shared systems',
            'Could extract keys from cloud VMs and shared hosting',
            'Required no physical access to the target',
            'Demonstrated vulnerability of shared cloud infrastructure'
          ],
          mitigation: 'Use constant-time AES implementations. Disable hyperthreading. Use cache partitioning. Keep libraries updated.',
          affected: ['OpenSSL', 'Shared cloud systems', 'VMs'],
          year: '2016'
        },
        {
          id: 'meltdown-spectre',
          name: 'Meltdown & Spectre (2018)',
          severity: 'Critical',
          description: 'Hardware vulnerabilities that could leak AES keys through speculative execution.',
          details: [
            'Discovered by multiple research teams (Google Project Zero, etc.)',
            'Exploited CPU speculative execution to read memory',
            'Could extract AES keys from kernel memory',
            'Affected virtually all modern CPUs (Intel, AMD, ARM)',
            'Required no special privileges',
            'Led to massive industry-wide patching effort',
            'Performance impact from mitigations'
          ],
          mitigation: 'Apply CPU microcode updates. Use updated operating systems. Enable mitigations. Use hardware security modules.',
          affected: ['All modern CPUs', 'All AES implementations'],
          year: '2018'
        },
        {
          id: 'rowhammer-aes',
          name: 'Rowhammer Attacks on AES (2015-2020)',
          severity: 'High',
          description: 'Hardware attacks that corrupt AES keys stored in DRAM.',
          details: [
            'Exploited DRAM row-hammer vulnerability',
            'Could flip bits in AES keys stored in memory',
            'Led to key corruption and potential recovery',
            'Required physical access or malicious code',
            'Affected various systems including Android devices',
            'Demonstrated importance of secure key storage'
          ],
          mitigation: 'Use ECC memory. Implement memory scrubbing. Use secure enclaves. Store keys in protected memory.',
          affected: ['Systems with vulnerable DRAM', 'Mobile devices'],
          year: '2015-2020'
        },
        {
          id: 'power-analysis-real',
          name: 'Power Analysis on Smart Cards (Multiple)',
          severity: 'High',
          description: 'Practical power analysis attacks that successfully extracted AES keys from smart cards.',
          details: [
            'Multiple documented cases of successful key extraction',
            'Used differential power analysis (DPA) techniques',
            'Affected various smart card implementations',
            'Required physical access to the card',
            'Demonstrated vulnerability of unprotected hardware',
            'Led to development of power-analysis resistant implementations'
          ],
          mitigation: 'Use power-analysis resistant implementations. Add noise and masking. Use hardware security modules. Implement countermeasures.',
          affected: ['Smart cards', 'Embedded systems', 'Unprotected hardware'],
          year: '2000s-2010s'
        },
        {
          id: 'ecb-pattern',
          name: 'ECB Pattern Leakage (Multiple)',
          severity: 'High',
          description: 'Real-world cases where ECB mode revealed sensitive information through patterns.',
          details: [
            'Multiple documented cases of pattern leakage',
            'Image encryption revealed structure through identical blocks',
            'Database encryption showed patterns in encrypted data',
            'Allowed partial plaintext recovery',
            'Common mistake in implementations',
            'Demonstrated why ECB should not be used'
          ],
          mitigation: 'Never use ECB for multiple blocks. Use CBC, CTR, or authenticated modes. Educate developers.',
          affected: ['ECB mode implementations'],
          year: 'Multiple'
        }
      ]
    },
    {
      id: 'protocol',
      title: 'Protocol-Level Attacks',
      icon: FileText,
      color: 'from-green-500 to-emerald-500',
      attacks: [
        {
          id: 'ecb-weakness',
          name: 'ECB Mode Weaknesses',
          severity: 'High',
          description: 'Electronic Codebook mode reveals patterns in plaintext through identical ciphertext blocks.',
          details: [
            'Identical plaintext blocks produce identical ciphertext blocks',
            'Patterns in plaintext are visible in ciphertext',
            'Not semantically secure',
            'Vulnerable to pattern analysis',
            'Should never be used for encrypting multiple blocks'
          ],
          mitigation: 'Use CBC, CTR, or authenticated modes (GCM) instead. ECB should only be used for single-block encryption.',
          affected: ['ECB mode only']
        },
        {
          id: 'iv-reuse',
          name: 'IV Reuse Attacks',
          severity: 'High',
          description: 'Attacks that exploit reuse of initialization vectors in CBC or CTR mode.',
          details: [
            'Reusing IV in CBC mode leaks information about plaintext',
            'CTR mode becomes completely insecure with IV reuse',
            'Can lead to complete key recovery',
            'Common implementation mistake',
            'Each encryption must use a unique IV'
          ],
          mitigation: 'Always use cryptographically secure random IVs. Never reuse IVs. Use IV/nonce generation from secure RNG.',
          affected: ['CBC mode', 'CTR mode', 'CFB mode', 'OFB mode']
        },
        {
          id: 'birthday',
          name: 'Birthday Attack',
          severity: 'Medium',
          description: 'Attacks that exploit the birthday paradox to find collisions.',
          details: [
            'Applies to hash functions and MAC algorithms',
            'For HMAC-SHA256, requires 2^128 operations (secure)',
            'For shorter MACs, can find collisions more easily',
            'Can be used to forge authenticated messages',
            'Less relevant for AES itself but affects authentication'
          ],
          mitigation: 'Use full-length MACs (256 bits). Implement proper authentication. Use authenticated encryption modes.',
          affected: ['Authentication mechanisms']
        }
      ]
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mb-6">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            <span className="gradient-text">AES Security & Attacks</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6">
            Understanding potential vulnerabilities and attack vectors against AES encryption
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-gray-700 dark:text-gray-300">Educational Purpose</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <Info className="h-4 w-4 text-blue-400" />
              <span className="text-gray-700 dark:text-gray-300">AES is Still Secure</span>
            </div>
          </div>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl"
        >
          <div className="flex items-start space-x-4">
            <Info className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Important Security Note
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                AES remains one of the most secure encryption algorithms available today. The attacks described here are either 
                theoretical (computationally infeasible), require specific implementation weaknesses, or need physical access to devices. 
                When properly implemented with strong keys and secure modes, AES provides excellent security for your data.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Attack Categories */}
        <div className="space-y-8">
          {attackCategories.map((category, categoryIndex) => {
            const CategoryIcon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                className="glass rounded-2xl p-6 border-clean"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`p-3 bg-gradient-to-r ${category.color} rounded-lg`}>
                    <CategoryIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {category.title}
                  </h2>
                </div>

                <div className="space-y-4">
                  {category.attacks.map((attack, attackIndex) => {
                    const isExpanded = expandedSections[attack.id];
                    return (
                      <motion.div
                        key={attack.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: attackIndex * 0.05 }}
                        className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden"
                      >
                        <motion.button
                          onClick={() => toggleSection(attack.id)}
                          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center space-x-4 flex-1 text-left">
                            <AlertTriangle className={`h-5 w-5 ${attack.severity === 'Critical' ? 'text-red-400' : attack.severity === 'High' ? 'text-orange-400' : 'text-yellow-400'}`} />
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {attack.name}
                                </h3>
                                <span className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(attack.severity)}`}>
                                  {attack.severity}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {attack.description}
                              </p>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </motion.button>

                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10"
                          >
                            <div className="space-y-4">
                              {/* Details */}
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                  <Info className="h-4 w-4 mr-2 text-blue-400" />
                                  Attack Details
                                </h4>
                                <ul className="space-y-2">
                                  {attack.details.map((detail, idx) => (
                                    <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                                      <span className="text-blue-400 mt-1">•</span>
                                      <span>{detail}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Mitigation */}
                              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center">
                                  <Shield className="h-4 w-4 mr-2" />
                                  Mitigation Strategies
                                </h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {attack.mitigation}
                                </p>
                              </div>

                              {/* Affected Variants */}
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                  <Target className="h-4 w-4 mr-2 text-orange-400" />
                                  Affected AES Variants/Modes
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {attack.affected.map((variant, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded text-xs font-medium"
                                    >
                                      {variant}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Year (for real-world attacks) */}
                              {attack.year && (
                                <div className="p-2 bg-gray-200 dark:bg-gray-800 rounded">
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    <Clock className="h-3 w-3 inline mr-1" />
                                    Discovered/Reported: {attack.year}
                                  </span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Best Practices Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 glass rounded-2xl p-8 border-clean"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Best Practices for Secure AES Implementation
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h3 className="font-semibold text-green-400 mb-2 flex items-center">
                  <Key className="h-4 w-4 mr-2" />
                  Key Management
                </h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Use cryptographically secure random key generation</li>
                  <li>• Implement proper key storage and protection</li>
                  <li>• Use key derivation functions (PBKDF2, Argon2)</li>
                  <li>• Rotate keys regularly</li>
                  <li>• Never hardcode keys in source code</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h3 className="font-semibold text-blue-400 mb-2 flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  Mode Selection
                </h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Use authenticated encryption (GCM, CCM) when possible</li>
                  <li>• Avoid ECB mode for multiple blocks</li>
                  <li>• Always use unique IVs/nonces</li>
                  <li>• Prefer CBC or CTR for non-authenticated modes</li>
                  <li>• Validate and authenticate all encrypted data</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <h3 className="font-semibold text-purple-400 mb-2 flex items-center">
                  <Cpu className="h-4 w-4 mr-2" />
                  Implementation Security
                </h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Use constant-time implementations</li>
                  <li>• Avoid data-dependent branches</li>
                  <li>• Protect against timing attacks</li>
                  <li>• Use hardware acceleration when available</li>
                  <li>• Keep cryptographic libraries updated</li>
                </ul>
              </div>

              <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <h3 className="font-semibold text-orange-400 mb-2 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  General Security
                </h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Validate all inputs and outputs</li>
                  <li>• Use secure random number generators</li>
                  <li>• Implement proper error handling</li>
                  <li>• Don't leak information through errors</li>
                  <li>• Follow defense-in-depth principles</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Conclusion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl"
        >
          <div className="flex items-start space-x-4">
            <CheckCircle className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Conclusion
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                While various attack vectors exist, AES remains highly secure when properly implemented. The attacks described 
                here primarily target implementation weaknesses rather than the algorithm itself. By following best practices, 
                using strong keys, selecting appropriate modes, and implementing proper security measures, AES provides robust 
                protection for your sensitive data. Always stay informed about new vulnerabilities and keep your implementations 
                updated with the latest security patches.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Attacks;

