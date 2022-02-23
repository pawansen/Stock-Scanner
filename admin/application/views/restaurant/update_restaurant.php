<header class="panel-heading">
  <h1 class="h4">Update Restaurant</h1>
</header>

<div class="panel-body"><!-- Body -->
	<!-- Top container -->
        <div class="float-right"><!-- ng-if="filterData.CategoryTypes.length>1" -->
                <a class="btn btn-success btn-sm ml-1" href="<?php echo site_url('restaurant'); ?>" >Restaurant List</a>
        </div>
	<!-- Data table -->
        <?php echo form_open('restaurant/update/'.$restaurent['id']); ?>
        <div class="table-responsive"> 
		<!-- data table -->
                <div class="row">
                    <div class="col-md-6">
                        <label class="">Restaurant Name</label>
                        <input type="text" name="name" value="<?php echo ($restaurent['name'])?$restaurent['name']:$this->input->post('name'); ?>" class="form-control col-md-12">
                        <br />
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <label class="">Location</label>
                        <input type="text" name="location" value="<?php echo ($restaurent['address'])?$restaurent['address']:$this->input->post('location'); ?>" class="form-control col-md-12">
                        <br />
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-3">
                        <label class="">Open Time</label>
                        <input type="text" name="opentime" value="<?php echo ($restaurent['openTime'])?$restaurent['openTime']:$this->input->post('opentime'); ?>; ?>" class="form-control col-md-12">
                        <br />
                    </div>
                    <div class="col-md-3">
                        <label class="">Close Time</label>
                        <input type="text" name="closetime" value="<?php echo ($restaurent['closeTime'])?$restaurent['closeTime']:$this->input->post('closetime'); ?>" class="form-control col-md-12">
                        <br />
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-3">
                        <label class="">Lat</label>
                        <input type="text" name="lat" value="<?php echo ($restaurent['lat'])?$restaurent['lat']:$this->input->post('lat'); ?>" class="form-control col-md-12">
                        <br />
                    </div>
                    <div class="col-md-3">
                        <label class="">Long</label>
                        <input type="text" name="long" value="<?php echo ($restaurent['long'])?$restaurent['long']:$this->input->post('long'); ?>" class="form-control col-md-12">
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
                        <input type="submit" value="Update Restaurant" class="btn btn-success btn-sm" />
                    </div>
                </div>
                <?php echo form_close(); ?>
                <br />
	</div>
	<!-- Data table/ -->
</div><!-- Body/ -->



