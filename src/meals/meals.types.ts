export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type MealStatus = "planned" | "prepared" | "skipped";

export type MealPlan = {
  id: string;
  date: string;
  mealType: MealType;
  title: string;
  servings: number;
  prepMinutes?: number;
  calories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  ingredients: string[];
  shoppingNeeded: boolean;
  note?: string;
  status: MealStatus;
  createdAt?: string;
};

export type MealFilters = { dateFrom?: string; dateTo?: string; status?: MealStatus };
export type MealSummary = { totalMeals: number; plannedMeals: number; preparedMeals: number; prepMinutes: number; shoppingNeeded: number };
