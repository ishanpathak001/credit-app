import React from 'react';
import { View, Dimensions, Text } from 'react-native';
import { StackedBarChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';

interface ChartData {
  day: string;
  settled: string | number;
  pending: string | number;
}

interface TransactionsChartProps {
  chartData: ChartData[];
}

const screenWidth = Dimensions.get('window').width;

const TransactionsChart: React.FC<TransactionsChartProps> = ({ chartData }) => {
  const { isDark } = useTheme();

  const labels = chartData.map(d => d.day);
  const data = chartData.map(d => [Number(d.settled), Number(d.pending)]); // convert to number

  const cardStyle = {
    backgroundColor: isDark ? '#1f2937' : '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 16,
  };

  return (
    <View style={cardStyle}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 16,
          color: isDark ? '#fff' : '#111',
        }}
      >
        📊 Transactions This Week
      </Text>
      <StackedBarChart
        data={{
          labels: labels || [],
          legend: ['Settled', 'Pending'],
          data: data || [],
          barColors: ['#2563eb', '#ef4444'],
        }}
        width={screenWidth - 64} // reduce width to fit card padding
        height={220}
        chartConfig={{
          backgroundGradientFrom: isDark ? '#1f2937' : '#fff',
          backgroundGradientTo: isDark ? '#1f2937' : '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(37,99,235,${opacity})`,
          labelColor: (opacity = 1) =>
            isDark ? `rgba(209,213,219,${opacity})` : `rgba(107,114,128,${opacity})`,
        }}
        style={{ borderRadius: 12 }}
        hideLegend={true}
      />
    </View>
  );
};

export default TransactionsChart;
