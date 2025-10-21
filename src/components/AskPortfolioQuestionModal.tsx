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
      <DialogContent className="sm:max-w-[700px] bg-card/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-card-foreground flex items-center">
            <Lightbulb className="w-6 h-6 mr-3 text-primary" />
            Ask Portfolio Assistant
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Ask any question about your portfolio and get AI-powered insights.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="question"
              className="block text-sm font-semibold text-card-foreground mb-3"
            >
              Your Question
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., How is my portfolio performing?"
              className="w-full px-4 py-3 border border-input rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background/50 placeholder:text-muted-foreground resize-none"
              rows={3}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!question.trim() || isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-primary-foreground transition-all ${
              isLoading || !question.trim()
                ? 'bg-primary/70 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Getting Answer...
              </div>
            ) : (
              'Ask Question'
            )}
          </Button>
          {answer && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-card-foreground mb-3">
                Assistant Response
              </label>
              <div className="p-6 bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm max-h-96 overflow-y-auto">
                <div className="text-base text-card-foreground prose prose-base max-w-none prose-headings:text-card-foreground prose-p:text-card-foreground prose-strong:text-card-foreground prose-code:text-card-foreground prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-p:leading-relaxed">
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
