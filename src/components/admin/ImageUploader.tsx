'use client';

import { useState } from 'react';
import Image from 'next/image';
// import PlaceholderImage from '../ui/PlaceholderImage';

type ImageUploaderProps = {
  initialImage?: string;
  onImageChange: (imageUrl: string) => void;
};

export default function ImageUploader({ initialImage, onImageChange }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState(initialImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Handle image upload with production-safe approach
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setIsUploading(true);
    setProgress(0);

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      setIsUploading(false);
      return;
    }

    // Check file size (limit to 5MB for production safety)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      setIsUploading(false);
      return;
    }

    try {
      // Create a smaller preview for the UI
      const previewReader = new FileReader();
      previewReader.onload = () => {
        const previewResult = previewReader.result as string;
        setPreviewUrl(previewResult);
        
        // In production, we'll use the same data URL approach
        // This is more reliable than trying to upload to external services
        onImageChange(previewResult);
        setIsUploading(false);
        setProgress(100);
      };
      
      previewReader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      };
      
      previewReader.onerror = () => {
        setError('Error processing image. Please try again.');
        setIsUploading(false);
      };
      
      previewReader.readAsDataURL(file);
    } catch (err) {
      console.error('Image processing error:', err);
      setError('Error processing image. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative w-full h-64 bg-gray-100 rounded-md overflow-hidden">
          <Image
            src={previewUrl}
            alt="Product image"
            fill
            className="object-contain"
            unoptimized={true} // Add unoptimized for consistent behavior
            onError={() => {
              setError('Failed to load image preview');
              setPreviewUrl('');
            }}
          />
          <button
            type="button"
            onClick={() => {
              setPreviewUrl('');
              onImageChange('');
            }}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
            aria-label="Remove image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center relative">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-1 text-sm text-gray-600">Upload a product image (up to 5MB)</p>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            disabled={isUploading}
          />
        </div>
      )}

      {isUploading && (
        <div className="text-center space-y-2">
          <p className="text-sm text-blue-600">Processing image... {progress}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
