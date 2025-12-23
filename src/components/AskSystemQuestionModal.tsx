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
import { Database, Copy } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { getSystemPrompt } from '@/app/actions/get-system-prompt'

export function AskSystemQuestionModal() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [responseId, setResponseId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success' | 'error'>('idle')
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null)

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

  const handleCopyPrompt = async () => {
    setCopyStatus('copying')
    setCopiedPrompt(null)

    try {
      // Check if clipboard API is supported and secure context
      if (!navigator.clipboard || !window.isSecureContext) {
        throw new Error('Clipboard API not supported')
      }

      const prompt = await getSystemPrompt()
      await navigator.clipboard.writeText(prompt)
      setCopyStatus('success')

      // Reset status after 2 seconds
      setTimeout(() => setCopyStatus('idle'), 2000)
    } catch (error) {
      console.error('Clipboard API failed:', error)

      // Fallback: show prompt for manual copying
      try {
        const prompt = await getSystemPrompt()
        setCopiedPrompt(prompt)
        setCopyStatus('error')
      } catch (fallbackError) {
        console.error('Failed to get prompt:', fallbackError)
        setCopyStatus('error')
      }
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] bg-card/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-border/50 flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl font-extrabold text-card-foreground flex items-center">
            <Database className="w-6 h-6 mr-3 text-secondary-foreground" />
            Ask System Assistant
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Ask questions about the full investor tracking system, including all companies and your
            complete transaction history.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
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
          <Button
            onClick={handleCopyPrompt}
            disabled={copyStatus === 'copying'}
            variant="outline"
            className="w-full flex justify-center py-3 px-4 border border-border rounded-xl shadow-sm text-sm font-semibold transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {copyStatus === 'copying' ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary"
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
                Copying...
              </div>
            ) : copyStatus === 'success' ? (
              <div className="flex items-center text-green-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Copied!
              </div>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy System Prompt
              </>
            )}
          </Button>
          {answer && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-card-foreground mb-3">
                Assistant Response
              </label>
              <div className="p-6 bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm">
                <div className="text-base text-card-foreground prose prose-base max-w-none prose-headings:text-card-foreground prose-p:text-card-foreground prose-strong:text-card-foreground prose-code:text-card-foreground prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-p:leading-relaxed">
                  <ReactMarkdown>{answer}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
          {copiedPrompt && copyStatus === 'error' && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-card-foreground mb-3">
                System Prompt (Manual Copy Required)
              </label>
              <textarea
                value={copiedPrompt}
                readOnly
                className="w-full p-6 bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm text-sm text-card-foreground font-mono h-[400px] resize-none focus:ring-2 focus:ring-primary focus:border-primary selection:bg-primary selection:text-primary-foreground leading-relaxed"
                onClick={(e) => e.currentTarget.select()}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Automatic copying failed. Select all text (Ctrl+A/Cmd+A) and copy (Ctrl+C/Cmd+C)
                to use in another AI tool.
              </p>
            </div>
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
