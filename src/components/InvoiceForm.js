// import React, { useMemo, useRef, useState } from "react";
// import html2canvas from "html2canvas";

// const InvoiceForm = () => {
//   const businessInfo = {
//     name: "Hexstelle",
//     address: "43 Afolabi Brown Street Akoka Yaba Lagos State",
//     phone: "+234 8140 892471",
//     email: "hexstelle1@gmail.com",
//     ownerEmail: "hexstelle1@gmail.com",
//     whatsapp: "https://wa.me/c/2348140892471",
//     bankName: "Carbon MFB",
//     accountNumber: "1224642058",
//     accountName: "Ugwunnamuchi Esther",
//   };

//   // Static logo
//   const staticLogo = process.env.PUBLIC_URL + "/hexstelle_logo.jpeg";

//   // Dynamic State
//   const [clientTitle, setClientTitle] = useState("");
//   const [clientName, setClientName] = useState("");
//   const [clientAddress, setClientAddress] = useState("");
//   const [clientPhone, setClientPhone] = useState("");
//   const [clientEmail, setClientEmail] = useState("");
//   const [items, setItems] = useState([
//     { description: "", quantity: 1, price: 0, unit: "pc" },
//   ]);
//   const [taxRate, setTaxRate] = useState(0);
//   const [isSending, setIsSending] = useState(false);
//   const [sendStatus, setSendStatus] = useState("");
//   const [exportType, setExportType] = useState("pdf");
//   const invoiceRef = useRef(null);

//   // ✅ Generate stable invoice fields (prevents mismatch on rerender)
//   const invoiceMeta = useMemo(() => {
//     const randomNum = Math.floor(Math.random() * 100000);
//     const shortNum = Math.floor(Math.random() * 1000);
//     const orderNo = Math.floor(Math.random() * 1000);
//     const issueDate = new Date().toLocaleDateString("en-GB");
//     const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(
//       "en-GB"
//     );
//     return {
//       invoiceNo: String(shortNum),
//       reference: String(randomNum),
//       orderNo: String(orderNo),
//       issueDate,
//       dueDate,
//     };
//   }, []);

//   // Color scheme
//   const colors = {
//     primary: "#2c3e50",
//     secondary: "#3498db",
//     accent: "#e74c3c",
//     success: "#27ae60",
//     warning: "#f39c12",
//     lightBg: "#f8f9fa",
//     border: "#e0e0e0",
//     text: "#333333",
//     textLight: "#666666",
//   };

//   // Handlers
//   const handleItemChange = (index, field, value) => {
//     const newItems = [...items];
//     newItems[index][field] =
//       field === "quantity" || field === "price" ? Number(value) : value;
//     setItems(newItems);
//   };

//   const addItem = () =>
//     setItems([...items, { description: "", quantity: 1, price: 0, unit: "pc" }]);

//   const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

//   const calculateSubtotal = () =>
//     items.reduce((acc, item) => acc + item.quantity * item.price, 0);

//   const calculateTax = () => calculateSubtotal() * (taxRate / 100);
//   const calculateTotal = () => calculateSubtotal() + calculateTax();

//   // Format currency with Naira sign
//   const formatNaira = (amount) => {
//     return `₦${Number(amount || 0).toLocaleString("en-NG", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     })}`;
//   };

//   // Get first name for greeting
//   const getFirstName = () => {
//     if (!clientName) return "Customer";
//     return clientName.trim().split(" ")[0] || "Customer";
//   };

//   // Convert image to base64 for logo
//   const getLogoBase64 = async () => {
//     return new Promise((resolve) => {
//       const img = new Image();
//       img.crossOrigin = "anonymous";
//       img.src = staticLogo;
//       img.onload = () => {
//         const canvas = document.createElement("canvas");
//         const ctx = canvas.getContext("2d");
//         canvas.width = img.width;
//         canvas.height = img.height;
//         ctx.drawImage(img, 0, 0);
//         try {
//           const base64 = canvas.toDataURL("image/png");
//           resolve(base64);
//         } catch (error) {
//           console.error("Error converting logo to base64:", error);
//           resolve(null);
//         }
//       };
//       img.onerror = () => {
//         console.error("Error loading logo image");
//         resolve(null);
//       };
//     });
//   };

//   // Generate Image (JPEG/PNG)
//   const generateImage = async (format = "jpeg") => {
//     try {
//       const element = invoiceRef.current;
//       if (!element) return null;

//       const canvas = await html2canvas(element, {
//         useCORS: true,
//         scale: 2,
//         logging: false,
//         backgroundColor: "#ffffff",
//         width: element.scrollWidth,
//         height: element.scrollHeight,
//         windowWidth: element.scrollWidth,
//         windowHeight: element.scrollHeight,
//       });

//       const imageData = canvas.toDataURL(`image/${format}`, 0.9);

//       const link = document.createElement("a");
//       link.download = `Hexstelle-invoice.${format}`;
//       link.href = imageData;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);

//       return imageData;
//     } catch (error) {
//       console.error("Error generating image:", error);
//       alert("Error generating image. Please try again.");
//       return null;
//     }
//   };

//   // ✅ Better multi-page PDF slicing (no weird overlap offsets)
//   const generatePDF = async (download = true) => {
//     try {
//       const element = invoiceRef.current;
//       if (!element) return null;

//       const canvas = await html2canvas(element, {
//         useCORS: true,
//         scale: 2,
//         logging: false,
//         backgroundColor: "#ffffff",
//         width: element.scrollWidth,
//         height: element.scrollHeight,
//         windowWidth: element.scrollWidth,
//         windowHeight: element.scrollHeight,
//       });

//       const imgData = canvas.toDataURL("image/png");
//       const { jsPDF } = await import("jspdf");
//       const pdf = new jsPDF("p", "mm", "a4");

//       const pdfWidth = pdf.internal.pageSize.getWidth(); // 210
//       const pdfHeight = pdf.internal.pageSize.getHeight(); // 297

//       // Convert canvas px -> pdf mm scaling
//       const imgWidth = pdfWidth;
//       const imgHeight = (canvas.height * imgWidth) / canvas.width;

//       let y = 0;
//       let heightLeft = imgHeight;

//       // First page
//       pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
//       heightLeft -= pdfHeight;

//       // Additional pages
//       while (heightLeft > 0) {
//         pdf.addPage();
//         y = heightLeft - imgHeight; // negative value to shift image up
//         pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
//         heightLeft -= pdfHeight;
//       }

//       if (download) pdf.save("Hexstelle-invoice.pdf");
//       return pdf.output("datauristring");
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//       if (download) {
//         await generateImage("jpeg");
//       }
//       return null;
//     }
//   };

//   // Export handler
//   const handleExport = async () => {
//     if (!clientName || !clientEmail) {
//       setSendStatus("Please enter client name and email address");
//       return;
//     }

//     if (exportType === "pdf") {
//       await generatePDF(true);
//     } else {
//       await generateImage("jpeg");
//     }
//   };

//   // Download PDF using backend endpoint
//   const downloadPDFViaBackend = async (invoiceData) => {
//     try {
//       const response = await fetch("http://localhost:5000/api/download-pdf", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(invoiceData),
//       });

//       if (response.ok) {
//         const blob = await response.blob();
//         const url = window.URL.createObjectURL(blob);
//         const link = document.createElement("a");
//         link.href = url;
//         link.download = `invoice-${invoiceData.invoiceNumber.replace(" ", "-")}.pdf`;
//         link.click();
//         window.URL.revokeObjectURL(url);
//         return true;
//       } else {
//         const errorData = await response.json();
//         console.error("Backend PDF download failed:", errorData);
//         return false;
//       }
//     } catch (error) {
//       console.error("Error downloading PDF via backend:", error);
//       return false;
//     }
//   };

//   // Send invoice function
//   const sendInvoiceEmail = async () => {
//     if (!clientEmail || !clientName) {
//       setSendStatus("Please enter client name and email address");
//       return;
//     }

//     setIsSending(true);
//     setSendStatus("Generating and sending invoice...");

//     try {
//       // Generate both PDF and Image versions
//       const invoicePdf = await generatePDF(false);

//       const element = invoiceRef.current;
//       const invoiceImage =
//         element &&
//         (await html2canvas(element, {
//           useCORS: true,
//           scale: 2,
//           logging: false,
//           backgroundColor: "#ffffff",
//           width: element.scrollWidth,
//           height: element.scrollHeight,
//           windowWidth: element.scrollWidth,
//           windowHeight: element.scrollHeight,
//         }).then((c) => c.toDataURL("image/jpeg", 0.9)));

