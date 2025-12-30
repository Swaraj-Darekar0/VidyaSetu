import { supabase } from './supabase';

export type UpsertUserProfileParams = {
  userId: string;
  fullName: string;
  email: string;
};

export async function upsertUserProfile({ userId, fullName, email }: UpsertUserProfileParams) {
  console.log('[supabase] upsertUserProfile:start', { userId, fullName, email });
  const { error } = await supabase
    .from('user_profiles')
    .upsert({ id: userId, full_name: fullName, email })
    .select('id')
    .single();

  if (error) throw error;
  console.log('[supabase] upsertUserProfile:success', { userId });
}

export type UpsertOnboardingProgressParams = {
  userId: string;
  classId?: string;
  subjects?: string[];
  currentStep?: number;
  motherTongue?: string;
  schoolType?: string;
};

export async function upsertOnboardingProgress({
  userId,
  classId,
  subjects,
  currentStep,
  motherTongue,
  schoolType,
}: UpsertOnboardingProgressParams) {
  console.log('[supabase] upsertOnboardingProgress:start', {
    userId,
    classId,
    subjects,
    currentStep,
    motherTongue,
    schoolType,
  });
  const payload: {
    user_id: string;
    class_id?: string;
    subjects?: string[];
    current_step?: number;
    mother_tongue?: string;
    school_type?: string;
  } = {
    user_id: userId,
  };

  if (typeof classId !== 'undefined') {
    payload.class_id = classId;
  }

  if (typeof subjects !== 'undefined') {
    payload.subjects = subjects;
  }

  if (typeof currentStep !== 'undefined') {
    payload.current_step = currentStep;
  }

  if (typeof motherTongue !== 'undefined') {
    payload.mother_tongue = motherTongue;
  }

  if (typeof schoolType !== 'undefined') {
    payload.school_type = schoolType;
  }

  const { error } = await supabase.from('onboarding_progress').upsert(payload, {
    onConflict: 'user_id',
  });

  if (error) throw error;
  console.log('[supabase] upsertOnboardingProgress:success', { userId });
}

export async function getCurrentUserId(): Promise<string> {
  console.log('[supabase] getCurrentUserId:start');
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user?.id) {
    throw new Error('Please log in again to continue.');
  }

  console.log('[supabase] getCurrentUserId:success', { userId: user.id });
  return user.id;
}
