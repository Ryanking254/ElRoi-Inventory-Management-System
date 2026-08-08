import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import { movements, revenueByDay } from '../../data/mockData';
import { formatCurrency } from '../../lib/calculations';

const { width } = Dimensions.get('window');

export default function Reports() {
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-06');
  const [selecting, setSelecting] = useState('start'); // start | end

  const filteredDays = useMemo(() => {
    return revenueByDay.filter((d) => d.date >= startDate && d.date <= endDate);
  }, [startDate, endDate]);

  const totals = useMemo(() => {
    const revenue = filteredDays.reduce((s, d) => s + d.revenue, 0);
    const profit = filteredDays.reduce((s, d) => s + d.profit, 0);
    const cost = filteredDays.reduce((s, d) => s + d.cost, 0);
    return { revenue, profit, cost };
  }, [filteredDays]);

  const chartData = {
    labels: filteredDays.map((d) => d.date.slice(8)),
    datasets: [
      {
        data: filteredDays.length ? filteredDays.map((d) => d.revenue) : [0],
        color: () => Colors.primary,
        strokeWidth: 2,
      },
      {
        data: filteredDays.length ? filteredDays.map((d) => d.profit) : [0],
        color: () => Colors.accent,
        strokeWidth: 2,
      },
    ],
    legend: ['Revenue', 'Profit'],
  };

  const markedDates = {};
  if (startDate) {
    markedDates[startDate] = {
      startingDay: true,
      color: Colors.primary,
      textColor: '#fff',
    };
  }
  if (endDate && endDate !== startDate) {
    markedDates[endDate] = {
      endingDay: true,
      color: Colors.primary,
      textColor: '#fff',
    };
  }
  // mark in-between
  if (startDate && endDate) {
    let d = new Date(startDate);
    const end = new Date(endDate);
    while (d < end) {
      d.setDate(d.getDate() + 1);
      const key = d.toISOString().slice(0, 10);
      if (key !== endDate) {
        markedDates[key] = { color: Colors.primaryLight, textColor: '#fff' };
      }
    }
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
      {/* Period Selector */}
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

      {/* Summary Cards */}
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

      {/* Line Chart */}
      <Card style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Revenue & Profit Trend</Text>
        {filteredDays.length > 0 ? (
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

      {/* Sales breakdown from movements */}
      <Card style={{ marginBottom: 30 }}>
        <Text style={styles.sectionTitle}>Sales in Period</Text>
        {movements
          .filter((m) => m.type === 'SALE' && m.date >= startDate && m.date <= endDate)
          .map((m) => (
            <View key={m.id} style={styles.saleRow}>
              <View>
                <Text style={styles.saleName}>{m.itemName}</Text>
                <Text style={styles.saleMeta}>
                  {m.date} · Qty {m.quantity}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.saleRev}>{formatCurrency(m.totalRevenue)}</Text>
                <Text style={styles.saleProfit}>+{formatCurrency(m.profit)}</Text>
              </View>
            </View>
          ))}
      </Card>
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
