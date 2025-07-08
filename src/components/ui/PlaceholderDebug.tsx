import React, { useEffect, useState } from 'react';

export default function PlaceholderDebug() {
  const [foundPath, setFoundPath] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const placeholderPaths = [
      '/placeholder.jpg',
      '/images/placeholder.jpg',
      '/public/placeholder.jpg',
      '/public/images/placeholder.jpg',
      '/assets/placeholder.jpg',
      '/assets/images/placeholder.jpg'
    ];

    const checkImage = (path: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = path;
      });
    };

    const findWorkingPath = async () => {
      for (const path of placeholderPaths) {
        const works = await checkImage(path);
        if (works) {
          console.log('Found working placeholder path:', path);
          setFoundPath(path);
          break;
        }
      }
      setChecking(false);
    };

    findWorkingPath();
  }, []);

  // Hidden component that just runs the check
  return (
    <div style={{ display: 'none' }}>
      {checking ? 'Checking placeholder paths...' : 
       foundPath ? `Found working path: ${foundPath}` : 
       'No working placeholder path found'}
    </div>
  );
}