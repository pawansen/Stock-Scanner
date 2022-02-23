var express = require("express");
const UserController = require("../controllers/UserController");
const InterestedController = require('../controllers/InterestedController');
const RestaurantsController = require('../controllers/RestaurantsController');
const PostController = require('../controllers/PostController');
const PackageController = require('../controllers/PackageController');
var router = express.Router();

/**user controller**/
router.post('/register',UserController.register);
router.post('/login',UserController.login);
router.post('/social-signin',UserController.socialSignIn);
router.post('/verify-otp',UserController.VerifyConfirmOtp);
router.post('/forgot-password-sent-otp',UserController.forgotPasswordSentOtp);
router.post('/reset-password',UserController.resetPassword);
router.post('/resend-verify-otp',UserController.resendConfirmOtp);
router.post('/update-profile',UserController.UpdateUserProfile);
router.post('/update-username',UserController.UpdateUsername);
router.post('/update-profile-image',UserController.updateProfilePic);
router.post('/change-password',UserController.changePassword);
router.post('/get-notifications-count',UserController.getNotificationsCount);
router.post('/get-notifications',UserController.getNotifications);
router.post('/post-notification-on-off',PostController.OwnerPostNotifyOnOff);
router.get('/get-stock-data',UserController.addYahooStockData);

/** intersted controller**/
router.post('/add-interested',InterestedController.addInterested);
router.post('/get-interested',InterestedController.getInterested);

/** restaurants contoller**/
router.post('/add-restaurant',RestaurantsController.addRestaurant);
router.post('/get-restaurants',RestaurantsController.getRestaurant);
router.post('/get-restaurant-details',RestaurantsController.getRestaurantDetails);
router.post('/update-restaurant',RestaurantsController.updateRestaurant);

/** social **/
router.post('/get-users-suggestions',UserController.getUsersSuggestions);
router.post('/add-friend-request',UserController.addFriendRequest);
router.post('/friend-request-status-update',UserController.friendRequestUpdateStatus);
router.post('/get-friends-list',UserController.getFriendsList);
router.post('/get-user-match-list',UserController.getUsersMatchList);
router.post('/add-user-match-request',UserController.addUserMatchRequest);
router.post('/match-request-status-update',UserController.matchRequestUpdateStatus);
router.post('/get-profile-details',UserController.getProfileDetails);
router.post('/update-notification',UserController.updateNotification);
router.post('/remove-friend',UserController.removeFriend);
router.post('/add-user-report-block',UserController.addUserReportBlock);
router.post('/remove-user-report-block',UserController.removeUserReportBlock);
router.post('/get-user-blocked',UserController.getUserBlocked);
router.post('/get-business-restaurants',UserController.getBusinessRestaurants);
/** post **/
router.post('/add-media',PostController.addMedia);
router.post('/add-post-feed',PostController.addPostFeed);
router.post('/get-post-feed',PostController.getPostFeed);
router.post('/get-my-post-feed',PostController.getMyPostFeed);
router.post('/add-post-like-unlike',PostController.addPostLike);
router.post('/get-post-likes',PostController.getPostLikes);
router.post('/post-file-save-gallery',PostController.PostFileSaveToGallery);
router.post('/get-post-save-gallery',PostController.getPostSavedGallery);
router.post('/add-post-comment',PostController.addPostComment);
router.post('/get-post-comments',PostController.getPostComments);
router.post('/delete-post-comment',PostController.deletePostComment);
router.post('/reported-post-comment',PostController.reportedPostComment);
router.post('/delete-post',PostController.deletePost);
router.post('/post-comment-on-off',PostController.OwnerPostCommentOnOff);
router.post('/get-chat-users',PostController.getChatUsers);
router.post('/get-chat-message',PostController.getChatMessage);
router.post('/add-chat-media',PostController.addChatMedia);
router.post('/delete-chat-message',PostController.deleteChatMessage);
router.post('/delete-chat-room',PostController.deleteChatRoom);
router.post('/add-chat-request',PostController.addChatRequest);
router.post('/chat-request-status-update',PostController.chatRequestUpdateStatus);
/** couple **/
router.post('/join-couple-code',UserController.JoinCoupleCode);
router.post('/get-couple-profile',UserController.getCoupleProfile);
router.post('/create-relationship',UserController.createRelationship);
router.post('/update-status-relationship',UserController.updateStatusRelationship);
router.post('/leave-relationship',UserController.LeaveRelationship);
router.post('/update-couple-profile',UserController.updateCoupleProfile);
/** create date **/
router.post('/create-date-get-partner-list',UserController.CreateDateGetPartnerList);
router.post('/create-date-request-partner',UserController.CreateDateRequestPartner);
router.post('/create-date-get-my-partner-request',UserController.CreateDateGetMyPartnerRequest);
router.post('/create-date-status-update-request-partner',UserController.CreateDateStatusUpdatePartnerRequest);
router.post('/delete-date-request',UserController.DeleteDateRequest);
router.post('/get-my-create-date-request-status',UserController.GetMycreateDateRequestStatus);

/** package & coupons **/
router.post('/add-coupon',PackageController.addCoupon);
router.post('/get-coupons',PackageController.getCoupons);
router.post('/purchase-coupons',PackageController.PurchaseCoupon);
router.post('/get-my-coupons',PackageController.getMyCoupons);
router.post('/finish-date',UserController.finishDate);
router.post('/add-faq',PackageController.addFaq);
router.post('/get-faq',PackageController.getFaq);
router.post('/get-packages',PackageController.getPackages);
router.post('/get-package-details',PackageController.getPackages);
router.post('/get-stores',PackageController.getStores);
router.post('/add-business-coupon',PackageController.addBusinessCoupon);
router.post('/update-business-coupon',PackageController.updateBusinessCoupon);
router.post('/delete-business-coupon',PackageController.deleteBusinessCoupon);
router.post('/get-business-coupons',PackageController.getBusinessCoupons);
router.post('/add-business-image',UserController.addBusinessImage);
module.exports = router;