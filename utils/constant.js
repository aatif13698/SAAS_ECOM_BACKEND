


// default permission list
// const defaultPersmissionsList =[

//     {
//         name: "Roles&Permissions",
//         displayName: "All Roles & Permissions",
//         access: false,
//         subMenus: {
//             create: {
//                 id : 1,
//                 access: false,
//                 api: "/demo/path",
//             },
//             view: {
//                 id : 2,
//                 access: false,
//                 api: "/demo/path",
//             },
//             update: {
//                 id : 3,
//                 access: false,
//                 api: "/demo/path",
//             },
//             softDelete: {
//                 id : 4,
//                 access: false,
//                 api: "/demo/path",
//             },
//         }
//     },
//     {
//         name: "Employee",
//         displayName: "All Emoloyee",
//         access: false,
//         subMenus: {
//             create: {
//                 id : 5,
//                 access: false,
//                 api: "/demo/path",
//             },
//             view: {
//                 id : 6,
//                 access: false,
//                 api: "/demo/path",
//             },
//             update: {
//                 id : 7,
//                 access: false,
//                 api: "/demo/path",
//             },
//             softDelete: {
//                 id : 8,
//                 access: false,
//                 api: "/demo/path",
//             },
//         }
//     },
//     {
//         name: "BusinessUnit",
//         displayName: "All Business Unit",
//         access: false,
//         subMenus: {

//             create: {
//                 id : 9,
//                 access: false,
//                 api: "/demo/path",
//             },
//             view: {
//                 id : 10,
//                 access: false,
//                 api: "/demo/path",
//             },
//             update: {
//                 id : 11,
//                 access: false,
//                 api: "/demo/path",
//             },
//             softDelete: {
//                 id : 12,
//                 access: false,
//                 api: "/demo/path",
//             },
//         }
//     },
//     {
//         name: "Branch",
//         displayName: "All Branch",
//         access: false,
//         subMenus: {
//             create: {
//                 id : 13,
//                 access: false,
//                 api: "/demo/path",
//             },
//             view: {
//                 id : 14,
//                 access: false,
//                 api: "/demo/path",
//             },
//             update: {
//                 id : 15,
//                 access: false,
//                 api: "/demo/path",
//             },
//             softDelete: {
//                 id : 16,
//                 access: false,
//                 api: "/demo/path",
//             },
//         }
//     },
//     {
//         name: "Warehouse",
//         displayName: "All Warehouse",
//         access: false,
//         subMenus: {
//             create: {
//                 id : 17,
//                 access: false,
//                 api: "/demo/path",
//             },
//             view: {
//                 id : 18,
//                 access: false,
//                 api: "/demo/path",
//             },
//             update: {
//                 id : 19,
//                 access: false,
//                 api: "/demo/path",
//             },
//             softDelete: {
//                 id : 20,
//                 access: false,
//                 api: "/demo/path",
//             },
//         }
//     },
//     {
//         name: "Category",
//         displayName: "All Category",
//         access: false,
//         subMenus: {
//             create: {
//                 id : 21,
//                 access: false,
//                 api: "/demo/path",
//             },
//             view: {
//                 id : 22,
//                 access: false,
//                 api: "/demo/path",
//             },
//             update: {
//                 id : 23,
//                 access: false,
//                 api: "/demo/path",
//             },
//             softDelete: {
//                 id : 24,
//                 access: false,
//                 api: "/demo/path",
//             },
//         }
//     },
//     {
//         name: "SubCategory",
//         displayName: "All Sub Category",
//         access: false,
//         subMenus: {
//             create: {
//                 id : 25,
//                 access: false,
//                 api: "/demo/path",
//             },
//             view: {
//                 id : 26,
//                 access: false,
//                 api: "/demo/path",
//             },
//             update: {
//                 id : 27,
//                 access: false,
//                 api: "/demo/path",
//             },
//             softDelete: {
//                 id : 28,
//                 access: false,
//                 api: "/demo/path",
//             },
//         }
//     },
//     {
//         name: "Brand",
//         displayName: "All Brand",
//         access: false,
//         subMenus: {
//             create: {
//                 id : 29,
//                 access: false,
//                 api: "/demo/path",
//             },
//             view: {
//                 id : 30,
//                 access: false,
//                 api: "/demo/path",
//             },
//             update: {
//                 id : 31,
//                 access: false,
//                 api: "/demo/path",
//             },
//             softDelete: {
//                 id : 32,
//                 access: false,
//                 api: "/demo/path",
//             },
//         }
//     },

