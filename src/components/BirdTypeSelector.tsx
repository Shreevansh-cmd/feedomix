
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { birdTypes } from '@/data/feedData';

interface BirdTypeSelectorProps {
  selectedBirdType: string;
  onBirdTypeChange: (birdType: string) => void;
}

export const BirdTypeSelector = ({ selectedBirdType, onBirdTypeChange }: BirdTypeSelectorProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Bird Type</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {birdTypes.map((birdType) => (
          <Card
            key={birdType.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedBirdType === birdType.id
                ? 'ring-2 ring-green-500 bg-green-50 border-green-300'
                : 'hover:border-green-300'
            }`}
            onClick={() => onBirdTypeChange(birdType.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-lg">
                {birdType.name === 'Broiler' ? '🐔' : '🥚'} {birdType.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                {birdType.phases.length} phases available
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
