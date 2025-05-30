'use client'

import { useState, useEffect } from 'react'
import emailjs from '@emailjs/browser'

// Type check for environment variables
if (!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ||
    !process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ||
    !process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) {
  throw new Error('Missing EmailJS environment variables');
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

export default function ContactPage() {
  // Initialize EmailJS with your public key in useEffect
  useEffect(() => {
    emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!)
  }, [])

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  
  const [formStatus, setFormStatus] = useState<null | 'success' | 'error'>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // Check for dark mode
  useEffect(() => {
    // Check if dark mode is enabled
    const checkDarkMode = () => {
      if (typeof window !== 'undefined') {
        // Check for dark mode preference
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setIsDarkMode(isDark)
      }
    }
    
    checkDarkMode()
    
    // Listen for changes in color scheme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!privacyConsent) {
      alert("Please agree to the privacy policy to continue.")
      return
    }
    
    setIsSubmitting(true)
    setFormStatus(null)

    try {
      const templateParams = {
        name: formState.name,
        email: formState.email,
        phone: formState.phone,
        subject: formState.subject,
        message: formState.message,
        to_name: "Admin",
      }

      console.log('Sending email with params:', templateParams)

      const result = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      )

      console.log('EmailJS Response:', result) // Debug log

      if (result.status === 200) {
        setFormState({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
        setPrivacyConsent(false)
        setFormStatus('success')
        
        setTimeout(() => {
          setFormStatus(null)
        }, 5000)
      } else {
        throw new Error('Failed to send email')
      }
    } catch (error: unknown) {
      // Type guard to check if error is EmailJSError
      const emailError = error as EmailJSError;
      
      console.error('Error sending email:', {
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
    <div className={`pt-24 pb-16 ${isDarkMode ? 'bg-gray-900' : 'bg-neutral-50'}`}>
      <div className="container mx-auto px-4 md:px-6">
        <header className="mb-12 text-center">
          <h1 className={`text-3xl md:text-5xl font-playfair mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Contact Us</h1>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Have questions about our products or want to place a bulk order? We&apos;d love to hear from you.
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          <div className="lg:col-span-1">
            <div className={`p-6 md:p-8 rounded-lg shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h2 className={`text-2xl font-playfair mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Phone</h3>
                    <div className="mt-1 space-y-1">
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <a href="tel:+919984001117" className={`hover:text-amber-600 ${isDarkMode ? 'hover:text-amber-400' : ''}`}>+91 9984001117</a>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Email</h3>
                    <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <a href="mailto:info.nutridry@gmail.com" className={`hover:text-amber-600 ${isDarkMode ? 'hover:text-amber-400' : ''}`}>info.nutridry@gmail.com</a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Location</h3>
                    <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    122/3, Awadh Vihar Colony,<br />
                    Near Amausi Intl. Airport,<br />
                    Kanpur Road, Lucknow, 226023
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className={`p-6 md:p-8 rounded-lg shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h2 className={`text-2xl font-playfair mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Send Us a Message</h2>
              
              {formStatus === 'success' && (
                <div className={`mb-6 p-4 rounded-md ${isDarkMode ? 'bg-green-900/20 border-green-900 text-green-300' : 'bg-green-50 border border-green-200 text-green-700'}`}>
                  <p>Thank you for your message! We&apos;ll get back to you as soon as possible.</p>
                </div>
              )}
              
              {formStatus === 'error' && (
                <div className={`mb-6 p-4 rounded-md ${isDarkMode ? 'bg-red-900/20 border-red-900 text-red-300' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                  <p>There was an error sending your message. Please try again or contact us directly.</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formState.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 
                        ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formState.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 
                        ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formState.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 
                        ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formState.subject}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 
                        ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="">Select a subject</option>
                      <option value="Product Inquiry">Product Inquiry</option>
                      <option value="Bulk Order">Bulk Order</option>
                      <option value="Shipping Question">Shipping Question</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    value={formState.message}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 
                      ${isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                  ></textarea>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="privacy"
                    name="privacy"
                    type="checkbox"
                    checked={privacyConsent}
                    onChange={(e) => setPrivacyConsent(e.target.checked)}
                    required
                    className={`h-5 w-5 text-amber-500 focus:ring-amber-500 border-gray-300 rounded 
                      transition-all duration-300 cursor-pointer hover:border-amber-500
                      ${isDarkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                  />
                  <label 
                    htmlFor="privacy" 
                    className={`ml-3 block text-sm text-gray-700 cursor-pointer
                      group-hover:text-amber-500 transition-colors duration-300
                      ${isDarkMode ? 'text-gray-300' : ''}`}
                  >
                    I agree to the <a href="#" className={`text-amber-500 hover:text-amber-600 underline ${isDarkMode ? 'hover:text-amber-400' : ''}`}>privacy policy</a> and consent to being contacted regarding my inquiry.
                  </label>
                </div>
                
                <div>
                  <style jsx>{glowAnimation}</style>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`
                      w-full md:w-auto px-8 py-4 bg-amber-500 text-white font-medium rounded-md
                      transition-all duration-300 transform hover:scale-105
                      ${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-amber-600 hover:shadow-lg'}
                      ${formState.name && formState.email && formState.subject && formState.message ? 
                        'animate-[glow_2s_ease-in-out_infinite]' : ''}
                    `}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className={`rounded-lg overflow-hidden h-96 relative ${isDarkMode ? 'border border-gray-700' : 'bg-gray-100'}`}>
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.9048741847673!2d80.88594307549115!3d26.82210007681714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399bfda9edc259d1%3A0x3b2b44cd948c56bc!2sAwadh%20Vihar%20Colony%2C%20Sarojini%20Nagar%2C%20Lucknow%2C%20Uttar%20Pradesh%20226023%2C%20India!5e0!3m2!1sen!2sus!4v1713010142112!5m2!1sen!2sus" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy"
            aria-hidden="false"
            tabIndex={0}
            referrerPolicy="no-referrer-when-downgrade"
            className={isDarkMode ? 'filter invert contrast-75 hue-rotate-180' : ''}
          ></iframe>
        </div>
        
        <div className="mt-16 text-center">
          <h2 className={`text-2xl md:text-3xl font-playfair mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Frequently Asked Questions</h2>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto mb-10`}>
            Find answers to common questions about our products, ordering process, and more.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <div className={`p-6 rounded-lg shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>How long do your products stay fresh?</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Our dehydrated products typically have a shelf life of 12 months when stored in a cool, dry place in their original sealed packaging.
              </p>
            </div>
            
            <div className={`p-6 rounded-lg shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Do you offer international shipping?</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Yes, we ship to select international destinations. Shipping rates and delivery times vary by location. Please contact us for specific details.
              </p>
            </div>
            
            <div className={`p-6 rounded-lg shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Are your products organic?</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Many of our products are certified organic. Each product description specifies whether it&apos;s organic or conventionally grown.
              </p>
            </div>
            
            <div className={`p-6 rounded-lg shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Do you offer wholesale pricing?</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Yes, we offer wholesale pricing for bulk orders. Please contact us directly at info.nutridry@gmail.com for wholesale inquiries.
              </p>
            </div>
          </div>
        </div>
        
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center mt-8`}>
          <p>We&apos;ll send your order details via WhatsApp for confirmation and payment processing.</p>
        </div>
      </div>
    </div>
  )
}
