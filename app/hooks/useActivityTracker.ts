import { useCallback } from 'react';
import { useAuth } from '~/context/AuthContext';
import { activityTracker, type UserActivity } from '~/services/activityTracker';

export const useActivityTracker = () => {
  const { user } = useAuth();

  const logActivity = useCallback((
    action: string,
    module: string,
    details?: string
  ) => {
    if (user) {
      activityTracker.logActivity(
        user.id,
        user.username,
        action,
        module,
        details
      );
    }
  }, [user]);

  const getRecentActivities = useCallback((hours: number = 24) => {
    return activityTracker.getRecentActivities(hours);
  }, []);

  const getActivitySummary = useCallback(() => {
    return activityTracker.getActivitySummary();
  }, []);

  const getUserStats = useCallback((userId?: string) => {
    const targetUserId = userId || user?.id;
    if (targetUserId) {
      return activityTracker.getUserStats(targetUserId);
    }
    return null;
  }, [user]);

  const exportActivities = useCallback(() => {
    return activityTracker.exportActivities();
  }, []);

  return {
    logActivity,
    getRecentActivities,
    getActivitySummary,
    getUserStats,
    exportActivities,
  };
};
