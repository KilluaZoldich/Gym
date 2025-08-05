"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Play, Plus, Clock, Dumbbell, CheckCircle, Timer, ArrowLeft, Edit, Trash2, X, Copy, Save, Sparkles, BarChart3, Calendar } from "lucide-react";
import { workoutPlanApi, workoutApi, workoutSetApi, type WorkoutPlan, type WorkoutExercise, type Workout, type WorkoutSet, type ApiState, createInitialApiState, initializeSampleData } from "@/lib/api-static";

// Local types for UI state
interface WorkoutSetLocal {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  completedAt: string;
}

interface WorkoutExerciseProgress {
  exercise: WorkoutExercise;
  sets: WorkoutSetLocal[];
  currentSet: number;
  isCompleted: boolean;
}

interface ExerciseForm {
  name: string;
  description: string;
  sets: number;
  reps: number;
  restTime: number;
}

type Screen = "plans" | "workout" | "rest" | "complete";

export default function GymApp() {
  const [screen, setScreen] = useState<Screen>("plans");
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutExerciseProgress[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [restTime, setRestTime] = useState(0);
  const [isRestActive, setIsRestActive] = useState(false);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: "", description: "" });
  const [newExercise, setNewExercise] = useState({ name: "", description: "", sets: 3, reps: 10, restTime: 60 });
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [isCreatingAdvanced, setIsCreatingAdvanced] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [exercises, setExercises] = useState<ExerciseForm[]>([]);
  const [newExerciseForm, setNewExerciseForm] = useState({ name: "", description: "", sets: 3, reps: 10, restTime: 60 });
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  
  // API states
  const [plansState, setPlansState] = useState<ApiState<WorkoutPlan[]>>(createInitialApiState());
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  // Load workout plans from API
  const loadWorkoutPlans = async () => {
    setPlansState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const plans = await workoutPlanApi.getAll();
      setWorkoutPlans(plans);
      setPlansState({ data: plans, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore nel caricamento delle schede';
      setPlansState(prev => ({ ...prev, loading: false, error: errorMessage }));
      toast({ title: "Errore", description: errorMessage, variant: "destructive" });
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    // Initialize sample data for static deployment
    initializeSampleData();
    loadWorkoutPlans();
  }, []);

  // Template predefiniti
  const workoutTemplates = {
    "forza-completa": {
      name: "Forza Completa",
      description: "Allenamento completo per tutto il corpo",
      exercises: [
        { name: "Squat", description: "Squat con bilanciere", sets: 4, reps: 8, restTime: 120 },
        { name: "Panca Piana", description: "Panca piana con bilanciere", sets: 4, reps: 10, restTime: 90 },
        { name: "Stacchi", description: "Stacchi da terra", sets: 3, reps: 6, restTime: 150 },
        { name: "Military Press", description: "Spinte militari", sets: 3, reps: 8, restTime: 90 },
      ]
    },
    "upper-body": {
      name: "Upper Body",
      description: "Allenamento per parte superiore del corpo",
      exercises: [
        { name: "Panca Piana", description: "Panca piana con bilanciere", sets: 4, reps: 10, restTime: 90 },
        { name: "Rematore", description: "Rematore con bilanciere", sets: 4, reps: 12, restTime: 90 },
        { name: "Military Press", description: "Spinte militari", sets: 3, reps: 8, restTime: 90 },
        { name: "Curl Bicipiti", description: "Curl con manubri", sets: 3, reps: 12, restTime: 60 },
      ]
    },
    "lower-body": {
      name: "Lower Body",
      description: "Allenamento per parte inferiore del corpo",
      exercises: [
        { name: "Squat", description: "Squat con bilanciere", sets: 4, reps: 8, restTime: 120 },
        { name: "Affondi", description: "Affondi con manubri", sets: 3, reps: 10, restTime: 90 },
        { name: "Leg Press", description: "Leg press machine", sets: 4, reps: 12, restTime: 90 },
        { name: "Calf Raises", description: "Alzate polpacci", sets: 3, reps: 15, restTime: 60 },
      ]
    },
    "cardio-forza": {
      name: "Cardio & Forza",
      description: "Allenamento misto cardio e forza",
      exercises: [
        { name: "Burpees", description: "Burpees", sets: 3, reps: 15, restTime: 60 },
        { name: "Push-up", description: "Flessioni", sets: 3, reps: 20, restTime: 60 },
        { name: "Mountain Climbers", description: "Mountain climbers", sets: 3, reps: 30, restTime: 60 },
        { name: "Plank", description: "Plank", sets: 3, reps: 1, restTime: 45 },
      ]
    }
  };

  // Timer for rest periods
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRestActive && restTime > 0) {
      interval = setInterval(() => {
        setRestTime(prev => prev - 1);
      }, 1000);
    } else if (restTime === 0 && isRestActive) {
      setIsRestActive(false);
      setScreen("workout");
    }
    return () => clearInterval(interval);
  }, [isRestActive, restTime]);

  const startWorkout = async (plan: WorkoutPlan) => {
    try {
      setLoading(true);
      // Start a new workout session in the database
      const workout = await workoutApi.start(plan.id);
      setActiveWorkout(workout);
      setSelectedPlan(plan);
      
      const workoutProgress = plan.exercises.map(exercise => ({
        exercise,
        sets: [],
        currentSet: 1,
        isCompleted: false
      }));
      setCurrentWorkout(workoutProgress);
      setCurrentExerciseIndex(0);
      setScreen("workout");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore nell\'avvio dell\'allenamento';
      toast({ title: "Errore", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const completeSet = async (weight: number, reps: number) => {
    if (!activeWorkout) return;
    
    const currentExercise = currentWorkout[currentExerciseIndex];
    
    // Declare updatedWorkout outside try-catch to make it accessible
    let updatedWorkout: typeof currentWorkout;
    
    try {
      // Save the set to the database
      await workoutSetApi.create({
        workoutId: activeWorkout.id,
        workoutExerciseId: currentExercise.exercise.id,
        setNumber: currentExercise.currentSet,
        weight,
        reps
      });
      
      // Update local state
      const newSet: WorkoutSetLocal = {
        id: `${Date.now()}`,
        setNumber: currentExercise.currentSet,
        weight,
        reps,
        completedAt: new Date().toISOString()
      };

      updatedWorkout = [...currentWorkout];
      updatedWorkout[currentExerciseIndex] = {
        ...currentExercise,
        sets: [...currentExercise.sets, newSet],
        currentSet: currentExercise.currentSet + 1,
        isCompleted: currentExercise.currentSet >= currentExercise.exercise.sets
      };

      setCurrentWorkout(updatedWorkout);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore nel salvare la serie';
      toast({ title: "Errore", description: errorMessage, variant: "destructive" });
      return;
    }

    // Check if exercise is completed
    if (updatedWorkout[currentExerciseIndex].isCompleted) {
      // Start rest timer
      setRestTime(currentExercise.exercise.restTime);
      setIsRestActive(true);
      setScreen("rest");
    }
  };

  const nextExercise = () => {
    if (currentExerciseIndex < currentWorkout.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setScreen("workout");
    } else {
      // Workout completed
      completeWorkout();
    }
  };

  const completeWorkout = async () => {
    if (!activeWorkout) return;
    
    try {
      setLoading(true);
      // Complete the workout in the database
      await workoutApi.complete(activeWorkout.id);
      setScreen("complete");
      toast({ title: "Successo", description: "Allenamento completato con successo!" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore nel completare l\'allenamento';
      toast({ title: "Errore", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const createWorkoutPlan = async () => {
    if (!newPlan.name.trim()) {
      toast({ title: "Errore", description: "Inserisci un nome per la scheda", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const plan = await workoutPlanApi.create({
        name: newPlan.name,
        description: newPlan.description,
        isActive: true
      });

      setWorkoutPlans(prev => [...prev, plan]);
      setPlansState(prev => ({ ...prev, data: [...prev.data, plan] }));
      setNewPlan({ name: "", description: "" });
      setIsCreatingPlan(false);
      toast({ title: "Successo", description: "Scheda creata con successo" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore nella creazione della scheda';
      toast({ title: "Errore", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addExerciseToPlan = async (planId: string) => {
    if (!newExercise.name.trim()) {
      toast({ title: "Errore", description: "Inserisci un nome per l'esercizio", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const plan = workoutPlans.find(p => p.id === planId);
      if (!plan) throw new Error('Scheda non trovata');
      
      const exercise = await workoutExerciseApi.create({
        name: newExercise.name,
        description: newExercise.description,
        sets: newExercise.sets,
        reps: newExercise.reps,
        restTime: newExercise.restTime,
        workoutPlanId: planId,
        order: plan.exercises.length + 1
      });

      setWorkoutPlans(prev => prev.map(p => 
        p.id === planId 
          ? { ...p, exercises: [...p.exercises, exercise] }
          : p
      ));

      setNewExercise({ name: "", description: "", sets: 3, reps: 10, restTime: 60 });
      toast({ title: "Successo", description: "Esercizio aggiunto con successo" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore nell\'aggiunta dell\'esercizio';
      toast({ title: "Errore", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkoutPlan = async (planId: string) => {
    try {
      setLoading(true);
      await workoutPlanApi.delete(planId);
      setWorkoutPlans(prev => prev.filter(plan => plan.id !== planId));
      setPlansState(prev => ({ ...prev, data: prev.data.filter(plan => plan.id !== planId) }));
      toast({ title: "Successo", description: "Scheda eliminata con successo" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore nell\'eliminazione della scheda';
      toast({ title: "Errore", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetWorkout = () => {
    setScreen("plans");
    setSelectedPlan(null);
    setCurrentWorkout([]);
    setCurrentExerciseIndex(0);
    setRestTime(0);
    setIsRestActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    const totalSets = currentWorkout.reduce((sum, ex) => sum + ex.exercise.sets, 0);
    const completedSets = currentWorkout.reduce((sum, ex) => sum + ex.sets.length, 0);
    return (completedSets / totalSets) * 100;
  };

  // Funzioni per la creazione avanzata di schede
  const openAdvancedCreator = () => {
    setPlanName("");
    setPlanDescription("");
    setExercises([]);
    setSelectedTemplate("");
    setIsCreatingAdvanced(true);
  };

  const addExercise = () => {
    if (!newExerciseForm.name.trim()) {
      toast({ title: "Errore", description: "Inserisci un nome per l'esercizio", variant: "destructive" });
      return;
    }

    if (newExerciseForm.sets < 1 || newExerciseForm.sets > 10) {
      toast({ title: "Errore", description: "Il numero di serie deve essere tra 1 e 10", variant: "destructive" });
      return;
    }

    if (newExerciseForm.reps < 1 || newExerciseForm.reps > 50) {
      toast({ title: "Errore", description: "Le ripetizioni devono essere tra 1 e 50", variant: "destructive" });
      return;
    }

    if (newExerciseForm.restTime < 10 || newExerciseForm.restTime > 600) {
      toast({ title: "Errore", description: "Il tempo di riposo deve essere tra 10 e 600 secondi", variant: "destructive" });
      return;
    }

    const exercise = {
      ...newExerciseForm,
      order: exercises.length + 1
    };

    setExercises(prev => [...prev, exercise]);
    setNewExerciseForm({ name: "", description: "", sets: 3, reps: 10, restTime: 60 });
    toast({ title: "Successo", description: "Esercizio aggiunto" });
  };

  const removeExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
    // Reorder exercises
    setExercises(prev => prev.map((ex, i) => ({ ...ex, order: i + 1 })));
  };

  const applyTemplate = (templateKey: string) => {
    const template = workoutTemplates[templateKey as keyof typeof workoutTemplates];
    if (template) {
      setPlanName(template.name);
      setPlanDescription(template.description);
      setExercises(template.exercises.map((ex, i) => ({ ...ex, order: i + 1 })));
      setSelectedTemplate(templateKey);
      toast({ title: "Template applicato", description: `${template.name} caricato` });
    }
  };

  const saveAdvancedPlan = async () => {
    if (!planName.trim()) {
      toast({ title: "Errore", description: "Inserisci un nome per la scheda", variant: "destructive" });
      return;
    }

    if (exercises.length === 0) {
      toast({ title: "Errore", description: "Aggiungi almeno un esercizio", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      // Create the workout plan first
      const newPlan = await workoutPlanApi.create({
        name: planName,
        description: planDescription,
        isActive: true
      });

      // Add exercises to the plan
      const createdExercises = [];
      for (let i = 0; i < exercises.length; i++) {
        const exercise = exercises[i];
        const createdExercise = await workoutExerciseApi.create({
          name: exercise.name,
          description: exercise.description,
          sets: exercise.sets,
          reps: exercise.reps,
          restTime: exercise.restTime,
          workoutPlanId: newPlan.id,
          order: i + 1
        });
        createdExercises.push(createdExercise);
      }

      const completePlan = { ...newPlan, exercises: createdExercises };
      setWorkoutPlans(prev => [...prev, completePlan]);
      setPlansState(prev => ({ ...prev, data: [...prev.data, completePlan] }));
      
      setIsCreatingAdvanced(false);
      toast({ title: "Successo", description: "Scheda creata con successo!" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore nella creazione della scheda avanzata';
      toast({ title: "Errore", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const duplicatePlan = async (plan: WorkoutPlan) => {
    try {
      setLoading(true);
      // Create the duplicated workout plan
      const duplicatedPlan = await workoutPlanApi.create({
        name: `${plan.name} (Copia)`,
        description: plan.description,
        isActive: true
      });

      // Add exercises to the duplicated plan
      const createdExercises = [];
      for (let i = 0; i < plan.exercises.length; i++) {
        const exercise = plan.exercises[i];
        const createdExercise = await workoutExerciseApi.create({
          name: exercise.name,
          description: exercise.description,
          sets: exercise.sets,
          reps: exercise.reps,
          restTime: exercise.restTime,
          workoutPlanId: duplicatedPlan.id,
          order: i + 1
        });
        createdExercises.push(createdExercise);
      }

      const completePlan = { ...duplicatedPlan, exercises: createdExercises };
      setWorkoutPlans(prev => [...prev, completePlan]);
      setPlansState(prev => ({ ...prev, data: [...prev.data, completePlan] }));
      
      toast({ title: "Successo", description: "Scheda duplicata" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore nella duplicazione della scheda';
      toast({ title: "Errore", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Schermata principale: Schede
  if (screen === "plans") {
    return (
      <div className="min-h-screen bg-white safe-all smooth-scroll">
        <div className="max-w-md mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12 pt-4">
            <h1 className="text-3xl font-thin text-gray-900 tracking-tight">Gym</h1>
            <p className="text-gray-400 text-sm mt-2">Scegli la tua scheda</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs">Schede</p>
                    <p className="text-gray-900 text-xl font-light">{workoutPlans.length}</p>
                  </div>
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs">Esercizi</p>
                    <p className="text-gray-900 text-xl font-light">
                      {workoutPlans.reduce((sum, plan) => sum + plan.exercises.length, 0)}
                    </p>
                  </div>
                  <Dumbbell className="h-6 w-6 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Button */}
          <div className="mb-8">
            <Dialog open={isCreatingAdvanced} onOpenChange={setIsCreatingAdvanced}>
              <DialogTrigger asChild>
                <Button 
                  onClick={openAdvancedCreator}
                  className="w-full bg-white border border-gray-300 text-gray-900 font-normal py-3 rounded-lg shadow-sm hover:shadow-md minimal-button touch-large btn-spacing"
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuova Scheda
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white border border-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 font-normal">Crea Scheda</DialogTitle>
                  <DialogDescription className="text-gray-500">
                    Crea una scheda personalizzata
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Template Selection */}
                  <div>
                    <Label className="text-gray-700 text-sm font-normal">Template</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {Object.entries(workoutTemplates).map(([key, template]) => (
                        <Button
                          key={key}
                          variant={selectedTemplate === key ? "default" : "outline"}
                          onClick={() => applyTemplate(key)}
                          className={`text-xs h-auto p-2 ${
                            selectedTemplate === key 
                              ? "bg-gray-900 text-white" 
                              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {template.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Plan Info */}
                  <div>
                    <Label htmlFor="plan-name" className="text-gray-700 text-sm font-normal">Nome</Label>
                    <Input
                      id="plan-name"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      placeholder="Nome scheda"
                      className="mt-1 border-gray-300 text-gray-900 placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="plan-desc" className="text-gray-700 text-sm font-normal">Descrizione</Label>
                    <Textarea
                      id="plan-desc"
                      value={planDescription}
                      onChange={(e) => setPlanDescription(e.target.value)}
                      placeholder="Descrizione opzionale"
                      className="mt-1 border-gray-300 text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  {/* Exercises List */}
                  {exercises.length > 0 && (
                    <div>
                      <Label className="text-gray-700 text-sm font-normal">Esercizi</Label>
                      <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                        {exercises.map((exercise, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 pr-2">
                                <p className="text-gray-900 font-medium text-sm">{exercise.name}</p>
                                <p className="text-gray-500 text-xs">{exercise.description}</p>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-700">
                                    {exercise.sets}x{exercise.reps}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-700">
                                    {exercise.restTime}s
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExercise(index)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Exercise Form */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <Label className="text-gray-700 text-sm font-normal mb-3 block">Aggiungi Esercizio</Label>
                    <div className="space-y-3">
                      <div>
                        <Input
                          value={newExerciseForm.name}
                          onChange={(e) => setNewExerciseForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nome esercizio"
                          className="bg-white border-gray-300 text-gray-900 placeholder-gray-400 text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          value={newExerciseForm.description}
                          onChange={(e) => setNewExerciseForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descrizione opzionale"
                          className="bg-white border-gray-300 text-gray-900 placeholder-gray-400 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Input
                            type="number"
                            value={newExerciseForm.sets}
                            onChange={(e) => setNewExerciseForm(prev => ({ ...prev, sets: parseInt(e.target.value) || 3 }))}
                            placeholder="Serie"
                            className="bg-white border-gray-300 text-gray-900 placeholder-gray-400 text-sm"
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            value={newExerciseForm.reps}
                            onChange={(e) => setNewExerciseForm(prev => ({ ...prev, reps: parseInt(e.target.value) || 10 }))}
                            placeholder="Reps"
                            className="bg-white border-gray-300 text-gray-900 placeholder-gray-400 text-sm"
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            value={newExerciseForm.restTime}
                            onChange={(e) => setNewExerciseForm(prev => ({ ...prev, restTime: parseInt(e.target.value) || 60 }))}
                            placeholder="Riposo"
                            className="bg-white border-gray-300 text-gray-900 placeholder-gray-400 text-sm"
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={addExercise}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm py-2"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                        ) : (
                          <Plus className="h-4 w-4 mr-1" />
                        )}
                        {loading ? 'Aggiunta...' : 'Aggiungi'}
                      </Button>
                    </div>
                  </div>

                  {/* Save Button */}
                  <Button 
                    onClick={saveAdvancedPlan}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-normal py-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : null}
                    {loading ? 'Creazione...' : 'Salva Scheda'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Workout Plans List */}
          <div className="space-y-4">
            {plansState.loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2 text-gray-500">Caricamento schede...</span>
              </div>
            )}
            
            {plansState.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{plansState.error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={loadWorkoutPlans}
                >
                  Riprova
                </Button>
              </div>
            )}
            
            {!plansState.loading && !plansState.error && workoutPlans.map(plan => (
              <Card 
                key={plan.id} 
                className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => !loading && startWorkout(plan)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <CardTitle className="text-lg text-gray-900 font-light">
                        {plan.name}
                      </CardTitle>
                      {plan.description && (
                        <CardDescription className="text-gray-500">
                          {plan.description}
                        </CardDescription>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Dumbbell className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">{plan.exercises.length} esercizi</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {Math.round(plan.exercises.reduce((sum, ex) => sum + (ex.sets * (ex.reps * 2 + ex.restTime)), 0) / 60)} min
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicatePlan(plan);
                        }}
                        className="h-8 w-8 p-0 bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                        title="Duplica scheda"
                        disabled={loading}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWorkoutPlan(plan.id);
                        }}
                        className="h-8 w-8 p-0 bg-white border-gray-300 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                        title="Elimina scheda"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    {plan.exercises.slice(0, 5).map((exercise, index) => (
                      <Badge 
                        key={exercise.id} 
                        variant="secondary" 
                        className="text-xs bg-gray-100 text-gray-600 border border-gray-200"
                      >
                        {exercise.name}
                      </Badge>
                    ))}
                    {plan.exercises.length > 5 && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs bg-gray-100 text-gray-600 border border-gray-200"
                      >
                        +{plan.exercises.length - 5}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Schermata di allenamento
  if (screen === "workout") {
    const currentExercise = currentWorkout[currentExerciseIndex];
    const progress = calculateProgress();

    return (
      <div className="min-h-screen bg-white safe-all smooth-scroll">
        <div className="max-w-md mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => setScreen("plans")}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-thin text-gray-900">{selectedPlan?.name}</h2>
            <div className="w-10" />
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Progresso</span>
              <span className="text-sm text-gray-900 font-thin">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1 bg-gray-100" />
          </div>

          {/* Exercise Info */}
          <Card className="border border-gray-200 shadow-sm mb-8">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-2">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                  <Dumbbell className="h-8 w-8 text-gray-500" />
                </div>
              </div>
              <CardTitle className="text-2xl text-gray-900 font-thin mb-1">
                {currentExercise.exercise.name}
              </CardTitle>
              {currentExercise.exercise.description && (
                <CardDescription className="text-gray-400">
                  {currentExercise.exercise.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-thin text-gray-900">
                    {currentExercise.currentSet}/{currentExercise.exercise.sets}
                  </p>
                  <p className="text-xs text-gray-400">Serie</p>
                </div>
                <div>
                  <p className="text-2xl font-thin text-gray-900">
                    {currentExercise.exercise.reps}
                  </p>
                  <p className="text-xs text-gray-400">Ripetizioni</p>
                </div>
                <div>
                  <p className="text-2xl font-thin text-gray-900">
                    {currentExercise.exercise.restTime}s
                  </p>
                  <p className="text-xs text-gray-400">Riposo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weight Input */}
          <Card className="border border-gray-200 shadow-sm mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-900 font-thin text-lg">Inserisci Peso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="weight" className="text-gray-400 text-sm">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="0"
                    className="mt-1 bg-white border-gray-200 text-gray-900 text-center text-2xl h-16"
                    style={{ 
                      backgroundColor: 'white', 
                      borderColor: '#E5E7EB',
                      color: '#1F2937',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="reps" className="text-gray-400 text-sm">Ripetizioni completate</Label>
                  <Input
                    id="reps"
                    type="number"
                    placeholder={currentExercise.exercise.reps.toString()}
                    className="mt-1 bg-white border-gray-200 text-gray-900 text-center text-2xl h-16"
                    style={{ 
                      backgroundColor: 'white', 
                      borderColor: '#E5E7EB',
                      color: '#1F2937',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complete Set Button */}
          <Button
            onClick={() => {
              const weightInput = document.getElementById('weight') as HTMLInputElement;
              const repsInput = document.getElementById('reps') as HTMLInputElement;
              const weight = parseFloat(weightInput.value) || 0;
              const reps = parseInt(repsInput.value) || currentExercise.exercise.reps;
              completeSet(weight, reps);
            }}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-thin py-3 rounded-lg shadow-sm hover:shadow-md minimal-button touch-xl btn-spacing-lg"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <CheckCircle className="h-5 w-5 mr-2" />
            )}
            {loading ? 'Salvando...' : 'Completa Serie'}
          </Button>

          {/* Exercise Navigation */}
          <div className="flex justify-between items-center mt-8">
            <span className="text-sm text-gray-400">
              Esercizio {currentExerciseIndex + 1} di {currentWorkout.length}
            </span>
            <div className="flex gap-2">
              {currentExerciseIndex > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentExerciseIndex(prev => prev - 1)}
                  className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Precedente
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Schermata di riposo
  if (screen === "rest") {
    const progressPercentage = (restTime / currentWorkout[currentExerciseIndex]?.exercise.restTime) * 100;

    return (
      <div className="min-h-screen bg-white safe-all smooth-scroll flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          {/* Timer Circle */}
          <div className="relative w-64 h-64 timer-circle mx-auto mb-12">
            <div className="absolute inset-0 rounded-full border-8 border-gray-100"></div>
            <div 
              className="absolute inset-0 rounded-full border-8 border-transparent border-t-gray-900 border-r-gray-900"
              style={{
                transform: `rotate(${progressPercentage * 3.6}deg)`,
                transition: 'transform 1s linear'
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-6xl font-thin text-gray-900 mb-2">{formatTime(restTime)}</p>
                <p className="text-gray-400">Riposo</p>
              </div>
            </div>
          </div>

          {/* Next Exercise Preview */}
          {currentExerciseIndex < currentWorkout.length - 1 && (
            <Card className="border border-gray-200 shadow-sm mb-8">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-900 font-thin text-lg">Prossimo Esercizio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-thin text-gray-900 mb-2">
                  {currentWorkout[currentExerciseIndex + 1]?.exercise.name}
                </p>
                <p className="text-gray-400 text-sm">
                  {currentWorkout[currentExerciseIndex + 1]?.exercise.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Skip Rest Button */}
          <Button
            onClick={nextExercise}
            variant="outline"
            className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Salta Riposo
          </Button>
        </div>
      </div>
    );
  }

  // Schermata di completamento
  if (screen === "complete") {
    const totalSets = currentWorkout.reduce((sum, ex) => sum + ex.sets.length, 0);
    const totalWeight = currentWorkout.reduce((sum, ex) => sum + ex.sets.reduce((setSum, set) => setSum + set.weight, 0), 0);

    return (
      <div className="min-h-screen bg-white safe-all smooth-scroll flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          {/* Success Animation */}
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="h-10 w-10 text-gray-600" />
          </div>

          <h2 className="text-3xl font-thin text-gray-900 mb-2">Allenamento Completato</h2>
          <p className="text-gray-400 mb-8">Ottimo lavoro</p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <BarChart3 className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-2xl font-thin text-gray-900">{totalSets}</p>
                <p className="text-sm text-gray-400">Serie Totali</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <Dumbbell className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-2xl font-thin text-gray-900">{totalWeight}kg</p>
                <p className="text-sm text-gray-400">Peso Totale</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={resetWorkout}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-thin py-3 minimal-button touch-large btn-spacing"
            >
              Torna alle Schede
            </Button>
            <Button
              onClick={() => {
                setCurrentWorkout([]);
                setCurrentExerciseIndex(0);
                startWorkout(selectedPlan!);
              }}
              variant="outline"
              className="w-full bg-white border-gray-200 text-gray-600 hover:bg-gray-50 minimal-button touch-large btn-spacing"
            >
              Ripeti Allenamento
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}