import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextResponse } from 'next/server'
import passwordSecurity from '@/lib/passwordSecurity'

// export async function POST(request: Request) {
//   try {
//     const body = await request.json()
//     const { email, password, securePassword, firstName, lastName, isEncoded } = body

//     // Basic validation
//     if (!email || !password) {
//       return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
//     }

//     const payload = await getPayload({ config })

//     // Check if user already exists
//     const existingUser = await payload.find({
//       collection: 'investors',
//       where: {
//         email: {
//           equals: email,
//         },
//       },
//     })

//     if (existingUser.docs.length > 0) {
//       return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 })
//     }

//     // Ensure we have an encoded password to store
//     // Use the secure password provided by the client, or encode it here
//     const passwordToStore =
//       securePassword || passwordSecurity.preparePasswordForTransmission(password)

//     // Create the user with the encoded password
//     const user = await payload.create({
//       collection: 'investors',
//       data: {
//         email,
//         password: passwordToStore, // Store the encoded password in the password field
//         firstName,
//         lastName,
//       },
//     })

//     // Return the created user without the password
//     const { password: _, ...userWithoutPassword } = user

//     return NextResponse.json(userWithoutPassword, { status: 201 })
//   } catch (error) {
//     console.error('Registration error:', error)
//     return NextResponse.json({ message: 'An error occurred during registration' }, { status: 500 })
//   }
// }
