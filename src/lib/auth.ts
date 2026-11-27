// src/lib/auth.ts
import { AuthOptions, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import User from '@/models/User';
import Organization from '@/models/Organization';
import dbConnect from './db';
import { findUserByEmail } from '@/lib/user/findByEmail';
import {
  resolveOrganizationInvite,
  sanitizeRegistrationRole,
} from '@/lib/organizations/resolveInvite';
import {
  isRegistrationAllowed,
  isTeacherRegistrationAllowed,
} from '@/lib/settingsHelpers';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      email: string;
      phone?: string;
      organizationId?: string | null;
      organizationName?: string | null;
      organizationLogo?: string | null;
      organizationColor?: string | null;
      canUploadVideos?: boolean;
      canCreateContests?: boolean;
      canGenerateAiQuizzes?: boolean;
      limits?: {
        courses?: number;
        quizzes?: number;
        blogs?: number;
        aiQuizGenerations?: number;
        aiQuizMaxQuestions?: number;
      };
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: string;
    phone?: string;
    organizationId?: string | null;
    organizationName?: string | null;
    organizationLogo?: string | null;
    organizationColor?: string | null;
    canUploadVideos?: boolean;
    canCreateContests?: boolean;
    canGenerateAiQuizzes?: boolean;
    limits?: {
      courses?: number;
      quizzes?: number;
      blogs?: number;
      aiQuizGenerations?: number;
      aiQuizMaxQuestions?: number;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    email: string;
    phone?: string;
    organizationId?: string | null;
    organizationName?: string | null;
    organizationLogo?: string | null;
    organizationColor?: string | null;
    canUploadVideos?: boolean;
    canCreateContests?: boolean;
    canGenerateAiQuizzes?: boolean;
    limits?: {
      courses?: number;
      quizzes?: number;
      blogs?: number;
      aiQuizGenerations?: number;
      aiQuizMaxQuestions?: number;
    };
    suspended?: boolean;
    lastValidatedAt?: number;
  }
}

interface OrgSnapshot {
  isActive?: boolean;
  name?: string;
  logo?: string | null;
  primaryColor?: string | null;
  permissions?: {
    canUploadVideos?: boolean;
    canCreatePublicCourses?: boolean;
    canCreateContests?: boolean;
    canGenerateAiQuizzes?: boolean;
  };
}

interface UserSnapshot {
  _id: { toString(): string };
  name?: string;
  email: string;
  phone?: string;
  role: string;
  isSuspended?: boolean;
  organizationId?: { toString(): string } | null;
  canUploadVideos?: boolean;
  canCreateContests?: boolean;
  canGenerateAiQuizzes?: boolean;
  limits?: {
    courses?: number;
    quizzes?: number;
    blogs?: number;
    aiQuizGenerations?: number;
    aiQuizMaxQuestions?: number;
  };
}

const JWT_REVALIDATE_INTERVAL_MS = 60_000;

async function fetchActiveOrgOrThrow(
  organizationId?: { toString(): string } | string | null
): Promise<OrgSnapshot | null> {
  if (!organizationId) return null;
  const org = await Organization.findById(organizationId)
    .select('isActive name logo primaryColor permissions')
    .lean<OrgSnapshot>();
  if (!org || org.isActive === false) {
    throw new Error('Your organization is currently inactive');
  }
  return org;
}

function computeEffectiveFlags(user: UserSnapshot, org: OrgSnapshot | null) {
  if (user.role === 'superadmin') {
    return {
      canUploadVideos: true,
      canCreateContests: true,
      canGenerateAiQuizzes: true,
    };
  }
  if (org) {
    const orgPerms = org.permissions || {};
    const isOrgAdmin = user.role === 'admin';
    return {
      canUploadVideos: Boolean(orgPerms.canUploadVideos && (isOrgAdmin || user.canUploadVideos)),
      canCreateContests: Boolean(orgPerms.canCreateContests && (isOrgAdmin || user.canCreateContests)),
      canGenerateAiQuizzes: Boolean(
        orgPerms.canGenerateAiQuizzes && (isOrgAdmin || user.canGenerateAiQuizzes)
      ),
    };
  }
  return {
    canUploadVideos: Boolean(user.canUploadVideos),
    canCreateContests: Boolean(user.canCreateContests),
    canGenerateAiQuizzes: Boolean(user.canGenerateAiQuizzes),
  };
}

