export interface UserActivity {
  id: string;
  userId: string;
  username: string;
  action: string;
  module: string;
  timestamp: number;
  details?: string;
  ipAddress?: string;
}

export interface ActivitySummary {
  totalActions: number;
  lastActivity: number;
  mostUsedModules: { [key: string]: number };
  recentActions: UserActivity[];
}

class ActivityTracker {
  private readonly STORAGE_KEY = 'user_activity_log';
  private readonly MAX_ACTIVITIES = 1000; // Mantener solo las últimas 1000 actividades

  // Registrar una nueva actividad
  logActivity(
    userId: string,
    username: string,
    action: string,
    module: string,
    details?: string,
  ): void {
    try {
      const activity: UserActivity = {
        id: this.generateId(),
        userId,
        username,
        action,
        module,
        timestamp: Date.now(),
        details,
        ipAddress: this.getClientIP(),
      };

      const activities = this.getActivities();
      activities.unshift(activity); // Agregar al inicio

      // Mantener solo las últimas MAX_ACTIVITIES
      if (activities.length > this.MAX_ACTIVITIES) {
        activities.splice(this.MAX_ACTIVITIES);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(activities));
    } catch (error) {
      console.error('Error al registrar actividad:', error);
    }
  }

  // Obtener todas las actividades
  getActivities(): UserActivity[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error al obtener actividades:', error);
      return [];
    }
  }

  // Obtener actividades de un usuario específico
  getUserActivities(userId: string, limit: number = 50): UserActivity[] {
    const activities = this.getActivities();
    return activities
      .filter((activity) => activity.userId === userId)
      .slice(0, limit);
  }

  // Obtener actividades recientes (últimas 24 horas)
  getRecentActivities(hours: number = 24): UserActivity[] {
    const activities = this.getActivities();
    const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
    return activities.filter((activity) => activity.timestamp > cutoffTime);
  }

  // Obtener resumen de actividad
  getActivitySummary(): ActivitySummary {
    const activities = this.getActivities();
    const recentActivities = activities.slice(0, 20); // Últimas 20 actividades

    // Contar módulos más usados
    const moduleCounts: { [key: string]: number } = {};
    activities.forEach((activity) => {
      moduleCounts[activity.module] = (moduleCounts[activity.module] || 0) + 1;
    });

    return {
      totalActions: activities.length,
      lastActivity: activities[0]?.timestamp || 0,
      mostUsedModules: moduleCounts,
      recentActions: recentActivities,
    };
  }

  // Obtener estadísticas por usuario
  getUserStats(userId: string) {
    const userActivities = this.getUserActivities(userId);
    const moduleCounts: { [key: string]: number } = {};

    userActivities.forEach((activity) => {
      moduleCounts[activity.module] = (moduleCounts[activity.module] || 0) + 1;
    });

    return {
      totalActions: userActivities.length,
      lastActivity: userActivities[0]?.timestamp || 0,
      mostUsedModules: moduleCounts,
      recentActions: userActivities.slice(0, 10),
    };
  }

  // Limpiar actividades antiguas (más de 30 días)
  cleanupOldActivities(): void {
    const activities = this.getActivities();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const filteredActivities = activities.filter(
      (activity) => activity.timestamp > thirtyDaysAgo,
    );

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredActivities));
  }

  // Exportar actividades (para análisis)
  exportActivities(): string {
    return JSON.stringify(this.getActivities(), null, 2);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getClientIP(): string {
    // En un entorno real, esto vendría del backend
    // Por ahora, simulamos una IP
    return '192.168.1.1';
  }
}

export const activityTracker = new ActivityTracker();

// Limpiar actividades antiguas cada vez que se carga el módulo
activityTracker.cleanupOldActivities();
