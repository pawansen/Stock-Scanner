<header class="panel-heading">
  <h1 class="h4">Restaurants</h1>
</header>

<div class="panel-body"><!-- Body -->
	<!-- Top container -->
	<div class="clearfix mt-2 mb-2">
		<span class="float-left records d-none d-sm-block">
			<span class="h5">Total records: <?php echo count($response['data']);?></span>
		</span>
		<div class="float-right"><!-- ng-if="filterData.CategoryTypes.length>1" -->
                        <a class="btn btn-success btn-sm ml-1" href="<?php echo site_url('restaurant/add'); ?>" >Add Restaurant</a>
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
					<th>Image</th>
					<th>Name</th>
					<th>Address</th>
					<th>Open Time</th>
					<th>Close Time</th>
					<th>Lat</th>
					<th>Long</th>
					<th>Status</th>
					<th style="width: 100px;" class="text-center">Action</th>
				</tr>
			</thead>
			<!-- table body -->
			<tbody id="tabledivbody">
                            <?php if(count($response['data']) > 0){ ?>
                            <?php foreach ($response['data'] as $item): ?>
				<tr>
                                    <td><img src="<?php echo $item['image']?>" style="height: 50px; width: 50px;"></td>
                                        <td><strong><?php echo $item['name']?></strong></td>
					<td><?php echo $item['address']?></td>
					<td><?php echo $item['openTime']?></td>
					<td><?php echo $item['closeTime']?></td>
					<td><?php echo $item['lat']?></td>
					<td><?php echo $item['long']?></td>
					<td>
                                            <?php 
                                                $status_color = ($item['status'] === 'Open')?'#28a745':'#F00';
                                                echo '<span style="color:'.$status_color.'"><strong>'.$item['status'].'</strong></span> <br />';
                                             ?>
					</td>
					<td class="text-center">
						<div class="dropdown">
							<button class="btn btn-secondary  btn-sm action" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">&#8230;</button>
							<div class="dropdown-menu dropdown-menu-left">
                                                                <a class="dropdown-item" href="<?php echo base_url('restaurant/update/'.$item['id']);?>">Update</a>
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



