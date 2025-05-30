/* eslint-disable react/no-unescaped-entities */
'use client'

import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    question: "How are your fruits and vegetables dried?",
    answer: "We use a gentle dehydration process that removes water content while preserving nutrients, flavor, and color. Our process doesn&apos;t involve any added preservatives, sulfites, or artificial ingredients.",
    category: "Products"
  },
  {
    question: "Are your products organic?",
    answer: "Many of our products are certified organic. Each product page clearly indicates whether that specific item is organic certified. We&apos;re committed to expanding our organic offerings over time.",
    category: "Products"
  },
  {
    question: "How long do your dried fruits and vegetables last?",
    answer: "When stored properly in a cool, dry place in an airtight container, our products typically last 6-12 months. Once opened, we recommend consuming within 2-3 months for optimal freshness and flavor.",
    category: "Products"
  },
  {
    question: "Do I need to refrigerate your products?",
    answer: "Refrigeration is not required, but it can extend shelf life. Store in a cool, dry place away from direct sunlight. For longer storage periods, refrigeration is recommended.",
    category: "Products"
  },
  {
    question: "Are your products suitable for people with allergies?",
    answer: "We process different fruits and vegetables in our facility, so cross-contamination is possible. Each product page lists potential allergens. If you have severe allergies, please contact us for more specific information about our processing methods.",
    category: "Products"
  },
  {
    question: "How do I place an order?",
    answer: "Simply browse our products, add items to your cart, and proceed to checkout. You&apos;ll need to create an account or check out as a guest, enter shipping and payment information, and confirm your order.",
    category: "Ordering"
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay for online purchases.",
    category: "Ordering"
  },
  {
    question: "Can I modify or cancel my order after it&apos;s placed?",
    answer: "You can modify or cancel your order within 2 hours of placing it by contacting our customer service team. After this window, orders are processed for shipping and cannot be modified or canceled.",
    category: "Ordering"
  },
  {
    question: "Do you offer bulk ordering for businesses?",
    answer: "Yes! We offer wholesale pricing for bulk orders. Please visit our Bulk Orders page to fill out an inquiry form, and our team will get back to you with pricing and options.",
    category: "Ordering"
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping within India typically takes 3-5 business days. Express shipping options (1-2 business days) are available at checkout for an additional fee.",
    category: "Shipping"
  },
  {
    question: "Do you ship internationally?",
    answer: "Currently, we only ship within India. We&apos;re working on expanding our shipping capabilities to international destinations in the near future.",
    category: "Shipping"
  },
  {
    question: "How much does shipping cost?",
    answer: "Shipping costs are calculated based on your location and the weight of your order. We offer free standard shipping on orders over ₹1000. You can see the exact shipping cost at checkout before completing your purchase.",
    category: "Shipping"
  },
  {
    question: "Can I track my order?",
    answer: "Yes, once your order ships, you&apos;ll receive a confirmation email with tracking information. You can also log into your account on our website to track your order status.",
    category: "Shipping"
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns of unopened products within 7 days of delivery. Please refer to our Refund Policy page for complete details on the return process.",
    category: "Returns & Refunds"
  },
  {
    question: "What if my product arrives damaged?",
    answer: "If your product arrives damaged, please contact us within 48 hours of delivery with photos of the damaged items and packaging. We&apos;ll arrange a replacement or refund.",
    category: "Returns & Refunds"
  },
  {
    question: "How do I request a refund?",
    answer: "To request a refund, contact our customer service team with your order number and reason for the refund. Approved refunds are processed within 5-7 business days to your original payment method.",
    category: "Returns & Refunds"
  },
  {
    question: "Do you have a satisfaction guarantee?",
    answer: "Yes, we stand behind the quality of our products. If you're not completely satisfied with your purchase for any reason, please contact us within 7 days of receiving your order, and we'll make it right.",
    category: "Returns & Refunds"
  },
  {
    question: "How can I contact customer service?",
    answer: "You can reach our customer service team by email at info.nutridry@gmail.com or by phone at +91 9984001117 during business hours (Monday-Saturday, 10:00 AM - 7:00 PM IST).",
    category: "Contact"
  },
  {
    question: "Do you have a physical store?",
    answer: "Currently, we operate exclusively online. However, you can find our products at select retail partners across India. Check our website for a list of retail locations.",
    category: "Contact"
  }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [openItems, setOpenItems] = useState<{[key: string]: boolean}>({});
  
  const categories = ['All', ...Array.from(new Set(faqs.map(faq => faq.category)))];
  
  const filteredFaqs = activeCategory === 'All' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);
  
  const toggleItem = (question: string) => {
    setOpenItems(prev => ({
      ...prev,
      [question]: !prev[question]
    }));
  };
  
  return (
    <div className="pt-24 pb-16 bg-neutral-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <header className="mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-playfair mb-4 dark:text-white">Frequently Asked Questions</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions about our products, ordering process, shipping, and more. Can't find what you're looking for? Contact us directly.
          </p>
        </header>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full transition-colors ${
                activeCategory === category 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-amber-100 dark:hover:bg-amber-900/30'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {filteredFaqs.map((faq, index) => (
            <div key={index} className={`border-b border-gray-200 dark:border-gray-700 ${index === 0 ? 'rounded-t-lg' : ''} ${index === filteredFaqs.length - 1 ? 'border-b-0 rounded-b-lg' : ''}`}>
              <button
                onClick={() => toggleItem(faq.question)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors focus:outline-none"
              >
                <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transform transition-transform ${openItems[faq.question] ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openItems[faq.question] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-4 text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Contact Section */}
        <div className="mt-16 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm text-center">
          <h2 className="text-2xl font-playfair mb-4 dark:text-white">Still Have Questions?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Our customer service team is here to help. Reach out to us through any of the methods below.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-6 max-w-2xl mx-auto">
            <a 
              href="mailto:info.nutridry@gmail.com" 
              className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Us
            </a>
            <a 
              href="tel:+919984001117" 
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Us
            </a>
            <a 
              href="/contact" 
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Contact Form
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
