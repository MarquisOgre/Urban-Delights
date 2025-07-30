import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RecipesDisplay from '@/components/RecipesDisplay';
import { fetchRecipesWithIngredients } from '@/services/database';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const RecipesDashboard: React.FC = () => {
  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipesWithIngredients,
  });

  const exportAllData = async () => {
    try {
      const wb = XLSX.utils.book_new();
      
      const recipesData = recipes.map(recipe => ({
        name: recipe.name,
        selling_price: recipe.selling_price,
        overheads: recipe.overheads,
        calories: recipe.calories,
        protein: recipe.protein,
        fat: recipe.fat,
        carbs: recipe.carbs,
        preparation: recipe.preparation,
        shelf_life: recipe.shelf_life,
        storage: recipe.storage,
        is_hidden: recipe.is_hidden
      }));
      
      const recipesWS = XLSX.utils.json_to_sheet(recipesData);
      XLSX.utils.book_append_sheet(wb, recipesWS, 'Recipes');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, `recipes-data-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header exportAllData={exportAllData} />
      
      <main className="container mx-auto px-4 py-6 pb-24">
        <RecipesDisplay recipes={recipes} onExport={exportAllData} />
      </main>
      
      <Footer showTopButton={true} />
    </div>
  );
};

export default RecipesDashboard;