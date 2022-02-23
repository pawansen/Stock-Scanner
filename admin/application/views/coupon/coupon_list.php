<div class="panel-body" ng-controller="PageController" ><!-- Body -->



	<!-- Top container -->
	<div class="clearfix mt-2 mb-2">
		<span class="float-left records hidden-sm-down">
			<span ng-if="data.dataList.length" class="h5">Total records: {{data.totalRecords}}</span>
		</span>
	<div class="float-right">
			<button class="btn btn-success btn-sm" ng-click="loadFormAdd();">Add Coupon</button>
		</div>
	</div>
	<!-- Top container/ -->


	<!-- Data table -->
	<div class="table-responsive block_pad_md" infinite-scroll="getList()" infinite-scroll-disabled='data.listLoading' infinite-scroll-distance="0"> 

		<!-- loading -->
		<p ng-if="data.listLoading" class="text-center data-loader"><img src="asset/img/loader.svg"></p>

		<!-- data table -->
		<table class="table table-striped table-hover " ng-if="data.dataList.length">
			<!-- table heading -->
			<thead>
				<tr>
					<th style="width:80px;" class="text-center">Banner</th>
					<th style="width: 100px;">Coupon Code</th>
					<th style="width: 300px;">Title</th>
					<th>Description</th>
					<th style="width: 120px;" class="text-center">Value</th>
					<th style="width: 160px;" class="text-center">Created on</th>
					<th style="width: 160px;" class="text-center">Valid Till</th>
					<th style="width: 100px;" class="text-center">Minium Amount</th>
					<th style="width: 100px;" class="text-center">Maximum Amount</th>
					<th style="width: 100px;" class="text-center">No. Of Uses</th>
					<th style="width: 100px;" class="text-center">Status</th>
					<th style="width: 100px;" class="text-center">Action</th>
				</tr>
			</thead>
			<!-- table body -->
			<tbody>
				<tr scope="row" ng-repeat="(key, row) in data.dataList">

					<td class="listed sm text-center">
						<img ng-if="!row.Media.Records[0].MediaThumbURL" ng-src="./asset/img/default-coupon.png">
						<img ng-if="row.Media.Records[0].MediaThumbURL" ng-src="{{row.Media.Records[0].MediaThumbURL}}">
					</td>


					<td class="text-center"><strong>{{row.CouponCode}}</strong></td>
					<td>{{row.CouponTitle}}</td>
					<td>{{row.CouponDescription}}</td>
					<td class="text-center">{{row.CouponValue}}<span ng-if="row.CouponType=='Percentage'">%</span></td>
					<td>{{row.EntryDate}}</td>
					<td>{{row.CouponValidTillDate}}</td>
					<td>{{row.MiniumAmount}}</td>
					<td>{{row.MaximumAmount}}</td>
					<td>{{row.NumberOfUses}}</td>
					<td class="text-center"><span ng-class="{Inactive:'text-danger', Active:'text-success'}[row.Status]">{{row.Status}}</span></td> 
					<td class="text-center">
						<div class="dropdown">
							<button class="btn btn-secondary  btn-sm action" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">&#8230;</button>
							<div class="dropdown-menu dropdown-menu-left">
								<a class="dropdown-item" href="" ng-click="loadFormEdit(key, row.CouponGUID)">Edit</a>
							</div>
						</div>
					</td>
				</tr>
			</tbody>
		</table>

		<!-- no record -->
		<p class="no-records text-center" ng-if="data.noRecords">
			<span ng-if="data.dataList.length">No more records found.</span>
			<span ng-if="!data.dataList.length">No records found.</span>
		</p>
	</div>
	<!-- Data table/ -->


	<!-- add Modal -->
	<div class="modal fade" id="add_model">
		<div class="modal-dialog modal-md" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h3 class="modal-title h5">Add <?php echo $this->ModuleData['ModuleName'];?></h3>     	
					<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				</div>
					<div ng-include="templateURLAdd"></div>
			</div>
		</div>
	</div>


	<!-- edit Modal -->
	<div class="modal fade" id="Edit_model">
		<div class="modal-dialog modal-md" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h3 class="modal-title h5">Edit <?php echo $this->ModuleData['ModuleName'];?></h3>     	
					<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				</div>
				<div ng-include="templateURLEdit"></div>
			</div>
		</div>
	</div>


</div><!-- Body/ -->



