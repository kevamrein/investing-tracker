import { getPayload } from 'payload'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import config from '../payload.config'
import passwordSecurity from './passwordSecurity'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        isEncoded: { label: 'Is Encoded', type: 'text' }, // Flag to indicate if the password is already securely encoded
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials.password) {
            return null
          }

          const payload = await getPayload({ config })

          // Determine if password was already encoded by the client
          const isEncoded = credentials.isEncoded === 'true'

          // Get the password from credentials
          const providedPassword = credentials.password

          // Find the investor by email - only check the investors collection
          const result = await payload.find({
            collection: 'investors',
            where: {
              email: {
                equals: credentials.email,
              },
            },
          })

          // Check if investor exists
          if (!result.docs || result.docs.length === 0) {
            return null
          }

          const user = result.docs[0]

          // Compare passwords based on encoding status
          let passwordMatches = false

          if (isEncoded) {
            // If client already encoded the password, verify directly
            passwordMatches = providedPassword === user.password
          } else {
            // If password is plaintext, encode it and then compare
            const encodedProvidedPassword =
              passwordSecurity.preparePasswordForTransmission(providedPassword)
            passwordMatches = encodedProvidedPassword === user.password
          }

          if (!passwordMatches) {
            return null
          }

          // Return the user for session handling
          return {
            id: String(user.id),
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            investableAssets: user.investableAssets || 0,
            accessToken: String(user.id),
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Pass attributes from the user to the token
      if (user) {
        token.id = user.id
        token.email = user.email
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.investableAssets = user.investableAssets
        token.accessToken = user.accessToken
      }
      return token
    },
    async session({ session, token }) {
      // Pass attributes from the token to the session
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.investableAssets = token.investableAssets as number
        session.accessToken = token.accessToken as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login', // Correct custom sign-in page path
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development', // Enable debug logs in development
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
}

// Augment next-auth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      investableAssets: number
    }
    accessToken: string
  }

  interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    investableAssets: number
    accessToken: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    firstName: string
    lastName: string
    investableAssets: number
    accessToken: string
  }
}