function toAuthUserPayload(user: UserSnapshot, org: OrgSnapshot | null) {
  const flags = computeEffectiveFlags(user, org);
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name || '',
    role: user.role,
    phone: user.phone || '',
    organizationId: user.organizationId?.toString() || null,
    organizationName: org?.name || null,
    organizationLogo: org?.logo || null,
    organizationColor: org?.primaryColor || null,
    canUploadVideos: flags.canUploadVideos,
    canCreateContests: flags.canCreateContests,
    canGenerateAiQuizzes: flags.canGenerateAiQuizzes,
    limits: user.limits,
  };
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
      authorization: {
        params: {
          prompt: 'select_account',
        },
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        googleIdToken: { label: 'Google ID Token', type: 'text' },
        firebaseIdToken: { label: 'Firebase ID Token', type: 'text' },
        role: { label: 'Role', type: 'text' },
        inviteCode: { label: 'Invite Code', type: 'text' },
        platform: { label: 'Platform', type: 'text' },
      },
      async authorize(credentials) {
        await dbConnect();

        // Firebase Phone OTP flow
        if (credentials?.firebaseIdToken) {
          const { getAdminAuth } = await import('@/lib/notifications/push/firebase-admin');
          const adminAuth = getAdminAuth();
          if (!adminAuth) throw new Error('Firebase Admin Auth not initialized');

          let phoneNumber: string | undefined;
          try {
            const decodedToken = await adminAuth.verifyIdToken(credentials.firebaseIdToken);
            phoneNumber = decodedToken.phone_number;
          } catch (e) {
            console.error('Firebase token verification failed', e);
            throw new Error('Invalid phone login');
          }
          if (!phoneNumber) throw new Error('No phone number found in token');

          let dbUser = await User.findOne({ phone: phoneNumber });

          if (!dbUser) {
            if (!(await isRegistrationAllowed())) {
              throw new Error('Registration is currently disabled by admin');
            }
            const role = sanitizeRegistrationRole(credentials?.role);
            if (!role) {
              throw new Error('Invalid registration role');
            }

            let organizationId = null;
            const rawInviteCode = credentials?.inviteCode?.trim();
            if (rawInviteCode) {
              const resolved = await resolveOrganizationInvite(rawInviteCode, role);
              if (!resolved.ok) {
                throw new Error(resolved.message);
              }
              organizationId = resolved.data.organization._id;
            } else if (role === 'teacher' && !(await isTeacherRegistrationAllowed())) {
              throw new Error('Teacher registration is currently disabled by admin');
            }

            const mockEmail = `phone-${phoneNumber.replace('+', '')}@phone.quizdo.com`;
            dbUser = await User.create({
              name: 'Phone User',
              email: mockEmail,
              phone: phoneNumber,
              role,
              organizationId,
              isVerified: true,
              provider: 'phone',
              lastActiveAt: new Date(),
              lastPlatform: 'android',
            });
          } else {
            if (dbUser.isSuspended) {
              throw new Error('Your account has been suspended');
            }
            // If existing unassigned user supplied a valid invite code, join them safely
            const rawInviteCode = credentials?.inviteCode?.trim();
            if (!dbUser.organizationId && rawInviteCode) {
              const joinRole = dbUser.role === 'teacher' ? 'teacher' : 'student';
              const resolved = await resolveOrganizationInvite(rawInviteCode, joinRole);
              if (resolved.ok) {
                dbUser.organizationId = resolved.data.organization._id;
                await dbUser.save();
              }
            }
            await User.findByIdAndUpdate(dbUser._id, {
              $set: { lastActiveAt: new Date(), lastPlatform: 'android' },
            });
          }

          const org = await fetchActiveOrgOrThrow(dbUser.organizationId);
          return toAuthUserPayload(dbUser, org);
        }

        // Native Google Sign-In flow (from React Native app / web)
        if (credentials?.googleIdToken) {
          const { OAuth2Client } = await import('google-auth-library');

          const isMobileApp =
            credentials.platform === 'mobile' ||
            credentials.platform === 'android' ||
            credentials.platform === 'ios';

          const targetClientId = isMobileApp
            ? process.env.GOOGLE_MOBILE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
            : process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_MOBILE_CLIENT_ID;

          const client = new OAuth2Client(targetClientId);

          let payload;
          try {
            const ticket = await client.verifyIdToken({
              idToken: credentials.googleIdToken,
              audience: [
                targetClientId,
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_MOBILE_CLIENT_ID,
              ].filter(Boolean) as string[],
            });
            payload = ticket.getPayload();
          } catch (e) {
            console.error('Native Google token verification failed', e);
            throw new Error('Invalid Google login');
          }

          if (!payload?.email || payload.email_verified !== true) {
            throw new Error('Google email is not verified');
          }

          const normalizedEmail = payload.email.trim().toLowerCase();
          let dbUser = await findUserByEmail(normalizedEmail);
          const platform = isMobileApp ? 'android' : 'web';

          if (!dbUser) {
            if (!(await isRegistrationAllowed())) {
              throw new Error('Registration is currently disabled by admin');
            }
            const role = sanitizeRegistrationRole(credentials?.role);
            if (!role) {
              throw new Error('Invalid registration role');
            }

            let organizationId = null;
            const rawInviteCode = credentials?.inviteCode?.trim();
            if (rawInviteCode) {
              const resolved = await resolveOrganizationInvite(rawInviteCode, role);
              if (!resolved.ok) {
                throw new Error(resolved.message);
              }
              organizationId = resolved.data.organization._id;
            } else if (role === 'teacher' && !(await isTeacherRegistrationAllowed())) {
              throw new Error('Teacher registration is currently disabled by admin');
            }

            dbUser = await User.create({
              name: payload.name || 'Google User',
              email: normalizedEmail,
              role,
              organizationId,
              avatar: payload.picture,
              isVerified: true,
              provider: 'google',
              lastActiveAt: new Date(),
              lastPlatform: platform,
            });
          } else {
            if (dbUser.isSuspended) {
              throw new Error('Your account has been suspended');
            }
            const rawInviteCode = credentials?.inviteCode?.trim();
            if (!dbUser.organizationId && rawInviteCode) {
              const joinRole = dbUser.role === 'teacher' ? 'teacher' : 'student';
              const resolved = await resolveOrganizationInvite(rawInviteCode, joinRole);
              if (resolved.ok) {
                dbUser.organizationId = resolved.data.organization._id;
                await dbUser.save();
              }
            }
            await User.findByIdAndUpdate(dbUser._id, {
              $set: { lastActiveAt: new Date(), lastPlatform: platform },
            });
          }

          const org = await fetchActiveOrgOrThrow(dbUser.organizationId);
          return toAuthUserPayload(dbUser, org);
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid email or password');
        }

        const user = await findUserByEmail(credentials.email).select('+password');

        if (!user) {
          throw new Error('Invalid email or password');
        }

        const isValid = await user.comparePassword(credentials.password);

        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        if (user.isSuspended) {
          throw new Error('Your account has been suspended');
        }

        const org = await fetchActiveOrgOrThrow(user.organizationId);

        await User.findByIdAndUpdate(user._id, {
          $set: { lastActiveAt: new Date() },
        });

        return toAuthUserPayload(user, org);
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth sign in
      if (account?.provider === 'google') {
        if (!user?.email) return false;

        await dbConnect();

        let requestedRole: 'student' | 'teacher' = 'student';
        let rawInviteCode = '';
        try {
          const { cookies } = await import('next/headers');
          const cookieStore = await cookies();
          const roleCookie = cookieStore.get('google-auth-role');
          const safeRole = sanitizeRegistrationRole(roleCookie?.value);
          if (safeRole) {
            requestedRole = safeRole;
          }
          const inviteCookie = cookieStore.get('google-auth-invite-code');
          if (inviteCookie?.value) {
            rawInviteCode = decodeURIComponent(inviteCookie.value).trim();
          }
        } catch (e) {
          console.error('Error reading google auth cookies:', e);
        }

        let dbUser = await findUserByEmail(user.email);

        if (!dbUser) {
          if (!(await isRegistrationAllowed())) {
            return false;
          }

          let role: 'student' | 'teacher' = requestedRole;
          let organizationId = null;

          if (rawInviteCode) {
            const resolved = await resolveOrganizationInvite(rawInviteCode, role);
            if (resolved.ok) {
              organizationId = resolved.data.organization._id;
            } else if (role === 'teacher') {
              // If user attempted Google signup with a student invite code while role cookie was teacher,
              // safely downgrade to student if valid for student; otherwise reject.
              const studentFallback = await resolveOrganizationInvite(rawInviteCode, 'student');
              if (!studentFallback.ok) {
                return false;
              }
              role = 'student';
              organizationId = studentFallback.data.organization._id;
            } else {
              return false;
            }
          } else if (role === 'teacher' && !(await isTeacherRegistrationAllowed())) {
            role = 'student';
          }

          const normalizedEmail = user.email.trim().toLowerCase();
          dbUser = await User.create({
            name: user.name || 'Google User',
            email: normalizedEmail,
            role,
            organizationId,
            avatar: user.image,
            isVerified: true,
            provider: 'google',
            lastActiveAt: new Date(),
            lastPlatform: 'web',
          });
        } else {
          if (dbUser.isSuspended) {
            return false;
          }
          if (!dbUser.organizationId && rawInviteCode) {
            const joinRole = dbUser.role === 'teacher' ? 'teacher' : 'student';
            const resolved = await resolveOrganizationInvite(rawInviteCode, joinRole);
            if (resolved.ok) {
              dbUser.organizationId = resolved.data.organization._id;
              await dbUser.save();
            }
          }
          await User.findByIdAndUpdate(dbUser._id, {
            $set: { lastActiveAt: new Date() },
          });
        }

        let org: OrgSnapshot | null = null;
        try {
          org = await fetchActiveOrgOrThrow(dbUser.organizationId);
        } catch {
          return false;
        }

        const payload = toAuthUserPayload(dbUser, org);
        user.id = payload.id;
        user.role = payload.role;
        user.organizationId = payload.organizationId;
        user.organizationName = payload.organizationName;
        user.organizationLogo = payload.organizationLogo;
        user.organizationColor = payload.organizationColor;
        user.canUploadVideos = payload.canUploadVideos;
        user.canCreateContests = payload.canCreateContests;
        user.canGenerateAiQuizzes = payload.canGenerateAiQuizzes;
        user.phone = payload.phone;
        user.limits = payload.limits;

        return true;
      }

      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email || '';
        token.name = user.name || '';
        token.organizationId = user.organizationId || null;
        token.organizationName = user.organizationName || null;
        token.organizationLogo = user.organizationLogo || null;
        token.organizationColor = user.organizationColor || null;
        token.canUploadVideos = user.canUploadVideos || false;
        token.canCreateContests = user.canCreateContests || false;
        token.canGenerateAiQuizzes = user.canGenerateAiQuizzes || false;
        token.phone = user.phone || '';
        token.limits = user.limits || token.limits;
        token.suspended = false;
        token.lastValidatedAt = Date.now();
        return token;
      }

      // Authoritative DB hydration on session update OR periodic revalidation
      // Never trust client-supplied session payload for role, organizationId, or permissions.
      const shouldRevalidate =
        Boolean(token.id) &&
        (trigger === 'update' ||
          !token.lastValidatedAt ||
          Date.now() - token.lastValidatedAt > JWT_REVALIDATE_INTERVAL_MS);

      if (shouldRevalidate && token.id) {
        try {
          await dbConnect();
          const dbUser = await User.findById(token.id)
            .select(
              'name email phone role isSuspended organizationId canUploadVideos canCreateContests canGenerateAiQuizzes limits'
            )
            .lean<UserSnapshot>();

          if (!dbUser || dbUser.isSuspended) {
            token.id = '';
            token.suspended = true;
            token.organizationId = null;
            return token;
          }

          let org: OrgSnapshot | null = null;
          if (dbUser.organizationId) {
            org = await Organization.findById(dbUser.organizationId)
              .select('isActive name logo primaryColor permissions')
              .lean<OrgSnapshot>();
            if (!org || org.isActive === false) {
              token.id = '';
              token.suspended = true;
              token.organizationId = null;
              return token;
            }
          }

          const payload = toAuthUserPayload(dbUser, org);
          token.id = payload.id;
          token.role = payload.role;
          token.email = payload.email;
          token.name = payload.name;
          token.phone = payload.phone;
          token.organizationId = payload.organizationId;
          token.organizationName = payload.organizationName;
          token.organizationLogo = payload.organizationLogo;
          token.organizationColor = payload.organizationColor;
          token.canUploadVideos = payload.canUploadVideos;
          token.canCreateContests = payload.canCreateContests;
          token.canGenerateAiQuizzes = payload.canGenerateAiQuizzes;
          token.limits = payload.limits;
          token.suspended = false;
          token.lastValidatedAt = Date.now();
        } catch {
          // On transient DB errors, keep existing token claims without granting new privileges
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        if (token.suspended || !token.id) {
          session.user.id = '';
          session.user.role = '';
          session.user.organizationId = null;
          return session;
        }
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.email = token.email;
        if (token.name) {
          session.user.name =
            typeof token.name === 'string'
              ? token.name
                  .split(' ')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ')
              : token.name;
        }
        session.user.phone = token.phone || '';
        session.user.organizationId = token.organizationId || null;
        session.user.organizationName = token.organizationName || null;
        session.user.organizationLogo = token.organizationLogo || null;
        session.user.organizationColor = token.organizationColor || null;
        session.user.canUploadVideos = token.canUploadVideos || false;
        session.user.canCreateContests = token.canCreateContests || false;
        session.user.canGenerateAiQuizzes = token.canGenerateAiQuizzes || false;
        session.user.limits = token.limits;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
