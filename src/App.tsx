// src/App.tsx
import React, { useState } from 'react';
import Compressor from 'compressorjs';
import './App.css';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [compressionOptions, setCompressionOptions] = useState({
    quality: 0.8,
    sizeRatio: 0.8
  });
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null); // Add this state
  const [compressedImageDimensions, setCompressedImageDimensions] = useState<{ width: number; height: number } | null>(null); // Add this state
  const [originalImageDimensions, setOriginalImageDimensions] = useState<{ width: number; height: number } | null>(null); // Add this state

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
    }
  };

  const handleOptionsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCompressionOptions(prev => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  const compressImage = () => {
    if (!originalImage) return;
  
    setIsCompressing(true);
  
    const img = new Image();
    img.src = URL.createObjectURL(originalImage);
    img.onload = () => {
      const newWidth = img.width * compressionOptions.sizeRatio;
      const newHeight = img.height * compressionOptions.sizeRatio;
  
      new Compressor(originalImage, {
        quality: compressionOptions.quality,
        maxWidth: newWidth,
        maxHeight: newHeight,
        success(result: Blob) {
          const compressedUrl = URL.createObjectURL(result);
          setCompressedImage(compressedUrl);
          setCompressedBlob(result); // Store the Blob object
  
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
          setIsCompressing(false);
        },
      });
    };
  };  
  
  const getFileSize = (file: File | Blob | null) => {
    return file ? `${(file.size / 1024).toFixed(2)} KB` : 'N/A';
  };

  return (
    <div className="container">
      <h1>Image Compressor</h1>
      
      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
        />
        {originalImage && (
          <div className="file-info">
            Original Size: {getFileSize(originalImage)}
          </div>
        )}
      </div>

      <div className="options-section">
        <h3>Compression Options</h3>
        <div className="option">
          <label>Quality (0-1):</label>
          <input
            type="number"
            name="quality"
            min="0"
            max="1"
            step="0.1"
            value={compressionOptions.quality}
            onChange={handleOptionsChange}
          />
        </div>
        <div className="option">
          <label>Resize (keeping the aspect ratio):</label>
          <input
            type="number"
            name="sizeRatio"
            min="0"
            max="1"
            step="0.1"
            value={compressionOptions.sizeRatio}
            onChange={handleOptionsChange}
          />
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
        <h3>
          Original
          {originalImageDimensions && (
            <div className="image-info">
              <div className="text-small">Size: {getFileSize(originalImage)}</div>
              <div className="text-small">Width: {originalImageDimensions.width}px</div>
              <div className="text-small">Height: {originalImageDimensions.height}px</div>
            </div>
          )}
        </h3>
          {originalImage && (
            <img src={URL.createObjectURL(originalImage)} alt="Original" />
          )}
        </div>
        <div className="image-container">
          <h3>
            Compressed
            {compressedImageDimensions && (
              <div className="image-info">
                <div className="text-small">Size: {getFileSize(compressedBlob)}</div>
                <div className="text-small">Width: {compressedImageDimensions.width}px</div>
                <div className="text-small">Height: {compressedImageDimensions.height}px</div>
              </div>
            )}
          </h3>
          {compressedImage && (
            <>
              <img src={compressedImage} alt="Compressed" />
            </>
          )}
        </div>
      </div>

      <div>
        {compressedImage && (
          <>
              <a href={compressedImage} download="compressed-image.jpg">
                <button className="download-button">Download Compressed Image</button>
              </a>
          </>
        )}
      </div>
    </div>
  );
};

export default App;