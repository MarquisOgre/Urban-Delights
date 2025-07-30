import MasterIngredientList from '@/components/MasterIngredientList';
import { type MasterIngredient } from '@/services/database';

interface IngredientsProps {
  masterIngredients: MasterIngredient[];
  onRefresh: () => void;
}

const Ingredients = ({ masterIngredients, onRefresh }: IngredientsProps) => {
  return (
    <MasterIngredientList masterIngredients={masterIngredients} onRefresh={onRefresh} />
  );
};

export default Ingredients;