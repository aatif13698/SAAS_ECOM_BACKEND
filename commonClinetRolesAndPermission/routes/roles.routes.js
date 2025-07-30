

const express = require("express");
let router = express.Router();



const rolesAndPermissionContrller = require("../controller/role.controller");

const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { tokenAuth } = require("../../middleware/authorization/superAdmin");


// # create, update, view, list,  delete RolesAndPermission by business unit routes starts here

router.post('/createRolesAndPermission', entityAuth.authorizeEntity("Administration", "Roles & Permissions", "create"), rolesAndPermissionContrller.createRolesAndPermissionByBusinessUnit);

router.put('/updateRolesAndPermission', entityAuth.authorizeEntity("Administration", "Roles & Permissions", "update"), rolesAndPermissionContrller.updateRoleAndPermissionByBusinessUnit);

router.get('/rolesAndPermission/:clientId/:roleId', entityAuth.authorizeEntity("Administration", "Roles & Permissions", "view"), rolesAndPermissionContrller.getParticularRoleAndPermissionByBusinessUnit);

router.get('/listRolesAndPermission', entityAuth.authorizeEntity("Administration", "Roles & Permissions", "view"), rolesAndPermissionContrller.listRolesAndPermission);

router.post("/softDeleteRolesAndPermission", entityAuth.authorizeEntity("Administration", "Roles & Permissions", "softDelete"), rolesAndPermissionContrller.softDeleteRolesAndPermissionByBusinesssUnit);

router.get('/getRolesList', tokenAuth, rolesAndPermissionContrller.getRolesList);

// router.post("/restoreRolesAndPermission", entityAuth.authorizeEntity( "Roles & Permissions", "delete"), rolesAndPermissionContrller.restoreRoleAndPermissionByBusinessUnit);


// # create, update, view, list, delete RolesAndPermission by business unit routes ends here






exports.router = router;
