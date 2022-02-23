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
						<th style="width: 300px;min-width:200px;">User</th>
						<th style="width: 120px;">SSN</th>
						<th style="width: 120px;">License</th>
						<th style="width: 120px;">License Details</th>
						<th style="width: 100px;" class="text-center">License Status</th>
<!-- 						<th style="width: 120px;">Bank Account</th>
						<th style="width: 120px;">A/C Details</th>
						<th style="width: 100px;" class="text-center">A/C Status</th> -->
						<th style="width: 100px;" class="text-center">Action</th>
					</tr>
				</thead>
				<!-- table body -->
				<tbody>
					<tr scope="row" ng-repeat="(key, row) in data.dataList"  >

						<td class="listed sm clearfix">
							<img class="rounded-circle float-left" ng-src="{{row.ProfilePic}}">
							<div class="content float-left"><strong>{{row.FullName}}</strong>
							<div ng-if="row.Email"><a href="javascript:void(0)" target="_top">{{row.Email}}</a></div><div ng-if="!row.Email">-</div>
							</div>
						</td>


						<td class="listed sm clearfix">
						    <div class="form-group" ng-if="row.MediaPAN.MediaCaption.SocialSecurityNumber">
								<label class="control-label"></label>
								<p class="text-muted">{{row.MediaPAN.MediaCaption.SocialSecurityNumber}}</p>
							</div>
						
						</td> 

						<td><img style="width: 100px; cursor: pointer;" ng-if="row.MediaPAN.MediaURL" ng-src="{{row.MediaPAN.MediaURL}}" ng-click="loadFormVerification(key,row.UserGUID,'PAN')"><p ng-if="!row.MediaPAN.MediaURL">-</p></td>
						<td>
							<div class="form-group" ng-if="row.MediaPAN.MediaCaption.LegalName">
								<label class="control-label">Name</label>
								<p class="text-muted">{{row.MediaPAN.MediaCaption.LegalName}}</p>
							</div>
							<div class="form-group" ng-if="row.MediaPAN.MediaCaption.LicenseCardNumber">
								<label class="control-label">License Number</label>
								<p class="text-muted text-success">{{row.MediaPAN.MediaCaption.LicenseCardNumber}}</p>
							</div>
							<div class="form-group" ng-if="row.MediaPAN.MediaCaption.CitizenStatus">
								<label class="control-label">Citizen Status</label>
								<p class="text-muted">{{row.MediaPAN.MediaCaption.CitizenStatus}}</p>
							</div>
							<div class="form-group">
								<span ng-if="!row.MediaPAN.MediaCaption">-</span>
							</div>
						</td> 

						<td><span ng-if="row.PanStatus" ng-class="{Pending:'text-danger', Verified:'text-success',Deleted:'text-danger',Blocked:'text-danger'}[row.PanStatus]" >{{row.PanStatus}}</span><span ng-if="!row.PanStatus">-</span></td> 
<!-- 						<td><img ng-if="row.MediaBANK.MediaThumbURL" ng-src="{{row.MediaBANK.MediaThumbURL}}" ng-click="loadFormVerification(key,row.UserGUID,'BANK')"><p ng-if="!row.MediaBANK.MediaThumbURL">-</p></td> -->
<!-- 						<td>
							<div class="form-group">
								<label class="control-label">Name</label>
								<p class="text-muted">{{row.MediaBANK.MediaCaption.FullName}}</p>
							</div>
							<div class="form-group">
								<label class="control-label">Account Number</label>
								<p class="text-muted">{{row.MediaBANK.MediaCaption.AccountNumber}}</p>
							</div>
							<div class="form-group">
								<label class="control-label">IFSC Code</label>
								<p class="text-muted">{{row.MediaBANK.MediaCaption.IFSCCode}}</p>
							</div>
						</td>  -->
<!-- y -->
						<td class="text-center">
									<div class="form-group" >
										<select name="PanStatus" id="PanStatus" ng-model="PanStatus" class="form-control chosen-select" ng-change="verifyDetails(row.UserGUID,'PAN',PanStatus)" >
											<option value="">License</option>
											<option value="Pending" ng-selected="row.PanStatus=='Pending'">Pending</option>
											<option value="Verified" ng-selected="row.PanStatus=='Verified'">Verified</option>
											<option value="Rejected" ng-selected="row.PanStatus=='Rejected'">Rejected</option>
										</select>
									</div>
	<!-- 							
									<div class="form-group" >
										<select name="BankStatus" id="BankStatus" ng-model="BankStatus" class="form-control chosen-select" ng-change="verifyDetails(row.UserGUID,'BANK',BankStatus)" >
											<option value="">A/C</option>
											<option value="Pending" ng-selected="row.BankStatus=='Pending'">Pending</option>
											<option value="Verified" ng-selected="row.BankStatus=='Verified'">Verified</option>
											<option value="Rejected" ng-selected="row.BankStatus=='Rejected'">Rejected</option>
										</select>
									</div> -->
									
								
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
										<label class="filter-col" for="Status">Pan Status</label>
										<select id="PanStatus" name="PanStatus" class="form-control chosen-select">
											<option value="">Please Select</option>
											<option value="1">Pending</option>
											<option value="2">Verified</option>
											<option value="3">Rejected</option>
											<option value="9">Not Submitted</option>
										</select>   
									</div>
								</div>
							</div>

							<div class="row">
								<div class="col-md-8">
									<div class="form-group">
										<label class="filter-col" for="Status">Ac Status</label>
										<select id="BankStatus" name="BankStatus" class="form-control chosen-select">
											<option value="">Please Select</option>
											<option value="1">Pending</option>
											<option value="2">Verified</option>
											<option value="3">Rejected</option>
											<option value="9">Not Submitted</option>
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



