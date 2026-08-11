import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import { formatCurrency } from '../../lib/calculations';
import { reportService } from '../../services/reportService';
import { movementService } from '../../services/movementService';

const { width } = Dimensions.get('window');

export default function Reports() {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [selecting, setSelecting] = useState('start');
  const [dailyData, setDailyData] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const [daily, movements] = await Promise.all([
        reportService.getDaily(startDate, endDate),
        movementService.getAll({ type: 'SALE', start: startDate, end: endDate }),
      ]);
      setDailyData(daily || []);
      setSales(movements || []);
    } catch (err) {
      console.log('Reports error:', err.message);
      setDailyData([]);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const totals = dailyData.reduce(
    (acc, d) => {
      acc.revenue += d.revenue || 0;
      acc.profit += d.profit || 0;
      acc.cost += d.cost || 0;
      return acc;
    },
    { revenue: 0, profit: 0, cost: 0 }
  );

  const chartData = {
    labels: dailyData.map((d) => (d.date || '').slice(8)),
    datasets: [
      {
        data: dailyData.length ? dailyData.map((d) => d.revenue || 0) : [0],
        color: () => Colors.primary,
        strokeWidth: 2,
      },
      {
        data: dailyData.length ? dailyData.map((d) => d.profit || 0) : [0],
        color: () => Colors.accent,
        strokeWidth: 2,
      },
    ],
    legend: ['Revenue', 'Profit'],
  };

  const markedDates = {};
  if (startDate) {
    markedDates[startDate] = { startingDay: true, color: Colors.primary, textColor: '#fff' };
  }
  if (endDate && endDate !== startDate) {
    markedDates[endDate] = { endingDay: true, color: Colors.primary, textColor: '#fff' };
  }

  const onDayPress = (day) => {
    if (selecting === 'start') {
      setStartDate(day.dateString);
      setSelecting('end');
    } else {
      if (day.dateString < startDate) {
        setStartDate(day.dateString);
      } else {
        setEndDate(day.dateString);
      }
      setSelecting('start');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.sectionTitle}>Select Period</Text>
        <View style={styles.periodRow}>
          <TouchableOpacity
            style={[styles.periodBtn, selecting === 'start' && styles.periodBtnActive]}
            onPress={() => setSelecting('start')}
          >
            <Text style={styles.periodLabel}>From</Text>
            <Text style={styles.periodValue}>{startDate}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodBtn, selecting === 'end' && styles.periodBtnActive]}
            onPress={() => setSelecting('end')}
          >
            <Text style={styles.periodLabel}>To</Text>
            <Text style={styles.periodValue}>{endDate}</Text>
          </TouchableOpacity>
        </View>
        <Calendar
          onDayPress={onDayPress}
          markedDates={markedDates}
          markingType="period"
          theme={{
            selectedDayBackgroundColor: Colors.primary,
            todayTextColor: Colors.accent,
            arrowColor: Colors.primary,
            monthTextColor: Colors.text,
            textDayFontWeight: '500',
          }}
          style={styles.calendar}
        />
      </Card>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.summaryRow}>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Revenue</Text>
              <Text style={[styles.summaryValue, { color: Colors.primary }]}>
                {formatCurrency(totals.revenue)}
              </Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Profit</Text>
              <Text style={[styles.summaryValue, { color: Colors.accent }]}>
                {formatCurrency(totals.profit)}
              </Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>COGS</Text>
              <Text style={[styles.summaryValue, { color: Colors.warning }]}>
                {formatCurrency(totals.cost)}
              </Text>
            </Card>
          </View>

          <Card style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Revenue & Profit Trend</Text>
            {dailyData.length > 0 ? (
              <LineChart
                data={chartData}
                width={width - 64}
                height={220}
                chartConfig={{
                  backgroundColor: Colors.white,
                  backgroundGradientFrom: Colors.white,
                  backgroundGradientTo: Colors.white,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(13, 79, 60, ${opacity})`,
                  labelColor: () => Colors.textSecondary,
                  propsForDots: { r: '5', strokeWidth: '2', stroke: Colors.primary },
                  propsForBackgroundLines: { stroke: Colors.border },
                }}
                bezier
                style={styles.chart}
                withInnerLines
                withOuterLines={false}
              />
            ) : (
              <Text style={styles.empty}>No data for selected period</Text>
            )}
          </Card>

          <Card style={{ marginBottom: 30 }}>
            <Text style={styles.sectionTitle}>Sales in Period</Text>
            {sales.length === 0 ? (
              <Text style={styles.empty}>No sales in this period</Text>
            ) : (
              sales.map((m) => (
                <View key={m.id} style={styles.saleRow}>
                  <View>
                    <Text style={styles.saleName}>{m.item?.name || m.itemName}</Text>
                    <Text style={styles.saleMeta}>
                      {m.date?.slice(0, 10)} · Qty {m.quantity}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.saleRev}>{formatCurrency(m.totalRevenue)}</Text>
                    <Text style={styles.saleProfit}>+{formatCurrency(m.profit)}</Text>
                  </View>
                </View>
              ))
            )}
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 12 },
  periodRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  periodBtn: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  periodLabel: { fontSize: 11, color: Colors.textLight },
  periodValue: { fontSize: 14, fontWeight: '600', color: Colors.text, marginTop: 2 },
  calendar: { borderRadius: 12, marginTop: 4 },
  summaryRow: { flexDirection: 'row', gap: 10, marginTop: 16, marginBottom: 16 },
  summaryCard: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  summaryLabel: { fontSize: 12, color: Colors.textSecondary },
  summaryValue: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  chartCard: { marginBottom: 16 },
  chart: { borderRadius: 12, marginLeft: -8 },
  empty: { textAlign: 'center', color: Colors.textLight, padding: 20 },
  saleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  saleName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  saleMeta: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  saleRev: { fontSize: 14, fontWeight: '600', color: Colors.text },
  saleProfit: { fontSize: 12, color: Colors.accent, fontWeight: '600' },
});