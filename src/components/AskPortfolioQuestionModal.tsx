'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Lightbulb } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export function AskPortfolioQuestionModal() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async () => {
    if (!question.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/ask-portfolio-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAnswer(data.answer)
      } else {
        setAnswer("Sorry, I couldn't get an answer right now. Please try again.")
      }
    } catch (error) {
      console.error('Error asking portfolio question:', error)
      setAnswer('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Lightbulb className="w-5 h-5 mr-2" />
          Ask Portfolio Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ask about Your Portfolio</DialogTitle>
          <DialogDescription>
            Ask any question about your portfolio and get AI-powered insights.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
              Your Question
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., How is my portfolio performing?"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!question.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? 'Getting Answer...' : 'Ask Question'}
          </Button>
          {answer && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md max-h-64 overflow-y-auto">
                <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                  <ReactMarkdown>{answer}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
