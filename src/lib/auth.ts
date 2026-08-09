// src/lib/auth.ts
import { AuthOptions, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import User from '@/models/User';
import dbConnect from './db';
import { findUserByEmail } from '@/lib/user/findByEmail';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      email: string;
      phone?: string;
      organizationId?: string | null;
      canUploadVideos?: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: string;
    phone?: string;
    organizationId?: string | null;
    canUploadVideos?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    email: string;
    phone?: string;
    organizationId?: string | null;
    canUploadVideos?: boolean;
  }
}

export const authOptions: AuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        googleIdToken: { label: "Google ID Token", type: "text" },
        firebaseIdToken: { label: "Firebase ID Token", type: "text" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        await dbConnect();

        // Firebase Phone OTP flow
        if (credentials?.firebaseIdToken) {
          const { getAdminAuth } = await import('@/lib/notifications/push/firebase-admin');
          const adminAuth = getAdminAuth();
          if (!adminAuth) throw new Error('Firebase Admin Auth not initialized');

          try {
            const decodedToken = await adminAuth.verifyIdToken(credentials.firebaseIdToken);
            const phoneNumber = decodedToken.phone_number;
            if (!phoneNumber) throw new Error('No phone number found in token');

            let dbUser = await User.findOne({ phone: phoneNumber });

            if (!dbUser) {
              const mockEmail = `phone-${phoneNumber.replace('+', '')}@phone.quizdo.com`;
              dbUser = await User.create({
                name: 'Phone User',
                email: mockEmail,
                phone: phoneNumber,
                role: credentials?.role || 'student',
                isVerified: true,
                provider: 'phone',
              });
            }

            return {
              id: dbUser._id.toString(),
              email: dbUser.email,
              name: dbUser.name,
              role: dbUser.role,
              phone: dbUser.phone || '',
              organizationId: dbUser.organizationId?.toString() || null,
              canUploadVideos: dbUser.canUploadVideos || false,
            };
          } catch (e) {
            console.error('Firebase token verification failed', e);
            throw new Error('Invalid phone login');
          }
        }

        // Native Google Sign-In flow (from React Native app)
        if (credentials?.googleIdToken) {
          const { OAuth2Client } = await import('google-auth-library');
          const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

          try {
            const ticket = await client.verifyIdToken({
              idToken: credentials.googleIdToken,
              // audience: process.env.GOOGLE_CLIENT_ID, // Use backend's client ID, or omit to allow multi-audience
            });
            const payload = ticket.getPayload();
            if (!payload?.email) throw new Error('Invalid Google Token payload');

            const normalizedEmail = payload.email.trim().toLowerCase();
            let dbUser = await findUserByEmail(normalizedEmail);

            if (!dbUser) {
              dbUser = await User.create({
                name: payload.name || 'Google User',
                email: normalizedEmail,
                role: 'student',
                avatar: payload.picture,
                isVerified: true,
                provider: 'google',
              });
            }

            return {
              id: dbUser._id.toString(),
              email: dbUser.email,
              name: dbUser.name,
              role: dbUser.role,
              phone: dbUser.phone || '',
              organizationId: dbUser.organizationId?.toString() || null,
              canUploadVideos: dbUser.canUploadVideos || false,
            };
          } catch (e) {
            console.error('Native Google token verification failed', e);
            throw new Error('Invalid Google login');
          }
        }

        console.log("[Authorize debug] Credentials:", { email: credentials?.email, password: credentials?.password ? '***' : null });

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing email or password');
        }

        console.log("[Authorize debug] User schema paths:", Object.keys(User.schema.paths));

        const user = await findUserByEmail(credentials.email).select('+password');

        console.log("[Authorize debug] DB search result fields:", user ? { id: user._id, email: user.email, name: user.name, hasPassword: Boolean(user.password) } : null);

        if (!user) {
          throw new Error('User not found');
        }

        const isValid = await user.comparePassword(credentials.password);
        console.log("[Authorize debug] password validation result:", isValid);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone || '',
          organizationId: user.organizationId?.toString() || null,
          canUploadVideos: user.canUploadVideos || false,
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth sign in
      if (account?.provider === 'google') {
        if (!user?.email) return false;

        await dbConnect();

        let dbUser = await findUserByEmail(user.email);

        if (!dbUser) {
          const normalizedEmail = user.email.trim().toLowerCase();
          dbUser = await User.create({
            name: user.name || 'Google User',
            email: normalizedEmail,
            role: 'student',
            avatar: user.image,
            isVerified: true,
            provider: 'google',
          });
        }

        user.id = dbUser._id.toString();
        user.role = dbUser.role;
        user.organizationId = dbUser.organizationId?.toString() || null;
        user.canUploadVideos = dbUser.canUploadVideos || false;
        user.phone = dbUser.phone || '';

        return true;
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email || '';
        token.name = user.name || '';
        token.organizationId = user.organizationId || null;
        token.canUploadVideos = user.canUploadVideos || false;
        token.phone = user.phone || '';
      }
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name;
        if (session.phone) token.phone = session.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.email = token.email;
        if (token.name) {
          session.user.name = token.name;
        }
        session.user.phone = token.phone || '';
        session.user.organizationId = token.organizationId || null;
        session.user.canUploadVideos = token.canUploadVideos || false;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};