//       // Get logo as base64
//       const logoBase64 = await getLogoBase64();

//       const invoiceData = {
//         clientName: clientTitle ? `${clientTitle} ${clientName}` : clientName,
//         clientEmail,
//         clientPhone,
//         clientAddress,
//         businessInfo: {
//           ...businessInfo,
//           logo: logoBase64,
//         },
//         items,
//         taxRate,
//         subtotal: calculateSubtotal(),
//         tax: calculateTax(),
//         total: calculateTotal(),
//         invoicePdf,
//         invoiceImage,
//         exportType,
//         invoiceNumber: `${invoiceMeta.invoiceNo} ${invoiceMeta.reference}`,
//         issueDate: invoiceMeta.issueDate,
//         dueDate: invoiceMeta.dueDate,
//         orderNo: invoiceMeta.orderNo,
//       };

//       const response = await fetch("http://localhost:5000/api/send-invoice", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(invoiceData),
//       });

//       const result = await response.json();

//       if (result.success) {
//         setSendStatus("Invoice sent successfully to client and business!");

//         // Offer PDF download
//         setTimeout(() => {
//           if (
//             window.confirm(
//               "Invoice sent successfully! Would you like to download the PDF version?"
//             )
//           ) {
//             downloadPDFViaBackend(invoiceData);
//           }
//         }, 1000);
//       } else {
//         setSendStatus(result.message || "Failed to send invoice");
//       }
//     } catch (error) {
//       console.error("Error sending email:", error);
//       setSendStatus("Failed to connect to server. Please check if backend is running.");
//     } finally {
//       setIsSending(false);
//     }
//   };

//   // Standalone PDF download function
//   const handleDownloadPDF = async () => {
//     try {
//       setIsSending(true);
//       setSendStatus("Generating PDF...");

//       const invoicePdf = await generatePDF(false);
//       const logoBase64 = await getLogoBase64();

//       const invoiceData = {
//         clientName: clientTitle ? `${clientTitle} ${clientName}` : clientName,
//         clientEmail,
//         clientPhone,
//         clientAddress,
//         businessInfo: {
//           ...businessInfo,
//           logo: logoBase64,
//         },
//         items,
//         taxRate,
//         subtotal: calculateSubtotal(),
//         tax: calculateTax(),
//         total: calculateTotal(),
//         invoicePdf,
//         invoiceNumber: `${invoiceMeta.invoiceNo} ${invoiceMeta.reference}`,
//         issueDate: invoiceMeta.issueDate,
//         dueDate: invoiceMeta.dueDate,
//         orderNo: invoiceMeta.orderNo,
//       };

//       const success = await downloadPDFViaBackend(invoiceData);
//       setSendStatus(success ? "PDF downloaded successfully!" : "Failed to download PDF");
//     } catch (error) {
//       console.error("Error downloading PDF:", error);
//       setSendStatus("Error downloading PDF");
//     } finally {
//       setIsSending(false);
//     }
//   };

//   return (
//     <div
//       style={{
//         maxWidth: "800px",
//         margin: "0 auto",
//         padding: "20px",
//         fontFamily: "Arial, sans-serif",
//         backgroundColor: "#f5f7fa",
//       }}
//     >
//       <h1
//         style={{
//           textAlign: "center",
//           color: colors.primary,
//           marginBottom: "30px",
//           fontSize: "2.5rem",
//           fontWeight: "300",
//         }}
//       >
//         Hexstelle Invoice Generator
//       </h1>

//       {/* Export Type Selection */}
//       <div
//         style={{
//           marginBottom: "20px",
//           padding: "20px",
//           backgroundColor: "white",
//           borderRadius: "10px",
//           boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//         }}
//       >
//         <label
//           style={{
//             display: "block",
//             fontWeight: "bold",
//             marginBottom: "10px",
//             color: colors.primary,
//             fontSize: "16px",
//           }}
//         >
//           Export Format:
//         </label>
//         <div style={{ display: "flex", gap: "20px" }}>
//           <label
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "8px",
//               cursor: "pointer",
//             }}
//           >
//             <input
//               type="radio"
//               value="pdf"
//               checked={exportType === "pdf"}
//               onChange={(e) => setExportType(e.target.value)}
//               style={{ cursor: "pointer" }}
//             />
//             <span style={{ color: colors.text }}>PDF Document</span>
//           </label>
//           <label
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "8px",
//               cursor: "pointer",
//             }}
//           >
//             <input
//               type="radio"
//               value="image"
//               checked={exportType === "image"}
//               onChange={(e) => setExportType(e.target.value)}
//               style={{ cursor: "pointer" }}
//             />
//             <span style={{ color: colors.text }}>JPEG Image</span>
//           </label>
//         </div>
//       </div>

//       {/* Client Information Form */}
//       <div
//         style={{
//           marginBottom: "20px",
//           padding: "20px",
//           backgroundColor: "white",
//           borderRadius: "10px",
//           boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//         }}
//       >
//         <h2
//           style={{
//             color: colors.primary,
//             marginBottom: "20px",
//             fontSize: "1.5rem",
//             borderBottom: `2px solid ${colors.border}`,
//             paddingBottom: "10px",
//           }}
//         >
//           Client Information
//         </h2>

//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr",
//             gap: "20px",
//             marginBottom: "20px",
//           }}
//         >
//           <div>
//             <label
//               style={{
//                 display: "block",
//                 fontWeight: "bold",
//                 marginBottom: "8px",
//                 fontSize: "14px",
//                 color: colors.text,
//               }}
//             >
//               Client Title
//             </label>
//             <select
//               value={clientTitle}
//               onChange={(e) => setClientTitle(e.target.value)}
//               style={{
//                 width: "100%",
//                 padding: "12px",
//                 border: `1px solid ${colors.border}`,
//                 borderRadius: "6px",
//                 fontSize: "14px",
//                 transition: "border-color 0.3s",
//                 backgroundColor: "white",
//               }}
//               onFocus={(e) => (e.target.style.borderColor = colors.secondary)}
//               onBlur={(e) => (e.target.style.borderColor = colors.border)}
//             >
//               <option value="">Select Title</option>
//               <option value="Ms.">Ms.</option>
//               <option value="Mrs.">Mrs.</option>
//               <option value="Mr.">Mr.</option>
//               <option value="Dr.">Dr.</option>
//               <option value="Chief">Chief</option>
//             </select>
//           </div>

//           <div>
//             <label
//               style={{
//                 display: "block",
//                 fontWeight: "bold",
//                 marginBottom: "8px",
//                 fontSize: "14px",
//                 color: colors.text,
//               }}
//             >
//               Client Name *
//             </label>
//             <input
//               type="text"
//               value={clientName}
//               onChange={(e) => setClientName(e.target.value)}
//               placeholder="Enter client name"
//               style={{
//                 width: "100%",
//                 padding: "12px",
//                 border: `1px solid ${colors.border}`,
//                 borderRadius: "6px",
//                 fontSize: "14px",
//                 transition: "border-color 0.3s",
//               }}
//               onFocus={(e) => (e.target.style.borderColor = colors.secondary)}
//               onBlur={(e) => (e.target.style.borderColor = colors.border)}
//             />
//           </div>
//         </div>

//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr",
//             gap: "20px",
//             marginBottom: "20px",
//           }}
//         >
//           <div>
//             <label
//               style={{
//                 display: "block",
//                 fontWeight: "bold",
//                 marginBottom: "8px",
//                 fontSize: "14px",
//                 color: colors.text,
//               }}
//             >
//               Client Email *
//             </label>
//             <input
//               type="email"
//               value={clientEmail}
//               onChange={(e) => setClientEmail(e.target.value)}
//               placeholder="Enter client email"
//               style={{
//                 width: "100%",
//                 padding: "12px",
//                 border: `1px solid ${colors.border}`,
//                 borderRadius: "6px",
//                 fontSize: "14px",
//                 transition: "border-color 0.3s",
//               }}
//               onFocus={(e) => (e.target.style.borderColor = colors.secondary)}
//               onBlur={(e) => (e.target.style.borderColor = colors.border)}
//             />
//           </div>

