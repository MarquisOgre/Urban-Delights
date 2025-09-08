import MasterIngredientList from '@/components/MasterIngredientList';
import { type MasterIngredient } from '@/services/database';

interface IngredientsProps {
  masterIngredients: MasterIngredient[];
  onRefresh: () => void;
  onBackToDashboard: () => void;
}

const Ingredients = ({ masterIngredients, onRefresh, onBackToDashboard }: IngredientsProps) => {
  return (
    <MasterIngredientList 
      masterIngredients={masterIngredients} 
      onRefresh={onRefresh} 
      onBackToDashboard={onBackToDashboard}
    />
  );
};

export default Ingredients;