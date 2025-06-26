
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NutrientPieChartProps {
  data: {
    protein: number;
    fat: number;
    fiber: number;
    ash: number;
    moisture: number;
    carbohydrates: number;
  };
}

const COLORS = {
  protein: '#8b5cf6',
  fat: '#f59e0b',
  fiber: '#10b981',
  ash: '#6b7280',
  moisture: '#3b82f6',
  carbohydrates: '#ef4444'
};

export const NutrientPieChart = ({ data }: NutrientPieChartProps) => {
  const chartData = [
    { name: 'Protein', value: data.protein, color: COLORS.protein },
    { name: 'Fat', value: data.fat, color: COLORS.fat },
    { name: 'Fiber', value: data.fiber, color: COLORS.fiber },
    { name: 'Ash', value: data.ash, color: COLORS.ash },
    { name: 'Moisture', value: data.moisture, color: COLORS.moisture },
    { name: 'Carbohydrates', value: data.carbohydrates, color: COLORS.carbohydrates }
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm" style={{ color: data.payload.color }}>
            {data.value.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for very small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="shadow-lg border-purple-200">
      <CardHeader className="bg-purple-100">
        <CardTitle className="text-purple-800 text-center">
          Nutrient Composition
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
