'use client';

import { useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

export default function RequestReturnPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  // Use React.use to unwrap params
  const orderId = use(params).id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageErrors, setImageErrors] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newErrors: string[] = [];
      const validFiles: File[] = [];
      
      // Validate each file
      filesArray.forEach(file => {
        // Check file size (4MB limit)
        if (file.size > 4 * 1024 * 1024) {
          newErrors.push(`${file.name} exceeds 4MB limit`);
          return;
        }
        
        // Check file type
        if (!file.type.startsWith('image/')) {
          newErrors.push(`${file.name} is not an image`);
          return;
        }
        
        validFiles.push(file);
      });
      
      // Limit to 2 images total
      if (images.length + validFiles.length > 2) {
        toast.error('Maximum 2 images allowed');
        return;
      }
      
      // Set errors if any
      if (newErrors.length > 0) {
        setImageErrors(newErrors);
        newErrors.forEach(error => toast.error(error));
        return;
      }
      
      // Create preview URLs for valid files
      const newImagePreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      
      setImages(prev => [...prev, ...validFiles]);
      setImagePreviewUrls(prev => [...prev, ...newImagePreviewUrls]);
      setImageErrors([]);
    }
  };

  const removeImage = (index: number) => {
    // Release object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setImages(images.filter((_, i) => i !== index));
    setImagePreviewUrls(imagePreviewUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      toast.error('Please select a reason for return');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // First, upload images if any
      let uploadedImageUrls: string[] = [];
      
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(image => {
          formData.append('files', image);
        });
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload images');
        }
        
        const uploadData = await uploadResponse.json();
        uploadedImageUrls = uploadData.urls;
      }
      
      // Now create the return request
      const response = await fetch(`/api/orders/${orderId}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason,
          description,
          images: uploadedImageUrls,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to request return');
      }
      
      toast.success('Return requested successfully');
      router.push('/account/returns');
    } catch (error) {
      console.error('Error requesting return:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to request return');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is valid for submission
  const isFormValid = reason !== '' && images.length > 0 && !isSubmitting;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Request a Return</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason for Return*
            </label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
              required
            >
              <option value="">Select a reason</option>
              <option value="damaged">Product arrived damaged</option>
              <option value="defective">Product is defective</option>
              <option value="wrong_item">Received wrong item</option>
              <option value="not_as_described">Not as described</option>
              <option value="other">Other reason</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Additional Details
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
              rows={4}
              placeholder="Please provide more details about the issue..."
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Upload Images* (Max 2, each under 4MB)
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
                multiple
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Select Images
              </button>
              <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                {images.length}/2 images selected
              </span>
            </div>
            
            {imagePreviewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <div className="relative h-40 rounded-md overflow-hidden">
                      <Image
                        src={url}
                        alt={`Return image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {imageErrors.length > 0 && (
              <div className="mt-2 text-sm text-red-500">
                {imageErrors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

