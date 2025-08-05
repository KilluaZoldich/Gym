// Static API client for workout application (GitHub Pages compatible)
// Uses localStorage for data persistence instead of server API

import { v4 as uuidv4 } from 'uuid';

// Types (same as api.ts)
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

// Storage keys
const STORAGE_KEYS = {
  WORKOUT_PLANS: 'workout_plans',
  WORKOUT_EXERCISES: 'workout_exercises',
  WORKOUTS: 'workouts',
  WORKOUT_SETS: 'workout_sets',
};

// Storage utilities
class StaticStorage {
  static get<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return [];
    }
  }

  static set<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error);
    }
  }

  static add<T extends { id: string }>(key: string, item: T): T {
    const items = this.get<T>(key);
    items.push(item);
    this.set(key, items);
    return item;
  }

  static update<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | null {
    const items = this.get<T>(key);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    const updatedItem = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    items[index] = updatedItem;
    this.set(key, items);
    return updatedItem;
  }

  static delete<T extends { id: string }>(key: string, id: string): boolean {
    const items = this.get<T>(key);
    const filteredItems = items.filter(item => item.id !== id);
    if (filteredItems.length === items.length) return false;
    
    this.set(key, filteredItems);
    return true;
  }

  static findById<T extends { id: string }>(key: string, id: string): T | null {
    const items = this.get<T>(key);
    return items.find(item => item.id === id) || null;
  }
}

// Simulate async behavior for consistency with original API
const delay = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));

// WorkoutPlan API functions
export const workoutPlanApi = {
  // Get all workout plans
  getAll: async (): Promise<WorkoutPlan[]> => {
    await delay();
    const plans = StaticStorage.get<WorkoutPlan>(STORAGE_KEYS.WORKOUT_PLANS);
    const exercises = StaticStorage.get<WorkoutExercise>(STORAGE_KEYS.WORKOUT_EXERCISES);
    
    return plans.map(plan => ({
      ...plan,
      exercises: exercises.filter(ex => ex.workoutPlanId === plan.id).sort((a, b) => a.order - b.order)
    }));
  },

  // Get a specific workout plan by ID
  getById: async (id: string): Promise<WorkoutPlan> => {
    await delay();
    const plan = StaticStorage.findById<WorkoutPlan>(STORAGE_KEYS.WORKOUT_PLANS, id);
    if (!plan) throw new Error('Workout plan not found');
    
    const exercises = StaticStorage.get<WorkoutExercise>(STORAGE_KEYS.WORKOUT_EXERCISES)
      .filter(ex => ex.workoutPlanId === id)
      .sort((a, b) => a.order - b.order);
    
    return { ...plan, exercises };
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
    await delay();
    const now = new Date().toISOString();
    const planId = uuidv4();
    
    const plan: WorkoutPlan = {
      id: planId,
      name: data.name,
      description: data.description,
      isActive: true,
      exercises: [],
      createdAt: now,
      updatedAt: now,
    };
    
    StaticStorage.add(STORAGE_KEYS.WORKOUT_PLANS, plan);
    
    // Create exercises
    const exercises: WorkoutExercise[] = (data.exercises || []).map(exerciseData => {
      const exercise: WorkoutExercise = {
        id: uuidv4(),
        workoutPlanId: planId,
        createdAt: now,
        updatedAt: now,
        ...exerciseData,
      };
      StaticStorage.add(STORAGE_KEYS.WORKOUT_EXERCISES, exercise);
      return exercise;
    });
    
    return { ...plan, exercises };
  },

  // Update a workout plan
  update: async (id: string, data: {
    name?: string;
    description?: string;
    isActive?: boolean;
  }): Promise<WorkoutPlan> => {
    await delay();
    const updatedPlan = StaticStorage.update<WorkoutPlan>(STORAGE_KEYS.WORKOUT_PLANS, id, data);
    if (!updatedPlan) throw new Error('Workout plan not found');
    
    const exercises = StaticStorage.get<WorkoutExercise>(STORAGE_KEYS.WORKOUT_EXERCISES)
      .filter(ex => ex.workoutPlanId === id)
      .sort((a, b) => a.order - b.order);
    
    return { ...updatedPlan, exercises };
  },

  // Delete a workout plan
  delete: async (id: string): Promise<void> => {
    await delay();
    const deleted = StaticStorage.delete<WorkoutPlan>(STORAGE_KEYS.WORKOUT_PLANS, id);
    if (!deleted) throw new Error('Workout plan not found');
    
    // Delete associated exercises
    const exercises = StaticStorage.get<WorkoutExercise>(STORAGE_KEYS.WORKOUT_EXERCISES);
    const filteredExercises = exercises.filter(ex => ex.workoutPlanId !== id);
    StaticStorage.set(STORAGE_KEYS.WORKOUT_EXERCISES, filteredExercises);
  },

  // Duplicate a workout plan
  duplicate: async (id: string): Promise<WorkoutPlan> => {
    const originalPlan = await workoutPlanApi.getById(id);
    return workoutPlanApi.create({
      name: `${originalPlan.name} (Copia)`,
      description: originalPlan.description,
      exercises: (originalPlan.exercises || []).map(ex => ({
        name: ex.name,
        description: ex.description,
        sets: ex.sets,
        reps: ex.reps,
        restTime: ex.restTime,
        order: ex.order,
      })),
    });
  },
};

