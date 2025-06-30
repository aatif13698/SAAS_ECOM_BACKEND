

const express = require("express");
let router = express.Router();
const auth = require("../../middleware/authorization/superAdmin");
const { body } = require('express-validator');

const supersuperAdminRequestController = require("../controller/request.controller");

router.post(
  '/create/request',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email')
      .optional()
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  supersuperAdminRequestController.createRequest
);


router.get('/get/demoRequest', auth.superAdminAuth, supersuperAdminRequestController.getDemoRequestList);

router.get('/get/demo/request/:id', auth.superAdminAuth, supersuperAdminRequestController.getIndividualRequest);

router.post('/delete/demoRequest', auth.superAdminAuth, supersuperAdminRequestController.deleteRequest);

router.post('/restore/demoRequest', auth.superAdminAuth, supersuperAdminRequestController.restoreRequest);

router.post('/:id/reply', auth.superAdminAuth, supersuperAdminRequestController.addReply );



exports.router = router;
