import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

// Define the Product interface based on your schema
interface Product {
  id?: string;
  name: string;
  description: string;
  longDescription?: string;
  image?: string | null;
  images: string[];
  category: string;
  rating?: number;
  reviews?: number;
  bestseller: boolean;
  featured: boolean;
  stock: number;
  benefits: string[];
  features: string[];
  usageSuggestions: string[];
  nutritionalInfo?: Record<string, unknown> | null;
  specs?: Record<string, unknown> | null;
  variants: ProductVariant[];
}

// Interface for product variants matching your schema
interface ProductVariant {
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
  image?: string;
  additionalImages?: string;
  bestseller?: boolean | string;
  featured?: boolean | string;
  benefits?: string;
  features?: string;
  usageSuggestions?: string;
  variants?: string;
  nutritionalInfo?: string;
  specs?: string;
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
      requiredFields.forEach((field) => {
        if (!row[field]) {
          errors.push(`Row ${index + 2}: Missing required field '${field}'`);
        }
      });

      // Check for variants
      if (!row.variants) {
        errors.push(`Row ${index + 2}: Missing required field 'variants'`);
      } else {
        try {
          const parsedVariants = JSON.parse(row.variants as string);
          if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
            errors.push(`Row ${index + 2}: 'variants' must be a non-empty array`);
          } else {
            // Check each variant has required fields
            parsedVariants.forEach((variant, variantIndex) => {
              if (!variant.size) {
                errors.push(`Row ${index + 2}, Variant ${variantIndex + 1}: Missing 'size'`);
              }
              if (variant.price === undefined || variant.price === null) {
                errors.push(`Row ${index + 2}, Variant ${variantIndex + 1}: Missing 'price'`);
              }
              if (isNaN(Number(variant.price))) {
                errors.push(`Row ${index + 2}, Variant ${variantIndex + 1}: 'price' must be a number`);
              }
              if (variant.stock !== undefined && isNaN(Number(variant.stock))) {
                errors.push(`Row ${index + 2}, Variant ${variantIndex + 1}: 'stock' must be a number`);
              }
            });
          }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          errors.push(`Row ${index + 2}: 'variants' must be a valid JSON array`);
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
            console.error('Error parsing JSON:', err);
            return fallback;
          }
        };

        // Parse variants correctly
        const parsedVariants: ProductVariant[] = safeJsonParse<ProductVariant[]>(row.variants as string, [])
          .map(variant => ({
            size: variant.size,
            price: Number(variant.price),
            originalPrice: variant.originalPrice !== undefined && variant.originalPrice !== null 
              ? Number(variant.originalPrice) 
              : null,
            stock: variant.stock !== undefined ? Number(variant.stock) : 0
          }));

        // Calculate total stock from variants
        const totalStock = parsedVariants.reduce((sum, variant) => sum + variant.stock, 0);
        
        return {
          name: row.name,
          description: row.description,
          longDescription: row.longDescription || '',
          image: row.image || null,
          images: row.additionalImages ? row.additionalImages.split(',').map((img: string) => img.trim()) : [],
          category: row.category,
          stock: totalStock, // Set stock as sum of variant stocks
          bestseller: row.bestseller === 'true' || row.bestseller === true,
          featured: row.featured === 'true' || row.featured === true,
          benefits: row.benefits ? row.benefits.split(',').map((b: string) => b.trim()) : [],
          features: row.features ? row.features.split(',').map((f: string) => f.trim()) : [],
          usageSuggestions: row.usageSuggestions ? row.usageSuggestions.split(',').map((u: string) => u.trim()) : [],
          nutritionalInfo: safeJsonParse(row.nutritionalInfo as string, null),
          specs: safeJsonParse(row.specs as string, null),
          variants: parsedVariants
        };
      });

      // Send data to API
      const response = await fetch('/api/products/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: productsToUpload }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload products');
      }

      const result = await response.json();
      setUploadStatus({
        status: 'success',
        message: `Successfully uploaded ${result.count} products`,
      });

      // Refresh the products list
      router.refresh();
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
