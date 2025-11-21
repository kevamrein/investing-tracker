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
import { Database } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export function AskSystemQuestionModal() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [responseId, setResponseId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async () => {
    if (!question.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/ask-system-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          responseId: responseId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAnswer(data.answer)
        setResponseId(data.responseId)
        setQuestion('')
      } else {
        setAnswer("Sorry, I couldn't get an answer right now. Please try again.")
        setResponseId(null)
      }
    } catch (error) {
      console.error('Error asking system question:', error)
      setAnswer('An error occurred. Please try again.')
      setResponseId(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="bg-secondary/50 hover:bg-secondary/70 text-secondary-foreground font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-2"
        >
          <Database className="w-5 h-5 mr-2" />
          Ask System Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-card/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-card-foreground flex items-center">
            <Database className="w-6 h-6 mr-3 text-secondary-foreground" />
            Ask System Assistant
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Ask questions about the full investor tracking system, including all companies and your
            complete transaction history.
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
              placeholder="e.g., What companies do I have positions in?"
              className="w-full px-4 py-3 border border-input rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all bg-background/50 placeholder:text-muted-foreground resize-none"
              rows={3}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!question.trim() || isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-secondary-foreground transition-all ${
              isLoading || !question.trim()
                ? 'bg-secondary/70 cursor-not-allowed'
                : 'bg-secondary hover:bg-secondary/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-secondary-foreground"
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
