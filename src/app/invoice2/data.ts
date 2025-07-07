
export type InvoiceDetails = {
  seller: {
    name: string;
    logoUrl: string;
    address: string[];
    contact: string;
    email: string;
    gstin: string;
    pan: string;
    cin: string;
    qrCodeUrl: string;
  };
  billTo: {
    name: string;
    address: string[];
    state: string;
    pincode: string;
    gstin: string;
    mobile: string;
  };
  shipTo: {
    name:string;
    address: string[];
    state: string;
    pincode: string;
    gstin: string;
    mobile: string;
  };
  invoiceMeta: {
    invNo: string;
    invDate: string;
    orderNo: string;
    orderDate: string;
    lrNo: string;
    lrDate: string;
    delNo: string;
    delDate: string;
    ewayBillNo: string;
    ewayDate: string;
    docNo: string;
    dispThrough: string;
    destination: string;
    vehicleNo: string;
    paymentTerms: string;
    termsDelivery: string;
  };
  irnDetails: {
    irn: string;
    ackNo: string;
    ackDate: string;
  };
  items: {
    srNo: number;
    description: string;
    subLines: string[];
    hsn: string;
    mrp?: number;
    quantity: number;
    unit: string;
    rate: number;
    per: string;
    discount?: number;
    amount: number;
  }[];
  summary: {
    transportCharges: number;
    igst: number;
    roundingOff: number;
    totalQty: number;
    totalAmount: number;
  };
  footer: {
    amountInWords: string;
    companyBankDetails: {
        holderName: string;
        bankName: string;
        acNo: string;
        ifsCode: string;
        branch: string;
    }[];
    termsAndConditions: string[];
    declaration: string;
    signature: {
        for: string;
        stampUrl: string;
        designation: string;
    };
    jurisdiction: string;
  };
};

