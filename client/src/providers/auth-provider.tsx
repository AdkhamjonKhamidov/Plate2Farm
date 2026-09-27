import * as Linking from 'expo-linking';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Profile } from '@/lib/database.types';
import { getDemoAccount } from '@/lib/demo-data';
import { getProfile, updateProfile as saveProfile } from '@/lib/food-listings';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import type { SignUpInput } from '@/lib/validation';
import { normalizeEmail } from '@/lib/validation';

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  profileError: string | null;
  callbackError: string | null;
  authEvent: AuthChangeEvent | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<{ needsEmailConfirmation: boolean }>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  saveProfile: (updates: Pick<Profile, 'full_name' | 'organization_name' | 'phone'>) => Promise<void>;
  clearCallbackError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function createAuthCallbackUrl(mode?: 'recovery') {
  const callbackUrl =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? new URL('/auth-callback', window.location.origin).toString()
      : Linking.createURL('auth-callback');

  return mode === 'recovery' ? `${callbackUrl}?mode=recovery` : callbackUrl;
}

async function consumeAuthUrl(url: string) {
  const client = getSupabaseClient();
  const queryString = url.split('?')[1]?.split('#')[0] ?? '';
  const fragment = url.split('#')[1] ?? '';
  const query = new URLSearchParams(queryString);
  const tokens = new URLSearchParams(fragment);
  const errorDescription = query.get('error_description') ?? tokens.get('error_description');
  if (errorDescription) {
    throw new Error(errorDescription);
  }

  const code = query.get('code');
  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) {
      throw error;
    }
    return;
  }

  const tokenHash = query.get('token_hash');
  const otpType = query.get('type');
  if (
    tokenHash &&
    (otpType === 'signup' ||
      otpType === 'invite' ||
      otpType === 'magiclink' ||
      otpType === 'recovery' ||
      otpType === 'email_change' ||
      otpType === 'email')
  ) {
    const { error } = await client.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    });
    if (error) {
      throw error;
    }
    return;
  }

  const accessToken = tokens.get('access_token');
  const refreshToken = tokens.get('refresh_token');
  if (accessToken && refreshToken) {
    const { error } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) {
      throw error;
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [callbackError, setCallbackError] = useState<string | null>(null);
  const [authEvent, setAuthEvent] = useState<AuthChangeEvent | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    let active = true;
    const client = getSupabaseClient();

    const loadUserProfile = async (userId: string) => {
      try {
        const nextProfile = await getProfile(userId);
        if (active) {
          setProfile(nextProfile);
          setProfileError(null);
        }
      } catch (error) {
        if (active) {
          setProfile(null);
          setProfileError(getErrorMessage(error));
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    const { data } = client.auth.onAuthStateChange((event, nextSession) => {
      if (!active) {
        return;
      }
      setAuthEvent(event);
      setSession(nextSession);

      if (!nextSession) {
        setProfile(null);
        setProfileError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        if (active) {
          void loadUserProfile(nextSession.user.id);
        }
      }, 0);
    });

    const urlSubscription =
      Platform.OS === 'web'
        ? null
        : Linking.addEventListener('url', ({ url }) => {
            void consumeAuthUrl(url).catch((error: unknown) => {
              if (active) {
                setCallbackError(getErrorMessage(error));
              }
            });
          });

    const appStateSubscription =
      Platform.OS === 'web'
        ? null
        : AppState.addEventListener('change', (nextState) => {
            if (nextState === 'active') {
              client.auth.startAutoRefresh();
            } else {
              client.auth.stopAutoRefresh();
            }
          });

    void (async () => {
      try {
        const initialUrl = Platform.OS === 'web' ? null : await Linking.getInitialURL();
        if (initialUrl) {
          await consumeAuthUrl(initialUrl);
        }
        const { data: sessionData, error } = await client.auth.getSession();
        if (error) {
          throw error;
        }
        if (!active) {
          return;
        }
        if (sessionData.session) {
          setSession(sessionData.session);
          await loadUserProfile(sessionData.session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        if (active) {
          setCallbackError(getErrorMessage(error));
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
      data.subscription.unsubscribe();
      urlSubscription?.remove();
      appStateSubscription?.remove();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      isLoading,
      profileError,
      callbackError,
      authEvent,
      signIn: async (email, password) => {
        const demoAccount = getDemoAccount(email, password);
        if (demoAccount) {
          const now = Math.floor(Date.now() / 1000);
          const demoSession: Session = {
            access_token: `demo-${demoAccount.profile.id}`,
            refresh_token: `demo-${demoAccount.profile.id}`,
            expires_in: 60 * 60 * 24,
            expires_at: now + 60 * 60 * 24,
            token_type: 'bearer',
            user: {
              id: demoAccount.profile.id,
              aud: 'authenticated',
              role: 'authenticated',
              email: demoAccount.email,
              phone: '',
              app_metadata: { provider: 'demo' },
              user_metadata: {},
              identities: [],
              created_at: demoAccount.profile.created_at,
              updated_at: demoAccount.profile.updated_at,
            },
          };
          setSession(demoSession);
          setProfile(demoAccount.profile);
          setProfileError(null);
          setIsLoading(false);
          return;
        }
        const { error } = await getSupabaseClient().auth.signInWithPassword({
          email: normalizeEmail(email),
          password,
        });
        if (error) {
          throw error;
        }
      },
      signUp: async (input) => {
        const emailRedirectTo = createAuthCallbackUrl();
        const { data, error } = await getSupabaseClient().auth.signUp({
          email: normalizeEmail(input.email),
          password: input.password,
          options: {
            emailRedirectTo,
            data: {
            account_type: input.accountType,
              full_name: input.fullName.trim(),
              organization_name: input.organizationName.trim(),
            },
          },
        });
        if (error) {
          throw error;
        }
        return { needsEmailConfirmation: !data.session };
      },
      sendPasswordReset: async (email) => {
        const emailRedirectTo = createAuthCallbackUrl('recovery');
        const { error } = await getSupabaseClient().auth.resetPasswordForEmail(
          normalizeEmail(email),
          { redirectTo: emailRedirectTo },
        );
        if (error) {
          throw error;
        }
      },
      signOut: async () => {
        if (session?.user.app_metadata.provider === 'demo') {
          setSession(null);
          setProfile(null);
          setProfileError(null);
          return;
        }
        const { error } = await getSupabaseClient().auth.signOut();
        if (error) {
          throw error;
        }
      },
      updatePassword: async (password) => {
        const { error } = await getSupabaseClient().auth.updateUser({ password });
        if (error) {
          throw error;
        }
      },
      refreshProfile: async () => {
        if (!session) {
          return;
        }
        setIsLoading(true);
        try {
          setProfile(await getProfile(session.user.id));
          setProfileError(null);
        } catch (error) {
          setProfileError(getErrorMessage(error));
        } finally {
          setIsLoading(false);
        }
      },
      saveProfile: async (updates) => {
        if (!session) {
          throw new Error('Sign in again to update your profile.');
        }
        const nextProfile = await saveProfile(session.user.id, updates);
        setProfile(nextProfile);
      },
      clearCallbackError: () => setCallbackError(null),
    }),
    [authEvent, callbackError, isLoading, profile, profileError, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return value;
}
