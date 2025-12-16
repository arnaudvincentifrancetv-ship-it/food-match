import React from 'react';
import { Ingredient } from '../types';
import { TYPE_COLORS } from '../constants';

interface DetailsPanelProps {
  ingredient: Ingredient | null;
  ingredientName?: string; 
  onNavigate?: () => void;
  isCenter: boolean;
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({ 
  ingredient, 
  ingredientName, 
  onNavigate,
  isCenter 
}) => {
  
  if (!ingredient && !ingredientName) return null;

  const displayName = ingredient ? ingredient.nom : ingredientName;
  const typeColor = ingredient && TYPE_COLORS[ingredient.type] ? TYPE_COLORS[ingredient.type] : '#94a3b8';

  const renderRecipeDetails = (details: string) => {
    if (details.includes("Proportions")) {
      // Parse cocktail proportions
      const cleanText = details.replace("Proportions :", "").trim();
      const items = cleanText.split(',').map(s => s.trim());
      return (
        <div className="mt-2">
          <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Proportions</p>
          <ul className="list-disc list-inside space-y-1">
            {items.map((item, idx) => (
              <li key={idx} className="text-slate-300 text-sm">{item}</li>
            ))}
          </ul>
        </div>
      );
    }
    return <p className="text-slate-200 text-sm leading-relaxed font-light mt-1">{details}</p>;
  };

  return (
    <div className="absolute top-36 right-6 w-80 max-h-[calc(100vh-180px)] overflow-y-auto custom-scroll z-20 pointer-events-none pb-6">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50 pointer-events-auto transform transition-all duration-500 ease-out hover:border-slate-600">
        
        {/* Header */}
        <div className="mb-4 pb-3 border-b border-slate-700/50">
           <div className="flex justify-between items-start gap-2">
             <h2 className="text-3xl font-bold text-white mb-1 tracking-tight leading-none break-words">
               {displayName}
             </h2>
             {ingredient?.type && (
               <span 
                 className="shrink-0 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-900 shadow-sm"
                 style={{ backgroundColor: typeColor }}
               >
                 {ingredient.type}
               </span>
             )}
           </div>
           {ingredient && (
             <div className="mt-2">
               <p className="text-amber-400/90 text-sm font-medium">
                 {ingredient.famille_saveur}
               </p>
               <p className="text-slate-400 text-xs italic mt-1 leading-snug">
                 {ingredient.description}
               </p>
             </div>
           )}
        </div>

        {/* Content */}
        {ingredient ? (
          <div className="space-y-5">
            
            {/* Profil Sensoriel Tags */}
            <div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {ingredient.profil_sensoriel.split('/').map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-medium">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Info Technique */}
            <div className="flex items-start gap-2 bg-slate-800/30 p-2.5 rounded-lg border border-slate-700/30">
              <svg className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-slate-300">
                <span className="font-semibold text-slate-400">Info : </span>
                {ingredient.info_technique}
              </p>
            </div>

            {/* Stats Pills */}
            <div className="grid grid-cols-5 gap-1">
               {/* Tiny stats bar */}
               <div className="col-span-1 h-1 bg-emerald-500 rounded-l-full opacity-80" style={{width: '100%'}}></div>
               <div className="col-span-1 h-1 bg-pink-500 opacity-80" style={{width: '100%'}}></div>
               <div className="col-span-1 h-1 bg-red-800 opacity-80" style={{width: '100%'}}></div>
               <div className="col-span-1 h-1 bg-orange-500 opacity-80" style={{width: '100%'}}></div>
               <div className="col-span-1 h-1 bg-yellow-500 rounded-r-full opacity-80" style={{width: '100%'}}></div>
               
               {/* Numbers below */}
               <div className="text-center text-[10px] text-slate-500">{ingredient.associations.sale.length}</div>
               <div className="text-center text-[10px] text-slate-500">{ingredient.associations.sucre.length}</div>
               <div className="text-center text-[10px] text-slate-500">{ingredient.associations.vin.length}</div>
               <div className="text-center text-[10px] text-slate-500">{ingredient.associations.mixologie.length}</div>
               <div className="text-center text-[10px] text-slate-500">{ingredient.associations.biere_cidre.length}</div>
            </div>

            {/* Recipe Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl p-4 border border-slate-700 group hover:border-slate-600 transition-colors">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5 tracking-widest">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Inspiration
              </h3>
              <p className="text-slate-100 font-bold text-sm mb-1">{ingredient.recette_data.titre}</p>
              {renderRecipeDetails(ingredient.recette_data.details)}
            </div>

            {/* Navigation Action */}
            {!isCenter && onNavigate && (
               <button 
                 onClick={onNavigate}
                 className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 group"
               >
                 <span>Centrer la galaxie</span>
                 <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
               </button>
            )}
          </div>
        ) : (
          <div className="text-center py-8 px-4">
             <div className="inline-block p-3 rounded-full bg-slate-800 mb-4">
               <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </div>
             <p className="text-slate-300 text-sm font-medium mb-2">
               Ingrédient Terminus
             </p>
             <p className="text-xs text-slate-500 leading-relaxed">
               Cet ingrédient est une destination finale et ne possède pas encore ses propres ramifications.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsPanel;
