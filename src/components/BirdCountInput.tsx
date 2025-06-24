
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BirdCountInputProps {
  birdCount: number;
  onBirdCountChange: (count: number) => void;
}

export const BirdCountInput = ({ birdCount, onBirdCountChange }: BirdCountInputProps) => {
  return (
    <div>
      <Label htmlFor="birdCount" className="text-lg font-semibold text-gray-800 block mb-3">
        Number of Birds
      </Label>
      <Input
        id="birdCount"
        type="number"
        min="1"
        max="50000"
        value={birdCount || ''}
        onChange={(e) => onBirdCountChange(parseInt(e.target.value) || 0)}
        placeholder="Enter number of birds"
        className="text-lg py-3 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
      />
      <p className="text-sm text-gray-500 mt-2">
        Enter the total number of birds in your flock (1-50,000)
      </p>
    </div>
  );
};
