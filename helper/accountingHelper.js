const customFieldSchema = require("../client/model/customField");
const clientLedgerGroupSchema = require("../client/model/ledgerGroup");
const { getClientDatabaseConnection } = require("../db/connection");
const httpStatusCode = require("../utils/http-status-code");

async function generateLedgerGroup(businessId, branchId, warehouseId, level = "business", mainUser, clientId) {
    try {

        if (level == "business" && !businessId) {
            throw new CustomError(httpStatusCode.Conflict, "Business unit id is required for default ledger group creation")
        }

        if (level == "branch") {
            if (!businessId || !branchId) {
                throw new CustomError(httpStatusCode.Conflict, "Business unit and Branch id is required for default ledger group creation")
            }
        }

        if (level == "warehouse") {
            if (!businessId || !branchId || !warehouseId) {
                throw new CustomError(httpStatusCode.Conflict, "Business unit, Branch and warehouse id is required for default ledger group creation")
            }
        }
        const levelConfig = {
            vendor: { isVendorLevel: true, isBuLevel: false, isBranchLevel: false, isWarehouseLevel: false },
            business: { isVendorLevel: false, isBuLevel: true, isBranchLevel: false, isWarehouseLevel: false },
            branch: { isVendorLevel: false, isBuLevel: false, isBranchLevel: true, isWarehouseLevel: false },
            warehouse: { isVendorLevel: false, isBuLevel: false, isBranchLevel: false, isWarehouseLevel: true },
        };
        const data = [
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Capital Account",
                hasParent: false,
                createdBy: mainUser._id,
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Current Asset",
                hasParent: false,
                createdBy: mainUser._id,
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Current Liabilities",
                hasParent: false,
                createdBy: mainUser._id,
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Direct Expense",
                hasParent: false,
                createdBy: mainUser._id,
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Direct Income",
                hasParent: false,
                createdBy: mainUser._id,
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Fixed Assets",
                hasParent: false,
                createdBy: mainUser._id,
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Indirect Expense",
                hasParent: false,
                createdBy: mainUser._id,
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Indirect Income",
                hasParent: false,
                createdBy: mainUser._id,
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Investments",
                hasParent: false,
                createdBy: mainUser._id,
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Loans (Liability)",
                hasParent: false,
                createdBy: mainUser._id,
            },
        ]

        const dataArray = data.map((item) => {
            const newMapedData = { ...item }
            return Object.assign(newMapedData, levelConfig[level])
        });

        console.log("dataArray", dataArray);

        const clientConnection = await getClientDatabaseConnection(clientId);
        const LedgerGroup = clientConnection.model("ledgerGroup", clientLedgerGroupSchema);
        const CustomField = clientConnection.model("customField", customFieldSchema);
        const ledgerGruop = await LedgerGroup.insertMany(dataArray);

        console.log("ledgerGruop default", ledgerGruop);

        const fieldArray = [
            {
                "Capital Account": [
                    {
                        name: "nickName",
                        label: "Nick Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Nick Name.",
                        gridConfig: {
                            span: 12,
                            order: 1
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Owner/Partner",
                        label: "Owner/Partner",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Owner/Partner.",
                        gridConfig: {
                            span: 12,
                            order: 2
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "phone",
                        label: "Phone",
                        type: "number",
                        isRequired: true,
                        placeholder: "Enter phone.",
                        gridConfig: {
                            span: 12,
                            order: 3
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "email",
                        label: "Email",
                        type: "email",
                        isRequired: true,
                        placeholder: "Enter email.",
                        gridConfig: {
                            span: 12,
                            order: 4
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "pan",
                        label: "PAN",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter PAN.",
                        gridConfig: {
                            span: 12,
                            order: 5
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "SharePercentage",
                        label: "Share Percentage",
                        type: "number",
                        isRequired: true,
                        placeholder: "Enter Share Percentage.",
                        gridConfig: {
                            span: 12,
                            order: 6
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                ]
            },
            {
                "Current Asset": [
                    {
                        name: "nickName",
                        label: "Nick Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Nick Name.",
                        gridConfig: {
                            span: 12,
                            order: 1
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Asset Typ",
                        label: " Asset Typ",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Asset Typ.",
                        gridConfig: {
                            span: 12,
                            order: 2
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Description",
                        label: "Description",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Description.",
                        gridConfig: {
                            span: 12,
                            order: 3
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                ]
            },
            {
                "Current Liabilities": [
                    {
                        name: "nickName",
                        label: "Nick Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Nick Name.",
                        gridConfig: {
                            span: 12,
                            order: 1
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Liability Type",
                        label: "Liability Type",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Liability Type.",
                        gridConfig: {
                            span: 12,
                            order: 2
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Description",
                        label: "Description",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Description.",
                        gridConfig: {
                            span: 12,
                            order: 3
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                ]
            },
            {
                "Direct Expense": [
                    {
                        name: "nickName",
                        label: "Nick Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Nick Name.",
                        gridConfig: {
                            span: 12,
                            order: 1
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Expense Type",
                        label: "Expense Type",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Expense Type.",
                        gridConfig: {
                            span: 12,
                            order: 2
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Description",
                        label: "Description",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Description.",
                        gridConfig: {
                            span: 12,
                            order: 3
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },

                ]
            },
            {
                "Direct Income": [
                    {
                        name: "nickName",
                        label: "Nick Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Nick Name.",
                        gridConfig: {
                            span: 12,
                            order: 1
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Income Type",
                        label: "Income Type",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Income Type.",
                        gridConfig: {
                            span: 12,
                            order: 2
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Description",
                        label: "Description",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Description.",
                        gridConfig: {
                            span: 12,
                            order: 3
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },

                ]
            },
            {
                "Fixed Assets": [
                    {
                        name: "nickName",
                        label: "Nick Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Nick Name.",
                        gridConfig: {
                            span: 12,
                            order: 1
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Assets Type",
                        label: "Assets Type",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Assets Type.",
                        gridConfig: {
                            span: 12,
                            order: 2
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Description",
                        label: "Description",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Description.",
                        gridConfig: {
                            span: 12,
                            order: 3
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },

                ]
            },
            {
                "Indirect Expense": [
                    {
                        name: "nickName",
                        label: "Nick Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Nick Name.",
                        gridConfig: {
                            span: 12,
                            order: 1
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Expense Type",
                        label: "Expense Type",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Expense Type.",
                        gridConfig: {
                            span: 12,
                            order: 2
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Description",
                        label: "Description",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Description.",
                        gridConfig: {
                            span: 12,
                            order: 3
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },

                ]
            },
            {
                "Indirect Income": [
                    {
                        name: "nickName",
                        label: "Nick Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Nick Name.",
                        gridConfig: {
                            span: 12,
                            order: 1
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Income Type",
                        label: "Income Type",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Income Type.",
                        gridConfig: {
                            span: 12,
                            order: 2
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Description",
                        label: "Description",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Description.",
                        gridConfig: {
                            span: 12,
                            order: 3
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },

                ]
            },
            {
                "Investments": [
                    {
                        name: "nickName",
                        label: "Nick Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Nick Name.",
                        gridConfig: {
                            span: 12,
                            order: 1
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Investments Type",
                        label: "Investments Type",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Investments Type.",
                        gridConfig: {
                            span: 12,
                            order: 2
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Description",
                        label: "Description",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Description.",
                        gridConfig: {
                            span: 12,
                            order: 3
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },

                ]
            },
            {
                "Loans (Liability)": [
                    {
                        name: "nickName",
                        label: "Nick Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Nick Name.",
                        gridConfig: {
                            span: 12,
                            order: 1
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Loans Type",
                        label: "Loans Type",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Loans Type.",
                        gridConfig: {
                            span: 12,
                            order: 2
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Description",
                        label: "Description",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Description.",
                        gridConfig: {
                            span: 12,
                            order: 3
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },

                ]
            }
        ]

        ledgerGruop.map((item) => {
            const name = item.groupName;
            const id = item._id
            fieldArray.map(async (field) => {
                const gName = Object.keys(field)[0];
                if (gName === name) {
                    const fieldsArray = field[gName];
                    console.log("fieldsArray", fieldsArray);

                    const newFieldArray = fieldsArray.map((f) => {
                        return {
                            ...f,
                            groupId: id
                        }
                    });
                    console.log("newFieldArray", newFieldArray);
                    const a = await CustomField.insertMany(newFieldArray);
                    console.log("a", a);
                }
            })
        });

        const childLedgerArray = [
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Reserves and Surplus",
                hasParent: true,
                createdBy: mainUser._id,
                parentGroup: "Capital Account"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Bank Account",
                hasParent: true,
                createdBy: mainUser._id,
                parentGroup: "Current Asset"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Cash-in-hand",
                hasParent: true,
                createdBy: mainUser._id,
                parentGroup: "Current Asset"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Deposits (Asset)",
                hasParent: true,
                createdBy: mainUser._id,
                parentGroup: "Current Asset"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Loans & Advances (Asset)",
                hasParent: true,
                createdBy: mainUser._id,
                parentGroup: "Current Asset"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Stock-in-hand",
                hasParent: true,
                createdBy: mainUser._id,
                parentGroup: "Current Asset"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Sundry Debtors",
                hasParent: true,
                createdBy: mainUser._id,
                parentGroup: "Current Asset"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Duties & Taxes",
                hasParent: true,
                createdBy: mainUser._id,
                parentGroup: "Current Liabilities"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Sundry Creditor",
                hasParent: true,
                createdBy: mainUser._id,
                parentGroup: "Current Liabilities"
            },
        ];

        const newInsetArrayForChildLedger = childLedgerArray.map((child) => {
            const parentName = child?.parentGroup;
            let parentId = null;
            ledgerGruop.map((parent) => {
                if (parent?.groupName == parentName) {
                    parentId = parent._id
                }
            });
            return {
                ...child,
                parentGroup: parentId
            }
        });

        const dataArrayChildLedger = newInsetArrayForChildLedger.map((item) => {
            const newMapedData = { ...item }
            return Object.assign(newMapedData, levelConfig[level])
        });


        const childLedgerGruop = await LedgerGroup.insertMany(dataArrayChildLedger);

        const childLedgerFieldArray = [
            {
                "Reserves and Surplus": [
                    {
                        name: "nickName",
                        label: "Nick Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Nick Name.",
                        gridConfig: {
                            span: 12,
                            order: 1
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Reserve Type",
                        label: "Reserve Type",
                        type: "select",
                        isRequired: true,
                        placeholder: "",
                        options: [
                            "General Reserve",
                            "Capital Reserve",
                            "Dividend Reserve",
                            "Retained Earnings"
                        ],
                        gridConfig: {
                            span: 12,
                            order: 2
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Creation Date",
                        label: "Creation Date",
                        type: "date",
                        isRequired: true,
                        placeholder: "",
                        gridConfig: {
                            span: 12,
                            order: 3
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Description",
                        label: "Description",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Description.",
                        gridConfig: {
                            span: 12,
                            order: 4
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Photo",
                        label: "Upload Photo",
                        type: "file",
                        isRequired: true,
                        validation: {
                            fileTypes: [
                                "image/jpeg",
                                "image/png",
                                "image/gif",
                                "image/webp",
                                "image/bmp",
                                "image/svg+xml"
                            ],
                            maxSize: 4444444
                        },
                        aspectRation: {
                            xAxis: 2,
                            yAxis: 2
                        },
                        gridConfig: {
                            span: 12,
                            order: 5
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                ]
            },
            {
                "Bank Account": [
                    {
                        name: "nickName",
                        label: "Nick Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Nick Name.",
                        gridConfig: {
                            span: 12,
                            order: 1
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Bank Name",
                        label: " Bank Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Bank Name.",
                        gridConfig: {
                            span: 12,
                            order: 2
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Account Number",
                        label: "Account Number",
                        type: "number",
                        isRequired: true,
                        placeholder: "Enter Account Number.",
                        gridConfig: {
                            span: 12,
                            order: 3
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "IFSC Code",
                        label: " IFSC Code",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter IFSC Code.",
                        gridConfig: {
                            span: 12,
                            order: 4
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Branch",
                        label: "Branch",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Branch.",
                        gridConfig: {
                            span: 12,
                            order: 5
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Overdraft Limit",
                        label: "Overdraft Limit",
                        type: "number",
                        isRequired: true,
                        placeholder: "Enter Overdraft Limit.",
                        gridConfig: {
                            span: 12,
                            order: 6
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                ]
            },
            {
                "Cash-in-hand": [
                    {
                        name: "nickName",
                        label: "Nick Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Nick Name.",
                        gridConfig: {
                            span: 12,
                            order: 1
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Cash Type",
                        label: "Cash Type",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Cash Type.",
                        gridConfig: {
                            span: 12,
                            order: 2
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Description",
                        label: "Description",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Description.",
                        gridConfig: {
                            span: 12,
                            order: 3
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                ]
            },
            {
                "Deposits (Asset)": [
                    {
                        name: "nickName",
                        label: "Nick Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Nick Name.",
                        gridConfig: {
                            span: 12,
                            order: 1
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Deposits Type",
                        label: "Deposits Type",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Deposits Type.",
                        gridConfig: {
                            span: 12,
                            order: 2
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Description",
                        label: "Description",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Description.",
                        gridConfig: {
                            span: 12,
                            order: 3
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                ]
            },
            {
                "Loans & Advances (Asset)": [
                    {
                        name: "nickName",
                        label: "Nick Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Nick Name.",
                        gridConfig: {
                            span: 12,
                            order: 1
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Borrower Name",
                        label: "Borrower Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Borrower Name.",
                        gridConfig: {
                            span: 12,
                            order: 2
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Loan/Advance Type",
                        label: "Loan/Advance Type",
                        type: "select",
                        options: [
                            "Employee Advance,",
                            "Vendor Prepayment",
                            "Other"
                        ],
                        isRequired: true,
                        gridConfig: {
                            span: 12,
                            order: 3
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Description",
                        label: "Description",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Description.",
                        gridConfig: {
                            span: 12,
                            order: 4
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                ]
            },
            {
                "Stock-in-hand": [
                    {
                        name: "nickName",
                        label: "Nick Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Nick Name.",
                        gridConfig: {
                            span: 12,
                            order: 1
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Stock Valuation Method",
                        label: "Stock Valuation Method",
                        type: "select",
                        isRequired: true,
                        options: [
                            "FIFO",
                            "Weighted Average"
                        ],
                        gridConfig: {
                            span: 12,
                            order: 2
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Description",
                        label: "Description",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Description.",
                        gridConfig: {
                            span: 12,
                            order: 3
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                ]
            },
            {
                "Sundry Debtors": [
                    {
                        name: "nickName",
                        label: "Nick Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Nick Name.",
                        gridConfig: {
                            span: 12,
                            order: 1
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Address",
                        label: "Address",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Address.",
                        gridConfig: {
                            span: 12,
                            order: 2
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "PIN Code",
                        label: "PIN Code",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter PIN Code.",
                        gridConfig: {
                            span: 12,
                            order: 3
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "State",
                        label: "State",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter State.",
                        gridConfig: {
                            span: 12,
                            order: 4
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },

                    {
                        name: "Country",
                        label: "Country",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Country.",
                        gridConfig: {
                            span: 12,
                            order: 5
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Registration Type",
                        label: "Registration Type",
                        type: "select",
                        isRequired: true,
                        options: [
                            "regular",
                            "composition",
                            "unregistered"
                        ],
                        gridConfig: {
                            span: 12,
                            order: 6
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "PAN",
                        label: "PAN",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter PAN.",
                        gridConfig: {
                            span: 12,
                            order: 7
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Contact Person",
                        label: "Contact Person",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Contact Person.",
                        gridConfig: {
                            span: 12,
                            order: 8
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Phone",
                        label: "Phone",
                        type: "number",
                        isRequired: true,
                        placeholder: "Enter Phone.",
                        gridConfig: {
                            span: 12,
                            order: 9
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Email",
                        label: "Email",
                        type: "email",
                        isRequired: true,
                        placeholder: "Enter Email.",
                        gridConfig: {
                            span: 12,
                            order: 10
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Description",
                        label: "Description",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Description.",
                        gridConfig: {
                            span: 12,
                            order: 11
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                ]
            },
            {
                "Duties & Taxes": [
                    {
                        name: "nickName",
                        label: "Nick Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Nick Name.",
                        gridConfig: {
                            span: 12,
                            order: 1
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Description",
                        label: "Description",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Description.",
                        gridConfig: {
                            span: 12,
                            order: 2
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                ]
            },
            {
                "Sundry Creditor": [
                    {
                        name: "nickName",
                        label: "Nick Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Nick Name.",
                        gridConfig: {
                            span: 12,
                            order: 1
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Address",
                        label: "Address",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Address.",
                        gridConfig: {
                            span: 12,
                            order: 2
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "PIN Code",
                        label: "PIN Code",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter PIN Code.",
                        gridConfig: {
                            span: 12,
                            order: 3
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "State",
                        label: "State",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter State.",
                        gridConfig: {
                            span: 12,
                            order: 4
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },

                    {
                        name: "Country",
                        label: "Country",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Country.",
                        gridConfig: {
                            span: 12,
                            order: 5
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Registration Type",
                        label: "Registration Type",
                        type: "select",
                        isRequired: true,
                        options: [
                            "regular",
                            "composition",
                            "unregistered"
                        ],
                        gridConfig: {
                            span: 12,
                            order: 6
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "PAN",
                        label: "PAN",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter PAN.",
                        gridConfig: {
                            span: 12,
                            order: 7
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Contact Person",
                        label: "Contact Person",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Contact Person.",
                        gridConfig: {
                            span: 12,
                            order: 8
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Phone",
                        label: "Phone",
                        type: "number",
                        isRequired: true,
                        placeholder: "Enter Phone.",
                        gridConfig: {
                            span: 12,
                            order: 9
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Email",
                        label: "Email",
                        type: "email",
                        isRequired: true,
                        placeholder: "Enter Email.",
                        gridConfig: {
                            span: 12,
                            order: 10
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Description",
                        label: "Description",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Description.",
                        gridConfig: {
                            span: 12,
                            order: 11
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                ]
            },
        ]

        childLedgerGruop.map((item) => {
            const name = item.groupName;
            const id = item._id
            childLedgerFieldArray.map(async (field) => {
                const gName = Object.keys(field)[0];
                if (gName === name) {
                    const fieldsArray = field[gName];
                    console.log("fieldsArray", fieldsArray);

                    const newFieldArray = fieldsArray.map((f) => {
                        return {
                            ...f,
                            groupId: id
                        }
                    });
                    console.log("newFieldArray", newFieldArray);
                    const b = await CustomField.insertMany(newFieldArray);
                }
            })
        });

    } catch (error) {
        console.log("error while generating the ledger group", error);
    }
}





module.exports = {
    generateLedgerGroup
};