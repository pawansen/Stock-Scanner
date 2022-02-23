var express = require("express");
const AdminController = require('../controllers/AdminController');
var router = express.Router();

/**Admin controller**/
router.post('/login',AdminController.login);
router.post('/register',AdminController.register);

/** question controller**/
router.post('/add-question',AdminController.addQuestion);
router.post('/get-questions',AdminController.getQuestions);
router.post('/get-question-details',AdminController.getQuestionDetails);
router.post('/update-question',AdminController.updateQuestion);

/** restaurant controller**/
router.post('/get-restaurant-details',AdminController.getRestaurantDetails);

/** intersted controller**/
router.post('/add-interested',AdminController.addInteresteds);
router.post('/get-interesteds',AdminController.getInteresteds);
router.post('/get-interested-details',AdminController.getInteresteds);
router.post('/update-interested',AdminController.updateInterested);
router.post('/add-faq',AdminController.addFaq);
router.post('/get-faqs',AdminController.getFaq);
router.post('/get-faq-details',AdminController.getFaq);
router.post('/update-faq',AdminController.updateFaq);

/** users **/
router.post('/get-users',AdminController.getUsers);
router.post('/get-profile-details',AdminController.getProfileDetails);
router.post('/get-user-post-feed',AdminController.getMyPostFeed);
router.post('/get-post-likes',AdminController.getPostLikes);
router.post('/get-post-comments',AdminController.getPostComments);
router.post('/get-friends-list',AdminController.getFriendsList);
router.post('/get-couple-profile',AdminController.getCoupleProfile);
router.post('/get-post-save-gallery',AdminController.getPostSavedGallery);
router.post('/get-user-transaction-history',AdminController.getUserTransactionHistory);
router.post('/get-user-coupon-history',AdminController.getUserCouponHistory);

/** package **/
router.post('/add-package',AdminController.addPackage);
router.post('/get-packages',AdminController.getPackages);
router.post('/get-package-details',AdminController.getPackages);
router.post('/update-package',AdminController.updatePackage);

/** store **/
router.post('/add-store',AdminController.addStore);
router.post('/get-stores',AdminController.getStores);
router.post('/get-store-details',AdminController.getStores);
router.post('/get-store-item-details',AdminController.getStoresItem);
router.post('/update-status-store-item',AdminController.updateStatusStoreItem);
//router.post('/update-store',AdminController.updateStore);

/** business **/
router.post('/get-business-coupons',AdminController.getBusinessCoupons);
router.post('/get-post-feed',AdminController.getPostFeed);
module.exports = router;