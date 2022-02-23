<header class="panel-heading">
  <h1 class="h4"><?php echo $this->ModuleData['ModuleTitle'];?></h1>
</header>
<div class="panel-body" ng-controller="PageController" ><!-- Body -->

	<!-- Top container -->
	<div class="clearfix mt-2 mb-2">
		<span class="float-left records hidden-sm-down">
			<span ng-if="data.dataList.length" class="h5">Total records: {{data.totalRecords}}</span>
		</span>


		<!-- <span class="float-left ml-3" ng-if="data.dataList.length>1">
			<div class="dropdown">
				<button class="btn btn-secondary btn-sm action ng-scope" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" ng-if="data.UserGUID!=row.UserGUID">Action</button>
				<div class="dropdown-menu dropdown-menu-left">
					<a class="dropdown-item" href="" ng-click="deleteSelectedRecords()">Delete</a>
				</div>
			</div>
		</span> -->

		<div class="float-right">
			<form class="form-inline" id="filterForm" role="form" autocomplete="off" ng-submit="applyFilter()">
				<input type="text" class="form-control" name="Keyword" placeholder="Search">
			</form>
		</div>

		<div class="float-right mr-2">		
			<button class="btn btn-success btn-sm ml-1 float-right" ng-click="loadFormAdd();">Add Staff</button>
		</div>
	</div>
	<!-- Top container/ -->



	<!-- Data table -->
	<div class="table-responsive block_pad_md" infinite-scroll="getList()" infinite-scroll-disabled='data.listLoading' infinite-scroll-distance="0"> 

		<!-- loading -->
		<p ng-if="data.listLoading" class="text-center data-loader"><img src="asset/img/loader.svg"></p>


		<form name="records_form" id="records_form">
			<!-- data table -->
			<table class="table table-striped table-hover" ng-if="data.dataList.length">
				<!-- table heading -->
				<thead>
					<tr>
						<!-- <th style="width: 50px;" class="text-center" ng-if="data.dataList.length>1"><input type="checkbox" name="select-all" id="select-all" class="mt-1"></th>	 -->
						<th style="width: 300px;">User</th>
						<th>Contact No.</th>
						<th style="width: 120px;">Gender</th>
						<th style="width: 120px;">Date of Birth</th>
						<th style="width: 200px;">Role</th>
						<th style="width: 160px;" class="text-center">Registered On</th>
						<th style="width: 160px;" class="text-center">Last Login</th>
						<th style="width: 100px;" class="text-center">Status</th>
						<th style="width: 100px;" class="text-center">Action</th>

					</tr>
				</thead>
				<!-- table body -->
				<tbody>
					<tr scope="row" ng-repeat="(key, row) in data.dataList">
						<!-- <td class="text-center"  ng-if="data.dataList.length>1">
							<input type="checkbox" name="select-all-checkbox[]" id="select-all-checkbox-{{key}}" class="mt-2 select-all-checkbox" value="{{row.UserGUID}}" ng-if="data.UserGUID!=row.UserGUID">
						</td> -->
						<td class="listed sm clearfix">
							<img class="rounded-circle float-left" ng-src="{{row.ProfilePic}}">
							<div class="content float-left"><strong>{{row.FullName}}</strong>
							<div ng-if="row.Email"><a href="mailto:{{row.Email}}" target="_top">{{row.Email}}</a></div><div ng-if="!row.Email">-</div>
							</div>

						</td> 
						
						<td><span ng-if="row.PhoneNumber">{{row.PhoneNumber}}</span><span ng-if="!row.PhoneNumber">-</span></td> 
						<td><span ng-if="row.Gender">{{row.Gender}}</span><span ng-if="!row.Gender">-</span></td> 
						<td><span ng-if="row.BirthDate">{{row.BirthDate}}</span><span ng-if="!row.BirthDate">-</span></td> 
						<td ng-bind="row.UserTypeName"></td> 
						<td ng-bind="row.RegisteredOn"></td>  
						<td><span ng-if="row.LastLoginDate">{{row.LastLoginDate}}</span><span ng-if="!row.LastLoginDate">-</span></td> 
						<td class="text-center"><span ng-class="{Pending:'text-danger', Verified:'text-success',Deleted:'text-danger',Blocked:'text-danger'}[row.Status]">{{row.Status}}</span></td> 
						<td class="text-center">
							<div class="dropdown">
								<button class="btn btn-secondary  btn-sm action" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" ng-if="data.UserGUID!=row.UserGUID">&#8230;</button>
								<div class="dropdown-menu dropdown-menu-left">
									<a class="dropdown-item" href="" ng-click="loadFormEdit(key, row.UserGUID)">Edit</a>
									<a class="dropdown-item" href="" ng-click="loadFormDelete(key, row.UserGUID)">Delete</a>
								</div>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</form>
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
	<div class="modal fade" id="edit_model">
		<div class="modal-dialog modal-md" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h3 class="modal-title h5">Edit <?php echo $this->ModuleData['ModuleName'];?></h3>     	
					<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				</div>
				<!-- form -->
				<form id="edit_form" name="edit_form" autocomplete="off" ng-include="templateURLEdit">
				</form>
				<!-- /form -->
			</div>
		</div>
	</div>


	<!-- delete Modal -->
	<div class="modal fade" id="delete_model">
		<div class="modal-dialog modal-md" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h3 class="modal-title h5">Delete <?php echo $this->ModuleData['ModuleName'];?></h3>     	
					<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				</div>
				<!-- form -->
				<form id="edit_form" name="edit_form" autocomplete="off" ng-include="templateURLDelete">
				</form>
				<!-- /form -->
			</div>
		</div>
	</div>


</div><!-- Body/ -->



