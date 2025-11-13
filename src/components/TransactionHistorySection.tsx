'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AddInvestmentModal } from '@/components/AddInvestmentModal'

interface Transaction {
  type: string
  shares: number
  date: string
  amount: string
  price: string
  accountType: string
}

interface TransactionHistorySectionProps {
  transactionHistory: Transaction[]
  companyId: string
}

export function TransactionHistorySection({
  transactionHistory,
  companyId,
}: TransactionHistorySectionProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(transactionHistory)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchTransactions = async () => {
    try {
      console.log('Fetching transactions for companyId:', companyId)
      const response = await fetch(`/api/transactions/${companyId}`)
      console.log('Response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched transactions:', data.transactions)
        setTransactions(data.transactions)
      } else {
        console.error('Failed to fetch transactions:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [companyId])

  const handleInvestmentAdded = () => {
    console.log('Investment added, fetching transactions...')
    fetchTransactions()
  }

  return (
    <div className="bg-card/60 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-card-foreground">Transaction History</h2>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>
      <div className="space-y-4">
        {transactions.map((txn, index) => (
          <div
            key={index}
            className="p-6 rounded-xl bg-muted/50 border border-border/30 hover:bg-muted/70 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">{txn.date}</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  txn.type === 'buy'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-destructive text-destructive-foreground'
                }`}
              >
                {txn.type.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span className="font-medium">{txn.shares} shares</span>
              <span className="font-medium">
                ${txn.amount} @ ${txn.price}/share
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Account Type: <span className="font-semibold capitalize">{txn.accountType}</span>
            </div>
          </div>
        ))}
      </div>
      <AddInvestmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInvestmentAdded={handleInvestmentAdded}
        companyId={companyId}
      />
    </div>
  )
}