//           <div>
//             <label
//               style={{
//                 display: "block",
//                 fontWeight: "bold",
//                 marginBottom: "8px",
//                 fontSize: "14px",
//                 color: colors.text,
//               }}
//             >
//               Client Phone
//             </label>
//             <input
//               type="text"
//               value={clientPhone}
//               onChange={(e) => setClientPhone(e.target.value)}
//               placeholder="Enter client phone"
//               style={{
//                 width: "100%",
//                 padding: "12px",
//                 border: `1px solid ${colors.border}`,
//                 borderRadius: "6px",
//                 fontSize: "14px",
//                 transition: "border-color 0.3s",
//               }}
//               onFocus={(e) => (e.target.style.borderColor = colors.secondary)}
//               onBlur={(e) => (e.target.style.borderColor = colors.border)}
//             />
//           </div>
//         </div>

//         <div>
//           <label
//             style={{
//               display: "block",
//               fontWeight: "bold",
//               marginBottom: "8px",
//               fontSize: "14px",
//               color: colors.text,
//             }}
//           >
//             Client Address
//           </label>
//           <input
//             type="text"
//             value={clientAddress}
//             onChange={(e) => setClientAddress(e.target.value)}
//             placeholder="Enter client address"
//             style={{
//               width: "100%",
//               padding: "12px",
//               border: `1px solid ${colors.border}`,
//               borderRadius: "6px",
//               fontSize: "14px",
//               transition: "border-color 0.3s",
//             }}
//             onFocus={(e) => (e.target.style.borderColor = colors.secondary)}
//             onBlur={(e) => (e.target.style.borderColor = colors.border)}
//           />
//         </div>
//       </div>

//       {/* Tax Rate Input */}
//       <div
//         style={{
//           marginBottom: "20px",
//           padding: "20px",
//           backgroundColor: "white",
//           borderRadius: "10px",
//           boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//         }}
//       >
//         <label
//           style={{
//             display: "block",
//             fontWeight: "bold",
//             marginBottom: "12px",
//             color: colors.primary,
//             fontSize: "16px",
//           }}
//         >
//           Tax Rate (%):
//         </label>
//         <input
//           type="number"
//           value={taxRate}
//           onChange={(e) => setTaxRate(Number(e.target.value))}
//           min="0"
//           max="100"
//           step="0.1"
//           style={{
//             width: "120px",
//             padding: "12px",
//             border: `1px solid ${colors.border}`,
//             borderRadius: "6px",
//             fontSize: "14px",
//             transition: "border-color 0.3s",
//           }}
//           onFocus={(e) => (e.target.style.borderColor = colors.secondary)}
//           onBlur={(e) => (e.target.style.borderColor = colors.border)}
//         />
//       </div>

//       {/* Invoice Items Form */}
//       <div
//         style={{
//           marginBottom: "20px",
//           padding: "20px",
//           backgroundColor: "white",
//           borderRadius: "10px",
//           boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: "20px",
//           }}
//         >
//           <h2 style={{ color: colors.primary, margin: 0, fontSize: "1.5rem" }}>
//             Invoice Items
//           </h2>
//           <button
//             onClick={addItem}
//             style={{
//               padding: "10px 20px",
//               backgroundColor: colors.success,
//               color: "white",
//               border: "none",
//               borderRadius: "6px",
//               cursor: "pointer",
//               fontSize: "14px",
//               fontWeight: "bold",
//               transition: "background-color 0.3s",
//             }}
//             onMouseOver={(e) => (e.target.style.backgroundColor = "#219653")}
//             onMouseOut={(e) => (e.target.style.backgroundColor = colors.success)}
//           >
//             + Add Item
//           </button>
//         </div>

//         {items.map((item, index) => (
//           <div
//             key={index}
//             style={{
//               display: "grid",
//               gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
//               gap: "12px",
//               alignItems: "end",
//               marginBottom: "15px",
//               padding: "15px",
//               backgroundColor: colors.lightBg,
//               borderRadius: "8px",
//               border: `1px solid ${colors.border}`,
//             }}
//           >
//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   fontWeight: "bold",
//                   marginBottom: "6px",
//                   fontSize: "12px",
//                   color: colors.text,
//                 }}
//               >
//                 Description
//               </label>
//               <input
//                 type="text"
//                 value={item.description}
//                 onChange={(e) =>
//                   handleItemChange(index, "description", e.target.value)
//                 }
//                 placeholder="Item description"
//                 style={{
//                   width: "100%",
//                   padding: "10px",
//                   border: `1px solid ${colors.border}`,
//                   borderRadius: "4px",
//                   fontSize: "14px",
//                 }}
//               />
//             </div>

//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   fontWeight: "bold",
//                   marginBottom: "6px",
//                   fontSize: "12px",
//                   color: colors.text,
//                 }}
//               >
//                 Quantity
//               </label>
//               <input
//                 type="number"
//                 value={item.quantity}
//                 onChange={(e) =>
//                   handleItemChange(index, "quantity", e.target.value)
//                 }
//                 min="1"
//                 style={{
//                   width: "100%",
//                   padding: "10px",
//                   border: `1px solid ${colors.border}`,
//                   borderRadius: "4px",
//                   fontSize: "14px",
//                 }}
//               />
//             </div>

//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   fontWeight: "bold",
//                   marginBottom: "6px",
//                   fontSize: "12px",
//                   color: colors.text,
//                 }}
//               >
//                 Unit
//               </label>
//               <select
//                 value={item.unit}
//                 onChange={(e) => handleItemChange(index, "unit", e.target.value)}
//                 style={{
//                   width: "100%",
//                   padding: "10px",
//                   border: `1px solid ${colors.border}`,
//                   borderRadius: "4px",
//                   fontSize: "14px",
//                 }}
//               >
//                 <option value="pc">pc</option>
//                 <option value="set-piece">set</option>
//                 <option value="mid-piece">box</option>
//               </select>
//             </div>

//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   fontWeight: "bold",
//                   marginBottom: "6px",
//                   fontSize: "12px",
//                   color: colors.text,
//                 }}
//               >
//                 Price (₦)
//               </label>
//               <input
//                 type="number"
//                 value={item.price}
//                 onChange={(e) => handleItemChange(index, "price", e.target.value)}
//                 min="0"
//                 step="0.01"
//                 style={{
//                   width: "100%",
//                   padding: "10px",
//                   border: `1px solid ${colors.border}`,
//                   borderRadius: "4px",
//                   fontSize: "14px",
//                 }}
//               />
//             </div>

//             <div>
//               <button
//                 onClick={() => removeItem(index)}
//                 style={{
//                   padding: "10px 12px",
//                   backgroundColor: colors.accent,
//                   color: "white",
//                   border: "none",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                   fontSize: "12px",
//                   transition: "background-color 0.3s",
//                 }}
//                 onMouseOver={(e) => (e.target.style.backgroundColor = "#c0392b")}
//                 onMouseOut={(e) => (e.target.style.backgroundColor = colors.accent)}
//               >
//                 Remove
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Printable invoice section */}
//       <div
//         ref={invoiceRef}
//         style={{
//           padding: "40px",
//           backgroundColor: "white",
//           border: `1px solid ${colors.border}`,
//           borderRadius: "10px",
//           minHeight: "297mm",
//           boxSizing: "border-box",
//           boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
//         }}
//       >
//         {/* ✅ Header Section (3-column grid with spacing, no overlap) */}
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "140px 1fr 320px", 
//             columnGap: "18px",
//             alignItems: "start",
//             marginBottom: "30px",
//             borderBottom: `3px solid ${colors.primary}`,
//             paddingBottom: "20px",
//           }}
//         >
//           {/* Col 1 - Logo */}
//           <div style={{ display: "flex", alignItems: "center" }}>
//             <img
//               src={staticLogo}
//               alt="Hexstelle Logo"
//               style={{
//                 width: "120px",
//                 height: "60px",
//                 objectFit: "contain",
//                 borderRadius: "4px",
//               }}
//             />
//           </div>

//           {/* Col 2 - Brand */}
//           <div style={{ minWidth: 0 }}>
//             <h2
//               style={{
//                 color: colors.primary,
//                 margin: "0",
//                 fontSize: "24px",
//                 fontWeight: "bold",
//                 lineHeight: "1.2",
//                 whiteSpace: "nowrap",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//               }}
//             >
//               {businessInfo.name}
//             </h2>
//             <p
//               style={{
//                 margin: "2px 0",
//                 color: colors.textLight,
//                 fontSize: "12px",
//                 fontStyle: "italic",
//               }}
//             >
//               Empowering Beauty
//             </p>
//           </div>

