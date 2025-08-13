import React, { useState, useRef } from 'react';

const ReceiptUpload = ({ onReceiptUpload, maxFileSize = 5 * 1024 * 1024 }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedReceipts, setUploadedReceipts] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    processFiles(fileArray);
  };

  const processFiles = async (files) => {
    setError('');
    setUploading(true);

    const validFiles = [];
    const errors = [];

    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Unsupported file type. Please use JPEG, PNG, GIF, or PDF.`);
        return;
      }

      if (file.size > maxFileSize) {
        errors.push(`${file.name}: File too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB.`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    // Process valid files
    for (const file of validFiles) {
      try {
        const receiptData = await processFile(file);
        setUploadedReceipts(prev => [...prev, receiptData]);
        
        if (onReceiptUpload) {
          onReceiptUpload(receiptData);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        setError(prev => prev + `\nError processing ${file.name}: ${error.message}`);
      }
    }

    setUploading(false);
  };

  const processFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const receiptData = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: e.target.result,
          uploadedAt: new Date().toISOString(),
          // Mock OCR data - in a real app, you'd send this to an OCR service
          extractedData: extractMockData(file.name)
        };
        
        // Store in localStorage for persistence
        const existingReceipts = JSON.parse(localStorage.getItem('uploaded_receipts') || '[]');
        const updatedReceipts = [...existingReceipts, receiptData];
        localStorage.setItem('uploaded_receipts', JSON.stringify(updatedReceipts));
        
        resolve(receiptData);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  };

  const extractMockData = (filename) => {
    // Mock OCR extraction - in a real app, this would be done by an OCR service
    const mockData = [
      { amount: 25.99, merchant: 'Coffee Shop', date: '2024-01-15' },
      { amount: 156.78, merchant: 'Grocery Store', date: '2024-01-14' },
      { amount: 89.50, merchant: 'Restaurant', date: '2024-01-13' },
      { amount: 12.00, merchant: 'Gas Station', date: '2024-01-12' }
    ];
    
    return mockData[Math.floor(Math.random() * mockData.length)];
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const deleteReceipt = (receiptId) => {
    if (window.confirm('Are you sure you want to delete this receipt?')) {
      setUploadedReceipts(prev => prev.filter(receipt => receipt.id !== receiptId));
      
      // Update localStorage
      const existingReceipts = JSON.parse(localStorage.getItem('uploaded_receipts') || '[]');
      const updatedReceipts = existingReceipts.filter(receipt => receipt.id !== receiptId);
      localStorage.setItem('uploaded_receipts', JSON.stringify(updatedReceipts));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  React.useEffect(() => {
    // Load existing receipts from localStorage
    const existingReceipts = JSON.parse(localStorage.getItem('uploaded_receipts') || '[]');
    setUploadedReceipts(existingReceipts);
  }, []);

  return (
    <div className="receipt-upload">
      <div className="upload-header">
        <h3>Receipt Upload</h3>
        <p>Upload receipts to automatically extract expense data</p>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '1rem', whiteSpace: 'pre-line' }}>
          {error}
        </div>
      )}

      {/* Upload Area */}
      <div 
        className={`upload-area ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />
        
        <div className="upload-content">
          {uploading ? (
            <>
              <div className="upload-spinner">📤</div>
              <h4>Processing receipts...</h4>
              <p>Please wait while we extract data from your receipts</p>
            </>
          ) : (
            <>
              <div className="upload-icon">📄</div>
              <h4>Drop receipts here or click to browse</h4>
              <p>Supports JPEG, PNG, GIF, and PDF files up to {maxFileSize / (1024 * 1024)}MB</p>
              <div className="upload-features">
                <span>✓ Automatic OCR text extraction</span>
                <span>✓ Amount and merchant detection</span>
                <span>✓ Date recognition</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Uploaded Receipts */}
      {uploadedReceipts.length > 0 && (
        <div className="uploaded-receipts">
          <h4>Uploaded Receipts ({uploadedReceipts.length})</h4>
          <div className="receipts-grid">
            {uploadedReceipts.map(receipt => (
              <div key={receipt.id} className="receipt-card">
                <div className="receipt-preview">
                  {receipt.type.startsWith('image/') ? (
                    <img 
                      src={receipt.dataUrl} 
                      alt={receipt.name}
                      className="receipt-image"
                    />
                  ) : (
                    <div className="pdf-preview">
                      📄 PDF
                    </div>
                  )}
                </div>
                
                <div className="receipt-info">
                  <div className="receipt-header">
                    <h5>{receipt.name}</h5>
                    <button 
                      onClick={() => deleteReceipt(receipt.id)}
                      className="btn btn-sm btn-danger"
                      title="Delete receipt"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className="receipt-meta">
                    <span>{formatFileSize(receipt.size)}</span>
                    <span>{new Date(receipt.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  
                  {receipt.extractedData && (
                    <div className="extracted-data">
                      <h6>Extracted Data:</h6>
                      <div className="data-item">
                        <span>Amount:</span>
                        <span>${receipt.extractedData.amount}</span>
                      </div>
                      <div className="data-item">
                        <span>Merchant:</span>
                        <span>{receipt.extractedData.merchant}</span>
                      </div>
                      <div className="data-item">
                        <span>Date:</span>
                        <span>{receipt.extractedData.date}</span>
                      </div>
                      
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          // Here you could pre-fill an expense form with this data
                          alert('In a real app, this would pre-fill the expense form with the extracted data!');
                        }}
                      >
                        Create Expense
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="upload-tips">
        <h4>💡 Tips for better OCR results:</h4>
        <ul>
          <li>Ensure receipts are clearly visible and well-lit</li>
          <li>Avoid blurry or tilted images</li>
          <li>Include the full receipt with all important details</li>
          <li>PDF receipts often provide the most accurate results</li>
        </ul>
      </div>
    </div>
  );
};

export default ReceiptUpload;