// WorkoutExercise API functions
export const workoutExerciseApi = {
  // Get exercises for a workout plan
  getByPlanId: async (workoutPlanId: string): Promise<WorkoutExercise[]> => {
    await delay();
    return StaticStorage.get<WorkoutExercise>(STORAGE_KEYS.WORKOUT_EXERCISES)
      .filter(ex => ex.workoutPlanId === workoutPlanId)
      .sort((a, b) => a.order - b.order);
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
    await delay();
    const now = new Date().toISOString();
    const exercise: WorkoutExercise = {
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      ...data,
    };
    
    return StaticStorage.add(STORAGE_KEYS.WORKOUT_EXERCISES, exercise);
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
    await delay();
    const updated = StaticStorage.update<WorkoutExercise>(STORAGE_KEYS.WORKOUT_EXERCISES, id, data);
    if (!updated) throw new Error('Exercise not found');
    return updated;
  },

  // Delete an exercise
  delete: async (id: string): Promise<void> => {
    await delay();
    const deleted = StaticStorage.delete<WorkoutExercise>(STORAGE_KEYS.WORKOUT_EXERCISES, id);
    if (!deleted) throw new Error('Exercise not found');
  },
};

// Workout API functions
export const workoutApi = {
  // Get all workouts
  getAll: async (): Promise<Workout[]> => {
    await delay();
    const workouts = StaticStorage.get<Workout>(STORAGE_KEYS.WORKOUTS);
    const plans = StaticStorage.get<WorkoutPlan>(STORAGE_KEYS.WORKOUT_PLANS);
    const exercises = StaticStorage.get<WorkoutExercise>(STORAGE_KEYS.WORKOUT_EXERCISES);
    const sets = StaticStorage.get<WorkoutSet>(STORAGE_KEYS.WORKOUT_SETS);
    
    return workouts.map(workout => {
      const plan = plans.find(p => p.id === workout.workoutPlanId);
      const planExercises = exercises.filter(ex => ex.workoutPlanId === workout.workoutPlanId);
      const workoutSets = sets.filter(s => s.workoutId === workout.id);
      
      return {
        ...workout,
        workoutPlan: plan ? { ...plan, exercises: planExercises } : {} as WorkoutPlan,
        sets: workoutSets,
      };
    });
  },

  // Get workouts by plan ID
  getByPlanId: async (workoutPlanId: string): Promise<Workout[]> => {
    const allWorkouts = await workoutApi.getAll();
    return allWorkouts.filter(w => w.workoutPlanId === workoutPlanId);
  },

  // Start a new workout
  start: async (workoutPlanId: string, notes?: string): Promise<Workout> => {
    await delay();
    const plan = await workoutPlanApi.getById(workoutPlanId);
    const now = new Date().toISOString();
    
    const workout: Workout = {
      id: uuidv4(),
      workoutPlanId,
      startedAt: now,
      notes,
      workoutPlan: plan,
      sets: [],
    };
    
    return StaticStorage.add(STORAGE_KEYS.WORKOUTS, workout);
  },

  // Complete a workout
  complete: async (id: string, notes?: string): Promise<Workout> => {
    await delay();
    const updated = StaticStorage.update<Workout>(STORAGE_KEYS.WORKOUTS, id, {
      completedAt: new Date().toISOString(),
      notes,
    });
    if (!updated) throw new Error('Workout not found');
    
    const plan = await workoutPlanApi.getById(updated.workoutPlanId);
    const sets = StaticStorage.get<WorkoutSet>(STORAGE_KEYS.WORKOUT_SETS)
      .filter(s => s.workoutId === id);
    
    return { ...updated, workoutPlan: plan, sets };
  },

  // Delete a workout
  delete: async (id: string): Promise<void> => {
    await delay();
    const deleted = StaticStorage.delete<Workout>(STORAGE_KEYS.WORKOUTS, id);
    if (!deleted) throw new Error('Workout not found');
    
    // Delete associated sets
    const sets = StaticStorage.get<WorkoutSet>(STORAGE_KEYS.WORKOUT_SETS);
    const filteredSets = sets.filter(s => s.workoutId !== id);
    StaticStorage.set(STORAGE_KEYS.WORKOUT_SETS, filteredSets);
  },
};

