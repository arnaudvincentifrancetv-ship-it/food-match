import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export interface IngredientAssociations {
  sale: string[];
  sucre: string[];
  vin: string[];
  mixologie: string[];
  biere_cidre: string[];
}

export interface RecipeData {
  titre: string;
  details: string;
}

export interface Ingredient {
  nom: string;
  type: string;
  famille_saveur: string;
  description: string;
  profil_sensoriel: string;
  info_technique: string;
  associations: IngredientAssociations;
  recette_data: RecipeData;
}

export interface FilterState {
  sale: boolean;
  sucre: boolean;
  vin: boolean;
  mixologie: boolean;
  biere_cidre: boolean;
}

export type CategoryType = keyof IngredientAssociations | 'main';

export interface GraphNode extends SimulationNodeDatum {
  id: string;
  group: 'center' | 'satellite';
  category: CategoryType;
  data?: Ingredient | null; // Full data if available in our DB
  name: string;
  color: string;
  radius: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number;
  color: string; // Links now carry the color of the category
}
