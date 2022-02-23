<header class="panel-heading">
  <h1 class="h4">Add Question</h1>
</header>

<div class="panel-body"><!-- Body -->
	<!-- Top container -->
        <div class="float-right"><!-- ng-if="filterData.CategoryTypes.length>1" -->
                <a class="btn btn-success btn-sm ml-1" href="<?php echo site_url('question'); ?>" >Question List</a>
        </div>
	<!-- Data table -->
        <?php echo form_open('question/add'); ?>
        <div class="table-responsive"> 
		<!-- data table -->
                <div class="row">
                    <div class="col-md-5">
                        <label class="">Question</label>
                        <input type="text" name="question" value="<?php echo $this->input->post('question'); ?>" class="form-control col-md-12">
                        <br />
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-4">
                        <label class="">Option 1</label>
                        <input type="text" name="option1" value="<?php echo $this->input->post('option1'); ?>" class="form-control col-md-12" placeholder="" >
                        <br />
                        <input type="radio" name="correctoption" <?php echo ($this->input->post('correctoption') == 1)?'checked':''; ?> value="1"> Option 1 is correct Answer
                    </div>
                    <div class="col-md-4">
                        <label class="">Option 2</label>
                        <input type="text" name="option2" value="<?php echo $this->input->post('option2'); ?>" class="form-control col-md-12" placeholder="" >
                        <br />
                        <input type="radio" name="correctoption" <?php echo ($this->input->post('correctoption') == 2)?'checked':''; ?> value="2"> Option 2 is correct Answer
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
                        <input type="submit" value="Add Question" class="btn btn-success btn-sm" />
                    </div>
                </div>
                <?php echo form_close(); ?>
                <br />
	</div>
	<!-- Data table/ -->
</div><!-- Body/ -->



