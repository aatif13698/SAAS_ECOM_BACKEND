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
            }
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




        // const group = await LedgerGroup.findById(ledgerGruop._id).populate({
        //     path: 'parentGroup',
        //     model: LedgerGroup,
        // });

        const fieldArray2 = [
            {
                name: "Capital Account",
                subGroups: [
                    {
                        name: "Surplus",
                        fields: [
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
                                name: "Dasu",
                                label: "dasu",
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

                        ]
                    },

                ],
                fields: [
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
                        name: "abc",
                        label: "ABC",
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


                ]
            }
        ]

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
                        name: "abc",
                        label: "ABC",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter abc.",
                        gridConfig: {
                            span: 12,
                            order: 1
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
                        name: "xyz",
                        label: " XYZ",
                        type: "text",
                        isRequired: true,
                        placeholder: "Enter xyz.",
                        gridConfig: {
                            span: 12,
                            order: 1
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
        })



    } catch (error) {
        console.log("error while generating the ledger group", error);
    }

}





module.exports = {
    generateLedgerGroup
};