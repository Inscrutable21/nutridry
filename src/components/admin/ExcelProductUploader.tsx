import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

export default function ExcelProductUploader() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });
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

  const processExcelData = async (file: File) => {
    return new Promise<any[]>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  const validateProductData = (products: any[]) => {
    const requiredFields = ['name', 'description', 'price', 'category', 'stock'];
    const errors: string[] = [];

    products.forEach((product, index) => {
      requiredFields.forEach((field) => {
        if (!product[field] && product[field] !== 0) {
          errors.push(`Row ${index + 2}: Missing required field '${field}'`);
        }
      });

      // Validate numeric fields
      if (product.price && isNaN(Number(product.price))) {
        errors.push(`Row ${index + 2}: Price must be a number`);
      }
      if (product.stock && isNaN(Number(product.stock))) {
        errors.push(`Row ${index + 2}: Stock must be a number`);
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
      const productsToUpload = excelData.map((row: any) => {
        // Helper function to safely parse JSON
        const safeJsonParse = (jsonString: any, defaultValue: any) => {
          if (!jsonString) return defaultValue;
          try {
            // Handle potential string formatting issues
            const cleaned = typeof jsonString === 'string' 
              ? jsonString.trim().replace(/^['"]|['"]$/g, '') // Remove quotes if present
              : jsonString;
            return typeof cleaned === 'object' ? cleaned : JSON.parse(cleaned);
          } catch (error) {
            console.warn('Failed to parse JSON:', error);
            return defaultValue;
          }
        };

        return {
          name: row.name,
          description: row.description,
          longDescription: row.longDescription || '',
          price: Number(row.price),
          // Fix salePrice handling to ensure it's a number or null, never a string
          salePrice: row.salePrice ? Number(row.salePrice) || null : null,
          image: row.image || '',
          images: row.additionalImages ? row.additionalImages.split(',').map((img: string) => img.trim()) : [],
          category: row.category,
          stock: Number(row.stock),
          bestseller: row.bestseller === 'true' || row.bestseller === true,
          featured: row.featured === 'true' || row.featured === true,
          benefits: row.benefits ? row.benefits.split(',').map((b: string) => b.trim()) : [],
          features: row.features ? row.features.split(',').map((f: string) => f.trim()) : [],
          usageSuggestions: row.usageSuggestions ? row.usageSuggestions.split(',').map((u: string) => u.trim()) : [],
          // Use safe parsing for complex JSON fields
          variants: safeJsonParse(row.variants, []),
          nutritionalInfo: safeJsonParse(row.nutritionalInfo, {}),
          specs: safeJsonParse(row.specs, {}),
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
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to upload products',
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