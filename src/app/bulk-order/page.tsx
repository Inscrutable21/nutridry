'use client'

import { useState, useEffect } from 'react'
import emailjs from '@emailjs/browser'

// Type check for environment variables
if (!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ||
    !process.env.NEXT_PUBLIC_EMAILJS_BULK_ORDER_TEMPLATE_ID ||
    !process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) {
  throw new Error('Missing EmailJS environment variables for bulk orders');
}

// Type definitions
interface EmailJSError extends Error {
  text?: string;
  status?: number;
}

const glowAnimation = `
  @keyframes glow {
    0% {
      box-shadow: 0 0 5px #E6C077;
    }
    50% {
      box-shadow: 0 0 20px #E6C077, 0 0 30px #E6C077;
    }
    100% {
      box-shadow: 0 0 5px #E6C077;
    }
  }
`

export default function BulkOrderPage() {
  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!)
  }, [])

  // Update your form state to match the field names in the email template
  const [formState, setFormState] = useState({
    name: '',           // This will be "FROM" in the email
    email: '',          // This will be "EMAIL ADDRESS" in the email
    phone: '',          // This will be "PHONE NUMBER" in the email
    regarding: '',      // This will be "REGARDING" in the email
    message: '',        // This will be "MESSAGE CONTENT" in the email
    company: '',        // Additional field not shown in the email template
    product_interest: '',// Additional field not shown in the email template
    quantity: ''        // Additional field not shown in the email template
  })
  
  const [formStatus, setFormStatus] = useState<null | 'success' | 'error'>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormStatus(null)

    try {
      const templateParams = {
        from_name: formState.name,           // Maps to "FROM"
        email: formState.email,              // Maps to "EMAIL ADDRESS"
        phone: formState.phone,              // Maps to "PHONE NUMBER"
        regarding: formState.regarding || formState.product_interest, // Maps to "REGARDING"
        message: formState.message,          // Maps to "MESSAGE CONTENT"
        // Include additional fields that might be useful in the email
        company: formState.company,
        product_interest: formState.product_interest,
        quantity: formState.quantity,
        to_name: "Admin",
      }

      console.log('Sending bulk order email with params:', templateParams)

      const result = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_BULK_ORDER_TEMPLATE_ID!,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      )

      console.log('EmailJS Response:', result)

      if (result.status === 200) {
        setFormState({
          name: '',
          email: '',
          phone: '',
          regarding: '',
          message: '',
          company: '',
          product_interest: '',
          quantity: ''
        })
        setFormStatus('success')
        
        setTimeout(() => {
          setFormStatus(null)
        }, 5000)
      } else {
        throw new Error('Failed to send email')
      }
    } catch (error: unknown) {
      const emailError = error as EmailJSError;
      
      console.error('Error sending bulk order email:', {
        error: emailError,
        errorMessage: emailError?.message || 'Unknown error',
        errorDetails: emailError?.text || 'No details available',
        errorStatus: emailError?.status || 'No status available'
      });
      setFormStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="pt-24 pb-16 bg-neutral-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <header className="mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-playfair mb-4 dark:text-white">Bulk Orders</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Interested in ordering our products in bulk? Fill out the form below and our team will get back to you with pricing and options.
          </p>
        </header>
        
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formState.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formState.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="product_interest" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Interest *
                </label>
                <select
                  id="product_interest"
                  name="product_interest"
                  value={formState.product_interest}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a product category</option>
                  <option value="Dehydrated Vegetables">Dehydrated Vegetables</option>
                  <option value="Dehydrated Fruits">Dehydrated Fruits</option>
                  <option value="Powders">Powders</option>
                  <option value="Flakes">Flakes</option>
                  <option value="Multiple Products">Multiple Products</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estimated Quantity *
                </label>
                <select
                  id="quantity"
                  name="quantity"
                  value={formState.quantity}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select quantity range</option>
                  <option value="5-10 kg">5-10 kg</option>
                  <option value="10-25 kg">10-25 kg</option>
                  <option value="25-50 kg">25-50 kg</option>
                  <option value="50+ kg">50+ kg</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Requirements
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder="Please specify any packaging requirements, delivery timeline, or other special requests."
                value={formState.message}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md 
                  focus:ring-2 focus:ring-[#E6C077] focus:border-[#E6C077] 
                  hover:border-[#E6C077] transition-colors duration-300"
              ></textarea>
            </div>
            
            <div className="flex items-center group">
              <input
                id="privacy"
                name="privacy"
                type="checkbox"
                required
                className="h-5 w-5 text-[#E6C077] focus:ring-[#E6C077] border-gray-300 rounded 
                  transition-all duration-300 cursor-pointer hover:border-[#E6C077]"
              />
              <label 
                htmlFor="privacy" 
                className="ml-3 block text-sm text-gray-700 cursor-pointer
                  group-hover:text-[#E6C077] transition-colors duration-300"
              >
                I agree to the <a href="/privacy" className="text-[#E6C077] hover:text-[#d4ad62] underline">privacy policy</a> and consent to being contacted regarding my bulk order inquiry.
              </label>
            </div>
            
            <div>
              <style jsx>{glowAnimation}</style>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  w-full md:w-auto px-8 py-4 bg-[#e79c12] text-white font-medium rounded-md
                  transition-all duration-300 transform hover:scale-105
                  ${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-[#d4ad62] hover:shadow-lg'}
                `}
              >
                {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
