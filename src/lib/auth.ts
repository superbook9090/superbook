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
      organizationId?: string | null;
      canUploadVideos?: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: string;
    organizationId?: string | null;
    canUploadVideos?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    email: string;
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
        googleIdToken: { label: "Google ID Token", type: "text" }
      },
      async authorize(credentials) {
        await dbConnect();

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
              organizationId: dbUser.organizationId?.toString() || null,
              canUploadVideos: dbUser.canUploadVideos || false,
            };
          } catch (e) {
            console.error('Native Google token verification failed', e);
            throw new Error('Invalid Google login');
          }
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing email or password');
        }

        const user = await findUserByEmail(credentials.email).select('+password');

        if (!user) {
          throw new Error('User not found');
        }

        const isValid = await user.comparePassword(credentials.password);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
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
      }
      if (trigger === 'update' && session?.name) {
        token.name = session.name;
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