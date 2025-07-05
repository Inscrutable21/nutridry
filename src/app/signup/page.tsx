'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1) // 1: Signup form, 2: OTP verification
  const [otp, setOtp] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formState.name) newErrors.name = 'Name is required'
    if (!formState.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formState.email)) newErrors.email = 'Email is invalid'
    
    if (!formState.password) newErrors.password = 'Password is required'
    else if (formState.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    
    if (formState.password !== formState.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (!formState.mobile) newErrors.mobile = 'Mobile number is required'
    else if (!/^\d{10}$/.test(formState.mobile)) newErrors.mobile = 'Mobile number must be 10 digits'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed')
      }
      
      // Move to OTP verification step
      setStep(2)
    } catch (error) {
      console.error('Signup error:', error)
      setErrors({ form: (error as Error).message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formState.email, otp })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed')
      }
      
      // Redirect to login page after successful verification
      router.push('/login?verified=true')
    } catch (error) {
      console.error('OTP verification error:', error)
      setErrors({ otp: (error as Error).message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-emerald-800 font-playfair">
            TheNutriDry
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 ? 'Create your account' : 'Verify your email'}
          </p>
        </div>
        
        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="mb-4">
                <label htmlFor="name" className="sr-only">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                  placeholder="Full Name"
                  value={formState.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={formState.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              
              <div className="mb-4">
                <label htmlFor="mobile" className="sr-only">Mobile Number</label>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                  placeholder="Mobile Number"
                  value={formState.mobile}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={formState.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                  value={formState.confirmPassword}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
            
            {errors.form && (
              <div className="text-red-500 text-sm text-center">{errors.form}</div>
            )}
            
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                {isSubmitting ? 'Creating account...' : 'Sign up'}
              </button>
            </div>
            
            <div className="text-sm text-center">
              Already have an account?{' '}
              <Link href="/admin/login" className="font-medium text-emerald-600 hover:text-emerald-500">
                Sign in
              </Link>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            <div>
              <p className="text-sm text-gray-600 mb-4">
                We've sent a verification code to your email. Please enter it below.
              </p>
              <label htmlFor="otp" className="sr-only">Verification Code</label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="Enter verification code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={isSubmitting}
              />
              {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                {isSubmitting ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
