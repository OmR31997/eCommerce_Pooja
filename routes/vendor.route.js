import express from 'express';
import { clear_vendors, confirm_otp, get_me, get_vendor_byId, get_vendors, remove_vendor_profile, update_vendor_profile, vendor_filters, vendor_signup } from '../controllers/vendor.controller.js';
import { Upload } from '../middlewares/upload.middleware.js';
import { AuthAccess } from '../middlewares/auth.middleware.js';

const router = express.Router();

/* @description -> To sign-up as vendor
   @end-Point -> /api/vendor/sign-up
   @methtod -> POST
   @access -> Private (user) 
*/
router.post('/sign-up', AuthAccess('Vendor', 'create'), vendor_signup);

/* @description -> To confirm-otp and update in vendor & user records
   @end-Point -> /api/vendor/confirm-otp
   @methtod -> POST
   @access -> Private (user) 
*/
router.post('/confirm-otp', AuthAccess('Vendor', 'create'), Upload('LOGO-').single('logoUrl'), confirm_otp);

/* @description -> To get profile
   @end-Point -> /api/user/me
   @methtod -> GET
   @access -> Private (vendor) 
*/
router.get('/me', AuthAccess('Vendor', 'read'), get_me);

/* @description -> To read all vendors records
   @end-Point -> /api/vendor/view
   @methtod -> GET
   @access -> Private (admin) 
*/
router.get('/view', AuthAccess('Vendor', 'read'), get_vendors);

/* @description -> To get vedor record byId
   @end-Point -> /api/vendor/view/:id
   @methtod -> GET
   @access -> Private (admin) 
*/
router.get('/view/:id', AuthAccess('Vendor', 'read'), get_vendor_byId);

/* @description -> To update vedor record byId
   @end-Point -> /api/vendor/view/:id
   @methtod -> PATCH
   @access -> Private (vendor/admin) 
*/
router.patch('/:id/update', AuthAccess('Vendor', 'update'),
   Upload('LOGO-').fields([
      { name: 'logoUrl', maxCount: 1 },
      { name: 'documents', maxCount: Number(process.env.MAX_VENDOR_DOCUMENTS) ?? 2 }
   ]), update_vendor_profile);

/* @description -> To delete vendor record byId
   @end-Point -> /api/vendor/:id/delete
   @methtod -> DELETE
   @access -> Private (vendor/admin) 
*/
router.delete('/:id/delete', AuthAccess('Vendor', 'delete'), remove_vendor_profile);

/* @description -> To clear vendors
   @end-Point -> /api/vendor/clear
   @methtod -> DELETE
   @access -> Private (admin) 
*/
router.delete('/clear', AuthAccess('Vendor', 'delete'), clear_vendors);

/* @description -> To filter
   @end-Point -> /api/vendor/filter
   @methtod -> GET 
*/
router.get('/filters', AuthAccess('Vendor', 'read'), vendor_filters);

export default router;