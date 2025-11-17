import express from 'express';
import { authentication, authorizationAccess, filterRestrictedStaffFields } from '../middlewares/auth.middleware.js';
import { clear_vendors, confirm_otp, get_dashboard, get_me, get_vendor_byId, get_vendors, remove_vendor_profile, update_vendor_profile, vendor_filters, vendor_signup } from '../controllers/vendor.controller.js';
import { Upload } from '../middlewares/upload.middleware.js';
const router = express.Router();

/* @description -> To sign-up as vendor
   @end-Point -> /api/vendor/sign-up
   @methtod -> POST
   @access -> Private (user) 
*/
router.post('/sign-up', authentication, authorizationAccess('Vendor', 'isCreate'), vendor_signup);

/* @description -> To confirm-otp and update in vendor & user records
   @end-Point -> /api/vendor/confirm-otp
   @methtod -> POST
   @access -> Private (user) 
*/
router.post('/confirm-otp', authentication, authorizationAccess('Vendor', 'isCreate'), Upload('LOGO-').single('logoUrl'), confirm_otp);

/* @description -> To get profile
   @end-Point -> /api/user/me
   @methtod -> GET
   @access -> Private (userId===req.user.id) 
*/
router.post('/me', authentication, authorizationAccess('Vendor', 'isRead'), get_me);

/* @description -> To read all vendors records
   @end-Point -> /api/vendor/view
   @methtod -> GET
   @access -> Private (admin) 
*/
router.get('/view', authentication, authorizationAccess('Vendor', 'isRead'), get_vendors);

/* @description -> To get vedor record byId
   @end-Point -> /api/vendor/view/:id
   @methtod -> GET
   @access -> Private (admin) 
*/
router.get('/view/:id', authentication, authorizationAccess('Vendor', 'isRead'), get_vendor_byId);

/* @description -> To update vedor record byId
   @end-Point -> /api/vendor/view/:id
   @methtod -> PATCH
   @access -> Private (vendor/admin) 
*/
router.patch('/:id/update', authentication, authorizationAccess('Vendor', 'isUpdate'), filterRestrictedStaffFields, Upload('LOGO-').fields([{ name: 'logoUrl', maxCount: 1 }, { name: 'documents', maxCount: Number(process.env.MAX_VENDOR_DOCUMENTS) ?? 2 }]), update_vendor_profile);

/* @description -> To delete vendor record byId
   @end-Point -> /api/vendor/:id/delete
   @methtod -> DELETE
   @access -> Private (vendor/admin) 
*/
router.delete('/:id/delete', authentication, authorizationAccess('Vendor', 'isDelete'), remove_vendor_profile);

/* @description -> To clear vendors
   @end-Point -> /api/vendor/clear
   @methtod -> DELETE
   @access -> Private (admin) 
*/
router.delete('/clear', authentication, authorizationAccess('Vendor', 'isDelete'), clear_vendors);

/* @description -> To filter
   @end-Point -> /api/vendor/filter
   @methtod -> GET 
*/
router.get('/filters', authentication, authorizationAccess('Vendor', 'isRead'), vendor_filters);

export default router;