import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  Wallet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  CreditCard,
  TrendingUp,
  ArrowLeftRight,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { GlassCard, Button, LoadingSpinner } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'booking_payment' | 'refund' | 'commission';
  amount: number;
  created_at: string;
  booking_id?: string;
}

const sampleTransactions: Transaction[] = [
  {
    id: '1',
    type: 'deposit',
    amount: 500,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '2',
    type: 'booking_payment',
    amount: -450,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: '3',
    type: 'refund',
    amount: 120,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: '4',
    type: 'commission',
    amount: -75,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
];

export default function WalletScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>(sampleTransactions);
  const [loading, setLoading] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);

  const balance = profile?.wallet_balance || 0;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft size={20} color={Colors.success} />;
      case 'withdrawal':
        return <ArrowUpRight size={20} color={Colors.error} />;
      case 'booking_payment':
        return <CreditCard size={20} color={Colors.gold} />;
      case 'refund':
        return <ArrowLeftRight size={20} color={Colors.warning} />;
      case 'commission':
        return <TrendingUp size={20} color={Colors.platinum} />;
      default:
        return <DollarSign size={20} color={Colors.gold} />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Added Funds';
      case 'withdrawal':
        return 'Withdrawal';
      case 'booking_payment':
        return 'Booking Payment';
      case 'refund':
        return 'Refund';
      case 'commission':
        return 'Commission';
      default:
        return 'Transaction';
    }
  };

  const handleAddFunds = async (amount: number) => {
    setLoading(true);
    // In a real app, this would integrate with a payment gateway
    setTimeout(() => {
      refreshProfile();
      setShowAddFunds(false);
      setLoading(false);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Wallet size={40} color={Colors.gold} />
          </View>
          <Text style={styles.title}>Wallet</Text>
          <Text style={styles.subtitle}>Manage your funds</Text>
        </View>

        {/* Balance Card */}
        <GlassCard style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>Rs.{balance.toLocaleString()}</Text>
            </View>
            <View style={styles.balanceIcon}>
              <DollarSign size={32} color={Colors.gold} />
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowAddFunds(true)}
            >
              <View style={styles.actionGradient}>
                <Plus size={18} color={Colors.black} />
                <Text style={styles.actionText}>Add Funds</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButtonSecondary}>
              <Text style={styles.actionTextSecondary}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </LinearGradient>

      {/* Quick Add Amounts */}
      {showAddFunds && (
        <View style={styles.addFundsSection}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <View style={styles.quickAddGrid}>
            {[100, 250, 500, 1000].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={styles.quickAddButton}
                onPress={() => handleAddFunds(amount)}
              >
                <View style={styles.quickAddGradient}>
                  <Text style={styles.quickAddAmount}>+${amount}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddFunds(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Transactions */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.sectionTitle}>Transaction History</Text>

        {transactions.map((transaction) => (
          <GlassCard key={transaction.id} style={styles.transactionCard}>
            <View style={styles.transactionRow}>
              <View style={styles.transactionIcon}>
                {getTransactionIcon(transaction.type)}
              </View>
              <View style={styles.transactionContent}>
                <Text style={styles.transactionLabel}>
                  {getTransactionLabel(transaction.type)}
                </Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  transaction.amount > 0
                    ? styles.amountPositive
                    : styles.amountNegative,
                ]}
              >
                {transaction.amount > 0 ? '+' : ''}Rs.{Math.abs(transaction.amount).toFixed(0)}
              </Text>
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.titanium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['2xl'],
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius['2xl'],
    backgroundColor: Colors.titanium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 28,
  },
  subtitle: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  balanceCard: {
    marginTop: Spacing.lg,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  balanceLabel: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  balanceAmount: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 40,
    marginTop: Spacing.xs,
  },
  balanceIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  actionText: {
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
  },
  actionButtonSecondary: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionTextSecondary: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
  },
  addFundsSection: {
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing['2xl'],
  },
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing['2xl'],
  },
  quickAddButton: {
    width: '23%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  quickAddGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  quickAddAmount: {
    color: Colors.gold,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  cancelButton: {
    width: '100%',
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  cancelText: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['4xl'],
  },
  transactionCard: {
    marginHorizontal: Spacing['2xl'],
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.titanium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  transactionLabel: {
    color: Colors.text,
    fontFamily: 'Inter-Medium',
    fontSize: 15,
  },
  transactionDate: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  amountPositive: {
    color: Colors.success,
  },
  amountNegative: {
    color: Colors.text,
  },
});
