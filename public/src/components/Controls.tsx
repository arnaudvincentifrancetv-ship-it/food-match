import React, { useState, useEffect } from 'react';
import { FilterState, Ingredient } from '../types';

interface ControlsProps {
  allIngredients: Ingredient[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSelectIngredient: (ingredient: Ingredient) => void;
}

const Controls: React.FC<ControlsProps> = ({ 
  allIngredients, 
  filters, 
  setFilters, 
  onSelectIngredient 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);

  // Handle Search Input
  useEffect(() => {
    if (searchTerm.length < 1) {
      setSuggestions([]);
      return;
    }
    const matches = allIngredients.filter(ing => 
      ing.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSuggestions(matches);
  }, [searchTerm, allIngredients]);

  const toggleFilter = (key: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex justify-center w-full pointer-events-none px-4">
      {/* Container Capsule - Compact & Centered */}
      <div className="flex flex-col lg:flex-row items-center gap-2 p-2 bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-xl shadow-2xl pointer-events-auto w-auto transition-all">
        
        {/* Search Bar */}
        <div className="relative w-full lg:w-60 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-1.5 border border-slate-600 rounded-lg bg-slate-800/50 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm transition-all"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {/* Autocomplete Dropdown */}
          {suggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-auto custom-scroll z-50">
              {suggestions.map((ing) => (
                <li 
                  key={ing.nom}
                  className="px-4 py-2 hover:bg-slate-700 cursor-pointer flex justify-between items-center group transition-colors"
                  onClick={() => {
                    onSelectIngredient(ing);
                    setSearchTerm('');
                    setSuggestions([]);
                  }}
                >
                  <span className="text-slate-200 group-hover:text-amber-400 font-medium text-sm">{ing.nom}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{ing.type}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Divider (Desktop only) */}
        <div className="hidden lg:block w-px h-6 bg-slate-700 mx-1"></div>

        {/* Filter Toggles - Compact */}
        <div className="flex gap-1.5 flex-wrap justify-center w-full lg:w-auto">
          
          {/* 1. Salé */}
          <button
            onClick={() => toggleFilter('sale')}
            className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all border flex items-center gap-1.5 ${
              filters.sale 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${filters.sale ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
            SALÉ
          </button>

          {/* 2. Sucré */}
          <button
            onClick={() => toggleFilter('sucre')}
            className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all border flex items-center gap-1.5 ${
              filters.sucre 
                ? 'bg-pink-500/10 text-pink-400 border-pink-500/50 shadow-[0_0_10px_rgba(236,72,153,0.2)]' 
                : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${filters.sucre ? 'bg-pink-500' : 'bg-slate-600'}`}></span>
            SUCRÉ
          </button>

          {/* 3. Vin */}
          <button
            onClick={() => toggleFilter('vin')}
            className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all border flex items-center gap-1.5 ${
              filters.vin 
                ? 'bg-red-900/20 text-red-400 border-red-800/50 shadow-[0_0_10px_rgba(127,29,29,0.2)]' 
                : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${filters.vin ? 'bg-red-800' : 'bg-slate-600'}`}></span>
            VIN
          </button>

          {/* 4. Mixologie */}
          <button
            onClick={() => toggleFilter('mixologie')}
            className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all border flex items-center gap-1.5 ${
              filters.mixologie 
                ? 'bg-orange-500/10 text-orange-400 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.2)]' 
                : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${filters.mixologie ? 'bg-orange-500' : 'bg-slate-600'}`}></span>
            MIXOLOGIE
          </button>

          {/* 5. Bière & Cidre */}
          <button
            onClick={() => toggleFilter('biere_cidre')}
            className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all border flex items-center gap-1.5 ${
              filters.biere_cidre 
                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
                : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${filters.biere_cidre ? 'bg-yellow-500' : 'bg-slate-600'}`}></span>
            BIÈRE & CIDRE
          </button>

        </div>
      </div>
    </div>
  );
};

export default Controls;
