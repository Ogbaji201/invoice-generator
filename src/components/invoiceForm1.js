import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";

const InvoiceForm = () => {
  const businessInfo = {
    name: "Hexstelle",
    address: "33 Obayan Street, Akoka, Lagos State, Nigeria",
    phone: "+234 8140 892471",
    email: "hexstelle1@gmail.com",
    ownerEmail: "hexstelle1@gmail.com",
    whatsapp: "https://wa.me/c/2348140892471",
    bankName: "Carbon MFB",
    accountNumber: "1224642058",
    accountName: "Ugwunnamuchi Esther",
  };

  // Static logo
  const staticLogo = process.env.PUBLIC_URL + "/hexstelle_logo.jpeg";

  // Dynamic State
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [items, setItems] = useState([{ description: "", quantity: 1, price: 0, unit: "pc" }]);
  const [taxRate, setTaxRate] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState("");
  const [exportType, setExportType] = useState("pdf");
  const invoiceRef = useRef();

  // Color scheme
  const colors = {
    primary: '#2c3e50',
    secondary: '#3498db',
    accent: '#e74c3c',
    success: '#27ae60',
    warning: '#f39c12',
    lightBg: '#f8f9fa',
    border: '#e0e0e0',
    text: '#333333',
    textLight: '#666666'
  };

  // Handlers
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === "quantity" || field === "price" ? Number(value) : value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { description: "", quantity: 1, price: 0, unit: "pc" }]);

  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const calculateSubtotal = () =>
    items.reduce((acc, item) => acc + item.quantity * item.price, 0);

  const calculateTax = () => calculateSubtotal() * (taxRate / 100);
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  // Format currency with Naira sign
  const formatNaira = (amount) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Generate invoice number like reference (221 13403)
  const generateInvoiceNumber = () => {
    const randomNum = Math.floor(Math.random() * 100000);
    const shortNum = Math.floor(Math.random() * 1000);
    return `${shortNum} ${randomNum}`;
  };

  // Convert image to base64 for logo
  const getLogoBase64 = async () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = staticLogo;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        try {
          const base64 = canvas.toDataURL('image/png');
          resolve(base64);
        } catch (error) {
          console.error('Error converting logo to base64:', error);
          resolve(null);
        }
      };
      img.onerror = () => {
        console.error('Error loading logo image');
        resolve(null);
      };
    });
  };

  // Generate Image (JPEG/PNG)
  const generateImage = async (format = 'jpeg') => {
    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 2,
        logging: false,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      const imageData = canvas.toDataURL(`image/${format}`, 0.9);
      
      const link = document.createElement('a');
      link.download = `Hexstelle-invoice.${format}`;
      link.href = imageData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return imageData;
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error generating image. Please try again.');
      return null;
    }
  };

  // Generate PDF and return base64 data
  const generatePDF = async (download = true) => {
    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 2,
        logging: false,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      let heightLeft = imgHeight;
      let position = 0;
      
      if (heightLeft > pdfHeight) {
        while (heightLeft > 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
      }
      
      if (download) {
        pdf.save('Hexstelle-invoice.pdf');
      }
      
      // Return PDF as base64 string
      const pdfBase64 = pdf.output('datauristring');
      return pdfBase64;
    } catch (error) {
      console.error('Error generating PDF:', error);
      if (download) {
        generateImage('jpeg');
      }
      return null;
    }
  };

  // Export handler
  const handleExport = async () => {
    if (!clientName || !clientEmail) {
      setSendStatus("Please enter client name and email address");
      return;
    }

    if (exportType === 'pdf') {
      await generatePDF(true);
    } else {
      await generateImage('jpeg');
    }
  };

  // Download PDF using backend endpoint
  const downloadPDFViaBackend = async (invoiceData) => {
    try {
      const response = await fetch('http://localhost:5000/api/download-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${invoiceData.invoiceNumber.replace(' ', '-')}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        return true;
      } else {
        const errorData = await response.json();
        console.error('Backend PDF download failed:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Error downloading PDF via backend:', error);
      return false;
    }
  };

  // Send invoice function - UPDATED for backend compatibility
  const sendInvoiceEmail = async () => {
    if (!clientEmail || !clientName) {
      setSendStatus("Please enter client name and email address");
      return;
    }

    setIsSending(true);
    setSendStatus("Generating and sending invoice...");

    try {
      // Generate both PDF and Image versions
      const invoicePdf = await generatePDF(false); // Don't download, just get base64
      const invoiceImage = await html2canvas(invoiceRef.current, {
        useCORS: true,
        scale: 2,
        logging: false,
        backgroundColor: '#ffffff',
        width: invoiceRef.current.scrollWidth,
        height: invoiceRef.current.scrollHeight
      }).then(canvas => canvas.toDataURL('image/jpeg', 0.9));

      // Get logo as base64
      const logoBase64 = await getLogoBase64();

      const invoiceData = {
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        businessInfo: {
          ...businessInfo,
          logo: logoBase64 // Include logo in businessInfo
        },
        items,
        taxRate,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        invoicePdf, // Send PDF data
        invoiceImage, // Send image data as fallback
        exportType,
        invoiceNumber: generateInvoiceNumber(),
        issueDate: new Date().toLocaleDateString('en-GB'),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')
      };

      const response = await fetch('http://localhost:5000/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });

      const result = await response.json();
      
      if (result.success) {
        setSendStatus("Invoice sent successfully to client and business!");
        
        // Offer PDF download
        setTimeout(() => {
          if (window.confirm("Invoice sent successfully! Would you like to download the PDF version?")) {
            downloadPDFViaBackend(invoiceData);
          }
        }, 1000);
      } else {
        setSendStatus(result.message || 'Failed to send invoice');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setSendStatus("Failed to connect to server. Please check if backend is running.");
    } finally {
      setIsSending(false);
    }
  };

  // Standalone PDF download function
  const handleDownloadPDF = async () => {
    try {
      setIsSending(true);
      setSendStatus("Generating PDF...");

      const invoicePdf = await generatePDF(false);
      const logoBase64 = await getLogoBase64();

      const invoiceData = {
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        businessInfo: {
          ...businessInfo,
          logo: logoBase64
        },
        items,
        taxRate,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        invoicePdf,
        invoiceNumber: generateInvoiceNumber(),
        issueDate: new Date().toLocaleDateString('en-GB'),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')
      };

      const success = await downloadPDFViaBackend(invoiceData);
      setSendStatus(success ? "PDF downloaded successfully!" : "Failed to download PDF");
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setSendStatus("Error downloading PDF");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f7fa' }}>
      <h1 style={{ textAlign: 'center', color: colors.primary, marginBottom: '30px', fontSize: '2.5rem', fontWeight: '300' }}>
        Hexstelle Invoice Generator
      </h1>

      {/* Export Type Selection */}
      <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px', color: colors.primary, fontSize: '16px' }}>
          Export Format:
        </label>
        <div style={{ display: 'flex', gap: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="radio"
              value="pdf"
              checked={exportType === 'pdf'}
              onChange={(e) => setExportType(e.target.value)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ color: colors.text }}>PDF Document</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="radio"
              value="image"
              checked={exportType === 'image'}
              onChange={(e) => setExportType(e.target.value)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ color: colors.text }}>JPEG Image</span>
          </label>
        </div>
      </div>

      {/* Client Information Form */}
      <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: colors.primary, marginBottom: '20px', fontSize: '1.5rem', borderBottom: `2px solid ${colors.border}`, paddingBottom: '10px' }}>Client Information</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: colors.text }}>
              Client Name *
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Enter client name"
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: `1px solid ${colors.border}`, 
                borderRadius: '6px',
                fontSize: '14px',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.secondary}
              onBlur={(e) => e.target.style.borderColor = colors.border}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: colors.text }}>
              Client Email *
            </label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="Enter client email"
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: `1px solid ${colors.border}`, 
                borderRadius: '6px',
                fontSize: '14px',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.secondary}
              onBlur={(e) => e.target.style.borderColor = colors.border}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: colors.text }}>
              Client Phone
            </label>
            <input
              type="text"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="Enter client phone"
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: `1px solid ${colors.border}`, 
                borderRadius: '6px',
                fontSize: '14px',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.secondary}
              onBlur={(e) => e.target.style.borderColor = colors.border}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: colors.text }}>
              Client Address
            </label>
            <input
              type="text"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              placeholder="Enter client address"
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: `1px solid ${colors.border}`, 
                borderRadius: '6px',
                fontSize: '14px',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.secondary}
              onBlur={(e) => e.target.style.borderColor = colors.border}
            />
          </div>
        </div>
      </div>

      {/* Tax Rate Input */}
      <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '12px', color: colors.primary, fontSize: '16px' }}>
          Tax Rate (%):
        </label>
        <input
          type="number"
          value={taxRate}
          onChange={(e) => setTaxRate(Number(e.target.value))}
          min="0"
          max="100"
          step="0.1"
          style={{ 
            width: '120px', 
            padding: '12px', 
            border: `1px solid ${colors.border}`, 
            borderRadius: '6px',
            fontSize: '14px',
            transition: 'border-color 0.3s'
          }}
          onFocus={(e) => e.target.style.borderColor = colors.secondary}
          onBlur={(e) => e.target.style.borderColor = colors.border}
        />
      </div>

      {/* Invoice Items Form */}
      <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: colors.primary, margin: 0, fontSize: '1.5rem' }}>Invoice Items</h2>
          <button
            onClick={addItem}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: colors.success, 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#219653'}
            onMouseOut={(e) => e.target.style.backgroundColor = colors.success}
          >
            + Add Item
          </button>
        </div>

        {items.map((item, index) => (
          <div key={index} style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr 1fr 1fr auto', 
            gap: '12px', 
            alignItems: 'end',
            marginBottom: '15px',
            padding: '15px',
            backgroundColor: colors.lightBg,
            borderRadius: '8px',
            border: `1px solid ${colors.border}`
          }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '12px', color: colors.text }}>
                Description
              </label>
              <input
                type="text"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                placeholder="Item description"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: `1px solid ${colors.border}`, 
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '12px', color: colors.text }}>
                Quantity
              </label>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                min="1"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: `1px solid ${colors.border}`, 
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '12px', color: colors.text }}>
                Unit
              </label>
              <select
                value={item.unit}
                onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: `1px solid ${colors.border}`, 
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="pc">pc</option>
                <option value="set-piece">set</option>
                <option value="mid-piece">box</option>
                <option value="litres">litres</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '12px', color: colors.text }}>
                Price (₦)
              </label>
              <input
                type="number"
                value={item.price}
                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                min="0"
                step="0.01"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: `1px solid ${colors.border}`, 
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <button
                onClick={() => removeItem(index)}
                style={{ 
                  padding: '10px 12px', 
                  backgroundColor: colors.accent, 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontSize: '12px',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
                onMouseOut={(e) => e.target.style.backgroundColor = colors.accent}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Printable invoice section */}
      <div ref={invoiceRef} style={{ 
        padding: '40px', 
        backgroundColor: 'white', 
        border: `1px solid ${colors.border}`, 
        borderRadius: '10px',
        minHeight: '297mm',
        boxSizing: 'border-box',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        {/* Header Section with Improved Logo Alignment */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: '30px',
          borderBottom: `3px solid ${colors.primary}`,
          paddingBottom: '20px'
        }}>
          {/* Left side - Logo with better alignment */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '15px'
            }}>
              <img 
                src={staticLogo} 
                alt="Hexstelle Logo" 
                style={{ 
                  width: '120px', 
                  height: '60px', 
                  objectFit: 'contain',
                  borderRadius: '4px'
                }} 
              />
              <div>
                <h2 style={{ 
                  color: colors.primary, 
                  margin: '0', 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  lineHeight: '1.2'
                }}>
                  {businessInfo.name}
                </h2>
                <p style={{ 
                  margin: '2px 0', 
                  color: colors.textLight, 
                  fontSize: '12px',
                  fontStyle: 'italic'
                }}>
                  Professional Services
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Invoice Header */}
          <div style={{ textAlign: 'right', flex: 1 }}>
            <h1 style={{ 
              fontSize: '32px', 
              color: colors.primary, 
              margin: '0 0 15px 0',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              INVOICE
            </h1>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '8px',
              textAlign: 'left',
              backgroundColor: colors.lightBg,
              padding: '12px',
              borderRadius: '6px',
              fontSize: '11px',
              border: `1px solid ${colors.border}`
            }}>
              <div><strong>INVOICE NO.</strong></div>
              <div style={{ fontWeight: 'bold', color: colors.primary }}>{generateInvoiceNumber().split(' ')[0]}</div>
              
              <div><strong>REFERENCE</strong></div>
              <div style={{ fontWeight: 'bold', color: colors.primary }}>{generateInvoiceNumber().split(' ')[1]}</div>
              
              <div><strong>ISSUE DATE</strong></div>
              <div>{new Date().toLocaleDateString('en-GB')}</div>
              
              <div><strong>PAYMENT METHOD</strong></div>
              <div>Transfer</div>
              
              <div><strong>DUE DATE</strong></div>
              <div>{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}</div>
              
              <div><strong>ORDER NO.</strong></div>
              <div>{Math.floor(Math.random() * 1000)}</div>
            </div>
          </div>
        </div>

        {/* FROM/TO Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '20px', 
          marginBottom: '25px' 
        }}>
          <div>
            <h3 style={{ color: colors.primary, marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>FROM</h3>
            <div style={{ padding: '15px', backgroundColor: colors.lightBg, borderRadius: '6px', fontSize: '12px', border: `1px solid ${colors.border}` }}>
              <p style={{ margin: '3px 0', fontWeight: 'bold', color: colors.primary }}>{businessInfo.name}</p>
              <p style={{ margin: '3px 0', color: colors.text }}>{businessInfo.address}</p>
              <p style={{ margin: '3px 0', color: colors.text }}>Nigeria</p>
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${colors.border}` }}>
                <p style={{ margin: '2px 0', fontSize: '11px', color: colors.textLight }}>{businessInfo.phone}</p>
                <p style={{ margin: '2px 0', fontSize: '11px', color: colors.textLight }}>{businessInfo.whatsapp}</p>
                <p style={{ margin: '2px 0', fontSize: '11px', color: colors.textLight }}>{businessInfo.email}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 style={{ color: colors.primary, marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>TO</h3>
            <div style={{ padding: '15px', backgroundColor: colors.lightBg, borderRadius: '6px', fontSize: '12px', border: `1px solid ${colors.border}` }}>
              <p style={{ margin: '3px 0', fontWeight: 'bold', color: colors.primary }}>
                {clientName ? `Ms./Mr. ${clientName}` : "Client Name"}
              </p>
              {clientAddress && <p style={{ margin: '3px 0', color: colors.text }}>{clientAddress}</p>}
              <p style={{ margin: '3px 0', color: colors.text }}>Nigeria</p>
              {clientPhone && <p style={{ margin: '3px 0', color: colors.text }}>Phone: {clientPhone}</p>}
              {clientEmail && <p style={{ margin: '3px 0', color: colors.text }}>Email: {clientEmail}</p>}
            </div>
          </div>
        </div>

        {/* Total Due Banner */}
        <div style={{ 
          backgroundColor: colors.primary, 
          color: 'white', 
          padding: '15px', 
          textAlign: 'center',
          marginBottom: '20px',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          Total due: {formatNaira(calculateTotal())}
        </div>

        {/* Greeting */}
        <div style={{ marginBottom: '20px', fontSize: '12px', color: colors.text }}>
          <p style={{ fontStyle: 'italic' }}>Dear {clientName ? (clientName.startsWith('Ms.') || clientName.startsWith('Mr.') ? clientName.split(' ')[1] : clientName.split(' ')[0]) : 'Customer'},</p>
        </div>

        {/* Items Table */}
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          margin: '20px 0',
          border: `1px solid ${colors.border}`,
          fontSize: '12px',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <thead>
            <tr style={{ backgroundColor: colors.primary, color: 'white' }}>
              <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${colors.primary}`, fontWeight: 'bold' }}>DESCRIPTION</th>
              <th style={{ padding: '12px', textAlign: 'center', border: `1px solid ${colors.primary}`, fontWeight: 'bold' }}>QUANTITY</th>
              <th style={{ padding: '12px', textAlign: 'center', border: `1px solid ${colors.primary}`, fontWeight: 'bold' }}>UNIT PRICE (₦)</th>
              <th style={{ padding: '12px', textAlign: 'center', border: `1px solid ${colors.primary}`, fontWeight: 'bold' }}>AMOUNT (₦)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'white' : colors.lightBg }}>
                <td style={{ padding: '10px', border: `1px solid ${colors.border}`, verticalAlign: 'top' }}>
                  <div style={{ fontWeight: 'bold', color: colors.text }}>{item.description || "Item description"}</div>
                </td>
                <td style={{ padding: '10px', textAlign: 'center', border: `1px solid ${colors.border}`, color: colors.text }}>
                  {item.quantity} {item.unit}
                </td>
                <td style={{ padding: '10px', textAlign: 'center', border: `1px solid ${colors.border}`, color: colors.text }}>
                  {formatNaira(item.price)}
                </td>
                <td style={{ padding: '10px', textAlign: 'center', border: `1px solid ${colors.border}`, fontWeight: 'bold', color: colors.primary }}>
                  {formatNaira(item.quantity * item.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div style={{ 
          textAlign: 'right', 
          marginTop: '25px', 
          padding: '20px',
          borderTop: `3px solid ${colors.primary}`,
          fontSize: '14px',
          backgroundColor: colors.lightBg,
          borderRadius: '6px'
        }}>
          <div style={{ display: 'inline-block', textAlign: 'left', minWidth: '250px' }}>
            <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold', color: colors.text }}>Subtotal:</span>
              <span style={{ color: colors.text }}>{formatNaira(calculateSubtotal())}</span>
            </div>
            {taxRate > 0 && (
              <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold', color: colors.text }}>Tax ({taxRate}%):</span>
                <span style={{ color: colors.text }}>{formatNaira(calculateTax())}</span>
              </div>
            )}
            <div style={{ marginBottom: '10px', borderTop: `2px solid ${colors.border}`, paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold', color: colors.primary, fontSize: '16px' }}>Total (NGN):</span>
              <span style={{ fontWeight: 'bold', fontSize: '18px', color: colors.primary }}>
                {formatNaira(calculateTotal())}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          backgroundColor: colors.lightBg, 
          borderRadius: '6px',
          borderLeft: `5px solid ${colors.primary}`,
          fontSize: '12px',
          border: `1px solid ${colors.border}`
        }}>
          <h4 style={{ color: colors.primary, marginBottom: '10px', fontWeight: 'bold', fontSize: '14px' }}>Kindly make payment to:</h4>
          <p style={{ margin: '4px 0', fontWeight: 'bold', color: colors.text }}>{businessInfo.accountName}</p>
          <p style={{ margin: '4px 0', color: colors.text }}>Bank: {businessInfo.bankName}</p>
          <p style={{ margin: '4px 0', color: colors.text }}>Account Number: {businessInfo.accountNumber}</p>
          
        </div>

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: colors.lightBg, 
          borderRadius: '6px',
          borderLeft: `4px solid ${colors.warning}`,
          fontSize: '12px'
        }}>
          <h4 style={{ 
            color: colors.primary, 
            marginBottom: '8px', 
            fontWeight: 'bold', 
            fontSize: '13px' 
          }}>
            Payment Terms:
          </h4>
          <p style={{ margin: '4px 0', color: colors.text, lineHeight: '1.4' }}>
            An upfront fee of 50% is required before production begins. The balance will be due upon completion and prior to delivery.
          </p>
        </div>

        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '30px', 
          color: colors.textLight, 
          fontStyle: 'italic',
          paddingTop: '20px',
          borderTop: `1px solid ${colors.border}`,
          fontSize: '12px'
        }}>
          <p style={{ fontWeight: 'bold', fontSize: '14px', color: colors.primary }}>We appreciate your Patronage!</p>
          <p style={{ margin: '5px 0', fontSize: '11px' }}>Thank you for choosing Hexstelle</p>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div style={{ marginTop: '40px', padding: '30px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: colors.primary, marginBottom: '25px', fontSize: '1.5rem', textAlign: 'center' }}>Export & Send Invoice</h2>

        {/* Status message */}
        {sendStatus && (
          <div style={{
            padding: '15px',
            marginBottom: '25px',
            borderRadius: '6px',
            backgroundColor: sendStatus.includes('successfully') ? '#d4edda' : sendStatus.includes('Failed') ? '#f8d7da' : '#fff3cd',
            color: sendStatus.includes('successfully') ? '#155724' : sendStatus.includes('Failed') ? '#721c24' : '#856404',
            border: `1px solid ${sendStatus.includes('successfully') ? '#c3e6cb' : sendStatus.includes('Failed') ? '#f5c6cb' : '#ffeeba'}`,
            textAlign: 'center'
          }}>
            {sendStatus}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Export Button */}
          <button
            onClick={handleExport}
            style={{ 
              width: '100%', 
              padding: '18px', 
              backgroundColor: colors.secondary, 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '16px', 
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
            onMouseOut={(e) => e.target.style.backgroundColor = colors.secondary}
          >
            Export as {exportType === 'pdf' ? 'PDF' : 'JPEG Image'}
          </button>

          {/* Send Email Button */}
          <button
            onClick={sendInvoiceEmail}
            disabled={isSending}
            style={{ 
              width: '100%', 
              padding: '18px', 
              backgroundColor: isSending ? colors.textLight : '#9b59b6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '16px', 
              cursor: isSending ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => !isSending && (e.target.style.backgroundColor = '#8e44ad')}
            onMouseOut={(e) => !isSending && (e.target.style.backgroundColor = '#9b59b6')}
          >
            {isSending ? 'Sending Invoice...' : 'Send Invoice via Email'}
          </button>

          {/* Individual Format Buttons */}
          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={handleDownloadPDF}
              disabled={isSending}
              style={{ 
                flex: 1, 
                padding: '15px', 
                backgroundColor: colors.primary, 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                fontSize: '14px', 
                cursor: isSending ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => !isSending && (e.target.style.backgroundColor = '#1a252f')}
              onMouseOut={(e) => !isSending && (e.target.style.backgroundColor = colors.primary)}
            >
              {isSending ? 'Generating...' : 'Download PDF via Backend'}
            </button>
            <button
              onClick={() => generateImage('jpeg')}
              style={{ 
                flex: 1, 
                padding: '15px', 
                backgroundColor: colors.warning, 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                fontSize: '14px', 
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#e67e22'}
              onMouseOut={(e) => e.target.style.backgroundColor = colors.warning}
            >
              Download JPEG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;