export const invoiceData: InvoiceDetails = {
    seller: {
        name: "Ganesh Traders",
        logoUrl: "https://placehold.co/100x100.png",
        address: [
            "#27, 80 Ft Road, Industrial Area,",
            "Koramangala 6th Block, Bangalore",
            "State Name: West Bengal | 560068"
        ],
        contact: "9929229828",
        email: "ganesh.traders@gmail.com",
        gstin: "29AADCB2230M1ZP",
        pan: "ALRTD3355D",
        cin: "U72200DL2011FTC227638",
        qrCodeUrl: "https://placehold.co/80x80.png"
    },
    billTo: {
        name: "Alfa Provisions India Pvt. Ltd.",
        address: ["6,14, Mayurbhanj Rd", "Orient Row", "Kolkata"],
        state: "West Bengal, 19",
        pincode: "700001",
        gstin: "9AABCI2726B1ZZ",
        mobile: "8563425876",
    },
    shipTo: {
        name: "Alfa Provisions India Pvt. Ltd.",
        address: ["6,14, Mayurbhanj Rd", "Orient Row", "Kolkata"],
        state: "West Bengal, 19",
        pincode: "700001",
        gstin: "9AABCI2726B1ZZ",
        mobile: "8563425876",
    },
    invoiceMeta: {
        invNo: "GT/INV/1005",
        invDate: "1-Dec-24",
        orderNo: "ORD-101",
        orderDate: "1-Dec-24",
        lrNo: "LR:1",
        lrDate: "1-Dec-24",
        delNo: "DL-101",
        delDate: "1-Dec-24",
        ewayBillNo: "",
        ewayDate: "",
        docNo: "Doc:1",
        dispThrough: "Disp:1",
        destination: "Dest:1",
        vehicleNo: "MH-04-HL-4432",
        paymentTerms: "30 Days",
        termsDelivery: "Terms of Delivery 1, Terms of Delivery 2, ..",
    },
    irnDetails: {
        irn: "f664191addb82f6d5781f1e5c865049b16457ed42e12eda84632a1736e7be0a8",
        ackNo: "690338861139",
        ackDate: "1-Dec-24",
    },
    items: [
        { srNo: 1, description: "50-50 Biscuits", subLines: ["Batch No: B-101 | Mfg Dt:1-Dec-24 | 31-Dec-25", "Batch No: B-102 | Mfg Dt:1-Dec-24 | 31-Dec-26"], hsn: "1905", quantity: 175, unit: "Pcs", rate: 25.00, per: "Pcs", discount: 3, amount: 4243.75 },
        { srNo: 2, description: "Ambika Appalam", subLines: ["This is Test Description Line 1", "This is Test Description Line 2"], hsn: "1905", quantity: 50, unit: "Pcs", rate: 60.00, per: "Pcs", discount: 2.50, amount: 2925.00 },
        { srNo: 3, description: "Aquafina 1 Litre", subLines: [], hsn: "2201", mrp: 20.00, quantity: 100, unit: "Pcs", rate: 20.00, per: "Pcs", amount: 2000.00 },
        { srNo: 4, description: "Atish Papad", subLines: [], hsn: "1905", mrp: 75.00, quantity: 100, unit: "Pcs", rate: 40.00, per: "Pcs", amount: 4000.00 },
        { srNo: 5, description: "Bagrry Corn Flakes", subLines: [], hsn: "1904", quantity: 150, unit: "Pcs", rate: 130.00, per: "Pcs", amount: 19500.00 },
        { srNo: 6, description: "Bisleri 1 litre", subLines: [], hsn: "2201", mrp: 20.00, quantity: 5, unit: "Pcs", rate: 120.00, per: "Pcs", amount: 600.00 },
        { srNo: 7, description: "Close Up 150g", subLines: [], hsn: "33061020", quantity: 10, unit: "Pcs", rate: 60.00, per: "Pcs", amount: 600.00 },
        { srNo: 8, description: "Coca Cola 300ml Tin", subLines: [], hsn: "220210", quantity: 50, unit: "Pcs", rate: 20.00, per: "Pcs", amount: 1000.00 },
        { srNo: 9, description: "Colgate Tooth Powder 200g", subLines: [], hsn: "33061010", quantity: 50, unit: "Pcs", rate: 50.00, per: "Pcs", amount: 2500.00 },
        { srNo: 10, description: "Garnier Shampoo", subLines: [], hsn: "3305", quantity: 45, unit: "Pcs", rate: 150.00, per: "Pcs", amount: 6750.00 },
        { srNo: 11, description: "Bourbon Biscuits", subLines: ["Batch No: B-7786 | Mfg Dt:1-Dec-24 | 5 Years"], hsn: "1905", quantity: 15, unit: "Pcs", rate: 100.00, per: "Pcs", amount: 1500.00 },
        { srNo: 12, description: "Dabur Lal 150g", subLines: [], hsn: "33061010", quantity: 100, unit: "Pcs", rate: 15.00, per: "Pcs", amount: 1500.00 },
        { srNo: 13, description: "Dabur Red 100g", subLines: [], hsn: "33061020", quantity: 100, unit: "Pcs", rate: 10.00, per: "Pcs", amount: 1000.00 },
        { srNo: 14, description: "Del Monte Pasta 500g", subLines: [], hsn: "1902", quantity: 10, unit: "Pcs", rate: 150.00, per: "Pcs", amount: 1500.00 },
        { srNo: 15, description: "Diwali Chocholate Pack", subLines: [], hsn: "1902", quantity: 50, unit: "Pcs", rate: 250.00, per: "Pcs", amount: 12500.00 },
        { srNo: 16, description: "Dutch Masters Cigars", subLines: [], hsn: "2402", quantity: 10, unit: "Pcs", rate: 3500.00, per: "Pcs", discount: 2, amount: 34300.00 },
        { srNo: 17, description: "Dyson Supersonic Hair Dryer", subLines: [], hsn: "8516", quantity: 25, unit: "Pcs", rate: 1250.00, per: "Pcs", discount: 2, amount: 30625.00 }
    ],
    summary: {
        transportCharges: 100.00,
        igst: 23413.28,
        roundingOff: -0.03,
        totalQty: 1045,
        totalAmount: 150557.00
    },
    footer: {
        amountInWords: "INR One Lakh Fifty Thousand Five Hundred Fifty Seven",
        companyBankDetails: [
            { holderName: "Ganesh Traders", bankName: "State Bank of India", acNo: "100002342335666", ifsCode: "SBIN8855334", branch: "Mumbai" },
            { holderName: "Ganesh Traders", bankName: "State Bank of India", acNo: "100002342335666", ifsCode: "SBIN8855334", branch: "Mumbai" }
        ],
        termsAndConditions: [
            "Lorem Ipsum is simply dummy text of the printing and typesetting",
            "Lorem Ipsum is simply dummy text of the printing and typesetting",
            "Lorem Ipsum is simply dummy text of the",
            "Lorem Ipsum is simply dummy text of the",
            "Lorem Ipsum is simply dummy text of the"
        ],
        declaration: "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
        signature: {
            for: "Ganesh Traders",
            stampUrl: "https://placehold.co/100x50.png",
            designation: "Authorised Signatory"
        },
        jurisdiction: "SUBJECT TO MUMBAI JURISDICTION",
    }
};