//           {/* Col 3 - Invoice Header */}
//           <div style={{ textAlign: "right" }}>
//             <h1
//               style={{
//                 fontSize: "32px",
//                 color: colors.primary,
//                 margin: "0 0 15px 0",
//                 fontWeight: "bold",
//                 textTransform: "uppercase",
//                 letterSpacing: "1px",
//               }}
//             >
//               INVOICE
//             </h1>

//             <div
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "1fr 1fr",
//                 gap: "8px",
//                 textAlign: "left",
//                 backgroundColor: colors.lightBg,
//                 padding: "12px",
//                 borderRadius: "6px",
//                 fontSize: "11px",
//                 border: `1px solid ${colors.border}`,
//               }}
//             >
//               <div>
//                 <strong>INVOICE NO.</strong>
//               </div>
//               <div style={{ fontWeight: "bold", color: colors.primary }}>
//                 {invoiceMeta.invoiceNo}
//               </div>

//               <div>
//                 <strong>REFERENCE</strong>
//               </div>
//               <div style={{ fontWeight: "bold", color: colors.primary }}>
//                 {invoiceMeta.reference}
//               </div>

//               <div>
//                 <strong>ISSUE DATE</strong>
//               </div>
//               <div>{invoiceMeta.issueDate}</div>

//               <div>
//                 <strong>PAYMENT METHOD</strong>
//               </div>
//               <div>Transfer</div>

//               <div>
//                 <strong>DUE DATE</strong>
//               </div>
//               <div>{invoiceMeta.dueDate}</div>

//               <div>
//                 <strong>ORDER NO.</strong>
//               </div>
//               <div>{invoiceMeta.orderNo}</div>
//             </div>
//           </div>
//         </div>

//         {/* FROM/TO Section */}
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr",
//             gap: "20px",
//             marginBottom: "25px",
//           }}
//         >
//           <div>
//             <h3
//               style={{
//                 color: colors.primary,
//                 marginBottom: "8px",
//                 fontSize: "14px",
//                 fontWeight: "bold",
//                 textTransform: "uppercase",
//               }}
//             >
//               FROM
//             </h3>
//             <div
//               style={{
//                 padding: "15px",
//                 backgroundColor: colors.lightBg,
//                 borderRadius: "6px",
//                 fontSize: "12px",
//                 border: `1px solid ${colors.border}`,
//               }}
//             >
//               <p
//                 style={{
//                   margin: "3px 0",
//                   fontWeight: "bold",
//                   color: colors.primary,
//                 }}
//               >
//                 {businessInfo.name}
//               </p>
//               <p style={{ margin: "3px 0", color: colors.text }}>{businessInfo.address}</p>
//               <p style={{ margin: "3px 0", color: colors.text }}>Nigeria</p>
//               <div
//                 style={{
//                   marginTop: "8px",
//                   paddingTop: "8px",
//                   borderTop: `1px solid ${colors.border}`,
//                 }}
//               >
//                 <p style={{ margin: "2px 0", fontSize: "11px", color: colors.textLight }}>
//                   {businessInfo.phone}
//                 </p>
//                 <p style={{ margin: "2px 0", fontSize: "11px", color: colors.textLight }}>
//                   {businessInfo.whatsapp}
//                 </p>
//                 <p style={{ margin: "2px 0", fontSize: "11px", color: colors.textLight }}>
//                   {businessInfo.email}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div>
//             <h3
//               style={{
//                 color: colors.primary,
//                 marginBottom: "8px",
//                 fontSize: "14px",
//                 fontWeight: "bold",
//                 textTransform: "uppercase",
//               }}
//             >
//               TO
//             </h3>
//             <div
//               style={{
//                 padding: "15px",
//                 backgroundColor: colors.lightBg,
//                 borderRadius: "6px",
//                 fontSize: "12px",
//                 border: `1px solid ${colors.border}`,
//               }}
//             >
//               <p
//                 style={{
//                   margin: "3px 0",
//                   fontWeight: "bold",
//                   color: colors.primary,
//                 }}
//               >
//                 {clientName ? `${clientTitle} ${clientName}` : "Client Name"}
//               </p>
//               {clientAddress && <p style={{ margin: "3px 0", color: colors.text }}>{clientAddress}</p>}
//               <p style={{ margin: "3px 0", color: colors.text }}>Nigeria</p>
//               {clientPhone && <p style={{ margin: "3px 0", color: colors.text }}>Phone: {clientPhone}</p>}
//               {clientEmail && <p style={{ margin: "3px 0", color: colors.text }}>Email: {clientEmail}</p>}
//             </div>
//           </div>
//         </div>

//         {/* Total Due Banner */}
//         <div
//           style={{
//             backgroundColor: colors.primary,
//             color: "white",
//             padding: "15px",
//             textAlign: "center",
//             marginBottom: "20px",
//             borderRadius: "6px",
//             fontSize: "16px",
//             fontWeight: "bold",
//             boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
//           }}
//         >
//           Total due: {formatNaira(calculateTotal())}
//         </div>

//         {/* Greeting */}
//         <div style={{ marginBottom: "20px", fontSize: "12px", color: colors.text }}>
//           <p style={{ fontStyle: "italic" }}>Dear {getFirstName()},</p>
//         </div>

