




const defaultPersmissionsList = [
  {
    name: "Human resources",
    access: false,
    menu: [
      {
        name: "Shift",
        displayName: "All Shift",
        access: false,
        subMenus: {
          create: { id: 1, access: false, api: "/demo/path" },
          view: { id: 2, access: false, api: "/demo/path" },
          update: { id: 3, access: false, api: "/demo/path" },
          softDelete: { id: 4, access: false, api: "/demo/path" },
          activeActive: { id: 5, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Change Shift",
        displayName: "All Change Shift",
        access: false,
        subMenus: {
          create: { id: 6, access: false, api: "/demo/path" },
          view: { id: 7, access: false, api: "/demo/path" },
          update: { id: 8, access: false, api: "/demo/path" },
          softDelete: { id: 9, access: false, api: "/demo/path" },
          activeActive: { id: 10, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Shift Change Request",
        displayName: "All Shift Change Request",
        access: false,
        subMenus: {
          create: { id: 11, access: false, api: "/demo/path" },
          view: { id: 12, access: false, api: "/demo/path" },
          update: { id: 13, access: false, api: "/demo/path" },
          softDelete: { id: 14, access: false, api: "/demo/path" },
          activeActive: { id: 15, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Department",
        displayName: "All Department",
        access: false,
        subMenus: {
          create: { id: 16, access: false, api: "/demo/path" },
          view: { id: 17, access: false, api: "/demo/path" },
          update: { id: 18, access: false, api: "/demo/path" },
          softDelete: { id: 19, access: false, api: "/demo/path" },
          activeActive: { id: 20, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Documents",
        displayName: "All Documents",
        access: false,
        subMenus: {
          create: { id: 21, access: false, api: "/demo/path" },
          view: { id: 22, access: false, api: "/demo/path" },
          update: { id: 23, access: false, api: "/demo/path" },
          softDelete: { id: 24, access: false, api: "/demo/path" },
          activeActive: { id: 25, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Assets & Tools",
        displayName: "All Assets & Tools",
        access: false,
        subMenus: {
          create: { id: 26, access: false, api: "/demo/path" },
          view: { id: 27, access: false, api: "/demo/path" },
          update: { id: 28, access: false, api: "/demo/path" },
          softDelete: { id: 29, access: false, api: "/demo/path" },
          activeActive: { id: 30, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Leave Category",
        displayName: "All Leave Category",
        access: false,
        subMenus: {
          create: { id: 31, access: false, api: "/demo/path" },
          view: { id: 32, access: false, api: "/demo/path" },
          update: { id: 33, access: false, api: "/demo/path" },
          softDelete: { id: 34, access: false, api: "/demo/path" },
          activeActive: { id: 35, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Leave Allotment",
        displayName: "All Leave Allotment",
        access: false,
        subMenus: {
          create: { id: 36, access: false, api: "/demo/path" },
          view: { id: 37, access: false, api: "/demo/path" },
          update: { id: 38, access: false, api: "/demo/path" },
          softDelete: { id: 39, access: false, api: "/demo/path" },
          activeActive: { id: 40, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Holiday",
        displayName: "All Holiday",
        access: false,
        subMenus: {
          create: { id: 41, access: false, api: "/demo/path" },
          view: { id: 42, access: false, api: "/demo/path" },
          update: { id: 43, access: false, api: "/demo/path" },
          softDelete: { id: 44, access: false, api: "/demo/path" },
          activeActive: { id: 45, access: false, api: "/demo/path" }
        }
      }
    ]
  },
  {
    name: "Administration",
    access: false,
    menu: [
      {
        name: "Roles & Permissions",
        displayName: "All Roles & Permissions",
        access: false,
        subMenus: {
          create: { id: 46, access: false, api: "/demo/path" },
          view: { id: 47, access: false, api: "/demo/path" },
          update: { id: 48, access: false, api: "/demo/path" },
          softDelete: { id: 49, access: false, api: "/demo/path" },
          activeActive: { id: 50, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Employee",
        displayName: "All Employee",
        access: false,
        subMenus: {
          create: { id: 51, access: false, api: "/demo/path" },
          view: { id: 52, access: false, api: "/demo/path" },
          update: { id: 53, access: false, api: "/demo/path" },
          softDelete: { id: 54, access: false, api: "/demo/path" },
          activeActive: { id: 55, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Customer",
        displayName: "All Customer",
        access: false,
        subMenus: {
          create: { id: 56, access: false, api: "/demo/path" },
          view: { id: 57, access: false, api: "/demo/path" },
          update: { id: 58, access: false, api: "/demo/path" },
          softDelete: { id: 59, access: false, api: "/demo/path" },
          activeActive: { id: 60, access: false, api: "/demo/path" }
        }
      },
      {
        name: "BusinessUnit",
        displayName: "All BusinessUnit",
        access: false,
        subMenus: {
          create: { id: 61, access: false, api: "/demo/path" },
          view: { id: 62, access: false, api: "/demo/path" },
          update: { id: 63, access: false, api: "/demo/path" },
          softDelete: { id: 64, access: false, api: "/demo/path" },
          activeActive: { id: 65, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Branch",
        displayName: "All Branch",
        access: false,
        subMenus: {
          create: { id: 66, access: false, api: "/demo/path" },
          view: { id: 67, access: false, api: "/demo/path" },
          update: { id: 68, access: false, api: "/demo/path" },
          softDelete: { id: 69, access: false, api: "/demo/path" },
          activeActive: { id: 70, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Warehouse",
        displayName: "All Warehouse",
        access: false,
        subMenus: {
          create: { id: 71, access: false, api: "/demo/path" },
          view: { id: 72, access: false, api: "/demo/path" },
          update: { id: 73, access: false, api: "/demo/path" },
          softDelete: { id: 74, access: false, api: "/demo/path" },
          activeActive: { id: 75, access: false, api: "/demo/path" }
        }
      }
    ]
  },
  {
    name: "Product",
    access: false,
    menu: [
      {
        name: "SubCategory",
        displayName: "All SubCategory",
        access: false,
        subMenus: {
          create: { id: 76, access: false, api: "/demo/path" },
          view: { id: 77, access: false, api: "/demo/path" },
          update: { id: 78, access: false, api: "/demo/path" },
          softDelete: { id: 79, access: false, api: "/demo/path" },
          activeActive: { id: 80, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Brand",
        displayName: "All Brand",
        access: false,
        subMenus: {
          create: { id: 81, access: false, api: "/demo/path" },
          view: { id: 82, access: false, api: "/demo/path" },
          update: { id: 83, access: false, api: "/demo/path" },
          softDelete: { id: 84, access: false, api: "/demo/path" },
          activeActive: { id: 85, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Manufacturer",
        displayName: "All Manufacturer",
        access: false,
        subMenus: {
          create: { id: 86, access: false, api: "/demo/path" },
          view: { id: 87, access: false, api: "/demo/path" },
          update: { id: 88, access: false, api: "/demo/path" },
          softDelete: { id: 89, access: false, api: "/demo/path" },
          activeActive: { id: 90, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Product",
        displayName: "All Product",
        access: false,
        subMenus: {
          create: { id: 91, access: false, api: "/demo/path" },
          view: { id: 92, access: false, api: "/demo/path" },
          update: { id: 93, access: false, api: "/demo/path" },
          softDelete: { id: 94, access: false, api: "/demo/path" },
          activeActive: { id: 95, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Product QA",
        displayName: "All Product QA",
        access: false,
        subMenus: {
          create: { id: 96, access: false, api: "/demo/path" },
          view: { id: 97, access: false, api: "/demo/path" },
          update: { id: 98, access: false, api: "/demo/path" },
          softDelete: { id: 99, access: false, api: "/demo/path" },
          activeActive: { id: 100, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Product QA Out",
        displayName: "All Product QA Out",
        access: false,
        subMenus: {
          create: { id: 101, access: false, api: "/demo/path" },
          view: { id: 102, access: false, api: "/demo/path" },
          update: { id: 103, access: false, api: "/demo/path" },
          softDelete: { id: 104, access: false, api: "/demo/path" },
          activeActive: { id: 105, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Attribute",
        displayName: "All Attribute",
        access: false,
        subMenus: {
          create: { id: 106, access: false, api: "/demo/path" },
          view: { id: 107, access: false, api: "/demo/path" },
          update: { id: 108, access: false, api: "/demo/path" },
          softDelete: { id: 109, access: false, api: "/demo/path" },
          activeActive: { id: 110, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Variant",
        displayName: "All Variant",
        access: false,
        subMenus: {
          create: { id: 111, access: false, api: "/demo/path" },
          view: { id: 112, access: false, api: "/demo/path" },
          update: { id: 113, access: false, api: "/demo/path" },
          softDelete: { id: 114, access: false, api: "/demo/path" },
          activeActive: { id: 115, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Pricing",
        displayName: "All Pricing",
        access: false,
        subMenus: {
          create: { id: 116, access: false, api: "/demo/path" },
          view: { id: 117, access: false, api: "/demo/path" },
          update: { id: 118, access: false, api: "/demo/path" },
          softDelete: { id: 119, access: false, api: "/demo/path" },
          activeActive: { id: 120, access: false, api: "/demo/path" }
        }
      }
    ]
  },
  {
    name: "Inventory",
    access: false,
    menu: [
      {
        name: "Transport",
        displayName: "All Transport",
        access: false,
        subMenus: {
          create: { id: 121, access: false, api: "/demo/path" },
          view: { id: 122, access: false, api: "/demo/path" },
          update: { id: 123, access: false, api: "/demo/path" },
          softDelete: { id: 124, access: false, api: "/demo/path" },
          activeActive: { id: 125, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Stock",
        displayName: "All Stock",
        access: false,
        subMenus: {
          create: { id: 126, access: false, api: "/demo/path" },
          view: { id: 127, access: false, api: "/demo/path" },
          update: { id: 128, access: false, api: "/demo/path" },
          softDelete: { id: 129, access: false, api: "/demo/path" },
          activeActive: { id: 130, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Order",
        displayName: "All Order",
        access: false,
        subMenus: {
          create: { id: 131, access: false, api: "/demo/path" },
          view: { id: 132, access: false, api: "/demo/path" },
          update: { id: 133, access: false, api: "/demo/path" },
          softDelete: { id: 134, access: false, api: "/demo/path" },
          activeActive: { id: 135, access: false, api: "/demo/path" }
        }
      }
    ]
  },
  {
    name: "Accounting Master",
    access: false,
    menu: [
      {
        name: "Financial Year",
        displayName: "All Financial Year",
        access: false,
        subMenus: {
          create: { id: 136, access: false, api: "/demo/path" },
          view: { id: 137, access: false, api: "/demo/path" },
          update: { id: 138, access: false, api: "/demo/path" },
          softDelete: { id: 139, access: false, api: "/demo/path" },
          activeActive: { id: 140, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Currency",
        displayName: "All Currency",
        access: false,
        subMenus: {
          create: { id: 141, access: false, api: "/demo/path" },
          view: { id: 142, access: false, api: "/demo/path" },
          update: { id: 143, access: false, api: "/demo/path" },
          softDelete: { id: 144, access: false, api: "/demo/path" },
          activeActive: { id: 145, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Ledger",
        displayName: "All Ledger",
        access: false,
        subMenus: {
          create: { id: 146, access: false, api: "/demo/path" },
          view: { id: 147, access: false, api: "/demo/path" },
          update: { id: 148, access: false, api: "/demo/path" },
          softDelete: { id: 149, access: false, api: "/demo/path" },
          activeActive: { id: 150, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Group",
        displayName: "All Group",
        access: false,
        subMenus: {
          create: { id: 151, access: false, api: "/demo/path" },
          view: { id: 152, access: false, api: "/demo/path" },
          update: { id: 153, access: false, api: "/demo/path" },
          softDelete: { id: 154, access: false, api: "/demo/path" },
          activeActive: { id: 155, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Voucher Group",
        displayName: "All Voucher Group",
        access: false,
        subMenus: {
          create: { id: 156, access: false, api: "/demo/path" },
          view: { id: 157, access: false, api: "/demo/path" },
          update: { id: 158, access: false, api: "/demo/path" },
          softDelete: { id: 159, access: false, api: "/demo/path" },
          activeActive: { id: 160, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Voucher",
        displayName: "All Voucher",
        access: false,
        subMenus: {
          create: { id: 161, access: false, api: "/demo/path" },
          view: { id: 162, access: false, api: "/demo/path" },
          update: { id: 163, access: false, api: "/demo/path" },
          softDelete: { id: 164, access: false, api: "/demo/path" },
          activeActive: { id: 165, access: false, api: "/demo/path" }
        }
      }
    ]
  },
  {
    name: "Purchases",
    access: false,
    menu: [
      {
        name: "Supplier",
        displayName: "All Supplier",
        access: false,
        subMenus: {
          create: { id: 166, access: false, api: "/demo/path" },
          view: { id: 167, access: false, api: "/demo/path" },
          update: { id: 168, access: false, api: "/demo/path" },
          softDelete: { id: 169, access: false, api: "/demo/path" },
          activeActive: { id: 170, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Purchase Invoices",
        displayName: "All Purchase Invoices",
        access: false,
        subMenus: {
          create: { id: 171, access: false, api: "/demo/path" },
          view: { id: 172, access: false, api: "/demo/path" },
          update: { id: 173, access: false, api: "/demo/path" },
          softDelete: { id: 174, access: false, api: "/demo/path" },
          activeActive: { id: 175, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Payment Out",
        displayName: "All Payment Out",
        access: false,
        subMenus: {
          create: { id: 176, access: false, api: "/demo/path" },
          view: { id: 177, access: false, api: "/demo/path" },
          update: { id: 178, access: false, api: "/demo/path" },
          softDelete: { id: 179, access: false, api: "/demo/path" },
          activeActive: { id: 180, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Purchase Returns",
        displayName: "All Purchase Returns",
        access: false,
        subMenus: {
          create: { id: 181, access: false, api: "/demo/path" },
          view: { id: 182, access: false, api: "/demo/path" },
          update: { id: 183, access: false, api: "/demo/path" },
          softDelete: { id: 184, access: false, api: "/demo/path" },
          activeActive: { id: 185, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Debit Note",
        displayName: "All Debit Note",
        access: false,
        subMenus: {
          create: { id: 186, access: false, api: "/demo/path" },
          view: { id: 187, access: false, api: "/demo/path" },
          update: { id: 188, access: false, api: "/demo/path" },
          softDelete: { id: 189, access: false, api: "/demo/path" },
          activeActive: { id: 190, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Purchase Order",
        displayName: "All Purchase Order",
        access: false,
        subMenus: {
          create: { id: 191, access: false, api: "/demo/path" },
          view: { id: 192, access: false, api: "/demo/path" },
          update: { id: 193, access: false, api: "/demo/path" },
          softDelete: { id: 194, access: false, api: "/demo/path" },
          activeActive: { id: 195, access: false, api: "/demo/path" }
        }
      }
    ]
  },
  {
    name: "Sales",
    access: false,
    menu: [
      {
        name: "Sales Invoices",
        displayName: "All Sales Invoices",
        access: false,
        subMenus: {
          create: { id: 196, access: false, api: "/demo/path" },
          view: { id: 197, access: false, api: "/demo/path" },
          update: { id: 198, access: false, api: "/demo/path" },
          softDelete: { id: 199, access: false, api: "/demo/path" },
          activeActive: { id: 200, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Quotation",
        displayName: "All Quotation",
        access: false,
        subMenus: {
          create: { id: 201, access: false, api: "/demo/path" },
          view: { id: 202, access: false, api: "/demo/path" },
          update: { id: 203, access: false, api: "/demo/path" },
          softDelete: { id: 204, access: false, api: "/demo/path" },
          activeActive: { id: 205, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Payment In",
        displayName: "All Payment In",
        access: false,
        subMenus: {
          create: { id: 206, access: false, api: "/demo/path" },
          view: { id: 207, access: false, api: "/demo/path" },
          update: { id: 208, access: false, api: "/demo/path" },
          softDelete: { id: 209, access: false, api: "/demo/path" },
          activeActive: { id: 210, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Sales Returns",
        displayName: "All Sales Returns",
        access: false,
        subMenus: {
          create: { id: 211, access: false, api: "/demo/path" },
          view: { id: 212, access: false, api: "/demo/path" },
          update: { id: 213, access: false, api: "/demo/path" },
          softDelete: { id: 214, access: false, api: "/demo/path" },
          activeActive: { id: 215, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Credit Note",
        displayName: "All Credit Note",
        access: false,
        subMenus: {
          create: { id: 216, access: false, api: "/demo/path" },
          view: { id: 217, access: false, api: "/demo/path" },
          update: { id: 218, access: false, api: "/demo/path" },
          softDelete: { id: 219, access: false, api: "/demo/path" },
          activeActive: { id: 220, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Performa Invoice",
        displayName: "All Performa Invoice",
        access: false,
        subMenus: {
          create: { id: 221, access: false, api: "/demo/path" },
          view: { id: 222, access: false, api: "/demo/path" },
          update: { id: 223, access: false, api: "/demo/path" },
          softDelete: { id: 224, access: false, api: "/demo/path" },
          activeActive: { id: 225, access: false, api: "/demo/path" }
        }
      },
      {
        name: "Delivery Challan",
        displayName: "All Delivery Challan",
        access: false,
        subMenus: {
          create: { id: 226, access: false, api: "/demo/path" },
          view: { id: 227, access: false, api: "/demo/path" },
          update: { id: 228, access: false, api: "/demo/path" },
          softDelete: { id: 229, access: false, api: "/demo/path" },
          activeActive: { id: 230, access: false, api: "/demo/path" }
        }
      }
    ]
  }
];
// vendor Permission list
const vendorPersmissionsList = [
  {
    name: "Human resources",
    access: true,
    menu: [
      {
        name: "Shift",
        displayName: "All Shift",
        access: true,
        subMenus: {
          create: { id: 1, access: true, api: "/demo/path" },
          view: { id: 2, access: true, api: "/demo/path" },
          update: { id: 3, access: true, api: "/demo/path" },
          softDelete: { id: 4, access: true, api: "/demo/path" },
          activeActive: { id: 5, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Change Shift",
        displayName: "All Change Shift",
        access: true,
        subMenus: {
          create: { id: 6, access: true, api: "/demo/path" },
          view: { id: 7, access: true, api: "/demo/path" },
          update: { id: 8, access: true, api: "/demo/path" },
          softDelete: { id: 9, access: true, api: "/demo/path" },
          activeActive: { id: 10, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Shift Change Request",
        displayName: "All Shift Change Request",
        access: true,
        subMenus: {
          create: { id: 11, access: true, api: "/demo/path" },
          view: { id: 12, access: true, api: "/demo/path" },
          update: { id: 13, access: true, api: "/demo/path" },
          softDelete: { id: 14, access: true, api: "/demo/path" },
          activeActive: { id: 15, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Department",
        displayName: "All Department",
        access: true,
        subMenus: {
          create: { id: 16, access: true, api: "/demo/path" },
          view: { id: 17, access: true, api: "/demo/path" },
          update: { id: 18, access: true, api: "/demo/path" },
          softDelete: { id: 19, access: true, api: "/demo/path" },
          activeActive: { id: 20, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Documents",
        displayName: "All Documents",
        access: true,
        subMenus: {
          create: { id: 21, access: true, api: "/demo/path" },
          view: { id: 22, access: true, api: "/demo/path" },
          update: { id: 23, access: true, api: "/demo/path" },
          softDelete: { id: 24, access: true, api: "/demo/path" },
          activeActive: { id: 25, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Assets & Tools",
        displayName: "All Assets & Tools",
        access: true,
        subMenus: {
          create: { id: 26, access: true, api: "/demo/path" },
          view: { id: 27, access: true, api: "/demo/path" },
          update: { id: 28, access: true, api: "/demo/path" },
          softDelete: { id: 29, access: true, api: "/demo/path" },
          activeActive: { id: 30, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Leave Category",
        displayName: "All Leave Category",
        access: true,
        subMenus: {
          create: { id: 31, access: true, api: "/demo/path" },
          view: { id: 32, access: true, api: "/demo/path" },
          update: { id: 33, access: true, api: "/demo/path" },
          softDelete: { id: 34, access: true, api: "/demo/path" },
          activeActive: { id: 35, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Leave Allotment",
        displayName: "All Leave Allotment",
        access: true,
        subMenus: {
          create: { id: 36, access: true, api: "/demo/path" },
          view: { id: 37, access: true, api: "/demo/path" },
          update: { id: 38, access: true, api: "/demo/path" },
          softDelete: { id: 39, access: true, api: "/demo/path" },
          activeActive: { id: 40, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Holiday",
        displayName: "All Holiday",
        access: true,
        subMenus: {
          create: { id: 41, access: true, api: "/demo/path" },
          view: { id: 42, access: true, api: "/demo/path" },
          update: { id: 43, access: true, api: "/demo/path" },
          softDelete: { id: 44, access: true, api: "/demo/path" },
          activeActive: { id: 45, access: true, api: "/demo/path" }
        }
      }
    ]
  },
  {
    name: "Administration",
    access: true,
    menu: [
      {
        name: "Roles & Permissions",
        displayName: "All Roles & Permissions",
        access: true,
        subMenus: {
          create: { id: 46, access: true, api: "/demo/path" },
          view: { id: 47, access: true, api: "/demo/path" },
          update: { id: 48, access: true, api: "/demo/path" },
          softDelete: { id: 49, access: true, api: "/demo/path" },
          activeActive: { id: 50, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Employee",
        displayName: "All Employee",
        access: true,
        subMenus: {
          create: { id: 51, access: true, api: "/demo/path" },
          view: { id: 52, access: true, api: "/demo/path" },
          update: { id: 53, access: true, api: "/demo/path" },
          softDelete: { id: 54, access: true, api: "/demo/path" },
          activeActive: { id: 55, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Customer",
        displayName: "All Customer",
        access: true,
        subMenus: {
          create: { id: 56, access: true, api: "/demo/path" },
          view: { id: 57, access: true, api: "/demo/path" },
          update: { id: 58, access: true, api: "/demo/path" },
          softDelete: { id: 59, access: true, api: "/demo/path" },
          activeActive: { id: 60, access: true, api: "/demo/path" }
        }
      },
      {
        name: "BusinessUnit",
        displayName: "All BusinessUnit",
        access: true,
        subMenus: {
          create: { id: 61, access: true, api: "/demo/path" },
          view: { id: 62, access: true, api: "/demo/path" },
          update: { id: 63, access: true, api: "/demo/path" },
          softDelete: { id: 64, access: true, api: "/demo/path" },
          activeActive: { id: 65, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Branch",
        displayName: "All Branch",
        access: true,
        subMenus: {
          create: { id: 66, access: true, api: "/demo/path" },
          view: { id: 67, access: true, api: "/demo/path" },
          update: { id: 68, access: true, api: "/demo/path" },
          softDelete: { id: 69, access: true, api: "/demo/path" },
          activeActive: { id: 70, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Warehouse",
        displayName: "All Warehouse",
        access: true,
        subMenus: {
          create: { id: 71, access: true, api: "/demo/path" },
          view: { id: 72, access: true, api: "/demo/path" },
          update: { id: 73, access: true, api: "/demo/path" },
          softDelete: { id: 74, access: true, api: "/demo/path" },
          activeActive: { id: 75, access: true, api: "/demo/path" }
        }
      }
    ]
  },
  {
    name: "Product",
    access: true,
    menu: [
      {
        name: "SubCategory",
        displayName: "All SubCategory",
        access: true,
        subMenus: {
          create: { id: 76, access: true, api: "/demo/path" },
          view: { id: 77, access: true, api: "/demo/path" },
          update: { id: 78, access: true, api: "/demo/path" },
          softDelete: { id: 79, access: true, api: "/demo/path" },
          activeActive: { id: 80, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Brand",
        displayName: "All Brand",
        access: true,
        subMenus: {
          create: { id: 81, access: true, api: "/demo/path" },
          view: { id: 82, access: true, api: "/demo/path" },
          update: { id: 83, access: true, api: "/demo/path" },
          softDelete: { id: 84, access: true, api: "/demo/path" },
          activeActive: { id: 85, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Manufacturer",
        displayName: "All Manufacturer",
        access: true,
        subMenus: {
          create: { id: 86, access: true, api: "/demo/path" },
          view: { id: 87, access: true, api: "/demo/path" },
          update: { id: 88, access: true, api: "/demo/path" },
          softDelete: { id: 89, access: true, api: "/demo/path" },
          activeActive: { id: 90, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Product",
        displayName: "All Product",
        access: true,
        subMenus: {
          create: { id: 91, access: true, api: "/demo/path" },
          view: { id: 92, access: true, api: "/demo/path" },
          update: { id: 93, access: true, api: "/demo/path" },
          softDelete: { id: 94, access: true, api: "/demo/path" },
          activeActive: { id: 95, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Product QA",
        displayName: "All Product QA",
        access: true,
        subMenus: {
          create: { id: 96, access: true, api: "/demo/path" },
          view: { id: 97, access: true, api: "/demo/path" },
          update: { id: 98, access: true, api: "/demo/path" },
          softDelete: { id: 99, access: true, api: "/demo/path" },
          activeActive: { id: 100, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Product QA Out",
        displayName: "All Product QA Out",
        access: true,
        subMenus: {
          create: { id: 101, access: true, api: "/demo/path" },
          view: { id: 102, access: true, api: "/demo/path" },
          update: { id: 103, access: true, api: "/demo/path" },
          softDelete: { id: 104, access: true, api: "/demo/path" },
          activeActive: { id: 105, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Attribute",
        displayName: "All Attribute",
        access: true,
        subMenus: {
          create: { id: 106, access: true, api: "/demo/path" },
          view: { id: 107, access: true, api: "/demo/path" },
          update: { id: 108, access: true, api: "/demo/path" },
          softDelete: { id: 109, access: true, api: "/demo/path" },
          activeActive: { id: 110, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Variant",
        displayName: "All Variant",
        access: true,
        subMenus: {
          create: { id: 111, access: true, api: "/demo/path" },
          view: { id: 112, access: true, api: "/demo/path" },
          update: { id: 113, access: true, api: "/demo/path" },
          softDelete: { id: 114, access: true, api: "/demo/path" },
          activeActive: { id: 115, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Pricing",
        displayName: "All Pricing",
        access: true,
        subMenus: {
          create: { id: 116, access: true, api: "/demo/path" },
          view: { id: 117, access: true, api: "/demo/path" },
          update: { id: 118, access: true, api: "/demo/path" },
          softDelete: { id: 119, access: true, api: "/demo/path" },
          activeActive: { id: 120, access: true, api: "/demo/path" }
        }
      }
    ]
  },
  {
    name: "Inventory",
    access: true,
    menu: [
      {
        name: "Transport",
        displayName: "All Transport",
        access: true,
        subMenus: {
          create: { id: 121, access: true, api: "/demo/path" },
          view: { id: 122, access: true, api: "/demo/path" },
          update: { id: 123, access: true, api: "/demo/path" },
          softDelete: { id: 124, access: true, api: "/demo/path" },
          activeActive: { id: 125, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Stock",
        displayName: "All Stock",
        access: true,
        subMenus: {
          create: { id: 126, access: true, api: "/demo/path" },
          view: { id: 127, access: true, api: "/demo/path" },
          update: { id: 128, access: true, api: "/demo/path" },
          softDelete: { id: 129, access: true, api: "/demo/path" },
          activeActive: { id: 130, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Order",
        displayName: "All Order",
        access: true,
        subMenus: {
          create: { id: 131, access: true, api: "/demo/path" },
          view: { id: 132, access: true, api: "/demo/path" },
          update: { id: 133, access: true, api: "/demo/path" },
          softDelete: { id: 134, access: true, api: "/demo/path" },
          activeActive: { id: 135, access: true, api: "/demo/path" }
        }
      }
    ]
  },
  {
    name: "Accounting Master",
    access: true,
    menu: [
      {
        name: "Financial Year",
        displayName: "All Financial Year",
        access: true,
        subMenus: {
          create: { id: 136, access: true, api: "/demo/path" },
          view: { id: 137, access: true, api: "/demo/path" },
          update: { id: 138, access: true, api: "/demo/path" },
          softDelete: { id: 139, access: true, api: "/demo/path" },
          activeActive: { id: 140, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Currency",
        displayName: "All Currency",
        access: true,
        subMenus: {
          create: { id: 141, access: true, api: "/demo/path" },
          view: { id: 142, access: true, api: "/demo/path" },
          update: { id: 143, access: true, api: "/demo/path" },
          softDelete: { id: 144, access: true, api: "/demo/path" },
          activeActive: { id: 145, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Ledger",
        displayName: "All Ledger",
        access: true,
        subMenus: {
          create: { id: 146, access: true, api: "/demo/path" },
          view: { id: 147, access: true, api: "/demo/path" },
          update: { id: 148, access: true, api: "/demo/path" },
          softDelete: { id: 149, access: true, api: "/demo/path" },
          activeActive: { id: 150, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Group",
        displayName: "All Group",
        access: true,
        subMenus: {
          create: { id: 151, access: true, api: "/demo/path" },
          view: { id: 152, access: true, api: "/demo/path" },
          update: { id: 153, access: true, api: "/demo/path" },
          softDelete: { id: 154, access: true, api: "/demo/path" },
          activeActive: { id: 155, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Voucher Group",
        displayName: "All Voucher Group",
        access: true,
        subMenus: {
          create: { id: 156, access: true, api: "/demo/path" },
          view: { id: 157, access: true, api: "/demo/path" },
          update: { id: 158, access: true, api: "/demo/path" },
          softDelete: { id: 159, access: true, api: "/demo/path" },
          activeActive: { id: 160, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Voucher",
        displayName: "All Voucher",
        access: true,
        subMenus: {
          create: { id: 161, access: true, api: "/demo/path" },
          view: { id: 162, access: true, api: "/demo/path" },
          update: { id: 163, access: true, api: "/demo/path" },
          softDelete: { id: 164, access: true, api: "/demo/path" },
          activeActive: { id: 165, access: true, api: "/demo/path" }
        }
      }
    ]
  },
  {
    name: "Purchases",
    access: true,
    menu: [
      {
        name: "Supplier",
        displayName: "All Supplier",
        access: true,
        subMenus: {
          create: { id: 166, access: true, api: "/demo/path" },
          view: { id: 167, access: true, api: "/demo/path" },
          update: { id: 168, access: true, api: "/demo/path" },
          softDelete: { id: 169, access: true, api: "/demo/path" },
          activeActive: { id: 170, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Purchase Invoices",
        displayName: "All Purchase Invoices",
        access: true,
        subMenus: {
          create: { id: 171, access: true, api: "/demo/path" },
          view: { id: 172, access: true, api: "/demo/path" },
          update: { id: 173, access: true, api: "/demo/path" },
          softDelete: { id: 174, access: true, api: "/demo/path" },
          activeActive: { id: 175, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Payment Out",
        displayName: "All Payment Out",
        access: true,
        subMenus: {
          create: { id: 176, access: true, api: "/demo/path" },
          view: { id: 177, access: true, api: "/demo/path" },
          update: { id: 178, access: true, api: "/demo/path" },
          softDelete: { id: 179, access: true, api: "/demo/path" },
          activeActive: { id: 180, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Purchase Returns",
        displayName: "All Purchase Returns",
        access: true,
        subMenus: {
          create: { id: 181, access: true, api: "/demo/path" },
          view: { id: 182, access: true, api: "/demo/path" },
          update: { id: 183, access: true, api: "/demo/path" },
          softDelete: { id: 184, access: true, api: "/demo/path" },
          activeActive: { id: 185, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Debit Note",
        displayName: "All Debit Note",
        access: true,
        subMenus: {
          create: { id: 186, access: true, api: "/demo/path" },
          view: { id: 187, access: true, api: "/demo/path" },
          update: { id: 188, access: true, api: "/demo/path" },
          softDelete: { id: 189, access: true, api: "/demo/path" },
          activeActive: { id: 190, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Purchase Order",
        displayName: "All Purchase Order",
        access: true,
        subMenus: {
          create: { id: 191, access: true, api: "/demo/path" },
          view: { id: 192, access: true, api: "/demo/path" },
          update: { id: 193, access: true, api: "/demo/path" },
          softDelete: { id: 194, access: true, api: "/demo/path" },
          activeActive: { id: 195, access: true, api: "/demo/path" }
        }
      }
    ]
  },
  {
    name: "Sales",
    access: true,
    menu: [
      {
        name: "Sales Invoices",
        displayName: "All Sales Invoices",
        access: true,
        subMenus: {
          create: { id: 196, access: true, api: "/demo/path" },
          view: { id: 197, access: true, api: "/demo/path" },
          update: { id: 198, access: true, api: "/demo/path" },
          softDelete: { id: 199, access: true, api: "/demo/path" },
          activeActive: { id: 200, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Quotation",
        displayName: "All Quotation",
        access: true,
        subMenus: {
          create: { id: 201, access: true, api: "/demo/path" },
          view: { id: 202, access: true, api: "/demo/path" },
          update: { id: 203, access: true, api: "/demo/path" },
          softDelete: { id: 204, access: true, api: "/demo/path" },
          activeActive: { id: 205, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Payment In",
        displayName: "All Payment In",
        access: true,
        subMenus: {
          create: { id: 206, access: true, api: "/demo/path" },
          view: { id: 207, access: true, api: "/demo/path" },
          update: { id: 208, access: true, api: "/demo/path" },
          softDelete: { id: 209, access: true, api: "/demo/path" },
          activeActive: { id: 210, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Sales Returns",
        displayName: "All Sales Returns",
        access: true,
        subMenus: {
          create: { id: 211, access: true, api: "/demo/path" },
          view: { id: 212, access: true, api: "/demo/path" },
          update: { id: 213, access: true, api: "/demo/path" },
          softDelete: { id: 214, access: true, api: "/demo/path" },
          activeActive: { id: 215, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Credit Note",
        displayName: "All Credit Note",
        access: true,
        subMenus: {
          create: { id: 216, access: true, api: "/demo/path" },
          view: { id: 217, access: true, api: "/demo/path" },
          update: { id: 218, access: true, api: "/demo/path" },
          softDelete: { id: 219, access: true, api: "/demo/path" },
          activeActive: { id: 220, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Performa Invoice",
        displayName: "All Performa Invoice",
        access: true,
        subMenus: {
          create: { id: 221, access: true, api: "/demo/path" },
          view: { id: 222, access: true, api: "/demo/path" },
          update: { id: 223, access: true, api: "/demo/path" },
          softDelete: { id: 224, access: true, api: "/demo/path" },
          activeActive: { id: 225, access: true, api: "/demo/path" }
        }
      },
      {
        name: "Delivery Challan",
        displayName: "All Delivery Challan",
        access: true,
        subMenus: {
          create: { id: 226, access: true, api: "/demo/path" },
          view: { id: 227, access: true, api: "/demo/path" },
          update: { id: 228, access: true, api: "/demo/path" },
          softDelete: { id: 229, access: true, api: "/demo/path" },
          activeActive: { id: 230, access: true, api: "/demo/path" }
        }
      }
    ]
  }
];



// clients role
const clientRoles = [
  { id: 0, name: 'Customer', capability: defaultPersmissionsList },
  { id: 1, name: 'Vendor', capability: vendorPersmissionsList },
  { id: 2, name: 'Business Unit Head', capability: defaultPersmissionsList },
  { id: 3, name: 'Branch Head', capability: defaultPersmissionsList },
  { id: 4, name: 'Warehouse Head', capability: defaultPersmissionsList },
];




exports.clientRoles = clientRoles;
exports.defaultPersmissionsList = defaultPersmissionsList;
exports.vendorPersmissionsList = vendorPersmissionsList;