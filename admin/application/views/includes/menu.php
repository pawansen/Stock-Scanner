
<div class="top_header d-flex p-2 navbar-dark fixed-top">
    <div class="navbar-header col-md-2"> 
        
    <button class="menu-toggel navbar-toggler navbar-toggler-right text-white collapsed" type="button" data-toggle="collapse"> 
      <span class="navbar-toggler-icon"> </span> 
    </button>

        <a class="navbar-brand" href="#"><img src="<?php // echo API_URL;?>asset/img/emailer/logo.png" height="20"></a>
        <!-- a class="navbar-brand" href="#"><img src="<?php // echo API_URL;?>asset/img/emailer/logo.png" height="20"></a -->
    </div>
    <div class="col-md-2 offset-8 d-flex justify-content-around">
          <div class="notification dropdown">
              <ul class="navbar-nav">
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle text-white" href="#" id="navbardrop" data-toggle="dropdown">  <i class="fa fa-bell" aria-hidden="true"></i> </a>
                  
                  <div class="dropdown-menu dropdown-menu-right notify-list">
                      <ul  class="list-unstyled">
                        <li><div class="dropdown-title"> You have new notification </div></li>
                    
                          <div class="notif-center p-3">
                            <a href="#">
                              <div class="notif-icon bg-primary"> <i class="fa fa-user-plus"></i> </div>
                              <div class="notif-content pl-3">
                                <p class="mb-0"> New user registered </p>
                                <span class="time">5 minutes ago</span> 
                              </div>
                            </a>

                            <a href="#">
                              <div class="notif-icon bg-primary"> <i class="fa fa-user-plus"></i> </div>
                              <div class="notif-content pl-3">
                                <p class="mb-0"> New user registered </p>
                                <span class="time">5 minutes ago</span> 
                              </div>
                            </a>

                            <a href="#"  class="mb-0">
                              <div class="notif-icon bg-primary"> <i class="fa fa-user-plus"></i> </div>
                              <div class="notif-content pl-3">
                                <p class="mb-0"> New user registered </p>
                                <span class="time">5 minutes ago</span> 
                              </div>
                            </a>
                          </div>

                      </ul>
                  </div>
                </li>
              </ul>
          </div>

        <div class="dropdown">
          <ul class="navbar-nav">
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle text-white" href="#" id="navbardrop" data-toggle="dropdown"> Welcome Admin </a>
              <div class="dropdown-menu dropdown-menu-right" data-display="static">
                  <a class="dropdown-item" href="<?php echo base_url('dashboard/update_password');?>" >Change Password</a>
                <a class="dropdown-item" href="<?php $sdata = $this->session->userdata('UserData'); echo base_url().'signin/signout/'.$sdata['id'];?>">Sign Out</a>
              </div>    
            </li>
          </ul>
        </div> 
    </div>
</div> 
<div class="main-navbar">
<nav class="navbar navbar-expand-sm fixed-top navigation">
      <div class="container-fluid">
    <!-- navigation -->
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav">
            <li class="nav-item mt-3">        
            <a class="nav-link" href="<?php echo base_url('dashboard');?>"><i class="flaticon-home"></i>Dashboard</a>
            </li>           
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbardrop" data-toggle="dropdown">
              <i class="flaticon-user"></i>Questions
            </a>
            <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu">
                <li><a class="dropdown-item" href="<?php echo base_url('question');?>">List Questions</a></li>
                <li><a class="dropdown-item" href="<?php echo base_url('question/add');?>">Add Questions</a></li>
            </ul>
          </li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbardrop" data-toggle="dropdown">
              <i class="flaticon-user"></i>Restaurants
            </a>
            <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu">
                <li><a class="dropdown-item" href="<?php echo base_url('restaurant');?>">List Restaurants</a></li>
                <li><a class="dropdown-item" href="<?php echo base_url('restaurant/add');?>">Add Restaurant</a></li>
            </ul>
          </li>
    </ul>
    </div>


    <!-- /navigation -->

    <div class="attr-nav w-100"> 
      <!-- Right nav -->

    <!--   <div class="dropdown">
        <div class="nav-item">

          <a class="nav-link" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" ng-click="getNotifications();">
            <i class="fa fa-bell-o fa-lg text-white" ></i>
            <span class="badge" ng-show="data.notificationCount>0">{{data.notificationCount}}</span>
          </a>

          <ul class="dropdown-menu notification_menu">
            <li class="text-light bg-dark px-2 py-2">Notifications</li>

            <li class="notification-box text-center" ng-if="!notificationList">
              <a class="dropdown-item" href="javascript:void(0)">
              <div class="row">
                <div class="not-txt">
                  No new notifications.
                </div>
              </div>
            </a>
          </li>

          <li class="notification-box" ng-repeat="(key, row) in notificationList">
            <a class="dropdown-item" href="./order" target="_self">
            <div class="row">
              <div class="not-txt">
                {{row.NotificationText}}
              </div>
              <div class="not-date"><small class="text-warning">{{row.EntryDate}}</small></div>
            </div>
          </a>
        </li>

      </ul>
    </div>
    </div> -->
    </div>
    </div>
    </nav>

    <div id="mainFrame">
    <?php 
        if($this->session->flashdata('message')){ ?>
        <div class="alert alert-<?php echo ($this->session->flashdata('msgtype'))?$this->session->flashdata('msgtype'):'danger'; ?>" id="alert-message" style="padding: 5px; font-size: large; text-align: center;">
            <?php    echo $this->session->flashdata('message'); ?>
        </div>
    <?php } ?>
      <div class="container-fluid">
        <section class="block">
            


