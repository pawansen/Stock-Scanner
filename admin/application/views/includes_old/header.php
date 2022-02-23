<!DOCTYPE html>
<html lang="en-US">
<head>
	<meta charset="utf-8">
	<meta name="robots" content="no-cache">
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
	<title><?php echo SITE_NAME;?></title>
	<base href="<?php echo base_url(); ?>">
	<!-- FONT -->
	<link href='https://fonts.googleapis.com/css?family=Noto+Sans|Roboto:300,400,500|Poppins:100,200,300,400,500,600' rel='stylesheet'>
	<!-- BOOTSTRAP CSS -->
	 <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous"> 
	<!-- <link rel="stylesheet"  href="https://blackrockdigital.github.io/startbootstrap-sb-admin-2/vendor/bootstrap/css/bootstrap.min.css">
 -->	<!-- Alertify CSS -->
	<link rel="stylesheet" href="<?php echo base_url(); ?>asset/plugins/alertify/css/alertify.min.css" />
	<link rel="stylesheet" href="<?php echo base_url(); ?>asset/plugins/alertify/css/themes/bootstrap.min.css"/>
	<!-- Plugins CSS -->
	<?php if(!empty($css)){foreach($css as $value){?>
		<link rel="stylesheet" href="<?php echo $value; ?>" />
	<?php }} ?>
	<!-- CUSTOM CSS -->
	<link rel="stylesheet" href="asset/css/app.css" type="text/css" media="screen" />
	<link rel="stylesheet" href="asset/css/custom.css" type="text/css" media="screen" />
	


	<!-- Jquery -->
	<script src="https://code.jquery.com/jquery-2.2.4.min.js" integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=" crossorigin="anonymous"></script>


	<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js"></script>

	<!-- AngularJS -->
	<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.6/angular.min.js"></script>
	<script src="asset/plugins/ng-infinite-scroll.min.js"></script>
	<link href="<?php echo base_url(); ?>asset/css/select2.css" rel="stylesheet"/>
	<script src="<?php echo base_url(); ?>asset/js/select2.js"></script>
	<script type="text/javascript" src="https://cdn.jsdelivr.net/momentjs/latest/moment.min.js"></script>
</head>
<body ng-app="myApp" ng-cloak ng-controller="MainController">