//         {/* Items Table */}
//         <table
//           style={{
//             width: "100%",
//             borderCollapse: "collapse",
//             margin: "20px 0",
//             border: `1px solid ${colors.border}`,
//             fontSize: "12px",
//             borderRadius: "6px",
//             overflow: "hidden",
//           }}
//         >
//           <thead>
//             <tr style={{ backgroundColor: colors.primary, color: "white" }}>
//               <th style={{ padding: "12px", textAlign: "left", border: `1px solid ${colors.primary}`, fontWeight: "bold" }}>
//                 DESCRIPTION
//               </th>
//               <th style={{ padding: "12px", textAlign: "center", border: `1px solid ${colors.primary}`, fontWeight: "bold" }}>
//                 QUANTITY
//               </th>
//               <th style={{ padding: "12px", textAlign: "center", border: `1px solid ${colors.primary}`, fontWeight: "bold" }}>
//                 UNIT PRICE (₦)
//               </th>
//               <th style={{ padding: "12px", textAlign: "center", border: `1px solid ${colors.primary}`, fontWeight: "bold" }}>
//                 AMOUNT (₦)
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.map((item, index) => (
//               <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "white" : colors.lightBg }}>
//                 <td style={{ padding: "10px", border: `1px solid ${colors.border}`, verticalAlign: "top" }}>
//                   <div style={{ fontWeight: "bold", color: colors.text }}>
//                     {item.description || "Item description"}
//                   </div>
//                 </td>
//                 <td style={{ padding: "10px", textAlign: "center", border: `1px solid ${colors.border}`, color: colors.text }}>
//                   {item.quantity} {item.unit}
//                 </td>
//                 <td style={{ padding: "10px", textAlign: "center", border: `1px solid ${colors.border}`, color: colors.text }}>
//                   {formatNaira(item.price)}
//                 </td>
//                 <td style={{ padding: "10px", textAlign: "center", border: `1px solid ${colors.border}`, fontWeight: "bold", color: colors.primary }}>
//                   {formatNaira(item.quantity * item.price)}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* Totals Section */}
//         <div
//           style={{
//             textAlign: "right",
//             marginTop: "25px",
//             padding: "20px",
//             borderTop: `3px solid ${colors.primary}`,
//             fontSize: "14px",
//             backgroundColor: colors.lightBg,
//             borderRadius: "6px",
//           }}
//         >
//           <div style={{ display: "inline-block", textAlign: "left", minWidth: "250px" }}>
//             <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
//               <span style={{ fontWeight: "bold", color: colors.text }}>Subtotal:</span>
//               <span style={{ color: colors.text }}>{formatNaira(calculateSubtotal())}</span>
//             </div>
//             {taxRate > 0 && (
//               <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
//                 <span style={{ fontWeight: "bold", color: colors.text }}>Tax ({taxRate}%):</span>
//                 <span style={{ color: colors.text }}>{formatNaira(calculateTax())}</span>
//               </div>
//             )}
//             <div style={{ marginBottom: "10px", borderTop: `2px solid ${colors.border}`, paddingTop: "10px", display: "flex", justifyContent: "space-between" }}>
//               <span style={{ fontWeight: "bold", color: colors.primary, fontSize: "16px" }}>
//                 Total (NGN):
//               </span>
//               <span style={{ fontWeight: "bold", fontSize: "18px", color: colors.primary }}>
//                 {formatNaira(calculateTotal())}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Payment Information */}
//         <div
//           style={{
//             marginTop: "30px",
//             padding: "20px",
//             backgroundColor: colors.lightBg,
//             borderRadius: "6px",
//             borderLeft: `5px solid ${colors.primary}`,
//             fontSize: "12px",
//             border: `1px solid ${colors.border}`,
//           }}
//         >
//           <h4 style={{ color: colors.primary, marginBottom: "10px", fontWeight: "bold", fontSize: "14px" }}>
//             Kindly make payment to:
//           </h4>
//           <p style={{ margin: "4px 0", fontWeight: "bold", color: colors.text }}>{businessInfo.accountName}</p>
//           <p style={{ margin: "4px 0", color: colors.text }}>Bank: {businessInfo.bankName}</p>
//           <p style={{ margin: "4px 0", color: colors.text }}>Account Number: {businessInfo.accountNumber}</p>
//         </div>

//         {/* Payment Terms */}
//         <div
//           style={{
//             marginTop: "20px",
//             padding: "15px",
//             backgroundColor: colors.lightBg,
//             borderRadius: "6px",
//             borderLeft: `4px solid ${colors.warning}`,
//             fontSize: "12px",
//           }}
//         >
//           <h4 style={{ color: colors.primary, marginBottom: "8px", fontWeight: "bold", fontSize: "13px" }}>
//             Payment Terms:
//           </h4>
//           <p style={{ margin: "4px 0", color: colors.text, lineHeight: "1.4" }}>
//             An upfront fee of 50% is required before production begins. The balance will be due upon completion and prior to delivery.
//           </p>
//         </div>

//         {/* Footer */}
//         <div
//           style={{
//             textAlign: "center",
//             marginTop: "30px",
//             color: colors.textLight,
//             fontStyle: "italic",
//             paddingTop: "20px",
//             borderTop: `1px solid ${colors.border}`,
//             fontSize: "12px",
//           }}
//         >
//           <p style={{ fontWeight: "bold", fontSize: "14px", color: colors.primary }}>
//             We appreciate your Patronage!
//           </p>
//           <p style={{ margin: "5px 0", fontSize: "11px" }}>Thank you for choosing Hexstelle</p>
//         </div>
//       </div>

//       {/* Action Buttons Section */}
//       <div
//         style={{
//           marginTop: "40px",
//           padding: "30px",
//           backgroundColor: "white",
//           borderRadius: "10px",
//           boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//         }}
//       >
//         <h2
//           style={{
//             color: colors.primary,
//             marginBottom: "25px",
//             fontSize: "1.5rem",
//             textAlign: "center",
//           }}
//         >
//           Export & Send Invoice
//         </h2>

//         {/* Status message */}
//         {sendStatus && (
//           <div
//             style={{
//               padding: "15px",
//               marginBottom: "25px",
//               borderRadius: "6px",
//               backgroundColor: sendStatus.includes("successfully")
//                 ? "#d4edda"
//                 : sendStatus.includes("Failed")
//                 ? "#f8d7da"
//                 : "#fff3cd",
//               color: sendStatus.includes("successfully")
//                 ? "#155724"
//                 : sendStatus.includes("Failed")
//                 ? "#721c24"
//                 : "#856404",
//               border: `1px solid ${
//                 sendStatus.includes("successfully")
//                   ? "#c3e6cb"
//                   : sendStatus.includes("Failed")
//                   ? "#f5c6cb"
//                   : "#ffeeba"
//               }`,
//               textAlign: "center",
//             }}
//           >
//             {sendStatus}
//           </div>
//         )}

//         {/* Action Buttons */}
//         <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
//           {/* Export Button */}
//           <button
//             onClick={handleExport}
//             style={{
//               width: "100%",
//               padding: "18px",
//               backgroundColor: colors.secondary,
//               color: "white",
//               border: "none",
//               borderRadius: "8px",
//               fontSize: "16px",
//               cursor: "pointer",
//               fontWeight: "bold",
//               transition: "background-color 0.3s",
//             }}
//             onMouseOver={(e) => (e.target.style.backgroundColor = "#2980b9")}
//             onMouseOut={(e) => (e.target.style.backgroundColor = colors.secondary)}
//           >
//             Export as {exportType === "pdf" ? "PDF" : "JPEG Image"}
//           </button>

//           {/* Send Email Button */}
//           <button
//             onClick={sendInvoiceEmail}
//             disabled={isSending}
//             style={{
//               width: "100%",
//               padding: "18px",
//               backgroundColor: isSending ? colors.textLight : "#9b59b6",
//               color: "white",
//               border: "none",
//               borderRadius: "8px",
//               fontSize: "16px",
//               cursor: isSending ? "not-allowed" : "pointer",
//               fontWeight: "bold",
//               transition: "background-color 0.3s",
//             }}
//             onMouseOver={(e) => !isSending && (e.target.style.backgroundColor = "#8e44ad")}
//             onMouseOut={(e) => !isSending && (e.target.style.backgroundColor = "#9b59b6")}
//           >
//             {isSending ? "Sending Invoice..." : "Send Invoice via Email"}
//           </button>

//           {/* Individual Format Buttons */}
//           <div style={{ display: "flex", gap: "15px" }}>
//             <button
//               onClick={handleDownloadPDF}
//               disabled={isSending}
//               style={{
//                 flex: 1,
//                 padding: "15px",
//                 backgroundColor: colors.primary,
//                 color: "white",
//                 border: "none",
//                 borderRadius: "6px",
//                 fontSize: "14px",
//                 cursor: isSending ? "not-allowed" : "pointer",
//                 fontWeight: "bold",
//                 transition: "background-color 0.3s",
//               }}
//               onMouseOver={(e) => !isSending && (e.target.style.backgroundColor = "#1a252f")}
//               onMouseOut={(e) => !isSending && (e.target.style.backgroundColor = colors.primary)}
//             >
//               {isSending ? "Generating..." : "Download PDF via Backend"}
//             </button>

//             <button
//               onClick={() => generateImage("jpeg")}
//               style={{
//                 flex: 1,
//                 padding: "15px",
//                 backgroundColor: colors.warning,
//                 color: "white",
//                 border: "none",
//                 borderRadius: "6px",
//                 fontSize: "14px",
//                 cursor: "pointer",
//                 fontWeight: "bold",
//                 transition: "background-color 0.3s",
//               }}
//               onMouseOver={(e) => (e.target.style.backgroundColor = "#e67e22")}
//               onMouseOut={(e) => (e.target.style.backgroundColor = colors.warning)}
//             >
//               Download JPEG
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InvoiceForm;

import React, { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";

const InvoiceForm = () => {
  const businessInfo = {
    name: "Hexstelle",
    address: "43 Afolabi Brown Street Akoka Yaba Lagos State",
    phone: "+234 8140 892471",
    email: "hexstelle1@gmail.com",
    ownerEmail: "hexstelle1@gmail.com",
    whatsapp: "https://wa.me/c/2348140892471",
    bankName: "Carbon MFB",
    accountNumber: "1224642058",
    accountName: "Ugwunnamuchi Esther",
  };

  // Static logo (place hexstelle_logo.jpeg inside /public)
  const staticLogo = process.env.PUBLIC_URL + "/hexstelle_logo.jpeg";

  // Dynamic State
  const [clientTitle, setClientTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [items, setItems] = useState([{ description: "", quantity: 1, price: 0, unit: "pc" }]);
  const [taxRate, setTaxRate] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState("");
  const [exportType, setExportType] = useState("pdf");
  const invoiceRef = useRef(null);

  // Stable invoice meta (prevents mismatch on rerender)
  const invoiceMeta = useMemo(() => {
    const randomNum = Math.floor(Math.random() * 100000);
    const shortNum = Math.floor(Math.random() * 1000);
    const orderNo = Math.floor(Math.random() * 1000);
    const issueDate = new Date().toLocaleDateString("en-GB");
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB");
    return {
      invoiceNo: String(shortNum),
      reference: String(randomNum),
      orderNo: String(orderNo),
      issueDate,
      dueDate,
    };
  }, []);

  // Color scheme
  const colors = {
    primary: "#2c3e50",
    secondary: "#3498db",
    accent: "#e74c3c",
    success: "#27ae60",
    warning: "#f39c12",
    lightBg: "#f8f9fa",
    border: "#e0e0e0",
    text: "#333333",
    textLight: "#666666",
  };

  // Avoid splitting key blocks across pages in PDF
  const noBreak = {
    breakInside: "avoid",
    pageBreakInside: "avoid",
  };

  // Handlers
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === "quantity" || field === "price" ? Number(value) : value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { description: "", quantity: 1, price: 0, unit: "pc" }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const calculateSubtotal = () => items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const calculateTax = () => calculateSubtotal() * (taxRate / 100);
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  // Format currency with Naira sign
  const formatNaira = (amount) => {
    return `₦${Number(amount || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Get first name for greeting
  const getFirstName = () => {
    if (!clientName) return "Customer";
    return clientName.trim().split(" ")[0] || "Customer";
  };

  // Wait for all images inside invoice to load before html2canvas/html2pdf
  const waitForImages = async (rootEl) => {
    if (!rootEl) return;
    const imgs = Array.from(rootEl.querySelectorAll("img"));
    await Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.onload = res;
              img.onerror = res;
            })
      )
    );
  };

  // Convert logo to base64 (for backend email attachment if needed)
  const getLogoBase64 = async () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = staticLogo;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        try {
          const base64 = canvas.toDataURL("image/png");
          resolve(base64);
        } catch (error) {
          console.error("Error converting logo to base64:", error);
          resolve(null);
        }
      };
      img.onerror = () => {
        console.error("Error loading logo image");
        resolve(null);
      };
    });
  };

  // Generate Image (JPEG/PNG)
  const generateImage = async (format = "jpeg") => {
    try {
      const element = invoiceRef.current;
      if (!element) return null;

      await waitForImages(element);

      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 2,
        logging: false,
        backgroundColor: "#ffffff",
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imageData = canvas.toDataURL(`image/${format}`, 0.95);

      const link = document.createElement("a");
      link.download = `Hexstelle-invoice.${format}`;
      link.href = imageData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return imageData;
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Error generating image. Please try again.");
      return null;
    }
  };

  // Generate PDF (professional page breaks) using html2pdf.js
  const generatePDF = async (download = true) => {
    try {
      const element = invoiceRef.current;
      if (!element) return null;

      await waitForImages(element);

      const html2pdf = (await import("html2pdf.js")).default;

      const opt = {
        margin: [10, 10, 10, 10],
        filename: "Hexstelle-invoice.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      };

      if (download) {
        await html2pdf().set(opt).from(element).save();
        return null;
      }

      const worker = html2pdf().set(opt).from(element);
      const pdfObj = await worker.toPdf().get("pdf");
      return pdfObj.output("datauristring");
    } catch (error) {
      console.error("Error generating PDF:", error);
      if (download) await generateImage("jpeg");
      return null;
    }
  };

  // Export handler
  const handleExport = async () => {
    if (!clientName || !clientEmail) {
      setSendStatus("Please enter client name and email address");
      return;
    }

    if (exportType === "pdf") {
      await generatePDF(true);
    } else {
      await generateImage("jpeg");
    }
  };

  // Download PDF via backend endpoint
  const downloadPDFViaBackend = async (invoiceData) => {
    try {
      const response = await fetch("http://localhost:5000/api/download-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `invoice-${invoiceData.invoiceNumber.replace(" ", "-")}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        return true;
      } else {
        const errorData = await response.json();
        console.error("Backend PDF download failed:", errorData);
        return false;
      }
    } catch (error) {
      console.error("Error downloading PDF via backend:", error);
      return false;
    }
  };

  // Send invoice email
  const sendInvoiceEmail = async () => {
    if (!clientEmail || !clientName) {
      setSendStatus("Please enter client name and email address");
      return;
    }

    setIsSending(true);
    setSendStatus("Generating and sending invoice...");

    try {
      const element = invoiceRef.current;
      if (element) await waitForImages(element);

      // Generate PDF base64 (no download)
      const invoicePdf = await generatePDF(false);

      // Generate image base64
      const invoiceImage =
        element &&
        (await html2canvas(element, {
          useCORS: true,
          scale: 2,
          logging: false,
          backgroundColor: "#ffffff",
          width: element.scrollWidth,
          height: element.scrollHeight,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
        }).then((c) => c.toDataURL("image/jpeg", 0.95)));

      const logoBase64 = await getLogoBase64();

      const invoiceData = {
        clientName: clientTitle ? `${clientTitle} ${clientName}` : clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        businessInfo: { ...businessInfo, logo: logoBase64 },
        items,
        taxRate,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        invoicePdf,
        invoiceImage,
        exportType,
        invoiceNumber: `${invoiceMeta.invoiceNo} ${invoiceMeta.reference}`,
        issueDate: invoiceMeta.issueDate,
        dueDate: invoiceMeta.dueDate,
        orderNo: invoiceMeta.orderNo,
      };

      const response = await fetch("http://localhost:5000/api/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      const result = await response.json();

      if (result.success) {
        setSendStatus("Invoice sent successfully to client and business!");

        setTimeout(() => {
          if (window.confirm("Invoice sent successfully! Would you like to download the PDF version?")) {
            downloadPDFViaBackend(invoiceData);
          }
        }, 1000);
      } else {
        setSendStatus(result.message || "Failed to send invoice");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setSendStatus("Failed to connect to server. Please check if backend is running.");
    } finally {
      setIsSending(false);
    }
  };

  // Standalone PDF download via backend
  const handleDownloadPDF = async () => {
    try {
      setIsSending(true);
      setSendStatus("Generating PDF...");

      const invoicePdf = await generatePDF(false);
      const logoBase64 = await getLogoBase64();

      const invoiceData = {
        clientName: clientTitle ? `${clientTitle} ${clientName}` : clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        businessInfo: { ...businessInfo, logo: logoBase64 },
        items,
        taxRate,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        invoicePdf,
        invoiceNumber: `${invoiceMeta.invoiceNo} ${invoiceMeta.reference}`,
        issueDate: invoiceMeta.issueDate,
        dueDate: invoiceMeta.dueDate,
        orderNo: invoiceMeta.orderNo,
      };

      const success = await downloadPDFViaBackend(invoiceData);
      setSendStatus(success ? "PDF downloaded successfully!" : "Failed to download PDF");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      setSendStatus("Error downloading PDF");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif", backgroundColor: "#f5f7fa" }}>
      <h1 style={{ textAlign: "center", color: colors.primary, marginBottom: "30px", fontSize: "2.5rem", fontWeight: "300" }}>
        Hexstelle Invoice Generator
      </h1>

      {/* Export Type Selection */}
      <div style={{ marginBottom: "20px", padding: "20px", backgroundColor: "white", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "10px", color: colors.primary, fontSize: "16px" }}>
          Export Format:
        </label>
        <div style={{ display: "flex", gap: "20px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="radio" value="pdf" checked={exportType === "pdf"} onChange={(e) => setExportType(e.target.value)} style={{ cursor: "pointer" }} />
            <span style={{ color: colors.text }}>PDF Document</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="radio" value="image" checked={exportType === "image"} onChange={(e) => setExportType(e.target.value)} style={{ cursor: "pointer" }} />
            <span style={{ color: colors.text }}>JPEG Image</span>
          </label>
        </div>
      </div>

      {/* Client Information Form */}
      <div style={{ marginBottom: "20px", padding: "20px", backgroundColor: "white", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <h2 style={{ color: colors.primary, marginBottom: "20px", fontSize: "1.5rem", borderBottom: `2px solid ${colors.border}`, paddingBottom: "10px" }}>
          Client Information
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px", fontSize: "14px", color: colors.text }}>
              Client Title
            </label>
            <select
              value={clientTitle}
              onChange={(e) => setClientTitle(e.target.value)}
              style={{ width: "100%", padding: "12px", border: `1px solid ${colors.border}`, borderRadius: "6px", fontSize: "14px", transition: "border-color 0.3s", backgroundColor: "white" }}
              onFocus={(e) => (e.target.style.borderColor = colors.secondary)}
              onBlur={(e) => (e.target.style.borderColor = colors.border)}
            >
              <option value="">Select Title</option>
              <option value="Ms.">Ms.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Mr.">Mr.</option>
              <option value="Dr.">Dr.</option>
              <option value="Chief">Chief</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px", fontSize: "14px", color: colors.text }}>
              Client Name *
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Enter client name"
              style={{ width: "100%", padding: "12px", border: `1px solid ${colors.border}`, borderRadius: "6px", fontSize: "14px", transition: "border-color 0.3s" }}
              onFocus={(e) => (e.target.style.borderColor = colors.secondary)}
              onBlur={(e) => (e.target.style.borderColor = colors.border)}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px", fontSize: "14px", color: colors.text }}>
              Client Email *
            </label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="Enter client email"
              style={{ width: "100%", padding: "12px", border: `1px solid ${colors.border}`, borderRadius: "6px", fontSize: "14px", transition: "border-color 0.3s" }}
              onFocus={(e) => (e.target.style.borderColor = colors.secondary)}
              onBlur={(e) => (e.target.style.borderColor = colors.border)}
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px", fontSize: "14px", color: colors.text }}>
              Client Phone
            </label>
            <input
              type="text"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="Enter client phone"
              style={{ width: "100%", padding: "12px", border: `1px solid ${colors.border}`, borderRadius: "6px", fontSize: "14px", transition: "border-color 0.3s" }}
              onFocus={(e) => (e.target.style.borderColor = colors.secondary)}
              onBlur={(e) => (e.target.style.borderColor = colors.border)}
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px", fontSize: "14px", color: colors.text }}>
            Client Address
          </label>
          <input
            type="text"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
            placeholder="Enter client address"
            style={{ width: "100%", padding: "12px", border: `1px solid ${colors.border}`, borderRadius: "6px", fontSize: "14px", transition: "border-color 0.3s" }}
            onFocus={(e) => (e.target.style.borderColor = colors.secondary)}
            onBlur={(e) => (e.target.style.borderColor = colors.border)}
          />
        </div>
      </div>

      {/* Tax Rate Input */}
      <div style={{ marginBottom: "20px", padding: "20px", backgroundColor: "white", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "12px", color: colors.primary, fontSize: "16px" }}>
          Tax Rate (%):
        </label>
        <input
          type="number"
          value={taxRate}
          onChange={(e) => setTaxRate(Number(e.target.value))}
          min="0"
          max="100"
          step="0.1"
          style={{ width: "120px", padding: "12px", border: `1px solid ${colors.border}`, borderRadius: "6px", fontSize: "14px", transition: "border-color 0.3s" }}
          onFocus={(e) => (e.target.style.borderColor = colors.secondary)}
          onBlur={(e) => (e.target.style.borderColor = colors.border)}
        />
      </div>

      {/* Invoice Items Form */}
      <div style={{ marginBottom: "20px", padding: "20px", backgroundColor: "white", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ color: colors.primary, margin: 0, fontSize: "1.5rem" }}>Invoice Items</h2>
          <button
            onClick={addItem}
            style={{ padding: "10px 20px", backgroundColor: colors.success, color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "bold", transition: "background-color 0.3s" }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#219653")}
            onMouseOut={(e) => (e.target.style.backgroundColor = colors.success)}
          >
            + Add Item
          </button>
        </div>

        {items.map((item, index) => (
          <div
            key={index}
            style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: "12px", alignItems: "end", marginBottom: "15px", padding: "15px", backgroundColor: colors.lightBg, borderRadius: "8px", border: `1px solid ${colors.border}` }}
          >
            <div>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "6px", fontSize: "12px", color: colors.text }}>
                Description
              </label>
              <input
                type="text"
                value={item.description}
                onChange={(e) => handleItemChange(index, "description", e.target.value)}
                placeholder="Item description"
                style={{ width: "100%", padding: "10px", border: `1px solid ${colors.border}`, borderRadius: "4px", fontSize: "14px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "6px", fontSize: "12px", color: colors.text }}>
                Quantity
              </label>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                min="1"
                style={{ width: "100%", padding: "10px", border: `1px solid ${colors.border}`, borderRadius: "4px", fontSize: "14px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "6px", fontSize: "12px", color: colors.text }}>
                Unit
              </label>
              <select
                value={item.unit}
                onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                style={{ width: "100%", padding: "10px", border: `1px solid ${colors.border}`, borderRadius: "4px", fontSize: "14px" }}
              >
                <option value="pc">pc</option>
                <option value="set-piece">set</option>
                <option value="mid-piece">box</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "6px", fontSize: "12px", color: colors.text }}>
                Price (₦)
              </label>
              <input
                type="number"
                value={item.price}
                onChange={(e) => handleItemChange(index, "price", e.target.value)}
                min="0"
                step="0.01"
                style={{ width: "100%", padding: "10px", border: `1px solid ${colors.border}`, borderRadius: "4px", fontSize: "14px" }}
              />
            </div>

            <div>
              <button
                onClick={() => removeItem(index)}
                style={{ padding: "10px 12px", backgroundColor: colors.accent, color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", transition: "background-color 0.3s" }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#c0392b")}
                onMouseOut={(e) => (e.target.style.backgroundColor = colors.accent)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Printable invoice section */}
      <div
        ref={invoiceRef}
        style={{
          padding: "40px",
          backgroundColor: "white",
          border: `1px solid ${colors.border}`,
          borderRadius: "10px",
          minHeight: "297mm",
          boxSizing: "border-box",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "160px 1fr 320px",
            columnGap: "18px",
            alignItems: "start",
            marginBottom: "30px",
            borderBottom: `3px solid ${colors.primary}`,
            paddingBottom: "20px",
          }}
        >
          {/* Col 1 - Logo */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={staticLogo}
              alt="Hexstelle Logo"
              style={{
                width: "150px",
                height: "70px",
                objectFit: "contain",
                display: "block",
                borderRadius: 0,
              }}
            />
          </div>

          {/* Col 2 - Brand */}
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                color: colors.primary,
                margin: "0",
                fontSize: "24px",
                fontWeight: "bold",
                lineHeight: "1.2",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {businessInfo.name}
            </h2>
            <p style={{ margin: "2px 0", color: colors.textLight, fontSize: "12px", fontStyle: "italic" }}>
              Empowering Beauty
            </p>
          </div>

          {/* Col 3 - Invoice Header */}
          <div style={{ textAlign: "right" }}>
            <h1
              style={{
                fontSize: "32px",
                color: colors.primary,
                margin: "0 0 15px 0",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              INVOICE
            </h1>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                textAlign: "left",
                backgroundColor: colors.lightBg,
                padding: "12px",
                borderRadius: "6px",
                fontSize: "11px",
                border: `1px solid ${colors.border}`,
                ...noBreak,
              }}
            >
              <div><strong>INVOICE NO.</strong></div>
              <div style={{ fontWeight: "bold", color: colors.primary }}>{invoiceMeta.invoiceNo}</div>

              <div><strong>REFERENCE</strong></div>
              <div style={{ fontWeight: "bold", color: colors.primary }}>{invoiceMeta.reference}</div>

              <div><strong>ISSUE DATE</strong></div>
              <div>{invoiceMeta.issueDate}</div>

              <div><strong>PAYMENT METHOD</strong></div>
              <div>Transfer</div>

              <div><strong>DUE DATE</strong></div>
              <div>{invoiceMeta.dueDate}</div>

              <div><strong>ORDER NO.</strong></div>
              <div>{invoiceMeta.orderNo}</div>
            </div>
          </div>
        </div>

        {/* FROM/TO Section */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px", ...noBreak }}>
          <div>
            <h3 style={{ color: colors.primary, marginBottom: "8px", fontSize: "14px", fontWeight: "bold", textTransform: "uppercase" }}>
              FROM
            </h3>
            <div style={{ padding: "15px", backgroundColor: colors.lightBg, borderRadius: "6px", fontSize: "12px", border: `1px solid ${colors.border}` }}>
              <p style={{ margin: "3px 0", fontWeight: "bold", color: colors.primary }}>{businessInfo.name}</p>
              <p style={{ margin: "3px 0", color: colors.text }}>{businessInfo.address}</p>
              <p style={{ margin: "3px 0", color: colors.text }}>Nigeria</p>
              <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: `1px solid ${colors.border}` }}>
                <p style={{ margin: "2px 0", fontSize: "11px", color: colors.textLight }}>{businessInfo.phone}</p>
                <p style={{ margin: "2px 0", fontSize: "11px", color: colors.textLight }}>{businessInfo.whatsapp}</p>
                <p style={{ margin: "2px 0", fontSize: "11px", color: colors.textLight }}>{businessInfo.email}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ color: colors.primary, marginBottom: "8px", fontSize: "14px", fontWeight: "bold", textTransform: "uppercase" }}>
              TO
            </h3>
            <div style={{ padding: "15px", backgroundColor: colors.lightBg, borderRadius: "6px", fontSize: "12px", border: `1px solid ${colors.border}` }}>
              <p style={{ margin: "3px 0", fontWeight: "bold", color: colors.primary }}>
                {clientName ? `${clientTitle} ${clientName}`.trim() : "Client Name"}
              </p>
              {clientAddress ? <p style={{ margin: "3px 0", color: colors.text }}>{clientAddress}</p> : null}
              <p style={{ margin: "3px 0", color: colors.text }}>Nigeria</p>
              {clientPhone ? <p style={{ margin: "3px 0", color: colors.text }}>Phone: {clientPhone}</p> : null}
              {clientEmail ? <p style={{ margin: "3px 0", color: colors.text }}>Email: {clientEmail}</p> : null}
            </div>
          </div>
        </div>

        {/* Total Due Banner */}
        <div
          style={{
            backgroundColor: colors.primary,
            color: "white",
            padding: "15px",
            textAlign: "center",
            marginBottom: "20px",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: "bold",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            ...noBreak,
          }}
        >
          Total due: {formatNaira(calculateTotal())}
        </div>

        {/* Greeting */}
        <div style={{ marginBottom: "20px", fontSize: "12px", color: colors.text }}>
          <p style={{ fontStyle: "italic" }}>Dear {getFirstName()},</p>
        </div>

        {/* Items Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", margin: "20px 0", border: `1px solid ${colors.border}`, fontSize: "12px", borderRadius: "6px", overflow: "hidden" }}>
          <thead>
            <tr style={{ backgroundColor: colors.primary, color: "white" }}>
              <th style={{ padding: "12px", textAlign: "left", border: `1px solid ${colors.primary}`, fontWeight: "bold" }}>DESCRIPTION</th>
              <th style={{ padding: "12px", textAlign: "center", border: `1px solid ${colors.primary}`, fontWeight: "bold" }}>QUANTITY</th>
              <th style={{ padding: "12px", textAlign: "center", border: `1px solid ${colors.primary}`, fontWeight: "bold" }}>UNIT PRICE (₦)</th>
              <th style={{ padding: "12px", textAlign: "center", border: `1px solid ${colors.primary}`, fontWeight: "bold" }}>AMOUNT (₦)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "white" : colors.lightBg }}>
                <td style={{ padding: "10px", border: `1px solid ${colors.border}`, verticalAlign: "top" }}>
                  <div style={{ fontWeight: "bold", color: colors.text }}>{item.description || "Item description"}</div>
                </td>
                <td style={{ padding: "10px", textAlign: "center", border: `1px solid ${colors.border}`, color: colors.text }}>
                  {item.quantity} {item.unit}
                </td>
                <td style={{ padding: "10px", textAlign: "center", border: `1px solid ${colors.border}`, color: colors.text }}>
                  {formatNaira(item.price)}
                </td>
                <td style={{ padding: "10px", textAlign: "center", border: `1px solid ${colors.border}`, fontWeight: "bold", color: colors.primary }}>
                  {formatNaira(item.quantity * item.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div
          style={{
            textAlign: "right",
            marginTop: "25px",
            padding: "20px",
            borderTop: `3px solid ${colors.primary}`,
            fontSize: "14px",
            backgroundColor: colors.lightBg,
            borderRadius: "6px",
            ...noBreak,
          }}
        >
          <div style={{ display: "inline-block", textAlign: "left", minWidth: "250px" }}>
            <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: "bold", color: colors.text }}>Subtotal:</span>
              <span style={{ color: colors.text }}>{formatNaira(calculateSubtotal())}</span>
            </div>
            {taxRate > 0 && (
              <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "bold", color: colors.text }}>Tax ({taxRate}%):</span>
                <span style={{ color: colors.text }}>{formatNaira(calculateTax())}</span>
              </div>
            )}
            <div style={{ marginBottom: "10px", borderTop: `2px solid ${colors.border}`, paddingTop: "10px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: "bold", color: colors.primary, fontSize: "16px" }}>Total (NGN):</span>
              <span style={{ fontWeight: "bold", fontSize: "18px", color: colors.primary }}>{formatNaira(calculateTotal())}</span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            backgroundColor: colors.lightBg,
            borderRadius: "6px",
            borderLeft: `5px solid ${colors.primary}`,
            fontSize: "12px",
            border: `1px solid ${colors.border}`,
            ...noBreak,
          }}
        >
          <h4 style={{ color: colors.primary, marginBottom: "10px", fontWeight: "bold", fontSize: "14px" }}>Kindly make payment to:</h4>
          <p style={{ margin: "4px 0", fontWeight: "bold", color: colors.text }}>{businessInfo.accountName}</p>
          <p style={{ margin: "4px 0", color: colors.text }}>Bank: {businessInfo.bankName}</p>
          <p style={{ margin: "4px 0", color: colors.text }}>Account Number: {businessInfo.accountNumber}</p>
        </div>

        {/* Payment Terms */}
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: colors.lightBg,
            borderRadius: "6px",
            borderLeft: `4px solid ${colors.warning}`,
            fontSize: "12px",
            ...noBreak,
          }}
        >
          <h4 style={{ color: colors.primary, marginBottom: "8px", fontWeight: "bold", fontSize: "13px" }}>Payment Terms:</h4>
          <p style={{ margin: "4px 0", color: colors.text, lineHeight: "1.4" }}>
            An upfront fee of 50% is required before production begins. The balance will be due upon completion and prior to delivery.
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
            color: colors.textLight,
            fontStyle: "italic",
            paddingTop: "20px",
            borderTop: `1px solid ${colors.border}`,
            fontSize: "12px",
            ...noBreak,
          }}
        >
          <p style={{ fontWeight: "bold", fontSize: "14px", color: colors.primary }}>We appreciate your Patronage!</p>
          <p style={{ margin: "5px 0", fontSize: "11px" }}>Thank you for choosing Hexstelle</p>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div style={{ marginTop: "40px", padding: "30px", backgroundColor: "white", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <h2 style={{ color: colors.primary, marginBottom: "25px", fontSize: "1.5rem", textAlign: "center" }}>Export & Send Invoice</h2>

        {sendStatus && (
          <div
            style={{
              padding: "15px",
              marginBottom: "25px",
              borderRadius: "6px",
              backgroundColor: sendStatus.includes("successfully") ? "#d4edda" : sendStatus.includes("Failed") ? "#f8d7da" : "#fff3cd",
              color: sendStatus.includes("successfully") ? "#155724" : sendStatus.includes("Failed") ? "#721c24" : "#856404",
              border: `1px solid ${sendStatus.includes("successfully") ? "#c3e6cb" : sendStatus.includes("Failed") ? "#f5c6cb" : "#ffeeba"}`,
              textAlign: "center",
            }}
          >
            {sendStatus}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <button
            onClick={handleExport}
            style={{ width: "100%", padding: "18px", backgroundColor: colors.secondary, color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", fontWeight: "bold", transition: "background-color 0.3s" }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#2980b9")}
            onMouseOut={(e) => (e.target.style.backgroundColor = colors.secondary)}
          >
            Export as {exportType === "pdf" ? "PDF" : "JPEG Image"}
          </button>

          <button
            onClick={sendInvoiceEmail}
            disabled={isSending}
            style={{ width: "100%", padding: "18px", backgroundColor: isSending ? colors.textLight : "#9b59b6", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: isSending ? "not-allowed" : "pointer", fontWeight: "bold", transition: "background-color 0.3s" }}
            onMouseOver={(e) => !isSending && (e.target.style.backgroundColor = "#8e44ad")}
            onMouseOut={(e) => !isSending && (e.target.style.backgroundColor = "#9b59b6")}
          >
            {isSending ? "Sending Invoice..." : "Send Invoice via Email"}
          </button>

          <div style={{ display: "flex", gap: "15px" }}>
            <button
              onClick={handleDownloadPDF}
              disabled={isSending}
              style={{ flex: 1, padding: "15px", backgroundColor: colors.primary, color: "white", border: "none", borderRadius: "6px", fontSize: "14px", cursor: isSending ? "not-allowed" : "pointer", fontWeight: "bold", transition: "background-color 0.3s" }}
              onMouseOver={(e) => !isSending && (e.target.style.backgroundColor = "#1a252f")}
              onMouseOut={(e) => !isSending && (e.target.style.backgroundColor = colors.primary)}
            >
              {isSending ? "Generating..." : "Download PDF via Backend"}
            </button>

            <button
              onClick={() => generateImage("jpeg")}
              style={{ flex: 1, padding: "15px", backgroundColor: colors.warning, color: "white", border: "none", borderRadius: "6px", fontSize: "14px", cursor: "pointer", fontWeight: "bold", transition: "background-color 0.3s" }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#e67e22")}
              onMouseOut={(e) => (e.target.style.backgroundColor = colors.warning)}
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
