// src/lib/passwordSecurity.ts
import crypto from 'crypto'

/**
 * Password security utilities for encoding and hashing passwords
 */
class PasswordSecurity {
  private secretKey: string
  private seed: string

  constructor() {
    // In production, these should be environment variables
    this.secretKey =
      process.env.PASSWORD_SECRET_KEY || 'investment-tracker-secret-key-change-in-production'
    this.seed = process.env.PASSWORD_SEED || 'investment-tracker-seed-change-in-production'
  }

  /**
   * Create a secure hash using the password and seed
   */
  private createSecureHash(password: string): string {
    const hash = crypto
      .createHmac('sha256', this.secretKey)
      .update(`${password}${this.seed}`)
      .digest('hex')

    return hash
  }

  /**
   * Encode a password with base64 after hashing it
   */
  encodePassword(password: string): string {
    const hash = this.createSecureHash(password)
    return Buffer.from(hash).toString('base64')
  }

  /**
   * Verify if a plaintext password matches a stored encoded password
   */
  verifyPassword(plainPassword: string, encodedPassword: string): boolean {
    const encodedPlain = this.encodePassword(plainPassword)
    return encodedPlain === encodedPassword
  }

  /**
   * Prepare a password for sending to the server during login
   * This adds an additional layer of security for password transmission
   */
  preparePasswordForTransmission(password: string): string {
    // Hash the password with the seed and secret key
    const hash = this.createSecureHash(password)

    // Encode with base64 for transmission
    const base64Password = Buffer.from(hash).toString('base64')

    return base64Password
  }
}

// Create a singleton instance of the PasswordSecurity class
const passwordSecurity = new PasswordSecurity()
export default passwordSecurity
