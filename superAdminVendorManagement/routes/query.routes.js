

const express = require("express");
let router = express.Router();
const auth = require("../../middleware/authorization/superAdmin");
const { body } = require('express-validator');

const supersuperAdminQueryController = require("../controller/quer.controller");

router.post(
  '/create/query',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email')
      .optional()
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  supersuperAdminQueryController.createQuery
);


router.get('/get/query', auth.superAdminAuth, supersuperAdminQueryController.getQueryList);

router.get('/get/query/:id', auth.superAdminAuth, supersuperAdminQueryController.getIndividualQuery);

router.post('/delete/query', auth.superAdminAuth, supersuperAdminQueryController.deleteQuery);

router.post('/restore/query', auth.superAdminAuth, supersuperAdminQueryController.restoreQuery);

router.post('/:id/reply', auth.superAdminAuth, supersuperAdminQueryController.addReply );



exports.router = router;
