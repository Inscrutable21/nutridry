/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { Product } from '@/types';

// Define ProductVariant interface locally
interface ProductVariant {
  id?: string;
  size: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
}

// Interface for Excel row data
interface ExcelRow {
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  bestseller?: boolean | string;
  newArrival?: boolean | string;
  featured?: boolean | string;
  rating?: number | string;
  reviews?: number | string;
  benefits?: string;
  features?: string;
  nutritionalInfo?: string;
  specs?: string;
  usageSuggestions?: string;
  variants?: string;
  [key: string]: unknown; // For any other properties
}

interface UploadStatus {
  status: 'idle' | 'success' | 'error';
  message: string;
}

export default function ExcelProductUploader() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'idle',
    message: '',
  });
  const [fileSelected, setFileSelected] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is an Excel file
      if (
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel'
      ) {
        setFileSelected(file);
        setUploadStatus({ status: 'idle', message: '' });
      } else {
        setUploadStatus({
          status: 'error',
          message: 'Please select a valid Excel file (.xlsx or .xls)',
        });
        setFileSelected(null);
      }
    }
  };

  const processExcelData = async (file: File): Promise<ExcelRow[]> => {
    return new Promise<ExcelRow[]>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData as ExcelRow[]);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsBinaryString(file);
    });
  };

  const validateProductData = (excelData: ExcelRow[]): string[] => {
    const requiredFields = ['name', 'description', 'category'];
    const errors: string[] = [];

    excelData.forEach((row, index) => {
      // Check required fields
      requiredFields.forEach(field => {
        if (!row[field]) {
          errors.push(`Row ${index + 2}: Missing required field '${field}'`);
        }
      });

      // Validate variants if provided
      if (row.variants) {
        try {
          JSON.parse(row.variants as string);
        } catch {
          // Intentionally empty catch block - error is handled below
          errors.push(`Row ${index + 2}: 'variants' must be a valid JSON array or properly formatted string`);
        }
      }

      // Validate nutritionalInfo if provided
      if (row.nutritionalInfo) {
        try {
          JSON.parse(row.nutritionalInfo as string);
        } catch {
          // Intentionally empty catch block - error is handled below
          errors.push(`Row ${index + 2}: 'nutritionalInfo' must be a valid JSON object`);
        }
      }

      // Validate specs if provided
      if (row.specs) {
        try {
          JSON.parse(row.specs as string);
        } catch {
          // Intentionally empty catch block - error is handled below
          errors.push(`Row ${index + 2}: 'specs' must be a valid JSON object`);
        }
      }
    });

    return errors;
  };

  const handleUpload = async () => {
    if (!fileSelected) return;

    setIsUploading(true);
    setUploadStatus({ status: 'idle', message: '' });

    try {
      // Process Excel file
      const excelData = await processExcelData(fileSelected);

      // Validate data
      const validationErrors = validateProductData(excelData);
      if (validationErrors.length > 0) {
        setUploadStatus({
          status: 'error',
          message: `Validation errors:\n${validationErrors.join('\n')}`,
        });
        setIsUploading(false);
        return;
      }

      // Transform data to match product schema
      const productsToUpload: Partial<Product>[] = excelData.map((row: ExcelRow) => {
        // Helper function to safely parse JSON
        const safeJsonParse = <T,>(jsonString: string | undefined, fallback: T): T => {
          if (!jsonString) return fallback;
          try {
            return JSON.parse(jsonString);
          } catch (err) {
            // For structured text data, convert to proper format
            if (typeof jsonString === 'string' && jsonString.includes('-')) {
              // Handle bullet point lists (- item1\n- item2)
              if (Array.isArray(fallback)) {
                return jsonString.split('\n')
                  .map(line => line.trim())
                  .filter(line => line.startsWith('-'))
                  .map(line => line.substring(1).trim()) as unknown as T;
              }
            }
            console.error('Error parsing JSON:', err);
            return fallback;
          }
        };

        // Parse variants from table format or JSON
        let parsedVariants: ProductVariant[] = [];
        
        if (row.variants) {
          try {
            // Try parsing as JSON first
            parsedVariants = JSON.parse(row.variants as string);
          } catch {
            // If JSON parsing fails, try parsing as structured text
            const variantText = row.variants as string;
            if (variantText.includes('|')) {
              // Parse table-like format with | separators
              const lines = variantText.split('\n').filter(line => line.trim() !== '' && line.includes('|'));
              
              // Skip header row if present
              const dataLines = lines[0].includes('Weight') || lines[0].includes('Size') ? lines.slice(1) : lines;
              
              parsedVariants = dataLines.map(line => {
                const parts = line.split('|').map(part => part.trim());
                // Assuming format: | Weight | Original Price | Sale Price | Stock |
                return {
                  size: parts[1] || '',  // Use Weight/Size as the size field
                  price: Number(parts[3]) || 0, // Sale Price
                  originalPrice: Number(parts[2]) || null, // Original Price
                  stock: Number(parts[4]) || 0 // Stock
                };
              });
            }
          }
        }

        // Calculate total stock from variants
        const totalStock = parsedVariants.reduce((sum, variant) => sum + (variant.stock || 0), 0);
        
        // Parse benefits, features, and usage suggestions
        const parseBulletPoints = (text?: string): string[] => {
          if (!text) return [];
          
          // Handle markdown-style bullet points
          if (text.includes('-')) {
            return text.split('\n')
              .map(line => line.trim())
              .filter(line => line.startsWith('-'))
              .map(line => line.substring(1).trim());
          }
          
          // Handle comma-separated list
          return text.split(',').map(item => item.trim());
        };
        
        // Create the product object with only fields that exist in the schema
        const productData: Partial<Product> = {
          name: row.name,
          description: row.description,
          longDescription: row.longDescription || '',
          image: '', // Empty string instead of null
          images: [],
          category: row.category,
          stock: totalStock,
          bestseller: row.bestseller === 'true' || row.bestseller === true,
          featured: row.featured === 'true' || row.featured === true,
          rating: Number(row.rating) || 0,
          reviews: Number(row.reviews) || 0,
          benefits: parseBulletPoints(row.benefits as string),
          features: parseBulletPoints(row.features as string),
          usageSuggestions: parseBulletPoints(row.usageSuggestions as string),
          nutritionalInfo: safeJsonParse(row.nutritionalInfo as string, {}),
          specs: safeJsonParse(row.specs as string, {}),
        };
        
        // Only add newArrival if it exists in the schema
        if (row.newArrival !== undefined) {
          // @ts-expect-error - Add newArrival if it exists in the schema
          productData.newArrival = row.newArrival === 'true' || row.newArrival === true;
        }
        
        return {
          ...productData,
          variants: parsedVariants
        };
      });

      // Check if there are too many products
      if (productsToUpload.length > 50) {
        setUploadStatus({
          status: 'error',
          message: 'Too many products. Please limit your upload to 50 products at a time.',
        });
        setIsUploading(false);
        return;
      }

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      try {
        // Send data to API with proper error handling
        const response = await fetch('/api/products/bulk-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: productsToUpload }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const textResponse = await response.text();
          throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 100)}...`);
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const result = await response.json();
        setUploadStatus({
          status: 'success',
          message: `Successfully uploaded ${result.count} products`,
        });

        // Revalidate the products cache
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/admin/products', tag: 'products' }),
        });

        // Refresh the products list
        router.refresh();
      } catch (fetchError: unknown) {
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Request timed out. The server took too long to respond.');
        }
        throw fetchError;
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadStatus({
        status: 'error',
        message: err instanceof Error ? err.message : 'Failed to upload products',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Bulk Upload Products</h2>
      <p className="text-gray-600 mb-4">
        Upload an Excel file (.xlsx or .xls) containing product data to add multiple products at once.
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Excel File</label>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-emerald-50 file:text-emerald-700
            hover:file:bg-emerald-100"
        />
      </div>

      {fileSelected && (
        <div className="mb-4 p-2 bg-gray-50 rounded flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-emerald-500 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="text-sm text-gray-700">{fileSelected.name}</span>
        </div>
      )}

      {uploadStatus.status !== 'idle' && (
        <div
          className={`mb-4 p-3 rounded ${uploadStatus.status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
        >
          <p className="text-sm whitespace-pre-line">{uploadStatus.message}</p>
        </div>
      )}

      <div className="flex justify-between items-center mt-6">
        <a
          href="/templates/product_upload_template.xlsx"
          download
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download Template
        </a>

        <button
          onClick={handleUpload}
          disabled={!fileSelected || isUploading}
          className={`px-4 py-2 rounded-md text-white font-medium ${!fileSelected || isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
        >
          {isUploading ? 'Uploading...' : 'Upload Products'}
        </button>
      </div>
    </div>
  );
}
