'use server'

import config from '@/payload.config'
import { getPayload } from 'payload'

export async function registerUser(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string

  if (!email || !password) {
    return { success: false, message: 'Email and password are required' }
  }

  try {
    const payload = await getPayload({ config })

    // Check if user already exists
    const existingUser = await payload.find({
      collection: 'investors',
      where: {
        email: {
          equals: email,
        },
      },
    })

    if (existingUser.docs.length > 0) {
      return { success: false, message: 'User with this email already exists' }
    }

    // Create the user with the encoded password
    const user = await payload.create({
      collection: 'investors',
      data: {
        email,
        password,
        firstName,
        lastName,
      },
    })

    return { success: true, user }
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, message: 'An error occurred during registration' }
  }
}
