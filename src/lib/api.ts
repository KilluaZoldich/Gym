// API client for workout application

// Types
export interface WorkoutExercise {
  id: string;
  name: string;
  description?: string;
  sets: number;
  reps: number;
  restTime: number;
  order: number;
  workoutPlanId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  exercises: WorkoutExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface Workout {
  id: string;
  workoutPlanId: string;
  startedAt: string;
  completedAt?: string;
  notes?: string;
  workoutPlan: WorkoutPlan;
  sets: WorkoutSet[];
}

export interface WorkoutSet {
  id: string;
  workoutId: string;
  workoutExerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  completedAt: string;
  workout: Workout;
  workoutExercise: WorkoutExercise;
}

// API Base URL
const API_BASE = '/api';

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

// WorkoutPlan API functions
export const workoutPlanApi = {
  // Get all workout plans
  getAll: async (): Promise<WorkoutPlan[]> => {
    return apiRequest<WorkoutPlan[]>('/workout-plans');
  },

  // Get a specific workout plan by ID
  getById: async (id: string): Promise<WorkoutPlan> => {
    return apiRequest<WorkoutPlan>(`/workout-plans/${id}`);
  },

  // Create a new workout plan
  create: async (data: {
    name: string;
    description?: string;
    exercises: {
      name: string;
      description?: string;
      sets: number;
      reps: number;
      restTime: number;
      order: number;
    }[];
  }): Promise<WorkoutPlan> => {
    return apiRequest<WorkoutPlan>('/workout-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update a workout plan
  update: async (id: string, data: {
    name?: string;
    description?: string;
    isActive?: boolean;
  }): Promise<WorkoutPlan> => {
    return apiRequest<WorkoutPlan>(`/workout-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete a workout plan
  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/workout-plans/${id}`, {
      method: 'DELETE',
    });
  },

  // Duplicate a workout plan
  duplicate: async (id: string): Promise<WorkoutPlan> => {
    const originalPlan = await workoutPlanApi.getById(id);
    return workoutPlanApi.create({
      name: `${originalPlan.name} (Copia)`,
      description: originalPlan.description,
      exercises: originalPlan.exercises?.map(ex => ({
        name: ex.name,
        description: ex.description,
        sets: ex.sets,
        reps: ex.reps,
        restTime: ex.restTime,
        order: ex.order,
      })) || [],
    });
  },
};

// WorkoutExercise API functions
export const workoutExerciseApi = {
  // Get exercises for a workout plan
  getByPlanId: async (workoutPlanId: string): Promise<WorkoutExercise[]> => {
    return apiRequest<WorkoutExercise[]>(`/workout-exercises?workoutPlanId=${workoutPlanId}`);
  },

  // Create a new exercise
  create: async (data: {
    name: string;
    description?: string;
    sets: number;
    reps: number;
    restTime: number;
    order: number;
    workoutPlanId: string;
  }): Promise<WorkoutExercise> => {
    return apiRequest<WorkoutExercise>('/workout-exercises', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update an exercise
  update: async (id: string, data: {
    name?: string;
    description?: string;
    sets?: number;
    reps?: number;
    restTime?: number;
    order?: number;
  }): Promise<WorkoutExercise> => {
    return apiRequest<WorkoutExercise>(`/workout-exercises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete an exercise
  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/workout-exercises/${id}`, {
      method: 'DELETE',
    });
  },
};

// Workout API functions
export const workoutApi = {
  // Get all workouts
  getAll: async (): Promise<Workout[]> => {
    return apiRequest<Workout[]>('/workouts');
  },

  // Get workouts by plan ID
  getByPlanId: async (workoutPlanId: string): Promise<Workout[]> => {
    return apiRequest<Workout[]>(`/workouts?workoutPlanId=${workoutPlanId}`);
  },

  // Start a new workout
  start: async (workoutPlanId: string, notes?: string): Promise<Workout> => {
    return apiRequest<Workout>('/workouts', {
      method: 'POST',
      body: JSON.stringify({
        workoutPlanId,
        notes,
      }),
    });
  },

  // Complete a workout
  complete: async (id: string, notes?: string): Promise<Workout> => {
    return apiRequest<Workout>(`/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        completedAt: new Date().toISOString(),
        notes,
      }),
    });
  },

  // Delete a workout
  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/workouts/${id}`, {
      method: 'DELETE',
    });
  },
};

// WorkoutSet API functions
export const workoutSetApi = {
  // Get sets for a workout
  getByWorkoutId: async (workoutId: string): Promise<WorkoutSet[]> => {
    return apiRequest<WorkoutSet[]>(`/workout-sets?workoutId=${workoutId}`);
  },

  // Record a completed set
  create: async (data: {
    workoutId: string;
    workoutExerciseId: string;
    setNumber: number;
    weight: number;
    reps: number;
  }): Promise<WorkoutSet> => {
    return apiRequest<WorkoutSet>('/workout-sets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update a set
  update: async (id: string, data: {
    weight?: number;
    reps?: number;
  }): Promise<WorkoutSet> => {
    return apiRequest<WorkoutSet>(`/workout-sets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete a set
  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/workout-sets/${id}`, {
      method: 'DELETE',
    });
  },
};

// Error handling helper
export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Loading state helper
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function createInitialApiState<T>(): ApiState<T> {
  return {
    data: null,
    loading: false,
    error: null,
  };
}