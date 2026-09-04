import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { LineChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/Card';
import { formatCurrency } from '../../lib/calculations';
import { reportService } from '../../services/reportService';
import { PLANS } from '../../constants/plans';

const screenWidth = Dimensions.get('window').width;

export default function Reports() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const currency = user?.currency || 'KES';
  const planId = user?.plan || 'free';
  const planLimits = PLANS[planId] || PLANS.free;

  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weekAgoStr = weekAgo.toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(weekAgoStr);
  const [endDate, setEndDate] = useState(today);
  const [selecting, setSelecting] = useState('start'); // 'start' | 'end'
  const [dailyData, setDailyData] = useState([]);
  const [summary, setSummary] = useState({ revenue: 0, cost: 0, profit: 0, salesCount: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Enforce free plan date clamp locally
  const clampDatesForPlan = useCallback((s, e) => {
    if (planLimits.reportDays === null) return { s, e };
    const allowedStart = new Date();
    allowedStart.setHours(0, 0, 0, 0);
    allowedStart.setDate(allowedStart.getDate() - (planLimits.reportDays - 1));
    const allowedStr = allowedStart.toISOString().slice(0, 10);
    if (s < allowedStr) return { s: allowedStr, e };
    return { s, e };
  }, [planLimits.reportDays]);

  const loadReports = useCallback(async () => {
    try {
      const clamped = clampDatesForPlan(startDate, endDate);

      const [daily, sum] = await Promise.all([
        reportService.getDaily(clamped.s, clamped.e).catch(() => []),
        reportService.getSummary(clamped.s, clamped.e).catch(() => ({
          revenue: 0,
          cost: 0,
          profit: 0,
          salesCount: 0,
        })),
      ]);

      setDailyData(Array.isArray(daily) ? daily : []);
      setSummary(sum || { revenue: 0, cost: 0, profit: 0, salesCount: 0 });
    } catch (err) {
      console.log('Reports error:', err.message);
      setDailyData([]);
      setSummary({ revenue: 0, cost: 0, profit: 0, salesCount: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [startDate, endDate, clampDatesForPlan]);

  useEffect(() => {
    setLoading(true);
    loadReports();
  }, [loadReports]);

  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  const onDayPress = (day) => {
    if (selecting === 'start') {
      setStartDate(day.dateString);
      if (day.dateString > endDate) setEndDate(day.dateString);
      setSelecting('end');
    } else {
      setEndDate(day.dateString);
      if (day.dateString < startDate) setStartDate(day.dateString);
      setSelecting('start');
    }
  };

  const markedDates = {
    [startDate]: {
      startingDay: true,
      color: theme.primary,
      textColor: '#fff',
    },
    [endDate]: {
      endingDay: true,
      color: theme.primary,
      textColor: '#fff',
    },
  };

  // Fill in-between days
  if (startDate !== endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);
    current.setDate(current.getDate() + 1);
    while (current < end) {
      const key = current.toISOString().slice(0, 10);
      markedDates[key] = { color: theme.primary + '40', textColor: theme.text };
      current.setDate(current.getDate() + 1);
    }
  }

  const chartData = {
    labels: dailyData.length
      ? dailyData.map((d) => d.date.slice(8))
      : ['—'],
    datasets: [
      {
        data: dailyData.length ? dailyData.map((d) => d.revenue || 0) : [0],
        color: () => theme.accent,
        strokeWidth: 2,
      },
      {
        data: dailyData.length ? dailyData.map((d) => d.profit || 0) : [0],
        color: () => theme.primary,
        strokeWidth: 2,
      },
    ],
    legend: ['Revenue', 'Profit'],
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {planLimits.reportDays !== null && (
        <View style={{ backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#f59e0b', borderRadius: 10, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ color: '#92400e', flex: 1, fontSize: 13 }}>
            Free plan: reports limited to last {planLimits.reportDays} days. Upgrade for full history.
          </Text>
          <TouchableOpacity onPress={() => router.push('/paywall')} style={{ backgroundColor: theme.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>Upgrade</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Date range selector */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Select Period ({selecting === 'start' ? 'Start date' : 'End date'})
      </Text>
      <Card style={{ backgroundColor: theme.card, marginBottom: 16, overflow: 'hidden' }}>
        <Calendar
          current={selecting === 'start' ? startDate : endDate}
          onDayPress={onDayPress}
          markedDates={markedDates}
          markingType="period"
          theme={{
            backgroundColor: theme.card,
            calendarBackground: theme.card,
            textSectionTitleColor: theme.textSecondary,
            selectedDayBackgroundColor: theme.primary,
            selectedDayTextColor: '#fff',
            todayTextColor: theme.accent,
            dayTextColor: theme.text,
            arrowColor: theme.primary,
            monthTextColor: theme.text,
          }}
        />
      </Card>

      <View style={styles.rangeRow}>
        <TouchableOpacity
          style={[
            styles.rangeChip,
            selecting === 'start' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setSelecting('start')}
        >
          <Text style={{ color: selecting === 'start' ? '#fff' : theme.text, fontWeight: '600' }}>
            From: {startDate}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.rangeChip,
            selecting === 'end' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setSelecting('end')}
        >
          <Text style={{ color: selecting === 'end' ? '#fff' : theme.text, fontWeight: '600' }}>
            To: {endDate}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary cards */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Summary</Text>
      <View style={styles.summaryRow}>
        <Card style={[styles.summaryCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Revenue</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>
            {formatCurrency(summary.revenue, currency)}
          </Text>
        </Card>
        <Card style={[styles.summaryCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Cost</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>
            {formatCurrency(summary.cost, currency)}
          </Text>
        </Card>
      </View>
      <View style={styles.summaryRow}>
        <Card style={[styles.summaryCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Profit</Text>
          <Text
            style={[
              styles.summaryValue,
              { color: summary.profit >= 0 ? theme.accent : '#ef4444' },
            ]}
          >
            {formatCurrency(summary.profit, currency)}
          </Text>
        </Card>
        <Card style={[styles.summaryCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Sales</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>
            {summary.salesCount || 0}
          </Text>
        </Card>
      </View>

      {/* Chart */}
      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 8 }]}>
        Revenue & Profit
      </Text>
      <Card style={{ backgroundColor: theme.card, paddingVertical: 12 }}>
        {dailyData.length === 0 ? (
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            No sales in this period
          </Text>
        ) : (
          <LineChart
            data={chartData}
            width={screenWidth - 64}
            height={200}
            chartConfig={{
              backgroundColor: theme.card,
              backgroundGradientFrom: theme.card,
              backgroundGradientTo: theme.card,
              decimalPlaces: 0,
              color: (opacity = 1) => theme.primary,
              labelColor: () => theme.textSecondary,
              propsForDots: { r: '3', strokeWidth: '2', stroke: theme.accent },
            }}
            bezier
            style={{ borderRadius: 12 }}
          />
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  rangeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  rangeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
  },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  summaryCard: { flex: 1, padding: 14 },
  summaryLabel: { fontSize: 12, marginBottom: 4 },
  summaryValue: { fontSize: 17, fontWeight: '700' },
  empty: { textAlign: 'center', paddingVertical: 30 },
});