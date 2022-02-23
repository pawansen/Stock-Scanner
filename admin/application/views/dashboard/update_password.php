<header class="panel-heading">
  <h1 class="h4">Change Password</h1>
</header>


<div class="panel-body"><!-- Body -->
	<!-- Data table -->
        <?php echo form_open('dashboard/update_password'); ?>
        <div class="table-responsive"> 
		<!-- data table -->
                <div class="row">
                    <div class="col-md-6">
                        <label class="">Current Password *</label>
                        <input type="password" name="current_pass" class="form-control col-md-12">
                        <br />
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <label class="">New Password *</label>
                        <input type="password" name="new_pass" class="form-control col-md-12">
                        <br />
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <label class="">Confirm New Password *</label>
                        <input type="password" name="con_new_pass" class="form-control col-md-12">
                        <br />
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <span class="text-danger"><?php echo validation_errors(); ?></span>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-5">
                        <br />
                        <input type="submit" value="Change Password" class="btn btn-success btn-sm" />
                    </div>
                </div>
                <?php echo form_close(); ?>
                <br />                
        </div>
</div>