//     {
//         name: "Manufacturer",
//         displayName: "All Manufacturer",
//         access: false,
//         subMenus: {
//             create: {
//                 id : 33,
//                 access: false,
//                 api: "/demo/path",
//             },
//             view: {
//                 id : 34,
//                 access: false,
//                 api: "/demo/path",
//             },
//             update: {
//                 id : 35,
//                 access: false,
//                 api: "/demo/path",
//             },
//             softDelete: {
//                 id : 36,
//                 access: false,
//                 api: "/demo/path",
//             },
//         }
//     },

// ]


const defaultPersmissionsList = [
    {
        name: "Administration",
        access: false,
        menu: [
            {
                name: "Roles & Permissions",
                displayName: "All Roles & Permissions",
                access: false,
                subMenus: {
                    create: { id: 1, access: false, api: "/demo/path" },
                    view: { id: 2, access: false, api: "/demo/path" },
                    update: { id: 3, access: false, api: "/demo/path" },
                    softDelete: { id: 4, access: false, api: "/demo/path" },
                    activeActive: { id: 5, access: false, api: "/demo/path" },
                }
            },
            {
                name: "Employee",
                displayName: "All Employee",
                access: false,
                subMenus: {
                    create: { id: 6, access: false, api: "/demo/path" },
                    view: { id: 7, access: false, api: "/demo/path" },
                    update: { id: 8, access: false, api: "/demo/path" },
                    softDelete: { id: 9, access: false, api: "/demo/path" },
                    activeActive: { id: 10, access: false, api: "/demo/path" },
                }
            },
            {
                name: "BusinessUnit",
                displayName: "All BusinessUnit",
                access: false,
                subMenus: {
                    create: { id: 11, access: false, api: "/demo/path" },
                    view: { id: 12, access: false, api: "/demo/path" },
                    update: { id: 13, access: false, api: "/demo/path" },
                    softDelete: { id: 14, access: false, api: "/demo/path" },
                    activeActive: { id: 15, access: false, api: "/demo/path" },
                }
            },
            {
                name: "Branch",
                displayName: "All Branch",
                access: false,
                subMenus: {
                    create: { id: 16, access: false, api: "/demo/path" },
                    view: { id: 17, access: false, api: "/demo/path" },
                    update: { id: 18, access: false, api: "/demo/path" },
                    softDelete: { id: 19, access: false, api: "/demo/path" },
                    activeActive: { id: 20, access: false, api: "/demo/path" },
                }
            },
            {
                name: "Warehouse",
                displayName: "All Warehouse",
                access: false,
                subMenus: {
                    create: { id: 21, access: false, api: "/demo/path" },
                    view: { id: 22, access: false, api: "/demo/path" },
                    update: { id: 23, access: false, api: "/demo/path" },
                    softDelete: { id: 24, access: false, api: "/demo/path" },
                    activeActive: { id: 25, access: false, api: "/demo/path" },
                }
            },


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
                    create: { id: 26, access: false, api: "/demo/path" },
                    view: { id: 27, access: false, api: "/demo/path" },
                    update: { id: 28, access: false, api: "/demo/path" },
                    softDelete: { id: 29, access: false, api: "/demo/path" },
                    activeActive: { id: 30, access: false, api: "/demo/path" },
                }
            },
            {
                name: "Brand",
                displayName: "All Brand",
                access: false,
                subMenus: {
                    create: { id: 31, access: false, api: "/demo/path" },
                    view: { id: 32, access: false, api: "/demo/path" },
                    update: { id: 33, access: false, api: "/demo/path" },
                    softDelete: { id: 34, access: false, api: "/demo/path" },
                    activeActive: { id: 35, access: false, api: "/demo/path" },
                }
            },
            {
                name: "Manufacturer",
                displayName: "All Manufacturer",
                access: false,
                subMenus: {
                    create: { id: 36, access: false, api: "/demo/path" },
                    view: { id: 37, access: false, api: "/demo/path" },
                    update: { id: 38, access: false, api: "/demo/path" },
                    softDelete: { id: 39, access: false, api: "/demo/path" },
                    activeActive: { id: 40, access: false, api: "/demo/path" },
                }
            },
            {
                name: "Attribute",
                displayName: "All Attribute",
                access: false,
                subMenus: {
                    create: { id: 41, access: false, api: "/demo/path" },
                    view: { id: 42, access: false, api: "/demo/path" },
                    update: { id: 43, access: false, api: "/demo/path" },
                    softDelete: { id: 44, access: false, api: "/demo/path" },
                    activeActive: { id: 45, access: false, api: "/demo/path" },
                }
            },
            {
                name: "Product",
                displayName: "All Product",
                access: false,
                subMenus: {
                    create: { id: 46, access: false, api: "/demo/path" },
                    view: { id: 47, access: false, api: "/demo/path" },
                    update: { id: 48, access: false, api: "/demo/path" },
                    softDelete: { id: 49, access: false, api: "/demo/path" },
                    activeActive: { id: 50, access: false, api: "/demo/path" },
                }
            },
            {
                name: "Pricing",
                displayName: "All Pricing",
                access: false,
                subMenus: {
                    create: { id: 66, access: false, api: "/demo/path" },
                    view: { id: 67, access: false, api: "/demo/path" },
                    update: { id: 68, access: false, api: "/demo/path" },
                    softDelete: { id: 69, access: false, api: "/demo/path" },
                    activeActive: { id: 70, access: false, api: "/demo/path" },
                }
            }
        ]
    },
    {
        name: "Inventory",
        access: false,
        menu: [
            {
                name: "Supplier",
                displayName: "All Supplier",
                access: false,
                subMenus: {
                    create: { id: 51, access: false, api: "/demo/path" },
                    view: { id: 52, access: false, api: "/demo/path" },
                    update: { id: 53, access: false, api: "/demo/path" },
                    softDelete: { id: 54, access: false, api: "/demo/path" },
                    activeActive: { id: 55, access: false, api: "/demo/path" },
                }
            },
            {
                name: "Stock",
                displayName: "All Stock",
                access: false,
                subMenus: {
                    create: { id: 56, access: false, api: "/demo/path" },
                    view: { id: 57, access: false, api: "/demo/path" },
                    update: { id: 58, access: false, api: "/demo/path" },
                    softDelete: { id: 59, access: false, api: "/demo/path" },
                    activeActive: { id: 60, access: false, api: "/demo/path" },
                }
            },
            {
                name: "Order",
                displayName: "All Order",
                access: false,
                subMenus: {
                    create: { id: 61, access: false, api: "/demo/path" },
                    view: { id: 62, access: false, api: "/demo/path" },
                    update: { id: 63, access: false, api: "/demo/path" },
                    softDelete: { id: 64, access: false, api: "/demo/path" },
                    activeActive: { id: 65, access: false, api: "/demo/path" },
                }
            }
            
        ]
    }
];