// WorkoutSet API functions
export const workoutSetApi = {
  // Get sets for a workout
  getByWorkoutId: async (workoutId: string): Promise<WorkoutSet[]> => {
    await delay();
    const sets = StaticStorage.get<WorkoutSet>(STORAGE_KEYS.WORKOUT_SETS)
      .filter(s => s.workoutId === workoutId);
    
    const workouts = StaticStorage.get<Workout>(STORAGE_KEYS.WORKOUTS);
    const exercises = StaticStorage.get<WorkoutExercise>(STORAGE_KEYS.WORKOUT_EXERCISES);
    
    return sets.map(set => {
      const workout = workouts.find(w => w.id === set.workoutId);
      const exercise = exercises.find(ex => ex.id === set.workoutExerciseId);
      
      return {
        ...set,
        workout: workout || {} as Workout,
        workoutExercise: exercise || {} as WorkoutExercise,
      };
    });
  },

  // Record a completed set
  create: async (data: {
    workoutId: string;
    workoutExerciseId: string;
    setNumber: number;
    weight: number;
    reps: number;
  }): Promise<WorkoutSet> => {
    await delay();
    const now = new Date().toISOString();
    
    const workout = StaticStorage.findById<Workout>(STORAGE_KEYS.WORKOUTS, data.workoutId);
    const exercise = StaticStorage.findById<WorkoutExercise>(STORAGE_KEYS.WORKOUT_EXERCISES, data.workoutExerciseId);
    
    const set: WorkoutSet = {
      id: uuidv4(),
      completedAt: now,
      workout: workout || {} as Workout,
      workoutExercise: exercise || {} as WorkoutExercise,
      ...data,
    };
    
    return StaticStorage.add(STORAGE_KEYS.WORKOUT_SETS, set);
  },

  // Update a set
  update: async (id: string, data: {
    weight?: number;
    reps?: number;
  }): Promise<WorkoutSet> => {
    await delay();
    const updated = StaticStorage.update<WorkoutSet>(STORAGE_KEYS.WORKOUT_SETS, id, data);
    if (!updated) throw new Error('Set not found');
    
    const workout = StaticStorage.findById<Workout>(STORAGE_KEYS.WORKOUTS, updated.workoutId);
    const exercise = StaticStorage.findById<WorkoutExercise>(STORAGE_KEYS.WORKOUT_EXERCISES, updated.workoutExerciseId);
    
    return {
      ...updated,
      workout: workout || {} as Workout,
      workoutExercise: exercise || {} as WorkoutExercise,
    };
  },

  // Delete a set
  delete: async (id: string): Promise<void> => {
    await delay();
    const deleted = StaticStorage.delete<WorkoutSet>(STORAGE_KEYS.WORKOUT_SETS, id);
    if (!deleted) throw new Error('Set not found');
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

// Initialize with sample data if storage is empty
export function initializeSampleData(): void {
  const plans = StaticStorage.get<WorkoutPlan>(STORAGE_KEYS.WORKOUT_PLANS);
  if (plans.length === 0) {
    // Add sample workout plan
    const samplePlan = {
      name: "Allenamento Base",
      description: "Scheda di allenamento per principianti",
      exercises: [
        {
          name: "Panca Piana",
          description: "Esercizio per pettorali",
          sets: 3,
          reps: 10,
          restTime: 120,
          order: 1,
        },
        {
          name: "Squat",
          description: "Esercizio per gambe",
          sets: 3,
          reps: 12,
          restTime: 90,
          order: 2,
        },
      ],
    };
    
    workoutPlanApi.create(samplePlan);
  }
}