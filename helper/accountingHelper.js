const customFieldSchema = require("../client/model/customField");
const clientLedgerGroupSchema = require("../client/model/ledgerGroup");
const clientVoucharGroupSchema = require("../client/model/voucherGroup");
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


        const primaryGroup = [
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Assets",
                hasParent: false,
                isMaster: true,
                isPrimary: true,
                createdBy: mainUser._id,
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Liabilities",
                hasParent: false,
                isMaster: true,
                isPrimary: true,
                createdBy: mainUser._id,
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Income",
                hasParent: false,
                isMaster: true,
                isPrimary: true,
                createdBy: mainUser._id,
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Expense",
                hasParent: false,
                isMaster: true,
                isPrimary: true,
                createdBy: mainUser._id,
            },

        ];

        const priamryDataArray = primaryGroup.map((item) => {
            const newMapedData = { ...item }
            return Object.assign(newMapedData, levelConfig[level])
        });


        const clientConnection = await getClientDatabaseConnection(clientId);
        const LedgerGroup = clientConnection.model("ledgerGroup", clientLedgerGroupSchema);
        const CustomField = clientConnection.model("customField", customFieldSchema);
        const primaryLedgerGruop = await LedgerGroup.insertMany(priamryDataArray);


        const nonPrimaryData = [
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Capital Account",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Liabilities"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Current Asset",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Assets"

            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Current Liabilities",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Liabilities"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Direct Expense",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Expense"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Direct Income",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Income"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Fixed Assets",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Assets"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Indirect Expense",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Expense"

            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Indirect Income",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Income"

            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Investments",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Assets"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Loans (Liability)",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Liabilities"
            },
        ];

        const newInsetArrayForNonPrimaryLedger = nonPrimaryData.map((child) => {
            const parentName = child?.parentGroup;
            let parentId = null;
            primaryLedgerGruop.map((parent) => {
                if (parent?.groupName == parentName) {
                    parentId = parent._id
                }
            });
            return {
                ...child,
                parentGroup: parentId
            }
        });

        const dataArrayNonPrimaryLedgerGroup = newInsetArrayForNonPrimaryLedger.map((item) => {
            const newMapedData = { ...item }
            return Object.assign(newMapedData, levelConfig[level])
        });

        const nonPrimaryLedgerGruop = await LedgerGroup.insertMany(dataArrayNonPrimaryLedgerGroup);

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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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

        nonPrimaryLedgerGruop.map((item) => {
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
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Capital Account"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Cash-At-Bank",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Current Asset"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Cash-in-hand",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Current Asset"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Deposits (Asset)",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Current Asset"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Loans & Advances (Asset)",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Current Asset"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Stock-in-hand",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Current Asset"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Sundry Debtors",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Current Asset"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Duties & Taxes",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Current Liabilities"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Sundry Creditor",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Current Liabilities"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Salary-Payable",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Current Liabilities"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Wages-Payable",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Current Liabilities"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Bill-Payable",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Current Liabilities"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Bank Over Draft",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Current Liabilities"
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                groupName: "Bill-Receivable",
                hasParent: true,
                isMaster: true,
                createdBy: mainUser._id,
                parentGroup: "Current Asset"
            },
        ];

        const newInsetArrayForChildLedger = childLedgerArray.map((child) => {
            const parentName = child?.parentGroup;
            let parentId = null;
            nonPrimaryLedgerGruop.map((parent) => {
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
                        isRequired: false,
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
                        isRequired: false,
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
                "Cash-At-Bank": [
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                        isRequired: false,
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
                "Salary-Payable": [
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
                        name: "Phone",
                        label: "Phone",
                        type: "number",
                        isRequired: true,
                        placeholder: "Enter Phone.",
                        gridConfig: {
                            span: 12,
                            order: 2
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
                            order: 3
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
                            order: 4
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
                            order: 5
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
                            order: 6
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
                            order: 7
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
                            order: 8
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
                            order: 9
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Description",
                        label: "Description",
                        type: "text",
                        isRequired: false,
                        placeholder: "Enter Description.",
                        gridConfig: {
                            span: 12,
                            order: 10
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                ]
            },
            {
                "Wages-Payable": [
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
                        name: "Employee/Employee Group",
                        label: "Employee/Employee Group",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter employee group name ...",
                        gridConfig: {
                            span: 12,
                            order: 2
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Wages Payable Amount",
                        label: "Wages Payable Amount",
                        type: "number",
                        isRequired: true,
                        placeholder: "Enter Wages Payable Amount.",
                        gridConfig: {
                            span: 12,
                            order: 3
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Wages Period",
                        label: "Wages Period",
                        type: "select",
                        isRequired: true,
                        options: [
                            "Weekly",
                            "Monthly",
                            "Yearly",
                            "Bi-weekly"
                        ],
                        gridConfig: {
                            span: 12,
                            order: 4
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Gross Wages",
                        label: "Gross Wages",
                        type: "number",
                        isRequired: true,
                        placeholder: "Enter Gross Wages.",
                        gridConfig: {
                            span: 12,
                            order: 5
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Total Deductions",
                        label: "Total Deductions",
                        type: "number",
                        isRequired: false,
                        placeholder: "Enter Deduction...",
                        gridConfig: {
                            span: 12,
                            order: 6
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Net Wages",
                        label: "Net Wages",
                        type: "number",
                        isRequired: true,
                        placeholder: "Enter Net Wages.",
                        gridConfig: {
                            span: 12,
                            order: 7
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },

                    {
                        name: "Working Hours",
                        label: "Working Hours",
                        type: "number",
                        isRequired: false,
                        placeholder: "Enter Working Hours..",
                        gridConfig: {
                            span: 12,
                            order: 8
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Wage Classification",
                        label: "Wage Classification",
                        type: "select",
                        isRequired: false,
                        options: [
                            "regular wages",
                            "contract wages",
                            "temporary wages"
                        ],
                        gridConfig: {
                            span: 12,
                            order: 9
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Remarks",
                        label: "Remarks",
                        type: "text",
                        isRequired: false,
                        placeholder: "Enter Remarks",
                        gridConfig: {
                            span: 12,
                            order: 10
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                ]
            },
            {
                "Bill-Payable": [
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
                        name: "Vendor/Supplier Name",
                        label: "Vendor/Supplier Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Vendor/Supplier Name ...",
                        gridConfig: {
                            span: 12,
                            order: 2
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Bill Amount",
                        label: "Bill Amount",
                        type: "number",
                        isRequired: true,
                        placeholder: "Enter Bill Amount.",
                        gridConfig: {
                            span: 12,
                            order: 3
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Bill Number / Invoice Number",
                        label: "Bill Number / Invoice Number",
                        type: "text",
                        isRequired: false,
                        placeholder: "Enter Bill Number / Invoice Number.",
                        gridConfig: {
                            span: 12,
                            order: 4
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Date of Bill",
                        label: "Date of Bill",
                        type: "date",
                        isRequired: true,
                        gridConfig: {
                            span: 12,
                            order: 5
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Due Date",
                        label: "Due Date",
                        type: "date",
                        isRequired: false,
                        gridConfig: {
                            span: 12,
                            order: 6
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Payment Terms",
                        label: "Payment Terms",
                        type: "number",
                        isRequired: true,
                        placeholder: "Enter Payment Terms.",
                        gridConfig: {
                            span: 12,
                            order: 7
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Goods/Services Provided",
                        label: "Goods/Services Provided",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Goods/Services Provided..",
                        gridConfig: {
                            span: 12,
                            order: 8
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Taxes",
                        label: "Taxes",
                        type: "number",
                        isRequired: false,
                        placeholder: "Enter Taxes..",
                        gridConfig: {
                            span: 12,
                            order: 9
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Discounts",
                        label: "Discounts",
                        type: "number",
                        isRequired: false,
                        placeholder: "Enter Discounts..",
                        gridConfig: {
                            span: 12,
                            order: 10
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Total Payable Amount",
                        label: "Total Payable Amount",
                        type: "number",
                        isRequired: true,
                        placeholder: "Enter Total Payable Amount..",
                        gridConfig: {
                            span: 12,
                            order: 11
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Remarks",
                        label: "Remarks",
                        type: "text",
                        isRequired: false,
                        placeholder: "Enter Remarks",
                        gridConfig: {
                            span: 12,
                            order: 12
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                ]
            },
            {
                "Bill-Receivable": [
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
                        name: "Customer / Party Name",
                        label: "Customer / Party Name",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Customer / Party Name ...",
                        gridConfig: {
                            span: 12,
                            order: 2
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Bill Amount",
                        label: "Bill Amount",
                        type: "number",
                        isRequired: true,
                        placeholder: "Enter Bill Amount.",
                        gridConfig: {
                            span: 12,
                            order: 3
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Tax Amount",
                        label: "Tax Amount",
                        type: "number",
                        isRequired: false,
                        placeholder: "Enter Tax Amount.",
                        gridConfig: {
                            span: 12,
                            order: 4
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "GST / VAT / Sales Tax",
                        label: "GST / VAT / Sales Tax",
                        type: "number",
                        isRequired: false,
                        placeholder: "Enter GST / VAT / Sales Tax.",
                        gridConfig: {
                            span: 12,
                            order: 5
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Total Bill Value",
                        label: "Total Bill Value",
                        type: "number",
                        isRequired: true,
                        placeholder: "Enter Total Bill Value.",
                        gridConfig: {
                            span: 12,
                            order: 6
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Bill / Invoice Number",
                        label: "Bill / Invoice Number",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter Bill / Invoice Number.",
                        gridConfig: {
                            span: 12,
                            order: 7
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Bill Date",
                        label: "Bill Date",
                        type: "date",
                        isRequired: true,
                        gridConfig: {
                            span: 12,
                            order: 8
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Due Date",
                        label: "Due Date",
                        type: "date",
                        isRequired: false,
                        gridConfig: {
                            span: 12,
                            order: 9
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                    {
                        name: "Remarks",
                        label: "Remarks",
                        type: "text",
                        isRequired: false,
                        placeholder: "Enter Remarks",
                        gridConfig: {
                            span: 12,
                            order: 10
                        },
                        isDeleteAble: false,
                        createdBy: mainUser?._id,
                    },
                ]
            },
            {
                "Bank Over Draft": [
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

async function generateVoucherGroup(businessId, branchId, warehouseId, level = "business", mainUser, clientId) {
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
                name: "Payment",
                code: "PAY",
                category: "Accounting",
                description: "Voucher used for payments to vendors, employees and more.",
                resetFrequency: "yearly",
                isMaster: true,
                createdBy: mainUser._id,
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                name: "Receipt",
                code: "REC",
                category: "Accounting",
                description: "Voucher used for receiving cash or payments from customers.",
                resetFrequency: "yearly",
                isMaster: true,
                createdBy: mainUser._id,
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                name: "Contra",
                code: "CONTRA",
                category: "Accounting",
                description: "Voucher used for internal transfers like bank to cash and vice versa.",
                resetFrequency: "yearly",
                isMaster: true,
                createdBy: mainUser._id,
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                name: "Sales",
                code: "SALE",
                category: "Accounting",
                description: "Voucher used for recording sales transactions.",
                resetFrequency: "yearly",
                isMaster: true,
                createdBy: mainUser._id,
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                name: "Purchase",
                code: "PURCHASE",
                category: "Accounting",
                description: "Voucher used for recording purchases from vendors.",
                resetFrequency: "yearly",
                isMaster: true,
                createdBy: mainUser._id,
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                name: "Journal",
                code: "JOURNAL",
                category: "Accounting",
                description: "Voucher used for non-cash transactions like adjustments, depreciation, etc.",
                resetFrequency: "yearly",
                isMaster: true,
                createdBy: mainUser._id,
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                name: "Credit Note",
                code: "CREDIT_NOTE",
                category: "Accounting",
                description: "Issued for sales returns or adjustments.",
                resetFrequency: "yearly",
                isMaster: true,
                createdBy: mainUser._id,
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                name: "Debit Note",
                code: "DEBIT_NOTE",
                category: "Accounting",
                description: "Issued for purchase returns or adjustments.",
                resetFrequency: "yearly",
                isMaster: true,
                createdBy: mainUser._id,
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                name: "Expense",
                code: "EXPENSE",
                category: "Accounting",
                description: "Voucher used for recording business expenses.",
                resetFrequency: "yearly",
                isMaster: true,
                createdBy: mainUser._id,
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                name: "Income",
                code: "INCOME",
                category: "Accounting",
                description: "Voucher used for recording non-sales income transactions.",
                resetFrequency: "yearly",
                isMaster: true,
                createdBy: mainUser._id,
            },
            {
                businessUnit: businessId,
                branch: branchId,
                warehouse: warehouseId,
                name: "Proforma",
                code: "PROFORMA",
                category: "Accounting",
                description: "Provisional voucher used for draft or pre-approval purposes.",
                resetFrequency: "yearly",
                isMaster: true,
                createdBy: mainUser._id,
            },

        ]

        const dataArray = data.map((item) => {
            const newMapedData = { ...item }
            return Object.assign(newMapedData, levelConfig[level])
        });

        console.log("dataArray", dataArray);

        const clientConnection = await getClientDatabaseConnection(clientId);
        const VoucherGroup = clientConnection.model("voucherGroup", clientVoucharGroupSchema);
        await VoucherGroup.insertMany(dataArray);



    } catch (error) {
        console.log("error while generating the ledger group", error);
    }
}




module.exports = {
    generateLedgerGroup,
    generateVoucherGroup
};