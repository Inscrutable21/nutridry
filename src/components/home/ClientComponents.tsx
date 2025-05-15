'use client'

// Import any client-side hooks or libraries you need here
import { useState } from 'react'

// Create client components for any interactive elements
export function NewsletterForm() {
  const [email, setEmail] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Submitting email:', email)
    // Reset form
    setEmail('')
  }
  
  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex rounded-full overflow-hidden border-2 border-white shadow-lg">
        <input 
          type="email" 
          placeholder="Your email address" 
          className="flex-grow px-6 py-3 text-gray-900 focus:outline-none w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button 
          type="submit" 
          className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white transition-colors font-medium whitespace-nowrap"
        >
          Subscribe
        </button>
      </div>
      <p className="text-xs mt-3 text-white/80">
        By subscribing, you agree to receive marketing communications from us.
      </p>
    </form>
  )
}
