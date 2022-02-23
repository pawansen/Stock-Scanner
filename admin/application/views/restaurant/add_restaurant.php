<header class="panel-heading">
  <h1 class="h4">Add Restaurant</h1>
</header>

<div class="panel-body"><!-- Body -->
	<!-- Top container -->
        <div class="float-right"><!-- ng-if="filterData.CategoryTypes.length>1" -->
                <a class="btn btn-success btn-sm ml-1" href="<?php echo site_url('restaurant'); ?>" >Restaurant List</a>
        </div>
	<!-- Data table -->
        <?php echo form_open('restaurant/add'); ?>
        <div class="table-responsive"> 
		<!-- data table -->
                <div class="row">
                    <div class="col-md-6">
                        <label class="">Restaurant Name</label>
                        <input type="text" name="name" value="<?php echo $this->input->post('name');?>" class="form-control col-md-12">
                        <br />
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <label class="">Location</label>
                        <input type="text" name="location" value="<?php echo $this->input->post('location');?>" class="form-control col-md-12">
                        <br />
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-3">
                        <label class="">Open Time</label>
                        <input type="text" name="opentime" value="<?php echo $this->input->post('opentime');?>" class="form-control col-md-12">
                        <br />
                    </div>
                    <div class="col-md-3">
                        <label class="">Close Time</label>
                        <input type="text" name="closetime" value="<?php echo $this->input->post('closetime');?>" class="form-control col-md-12">
                        <br />
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-3">
                        <label class="">Lat</label>
                        <input type="text" name="lat" value="<?php echo $this->input->post('lat');?>" class="form-control col-md-12">
                        <br />
                    </div>
                    <div class="col-md-3">
                        <label class="">Long</label>
                        <input type="text" name="long" value="<?php echo $this->input->post('long');?>" class="form-control col-md-12">
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
                        <input type="submit" value="Add Restaurant" class="btn btn-success btn-sm" />
                    </div>
                </div>
                <?php echo form_close(); ?>
                <br />
	</div>
	<!-- Data table/ -->
</div><!-- Body/ -->



