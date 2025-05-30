'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SearchBarProps {
  primaryColor?: string;
  onSearch?: (query: string) => void;
}

export default function SearchBar({ primaryColor = '#2b9348', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim())
      } else {
        router.push(`/search?q=${encodeURIComponent(query)}`)
      }
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xs">
      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full py-2 pl-4 pr-10 rounded-full border border-gray-300 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
        style={{ 
          fontFamily: 'Poppins, sans-serif',
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = primaryColor;
          e.target.style.boxShadow = `0 0 0 1px ${primaryColor}`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb';
          e.target.style.boxShadow = 'none';
        }}
      />
      <button 
        type="submit" 
        className="absolute right-0 top-0 h-full px-3 text-gray-500 dark:text-gray-400"
        style={{ transition: 'color 0.2s' }}
        onMouseOver={(e) => e.currentTarget.style.color = primaryColor}
        onMouseOut={(e) => e.currentTarget.style.color = document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </button>
    </form>
  )
}
