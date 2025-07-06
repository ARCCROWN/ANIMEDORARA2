import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface AuthUser {
  id: string;
  username: string;
  profilePicture: string;
  isAuthenticated: boolean;
  hasPassword: boolean;
  isAdmin: boolean;
}

const GUEST_USER: AuthUser = {
  id: 'guest',
  username: 'Guest User',
  profilePicture: '',
  isAuthenticated: false,
  hasPassword: false,
  isAdmin: false
};

interface StoredUser {
  id: string;
  username: string;
  profilePicture: string;
  passwordHash: string;
  joinDate: string;
  isAdmin: boolean;
}

// Helper function to set user context for RLS
const setUserContext = async (userId: string) => {
  try {
    await supabase.rpc('set_config', {
      setting_name: 'app.current_user_id',
      setting_value: userId,
      is_local: true
    });
  } catch (error) {
    console.error('Error setting user context:', error);
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser>(GUEST_USER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUserId = localStorage.getItem('currentUserId');
      if (currentUserId) {
        // Set user context for RLS
        await setUserContext(currentUserId);
        
        // Check if user exists in Supabase - use maybeSingle() to avoid errors when no row found
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', currentUserId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile from Supabase:', error);
        }

        if (profile) {
          setUser({
            id: profile.user_id,
            username: profile.username,
            profilePicture: profile.profile_picture,
            isAuthenticated: true,
            hasPassword: true,
            isAdmin: profile.is_admin
          });
        } else {
          // Fallback to localStorage
          const userProfile = localStorage.getItem(`userProfile_${currentUserId}`);
          if (userProfile) {
            const profile: StoredUser = JSON.parse(userProfile);
            setUser({
              id: profile.id,
              username: profile.username,
              profilePicture: profile.profilePicture,
              isAuthenticated: true,
              hasPassword: !!profile.passwordHash,
              isAdmin: profile.isAdmin || false
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      localStorage.removeItem('currentUserId');
    } finally {
      setLoading(false);
    }
  };

  const hashPassword = (password: string): string => {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  };

  const login = async (username: string, password: string, profilePicture?: string, isLogin: boolean = false) => {
    const userId = `user_${username.toLowerCase()}`;
    
    try {
      if (isLogin) {
        // Set user context for RLS
        await setUserContext(userId);
        
        // Check Supabase first - use maybeSingle() to avoid errors when no row found
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile from Supabase:', error);
        }

        if (profile) {
          // Verify password (in production, use proper password verification)
          const passwordHash = hashPassword(password);
          const storedProfile = localStorage.getItem(`userProfile_${userId}`);
          
          if (storedProfile) {
            const localProfile: StoredUser = JSON.parse(storedProfile);
            if (localProfile.passwordHash !== passwordHash) {
              return { success: false, error: 'Invalid password. Please try again.' };
            }
          }

          localStorage.setItem('currentUserId', userId);
          setUser({
            id: profile.user_id,
            username: profile.username,
            profilePicture: profile.profile_picture,
            isAuthenticated: true,
            hasPassword: true,
            isAdmin: profile.is_admin
          });

          return { success: true };
        } else {
          // Fallback to localStorage
          const userProfile = localStorage.getItem(`userProfile_${userId}`);
          if (!userProfile) {
            return { success: false, error: 'User not found. Please sign up first.' };
          }

          const profile: StoredUser = JSON.parse(userProfile);
          const passwordHash = hashPassword(password);
          
          if (profile.passwordHash !== passwordHash) {
            return { success: false, error: 'Invalid password. Please try again.' };
          }

          localStorage.setItem('currentUserId', userId);
          // Set user context for RLS
          await setUserContext(userId);
          
          setUser({
            id: profile.id,
            username: profile.username,
            profilePicture: profile.profilePicture,
            isAuthenticated: true,
            hasPassword: true,
            isAdmin: profile.isAdmin || false
          });

          return { success: true };
        }
      } else {
        // Sign up new user
        const existingProfile = localStorage.getItem(`userProfile_${userId}`);
        if (existingProfile) {
          return { success: false, error: 'Username already exists. Please choose a different one or sign in.' };
        }

        const passwordHash = hashPassword(password);
        const defaultProfilePicture = profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
        
        // Set user context for RLS before creating profile
        await setUserContext(userId);
        
        // Create user profile in Supabase
        const { data: newProfile, error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            username,
            profile_picture: defaultProfilePicture,
            is_admin: false
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating profile in Supabase:', error);
        }

        // Save to localStorage as backup
        const userProfile: StoredUser = {
          id: userId,
          username,
          profilePicture: defaultProfilePicture,
          passwordHash,
          joinDate: new Date().toISOString(),
          isAdmin: false
        };

        localStorage.setItem(`userProfile_${userId}`, JSON.stringify(userProfile));
        localStorage.setItem('currentUserId', userId);
        
        setUser({
          id: userId,
          username,
          profilePicture: defaultProfilePicture,
          isAuthenticated: true,
          hasPassword: true,
          isAdmin: false
        });
        
        return { success: true };
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: 'Authentication failed. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUserId');
    setUser(GUEST_USER);
  };

  const updateProfile = async (updates: Partial<Pick<AuthUser, 'username' | 'profilePicture'>>) => {
    if (!user.isAuthenticated) return { success: false, error: 'Not authenticated' };

    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);

      // Set user context for RLS
      await setUserContext(user.id);

      // Update Supabase
      await supabase
        .from('user_profiles')
        .update({
          username: updates.username,
          profile_picture: updates.profilePicture
        })
        .eq('user_id', user.id);

      // Update localStorage
      const userProfile = JSON.parse(localStorage.getItem(`userProfile_${user.id}`) || '{}');
      const updatedProfile = { ...userProfile, ...updates };
      localStorage.setItem(`userProfile_${user.id}`, JSON.stringify(updatedProfile));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  const changePassword = (currentPassword: string, newPassword: string) => {
    if (!user.isAuthenticated) return { success: false, error: 'Not authenticated' };

    try {
      const userProfile = JSON.parse(localStorage.getItem(`userProfile_${user.id}`) || '{}');
      const currentPasswordHash = hashPassword(currentPassword);
      
      if (userProfile.passwordHash !== currentPasswordHash) {
        return { success: false, error: 'Current password is incorrect' };
      }

      if (newPassword.length < 6) {
        return { success: false, error: 'New password must be at least 6 characters' };
      }

      const newPasswordHash = hashPassword(newPassword);
      userProfile.passwordHash = newPasswordHash;
      localStorage.setItem(`userProfile_${user.id}`, JSON.stringify(userProfile));
      
      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, error: 'Failed to change password' };
    }
  };

  const useAdminKey = async (keyCode: string) => {
    if (!user.isAuthenticated) return { success: false, error: 'Not authenticated' };

    try {
      // Set user context for RLS
      await setUserContext(user.id);
      
      // Check if key exists and is unused
      const { data: adminKey, error: keyError } = await supabase
        .from('admin_keys')
        .select('*')
        .eq('key_code', keyCode)
        .eq('is_used', false)
        .maybeSingle();

      if (keyError || !adminKey) {
        return { success: false, error: 'Invalid or already used admin key' };
      }

      // Mark key as used
      await supabase
        .from('admin_keys')
        .update({
          is_used: true,
          used_by: user.id,
          used_at: new Date().toISOString()
        })
        .eq('id', adminKey.id);

      // Update user profile to admin
      await supabase
        .from('user_profiles')
        .update({ is_admin: true })
        .eq('user_id', user.id);

      // Update local state
      const updatedUser = { ...user, isAdmin: true };
      setUser(updatedUser);

      // Update localStorage
      const userProfile = JSON.parse(localStorage.getItem(`userProfile_${user.id}`) || '{}');
      userProfile.isAdmin = true;
      localStorage.setItem(`userProfile_${user.id}`, JSON.stringify(userProfile));

      return { success: true };
    } catch (error) {
      console.error('Error using admin key:', error);
      return { success: false, error: 'Failed to use admin key' };
    }
  };

  const requireAuth = (): boolean => {
    if (!user.isAuthenticated) {
      return false;
    }
    return true;
  };

  const isAdmin = (): boolean => {
    if (!user.isAuthenticated) return false;
    
    return user.isAdmin || 
           user.username.toLowerCase().includes('admin') ||
           user.username.toLowerCase().includes('moderator');
  };

  return {
    user,
    loading,
    login,
    logout,
    updateProfile,
    changePassword,
    useAdminKey,
    requireAuth,
    isAdmin,
    isAuthenticated: user.isAuthenticated
  };
};