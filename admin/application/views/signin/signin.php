<?php 
if($this->session->flashdata('message')){ ?>
<div class="alert alert-<?php echo ($this->session->flashdata('msgtype'))?$this->session->flashdata('msgtype'):'danger'; ?>" id="alert-message" style="padding: 5px; font-size: large; text-align: center;">
    <?php    echo $this->session->flashdata('message'); ?>
</div>
<?php } ?>
<div class="container" ng-controller="PageController"> 
 <!-- div id="logo" class="text-center"><img src="<?php // echo API_URL;?>asset/img/emailer/logo.png"></div --!> 
  <!-- Form -->
  <div class="col-12 col-sm-11 col-md-8 col-lg-6 col-xl-5 login-block">
    <h1 class="h3">Admin Sign in</h1>
    <br>
    <p>Please enter your credentials.</p>       
    <br>
    <form method="post" id="login_form" name="login_form"  autocomplete='off'>
      <div class="form-group">
        <input type="text" name="Username" class="form-control form-control-lg" placeholder="Username"  autofocus="">
      </div>

      <div class="form-group">
        <input type="password" name="Password" class="form-control form-control-lg" placeholder="Password">
      </div>

      <div class="form-group">
        <button type="submit" name="submit_button" class="btn btn-success btn-sm" ng-disabled="processing" ng-click="signIn()">Sign in</button>
        <span class="float-right"><a href="recovery" class="a">Forgot password?</a></span>
      </div>
    </form>
  </div>
</div><!-- / container -->