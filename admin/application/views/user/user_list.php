<header class="panel-heading">
  <h1 class="h4"><?php echo $this->ModuleData['ModuleTitle'];?></h1>
</header>
<div class="panel-body" ng-controller="PageController" ><!-- Body -->

	<!-- Top container -->
	<div class="clearfix mt-2 mb-2">
		<span class="float-left records hidden-sm-down">
			<span ng-if="data.dataList.length" class="h5">Total records: {{data.totalRecords}}</span>
		</span>

		<div class="float-right">
			<form id="filterForm" role="form" autocomplete="off" ng-submit="applyFilter()" class="ng-pristine ng-valid">
				<input type="text" class="form-control" name="Keyword" placeholder="Search">
			</form>
		</div>
		<div class="float-right">
			<button class="btn btn-default btn-secondary btn-sm ng-scope" data-toggle="modal" data-target="#filter_model">Filter</button>&nbsp;
			
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
						<!-- <th style="width: 50px;" class="text-center" ng-if="data.dataList.length>1"><input type="checkbox" name="select-all" id="select-all" class="mt-1" ></th> -->	
						<th class="sort" ng-click="applyOrderedList('FirstName','ASC')" style="width: 400px;min-width:200px;">User &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  Name &nbsp;<span class="sort_deactive"></span></th>
				<!-- 		<th>User Team Code</th> -->
						<th>Username</th>
						<!-- <th>Full Legal Name</th> -->
						<!-- <th style="width: 120px;">Gender</th> -->
						<th style="width: 120px;">Date of Birth</th>
						<!-- <th style="width: 120px;">Referred</th> -->
						<!-- <th style="width: 200px;">Role</th> -->

			<!-- 			<th style="width: 120px;" class="text-center">Social Security Number</th> -->
				<!-- 		<th>Citizen Status</th>  -->
						<th>State</th> 
						<th style="width: 160px;" class="text-center">Last Login</th>
						<th style="width: 160px;" class="text-center sort" ng-click="applyOrderedList('E.EntryDate', 'ASC')">Registered On <span class="sort_deactive">&nbsp;</span></th>
						<th style="width: 80px;" class="text-center">Public Contest Won/Play</th>
						<th style="width: 80px;" class="text-center">Total Withdrawal</th>
						<th style="width: 160px;" class="text-center sort" ng-click="applyOrderedList('WalletAmount', 'ASC')">Cash Available <span class="sort_deactive">&nbsp;</span></th>
						<th style="width: 100px;" class="text-center">Status</th>
						<th style="width: 100px;" class="text-center">Action</th>

					</tr>
				</thead>
				<!-- table body -->
				<tbody>
					<tr scope="row" ng-repeat="(key, row) in data.dataList">

						<td class="listed sm clearfix">
							<img class="rounded-circle float-left" ng-src="{{row.ProfilePic}}">
							<div class="content float-left"><strong><a target="_blank" href="userdetails?UserGUID={{row.UserGUID}}">{{row.FullName}}</a></strong>
							<div ng-if="row.Email"><a href="mailto:{{row.Email}}" target="_top">{{row.Email}}</a></div><div ng-if="!row.Email">-</div>
							</div>
						</td> 
                        <!--<td><span>{{row.UserTeamCode}}</span></td>-->
                        <td><span>{{row.Username}}</span></td>
<!-- 						<td><span ng-if="row.MediaPAN.MediaCaption">{{row.MediaPAN.MediaCaption.LegalName}}</span><span ng-if="!row.MediaPAN.MediaCaption">-</span></td>  -->
						<!-- <td><span ng-if="row.Gender">{{row.Gender}}</span><span ng-if="!row.Gender">-</span></td>  -->
						<td><span ng-if="row.BirthDate">{{row.BirthDate}}</span><span ng-if="!row.BirthDate">-</span></td> 
						<!-- <td><span ng-if="row.ReferredCount"><a href="javascript:void(0)" ng-click="loadFormReferredUsersList(key, row.UserGUID)" >{{row.ReferredCount}}</span><span ng-if="!row.ReferredCount">-</span></td>  -->
						<!-- <td ng-bind="row.UserTypeName"></td>  -->
						
