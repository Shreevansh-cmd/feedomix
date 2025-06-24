
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { birdTypes } from '@/data/feedData';

interface PhaseSelectorProps {
  selectedBirdType: string;
  selectedPhase: string;
  onPhaseChange: (phase: string) => void;
}

export const PhaseSelector = ({ selectedBirdType, selectedPhase, onPhaseChange }: PhaseSelectorProps) => {
  const selectedBird = birdTypes.find(bird => bird.id === selectedBirdType);

  if (!selectedBirdType) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-400 mb-3">Select Phase</h3>
        <p className="text-gray-400 text-center py-4">Please select a bird type first</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Growth Phase</h3>
      <div className="space-y-3">
        {selectedBird?.phases.map((phase) => (
          <Card
            key={phase.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedPhase === phase.id
                ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300'
                : 'hover:border-blue-300'
            }`}
            onClick={() => onPhaseChange(phase.id)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-800">{phase.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {phase.ageRange}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Protein:</span> {phase.protein}
                </div>
                <div>
                  <span className="font-medium">Energy:</span> {phase.energy}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
