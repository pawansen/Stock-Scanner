var express = require("express");
const UserController = require("../controllers/UserController");
const StockController = require('../controllers/StockController');
const StockCronController = require('../controllers/StockCronController');
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
router.post('/get-profile-details',UserController.getProfileDetails);

/** stock controller **/
router.post('/get-exchange-details',StockController.getExchangeDetails);
router.post('/get-stocks',StockController.getStocks);
router.post('/search-stocks',StockController.searchStocks);
router.post('/get-news-feed',StockController.getNewsFeed);
// router.get('/get-bonds-stock-list',StockController.getBondsStockList);
// router.get('/get-day-top-gainers-stock-list',StockController.getDaytopGainersList);
// router.get('/get-day-top-losers-stock-list',StockController.getDaytopLosersList);
// router.get('/get-most-active-stock-list',StockController.getMostActiveStockList);
// router.get('/get-stock-symbol',StockController.getSymbol);
// router.get('/get-stock-data',StockController.addYahooStockData);


/** crons **/
router.post('/cron/get-exchange-details',StockCronController.getExchangeDetails);
router.post('/cron/get-stock-bond-forex',StockCronController.getBondForexStock);
router.post('/cron/get-future-stock',StockCronController.getFutureStock);
router.post('/cron/upload-nasdaq-data',StockCronController.uploadNesdeqData);
router.post('/cron/upload-nyse-data',StockCronController.uploadNyseData);
router.post('/cron/get-news-live',StockCronController.getNewsLive);
module.exports = router;