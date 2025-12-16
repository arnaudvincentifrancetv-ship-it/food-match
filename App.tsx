
import React, { useState, useCallback, useEffect } from 'react';
import { INGREDIENTS_DATA } from './constants';
import { Ingredient, FilterState } from './types';
import GalaxyGraph from './components/GalaxyGraph';
import Controls from './components/Controls';
import DetailsPanel from './components/DetailsPanel';

const App: React.FC = () => {
  // Loading State
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState<Ingredient[]>(INGREDIENTS_DATA);
  
  // Interaction State
  const [centerIngredient, setCenterIngredient] = useState<Ingredient | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    sale: true,
    sucre: true,
    vin: true,
    mixologie: true,
    biere_cidre: true
  });
  
  const [hoveredNode, setHoveredNode] = useState<{data: Ingredient | null, name: string} | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // DATA FETCHING EFFECT
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Construct correct path using Vite's base URL environment variable
        // This ensures it works on localhost and on GitHub Pages sub-directory
        // Cast to any to avoid TS error if vite/client types are missing in tsconfig
        const baseUrl = (import.meta as any).env.BASE_URL;
        const dataUrl = `${baseUrl}data.json`;
        
        const response = await fetch(dataUrl);
        if (response.ok) {
          const externalData = await response.json();
          if (Array.isArray(externalData) && externalData.length > 0) {
            console.log("Loaded data from external source:", externalData.length, "items");
            setIngredients(externalData);
          }
        }
      } catch (error) {
        console.log("Using static fallback data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set default center once data is loaded
  useEffect(() => {
    if (!loading && ingredients.length > 0 && !centerIngredient) {
        const defaultCenter = ingredients.find(i => i.nom === "Abricot") || ingredients[0];
        setCenterIngredient(defaultCenter);
    }
  }, [loading, ingredients, centerIngredient]);

  // Handlers
  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleNodeClick = useCallback((nodeName: string) => {
    // 1. Try to find the clicked node in our full database (dynamic ingredients)
    const found = ingredients.find(i => i.nom === nodeName);

    if (found) {
      // 2. If it exists as a main entry, make it the center
      setCenterIngredient(found);
      setHoveredNode(null); // Reset hover state to show new center in panel
    } else {
      // 3. If it's a leaf node without its own connections map
      showNotification(`L'ingrédient "${nodeName}" est un terminus. Pas d'autres associations disponibles.`);
    }
  }, [ingredients, showNotification]);

  const handleSelectIngredient = useCallback((ingredient: Ingredient) => {
    setCenterIngredient(ingredient);
    setHoveredNode(null);
  }, []);

  const handleNodeHover = useCallback((data: Ingredient | null, name: string) => {
    setHoveredNode(prev => {
      if (!name) return null;
      if (prev?.name === name) return prev;
      return { data, name };
    });
  }, []);

  const downloadBlueprint = () => {
    const blueprint = {
      "name": "Food'Match - Notion to GitHub Sync",
      "flow": [
        {
          "id": 1,
          "module": "notion:searchObjects",
          "version": 1,
          "parameters": { "limit": 1000 },
          "mapper": {
            "filter": { "property": "Status", "select": { "equals": "Publié" } },
            "databaseId": "SELECTIONNEZ_VOTRE_DATABASE_ICI"
          },
          "metadata": { "designer": { "x": 0, "y": 0, "name": "Récupérer Ingrédients Publiés" } }
        },
        {
          "id": 2,
          "module": "json:aggregate",
          "version": 1,
          "parameters": { "groupBy": "" },
          "mapper": {
            "nom": "{{1.properties.Name.title[1].plain_text}}",
            "type": "{{1.properties.Type.select.name}}",
            "famille_saveur": "{{1.properties['Famille Saveur'].rich_text[1].plain_text}}",
            "description": "{{1.properties.Description.rich_text[1].plain_text}}",
            "profil_sensoriel": "{{1.properties['Profil Sensoriel'].rich_text[1].plain_text}}",
            "info_technique": "{{1.properties['Info Technique'].rich_text[1].plain_text}}",
            "associations": {
              "sale": "{{map(1.properties['Associations Salé'].multi_select; \"name\")}}",
              "sucre": "{{map(1.properties['Associations Sucré'].multi_select; \"name\")}}",
              "vin": "{{map(1.properties['Associations Vin'].multi_select; \"name\")}}",
              "mixologie": "{{map(1.properties['Associations Mixologie'].multi_select; \"name\")}}",
              "biere_cidre": "{{map(1.properties['Associations Bière'].multi_select; \"name\")}}"
            },
            "recette_data": {
              "titre": "{{1.properties['Recette Titre'].rich_text[1].plain_text}}",
              "details": "{{1.properties['Recette Détails'].rich_text[1].plain_text}}"
            }
          },
          "metadata": { "designer": { "x": 300, "y": 0, "name": "Transformer en Format App" } }
        },
        {
          "id": 3,
          "module": "github:updateFile",
          "version": 1,
          "parameters": {
            "path": "public/data.json",
            "branch": "main",
            "repo": "VOTRE_NOM_UTILISATEUR/food-match",
            "message": "Update ingredients from Notion via Make"
          },
          "mapper": { "content": "{{2.json}}", "sha": "" },
          "metadata": { "designer": { "x": 600, "y": 0, "name": "Mettre à jour GitHub" } }
        }
      ]
    };

    const blob = new Blob([JSON.stringify(blueprint, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'food_match_make_blueprint.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading || !centerIngredient) {
    return (
        <div className="w-screen h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-amber-400 font-bold animate-pulse tracking-widest">CHARGEMENT DE LA GALAXIE...</div>
        </div>
    );
  }

  return (
    <div className="relative w-screen h-screen bg-slate-900 flex flex-col border-t-4 border-amber-400 overflow-hidden">
      
      {/* Top Overlay: Controls */}
      <div className="absolute top-0 left-0 right-0 z-10 pt-3 pointer-events-none">
        <header className="text-center mb-1 pointer-events-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-400 tracking-[0.2em] font-['Outfit'] drop-shadow-lg cursor-pointer" onClick={() => window.location.reload()}>
            FOOD'MATCH
          </h1>
          <p className="text-slate-400 text-[10px] tracking-[0.3em] uppercase mt-1">L'Art du Food Pairing</p>
        </header>
        <Controls 
          allIngredients={ingredients}
          filters={filters}
          setFilters={setFilters}
          onSelectIngredient={handleSelectIngredient}
        />
      </div>

      {/* Main Visualization Area */}
      <div className="flex-1 w-full h-full relative z-0">
        <GalaxyGraph 
          centerIngredient={centerIngredient}
          filters={filters}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
        />
      </div>

      {/* Details Panel (Responsive: Bottom Sheet on Mobile, Side Panel on Desktop) */}
      <DetailsPanel 
        ingredient={hoveredNode ? hoveredNode.data : centerIngredient} 
        ingredientName={hoveredNode ? hoveredNode.name : centerIngredient.nom}
        isCenter={!hoveredNode || hoveredNode.name === centerIngredient.nom}
        onNavigate={() => {
             if (hoveredNode && hoveredNode.name) {
                 handleNodeClick(hoveredNode.name);
             }
        }}
      />
      
      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800/90 backdrop-blur text-white px-6 py-4 rounded-xl shadow-2xl border border-slate-600 animate-bounce z-50 flex flex-col items-center gap-2 text-center pointer-events-none">
          <div className="p-2 bg-amber-500/20 rounded-full">
            <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Footer Info & Admin Tools */}
      <div className="absolute bottom-2 right-4 z-10 pointer-events-auto text-right flex flex-col items-end gap-1 hidden md:flex">
        <p className="text-slate-600 text-[10px] pointer-events-none opacity-50">
          Arnaud Vincenti Dec 2025 Version 1
        </p>
        <button 
          onClick={downloadBlueprint}
          className="text-[10px] text-slate-700 hover:text-amber-500 transition-colors flex items-center gap-1"
          title="Télécharger le fichier Blueprint pour Make.com"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Blueprint Make
        </button>
      </div>

    </div>
  );
};

export default App;