<!-- 						<td align="center"><span ng-if="row.SocialSecurityNumber">{{row.SocialSecurityNumber}}</span><span ng-if="!row.SocialSecurityNumber">-</span></td>  -->
					<!-- 	<td><span>{{row.CitizenStatus}}</span></td> -->
						<td><span>{{row.StateName}}</span></td>
						<td><span ng-if="row.LastLoginDate">{{row.LastLoginDate}}</span><span ng-if="!row.LastLoginDate">-</span></td> 
						<td ng-bind="row.RegisteredOn"></td> 
						<td><span>{{row.PlayingHistory.TotalJoinedContestWinning}}/{{row.PlayingHistory.TotalJoinedContest}}</span></td>
						<td><span >${{(row.TotalWithdrawals == '')?0:row.TotalWithdrawals }}</span></td>
						<td><span >${{row.WalletAmount}}</span></td>
		<!-- 				<td class="text-center"><span ng-if="row.Source">{{row.Source}}</span><span ng-if="!row.Source">-</span></td>  -->
						<td class="text-center"><span ng-class="{Pending:'text-danger', Verified:'text-success',Deleted:'text-danger',Blocked:'text-danger'}[row.Status]">{{row.Status}}</span></td> 
						<td class="text-center">
							<div class="dropdown">
								<button class="btn btn-secondary  btn-sm action" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" ng-if="data.UserGUID!=row.UserGUID">&#8230;</button>
								<div class="dropdown-menu dropdown-menu-left">
									
<!--									<a class="dropdown-item" href="" ng-click="loadFormAddCash(key, row.UserGUID)">Add Cash Bonus</a>-->
									
									<a class="dropdown-item" target="_blank" href="transactions?UserGUID={{row.UserGUID}}" >Transactions</a>
									<a class="dropdown-item" target="_blank" href="joinedcontests?UserGUID={{row.UserGUID}}" >Joined Contests</a>
									<a class="dropdown-item" target="_blank" href="privatecontests?UserGUID={{row.UserGUID}}" >Private Contests</a>
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


	<div class="modal fade" id="filter_model"  ng-init="getFilterData()">
		<div class="modal-dialog modal-md" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h3 class="modal-title h5">Filters</h3>     	
					<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				</div>

				<!-- Filter form -->
				<form id="filterForm1" role="form" autocomplete="off" class="ng-pristine ng-valid">
					<div class="modal-body">
						<div class="form-area">

							<div class="row">
								<div class="col-md-8">
									<div class="form-group">
										<label class="filter-col" for="Status">Status</label>
										<select id="Status" name="Status" class="form-control chosen-select">
											<option value="">Please Select</option>
											<option value="Verified">Verified</option>
											<option value="Pending">Pending</option>
											<option value="Deleted">Deleted</option>
											<option value="Blocked">Blocked</option>
											<option value="Hidden">Hidden</option>
										</select>   
									</div>
								</div>
							</div>

														<div class="row">
								<div class="col-md-8">
									<div class="form-group">
										<label class="filter-col" for="Status">Withdrawal</label>
										<select id="Withdrawal" name="Withdrawal" class="form-control chosen-select">
											<option value="">Please Select</option>
											<option value="50"> > 50</option>
											<option value="100"> > 100</option>
											<option value="500"> > 500</option>
											<option value="600"> > 600</option>
											<option value="1000"> > 1000</option>
											<option value="1500"> > 1500</option>
											<option value="2000"> > 2000</option>
											<option value="2500"> > 2500</option>
										</select>   
									</div>
								</div>
							</div>

						</div> <!-- form-area /-->
					</div> <!-- modal-body /-->

					<div class="modal-footer">
						<button type="button" class="btn btn-secondary btn-sm" onclick="$('#filterForm1').trigger('reset'); $('.chosen-select').trigger('chosen:updated');">Reset</button>
						<button type="submit" class="btn btn-success btn-sm" data-dismiss="modal" ng-disabled="editDataLoading" ng-click="applyFilter()">Apply</button>
					</div>

				</form>
				<!-- Filter form/ -->
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
	<!-- Verification Modal -->
	<div class="modal fade" id="Verification_model">
		<div class="modal-dialog modal-md" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h3 class="modal-title h5">Verirification</h3>     	
					<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				</div>
				<!-- form -->
				<form id="Verification_form" name="edit_form" autocomplete="off" ng-include="templateURLEdit">
				</form>
				<!-- /form -->
			</div>
		</div>
	</div>
	<!-- Add cash bonus Modal -->
	<div class="modal fade" id="AddCashBonus_model">
		<div class="modal-dialog modal-md" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h3 class="modal-title h5">Add Cash Bonus</h3>     	
					<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				</div>
				<!-- form -->
				<form id="addCash_form" name="edit_form" autocomplete="off" ng-include="templateURLEdit">
				</form>
				<!-- /form -->
			</div>
		</div>
	</div>

	<!-- Add referral users list Modal -->
	<div class="modal fade" id="referralUserList_model">
		<div class="modal-dialog modal-md" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h3 class="modal-title h5">Referral Users List</h3>     	
					<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				</div>
				<!-- form -->
				<form id="referralUserList_form" name="referralUserList_form" autocomplete="off" ng-include="templateURLEdit">
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



