#!/usr/bin/env python3
"""
AES Encryption Tool Demo
This script demonstrates the AES implementation with example inputs.
"""

from aes_implementation import AES
import json

def print_matrix(matrix, title):
    """Print a 4x4 matrix in a nice format"""
    print(f"\n{title}:")
    print("+" + "-" * 25 + "+")
    for row in matrix:
        print("| " + " ".join(f"{byte:02X}" for byte in row) + " |")
    print("+" + "-" * 25 + "+")

def demo_aes():
    """Run AES encryption demos"""
    print("=" * 60)
    print("🔐 AES Encryption Tool Demo")
    print("=" * 60)
    
    # Test data
    message = "00112233445566778899aabbccddeeff"
    key_128 = "000102030405060708090a0b0c0d0e0f"
    key_192 = "000102030405060708090a0b0c0d0e0f1011121314151617"
    key_256 = "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f"
    
    print(f"📝 Message: {message}")
    print(f"🔑 AES-128 Key: {key_128}")
    print(f"🔑 AES-192 Key: {key_192}")
    print(f"🔑 AES-256 Key: {key_256}")
    
    # AES-128 Demo
    print("\n" + "=" * 40)
    print("🔒 AES-128 Encryption Demo")
    print("=" * 40)
    
    aes128 = AES(128)
    result128 = aes128.encrypt(message, key_128)
    
    print(f"✅ AES-128 Final Ciphertext: {result128['final_ciphertext']}")
    print(f"📊 Number of rounds: {len([r for r in result128['rounds'] if r['round'] == 0]) + len(set(r['round'] for r in result128['rounds'])) - 1}")
    
    # Show initial state
    initial_state = [[int(byte, 16) for byte in row] for row in result128['initial_state']]
    print_matrix(initial_state, "Initial State")
    
    # Show a few rounds
    print("\n🔍 Sample Round Operations:")
    for i, round_data in enumerate(result128['rounds'][:4]):  # Show first 4 operations
        state = [[int(byte, 16) for byte in row] for row in round_data['state']]
        print_matrix(state, f"Round {round_data['round']} - {round_data['operation']}")
    
    # AES-192 Demo
    print("\n" + "=" * 40)
    print("🔒 AES-192 Encryption Demo")
    print("=" * 40)
    
    aes192 = AES(192)
    result192 = aes192.encrypt(message, key_192)
    print(f"✅ AES-192 Final Ciphertext: {result192['final_ciphertext']}")
    
    # AES-256 Demo
    print("\n" + "=" * 40)
    print("🔒 AES-256 Encryption Demo")
    print("=" * 40)
    
    aes256 = AES(256)
    result256 = aes256.encrypt(message, key_256)
    print(f"✅ AES-256 Final Ciphertext: {result256['final_ciphertext']}")
    
    # Key Expansion Demo
    print("\n" + "=" * 40)
    print("🔑 Key Expansion Demo (AES-128)")
    print("=" * 40)
    
    print("📋 First 3 Round Keys:")
    for i, key_data in enumerate(result128['expanded_key'][:3]):
        key_matrix = [[int(byte, 16) for byte in row] for row in key_data['key']]
        print_matrix(key_matrix, f"Round {key_data['round']} Key")
    
    print("\n" + "=" * 60)
    print("🎉 Demo completed successfully!")
    print("🌐 To see the full interactive interface, run:")
    print("   python3 run_aes.py")
    print("   or")
    print("   ./run_aes.sh")
    print("=" * 60)

if __name__ == "__main__":
    demo_aes()