// vendor Permission list
const vendorPersmissionsList = [

    {
        name: "Administration",
        access: true,
        menu: [
            {
                name: "Roles & Permissions",
                displayName: "All Roles & Permissions",
                access: true,
                subMenus: {
                    create: { id: 1, access: true, api: "/demo/path" },
                    view: { id: 2, access: true, api: "/demo/path" },
                    update: { id: 3, access: true, api: "/demo/path" },
                    softDelete: { id: 4, access: true, api: "/demo/path" },
                    activeActive: { id: 5, access: true, api: "/demo/path" },
                }
            },
            {
                name: "Employee",
                displayName: "All Employee",
                access: true,
                subMenus: {
                    create: { id: 6, access: true, api: "/demo/path" },
                    view: { id: 7, access: true, api: "/demo/path" },
                    update: { id: 8, access: true, api: "/demo/path" },
                    softDelete: { id: 9, access: true, api: "/demo/path" },
                    activeActive: { id: 10, access: true, api: "/demo/path" },
                }
            },
            {
                name: "BusinessUnit",
                displayName: "All BusinessUnit",
                access: true,
                subMenus: {
                    create: { id: 11, access: true, api: "/demo/path" },
                    view: { id: 12, access: true, api: "/demo/path" },
                    update: { id: 13, access: true, api: "/demo/path" },
                    softDelete: { id: 14, access: true, api: "/demo/path" },
                    activeActive: { id: 15, access: true, api: "/demo/path" },
                }
            },
            {
                name: "Branch",
                displayName: "All Branch",
                access: true,
                subMenus: {
                    create: { id: 16, access: true, api: "/demo/path" },
                    view: { id: 17, access: true, api: "/demo/path" },
                    update: { id: 18, access: true, api: "/demo/path" },
                    softDelete: { id: 19, access: true, api: "/demo/path" },
                    activeActive: { id: 20, access: true, api: "/demo/path" },
                }
            },
            {
                name: "Warehouse",
                displayName: "All Warehouse",
                access: true,
                subMenus: {
                    create: { id: 21, access: true, api: "/demo/path" },
                    view: { id: 22, access: true, api: "/demo/path" },
                    update: { id: 23, access: true, api: "/demo/path" },
                    softDelete: { id: 24, access: true, api: "/demo/path" },
                    activeActive: { id: 25, access: true, api: "/demo/path" },
                }
            },


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
                    create: { id: 26, access: true, api: "/demo/path" },
                    view: { id: 27, access: true, api: "/demo/path" },
                    update: { id: 28, access: true, api: "/demo/path" },
                    softDelete: { id: 29, access: true, api: "/demo/path" },
                    activeActive: { id: 30, access: true, api: "/demo/path" },
                }
            },
            {
                name: "Brand",
                displayName: "All Brand",
                access: true,
                subMenus: {
                    create: { id: 31, access: true, api: "/demo/path" },
                    view: { id: 32, access: true, api: "/demo/path" },
                    update: { id: 33, access: true, api: "/demo/path" },
                    softDelete: { id: 34, access: true, api: "/demo/path" },
                    activeActive: { id: 35, access: true, api: "/demo/path" },
                }
            },
            {
                name: "Manufacturer",
                displayName: "All Manufacturer",
                access: true,
                subMenus: {
                    create: { id: 36, access: true, api: "/demo/path" },
                    view: { id: 37, access: true, api: "/demo/path" },
                    update: { id: 38, access: true, api: "/demo/path" },
                    softDelete: { id: 39, access: true, api: "/demo/path" },
                    activeActive: { id: 40, access: true, api: "/demo/path" },
                }
            },
            {
                name: "Attribute",
                displayName: "All Attribute",
                access: true,
                subMenus: {
                    create: { id: 41, access: true, api: "/demo/path" },
                    view: { id: 42, access: true, api: "/demo/path" },
                    update: { id: 43, access: true, api: "/demo/path" },
                    softDelete: { id: 44, access: true, api: "/demo/path" },
                    activeActive: { id: 45, access: true, api: "/demo/path" },
                }
            },
            {
                name: "Product",
                displayName: "All Product",
                access: true,
                subMenus: {
                    create: { id: 46, access: true, api: "/demo/path" },
                    view: { id: 47, access: true, api: "/demo/path" },
                    update: { id: 48, access: true, api: "/demo/path" },
                    softDelete: { id: 49, access: true, api: "/demo/path" },
                    activeActive: { id: 50, access: true, api: "/demo/path" },
                }
            },
            {
                name: "Pricing",
                displayName: "All Pricing",
                access: true,
                subMenus: {
                    create: { id: 66, access: true, api: "/demo/path" },
                    view: { id: 67, access: true, api: "/demo/path" },
                    update: { id: 68, access: true, api: "/demo/path" },
                    softDelete: { id: 69, access: true, api: "/demo/path" },
                    activeActive: { id: 70, access: true, api: "/demo/path" },
                }
            }
        ]
    },
    {
        name: "Inventory",
        access: true,
        menu: [
            {
                name: "Supplier",
                displayName: "All Supplier",
                access: true,
                subMenus: {
                    create: { id: 51, access: true, api: "/demo/path" },
                    view: { id: 52, access: true, api: "/demo/path" },
                    update: { id: 53, access: true, api: "/demo/path" },
                    softDelete: { id: 54, access: true, api: "/demo/path" },
                    activeActive: { id: 55, access: true, api: "/demo/path" },
                }
            },
            {
                name: "Stock",
                displayName: "All Stock",
                access: true,
                subMenus: {
                    create: { id: 56, access: true, api: "/demo/path" },
                    view: { id: 57, access: true, api: "/demo/path" },
                    update: { id: 58, access: true, api: "/demo/path" },
                    softDelete: { id: 59, access: true, api: "/demo/path" },
                    activeActive: { id: 60, access: true, api: "/demo/path" },
                }
            },
            {
                name: "Order",
                displayName: "All Order",
                access: true,
                subMenus: {
                    create: { id: 61, access: true, api: "/demo/path" },
                    view: { id: 62, access: true, api: "/demo/path" },
                    update: { id: 63, access: true, api: "/demo/path" },
                    softDelete: { id: 64, access: true, api: "/demo/path" },
                    activeActive: { id: 65, access: true, api: "/demo/path" },
                }
            }
            
        ]
    }
]




// clients role
const clientRoles = [
    { id: 0 , name: 'Customer', capability: defaultPersmissionsList },
    { id: 1, name: 'Vendor', capability: vendorPersmissionsList },
    { id: 2, name: 'Business Unit Head', capability: defaultPersmissionsList },
    { id: 3, name: 'Branch Head', capability: defaultPersmissionsList },
    { id: 4, name: 'Warehouse Head', capability: defaultPersmissionsList },
];




exports.clientRoles = clientRoles;
exports.defaultPersmissionsList = defaultPersmissionsList;
exports.vendorPersmissionsList = vendorPersmissionsList;