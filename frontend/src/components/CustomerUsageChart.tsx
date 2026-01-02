import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import API from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { on } from '../utils/eventBus';

const screenWidth = Dimensions.get('window').width;

const CustomerUsageChart = () => {
  const { token, user } = useContext(AuthContext);
  const { isDark } = useTheme();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { headers: { Authorization: `Bearer ${token}` } };
      const res = await API.get('/analytics/customer-usage', headers);
      setData(res.data || []);
    } catch (err) {
      console.log('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    const unsubAdded = on('transactions:added', fetchAnalytics);
    const unsubSettled = on('transactions:settled', fetchAnalytics);
    const unsubLimit = on('global-limit:updated', fetchAnalytics);

    return () => {
      unsubAdded();
      unsubSettled();
      unsubLimit();
    };
  }, [token, user?.global_credit_limit]);

  if (loading) {
    return (
      <View style={{ padding: 16 }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!data.length) {
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>No customers found.</Text>
      </View>
    );
  }

  // Chart only shows pending totals
  const chartData = {
    labels: data.map(c =>
      c.full_name.length > 8 ? c.full_name.slice(0, 8) + '…' : c.full_name
    ),
    datasets: [
      {
        data: data.map(c => Number(c.pending_total) || 0),
      },
    ],
  };

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1f2937' : '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 8,
          color: isDark ? '#fff' : '#111',
        }}
      >
        📊 Customer Pending Transactions
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={chartData}
          width={Math.max(screenWidth, data.length * 60)}
          height={220}
          fromZero
          showValuesOnTopOfBars
          yAxisLabel="₹"
          chartConfig={{
            backgroundGradientFrom: isDark ? '#1f2937' : '#fff',
            backgroundGradientTo: isDark ? '#1f2937' : '#fff',
            decimalPlaces: 0,
            color: () => '#3b82f6',
            labelColor: () => (isDark ? '#e5e7eb' : '#374151'),
            barPercentage: 0.6,
          }}
          style={{ borderRadius: 12, marginBottom: 8 }} yAxisSuffix={''}        />
      </ScrollView>

      {data.map(c => (
        <Text
          // key={c.id}
          style={{
            fontSize: 12,
            marginTop: 4,
            color: isDark ? '#9ca3af' : '#6b7280',
          }}
        >
          Credit Limit: ₹{user?.global_credit_limit}
        </Text>
      ))}
    </View>
  );
};

export default CustomerUsageChart;
