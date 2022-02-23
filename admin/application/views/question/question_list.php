<header class="panel-heading">
  <h1 class="h4">Questions</h1>
</header>

<div class="panel-body"><!-- Body -->
	<!-- Top container -->
	<div class="clearfix mt-2 mb-2">
		<span class="float-left records d-none d-sm-block">
			<span class="h5">Total records: <?php echo count($response['data']);?></span>
		</span>
		<div class="float-right"><!-- ng-if="filterData.CategoryTypes.length>1" -->
                        <a class="btn btn-success btn-sm ml-1" href="<?php echo site_url('question/add'); ?>" >Add Question</a>
		</div>
	</div>
	<!-- Top container/ -->


	<!-- Data table -->
	<div class="table-responsive"> 
		<!-- data table -->
		<table class="table table-striped table-condensed table-hover table-sortable">
			<!-- table heading -->
			<thead>
				<tr>
					<th>Question</th>
					<th>Status</th>
					<th>Options</th>
					<th style="width: 100px;" class="text-center">Action</th>
				</tr>
			</thead>
			<!-- table body -->
			<tbody id="tabledivbody">
                            <?php if(count($response['data']) > 0){ ?>
                            <?php foreach ($response['data'] as $que): ?>
				<tr>
					<td>
                                            <?php echo $que['question']?>
					</td>
					<td>
                                            <?php echo $que['status']?>
					</td>
					<td>
                                            <?php $sr = 1; foreach ($que['options'] as $option):
                                                $rightans = ($option['isRightAnswer'] === 'Yes')?'#28a745':'#000';
                                                echo '<span style="color:'.$rightans.'">'.$sr.'. '.$option['option'].'</span> <br />';
                                                $sr++;
                                             endforeach; ?>
					</td>
					<td class="text-center">
						<div class="dropdown">
							<button class="btn btn-secondary  btn-sm action" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">&#8230;</button>
							<div class="dropdown-menu dropdown-menu-left">
                                                                <a class="dropdown-item" href="<?php echo base_url('question/update/'.$que['questionId']);?>">Update</a>
							</div>
						</div>
					</td>
				</tr>
                            <?php endforeach; }else{ ?>
                                <tr>
                                    <td colspan=""><h3>-- NO RECORD FOUND --</h3></td>
                                </tr>
                            <?php } ?>
			</tbody>
		</table>
	</div>
	<!-- Data table/ -->
</div><!-- Body/ -->



