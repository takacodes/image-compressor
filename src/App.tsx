// src/App.tsx
import React, { useState, useCallback } from 'react';
import Compressor from 'compressorjs';
import './App.css';

// Define proper type interfaces
interface CompressionOptions {
  quality: number;
  sizeRatio: number;
}

interface ImageDimensions {
  width: number;
  height: number;
}

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [compressionOptions, setCompressionOptions] = useState<CompressionOptions>({
    quality: 0.8,
    sizeRatio: 0.8
  });
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedImageDimensions, setCompressedImageDimensions] = useState<ImageDimensions | null>(null);
  const [originalImageDimensions, setOriginalImageDimensions] = useState<ImageDimensions | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    
    setOriginalImage(file);
    setCompressedImage(null);
    setCompressedBlob(null);
    setCompressedImageDimensions(null);

    // Load the original image to get its dimensions
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      setOriginalImageDimensions({
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = () => {
      setError('Failed to load image');
      setOriginalImage(null);
    };
  }, []);

  const handleOptionsChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCompressionOptions(prev => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  }, []);

  const compressImage = useCallback(() => {
    if (!originalImage) return;
    
    setIsCompressing(true);
    setError(null);
  
    const img = new Image();
    img.src = URL.createObjectURL(originalImage);
    img.onload = () => {
      const newWidth = Math.round(img.width * compressionOptions.sizeRatio);
      const newHeight = Math.round(img.height * compressionOptions.sizeRatio);
  
      new Compressor(originalImage, {
        quality: compressionOptions.quality,
        maxWidth: newWidth,
        maxHeight: newHeight,
        success(result: Blob) {
          const compressedUrl = URL.createObjectURL(result);
          setCompressedImage(compressedUrl);
          setCompressedBlob(result);
  
          // Load the compressed image to get its dimensions
          const compressedImg = new Image();
          compressedImg.src = compressedUrl;
          compressedImg.onload = () => {
            setCompressedImageDimensions({
              width: compressedImg.width,
              height: compressedImg.height,
            });
          };
  
          setIsCompressing(false);
        },
        error(err: Error) {
          console.error('Compression error:', err);
          setError(`Compression failed: ${err.message}`);
          setIsCompressing(false);
        },
      });
    };
    img.onerror = () => {
      setError('Failed to process image');
      setIsCompressing(false);
    };
  }, [originalImage, compressionOptions]);
  
  const getFileSize = useCallback((file: File | Blob | null): string => {
    if (!file) return 'N/A';
    
    const sizeKB = file.size / 1024;
    if (sizeKB < 1024) {
      return `${sizeKB.toFixed(2)} KB`;
    } else {
      return `${(sizeKB / 1024).toFixed(2)} MB`;
    }
  }, []);

  const getDownloadFileName = useCallback((): string => {
    if (!originalImage) return 'compressed-image.jpg';
    
    const originalName = originalImage.name;
    const extension = originalName.substring(originalName.lastIndexOf('.'));
    const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
    
    return `${baseName}-compressed${extension}`;
  }, [originalImage]);

  const getCompressionRatio = useCallback((): string => {
    if (!originalImage || !compressedBlob) return '';
    
    const ratio = ((1 - compressedBlob.size / originalImage.size) * 100).toFixed(1);
    return `${ratio}%`;
  }, [originalImage, compressedBlob]);

  return (
    <div className="container">
      <h1>Image Compressor</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
        />
      </div>

      <div className="options-section">
        <h3>Compression Options</h3>
        <div className="option">
          <label>Quality (0-1):</label>
          <input
            type="range"
            name="quality"
            min="0.1"
            max="1"
            step="0.1"
            value={compressionOptions.quality}
            onChange={handleOptionsChange}
          />
          <span>{compressionOptions.quality}</span>
        </div>
        <div className="option">
          <label>Resize Ratio:</label>
          <input
            type="range"
            name="sizeRatio"
            min="0.1"
            max="1"
            step="0.1"
            value={compressionOptions.sizeRatio}
            onChange={handleOptionsChange}
          />
          <span>{compressionOptions.sizeRatio}</span>
        </div>
      </div>

      <button
        onClick={compressImage}
        disabled={!originalImage || isCompressing}
        className="compress-button"
      >
        {isCompressing ? 'Compressing...' : 'Compress Image'}
      </button>

      <div className="preview-section">
        <div className="image-container">
          <h3>Original</h3>
          {originalImageDimensions && (
            <div className="image-info">
              <div className="text-small">Size: {getFileSize(originalImage)}</div>
              <div className="text-small">
                Dimensions: {originalImageDimensions.width} × {originalImageDimensions.height}px
              </div>
            </div>
          )}
          {originalImage && (
            <div className="image-wrapper">
              <img src={URL.createObjectURL(originalImage)} alt="Original" />
            </div>
          )}
        </div>
        
        <div className="image-container">
          <h3>Compressed</h3>
          {compressedImageDimensions && (
            <div className="image-info">
              <div className="text-small">Size: {getFileSize(compressedBlob)}</div>
              <div className="text-small">
                Dimensions: {compressedImageDimensions.width} × {compressedImageDimensions.height}px
              </div>
              <div className="text-small">
                Reduction: {getCompressionRatio()}
              </div>
            </div>
          )}
          {compressedImage && (
            <div className="image-wrapper">
              <img src={compressedImage} alt="Compressed" />
            </div>
          )}
        </div>
      </div>

      {compressedImage && (
        <div className="download-section">
          <a 
            href={compressedImage} 
            download={getDownloadFileName()}
            className="download-link"
          >
            <button className="download-button">Download Compressed Image</button>
          </a>
        </div>
      )}
    </div>
  );
};

export default App;