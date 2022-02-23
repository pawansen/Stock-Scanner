<header class="panel-heading">
	<h1 class="h4"><?php echo $this->ModuleData['ModuleTitle'];?></h1>
</header>

<div class="panel-body" ng-controller="PageController"><!-- Body -->

	<!-- Top container -->
	<div class="clearfix mt-2 mb-2" >
		<span class="float-left records d-none d-sm-block">
			<span class="h5"><b></b></span><br>
		</span>

	</div>
	<div class="clearfix mt-2 mb-2" ng-if="data.dataList.length">
		<span class="float-left records d-none d-sm-block">
		</span>
		<div class="float-right">
			
		</div>
	</div>
	<!-- Top container/ -->

	<!-- Data table -->
	<div class="row block_pad_md align-items-center" ng-init="getUserDetails();getList('WalletAmount')" > 
		<div class="col-md-4 text-center">
			<div class="form-group">
				<img width="150" class="rounded-circle" ng-src="{{userData.ProfilePic}}">
			</div>
		</div>	
        <div class="col-md-8">
			<div class="row">
				<div class="col-md-6">
					<div class="col-sm-6">
						<div class="form-group">
							<label><b>First Name : </b></label>
							<span>{{userData.FullName}}</span>
						</div>
					</div>	
					<div class="col-sm-6">
						<div class="form-group">
							<label><b>Email : </b></label>
							<span>{{userData.Email}}</span>
						</div>
					</div>		
					<div class="col-sm-6">
						<div class="form-group">
							<label><b>Gender : </b></label>
							<span>{{userData.Gender}}</span>
						</div>
					</div>
				</div>
			   <div class="col-md-6">
			       <div class="col-sm-6">
						<div class="form-group">
							<label><b>BirthDate : </b></label>
							<span>{{userData.BirthDate}}</span>
						</div>
					</div>	
					<div class="col-sm-6">
						<div class="form-group">
							<label><b>PhoneNumber : </b></label>
							<span>{{userData.PhoneNumber}}</span>
						</div>
					</div>	
					<div class="col-sm-6">
						<div class="form-group">
							<label><b>Status : </b></label>
							<span ng-class="{Pending:'text-danger', Verified:'text-success',Deleted:'text-danger',Blocked:'text-danger'}[userData.Status]">{{userData.Status}}</span>
						</div>
					</div>
			   </div>
			</div>

		</div>	
	</div>
	<hr>
	<div class="row">
		<div class="col-sm-12 mb-2">
			<span class="h5"><b>Verifications</b></span><br>
		</div>
		<div class="col-sm-4">
			<label>PAN : </label>
			<span ng-class="{Pending:'text-danger', Verified:'text-success',Deleted:'text-danger',Blocked:'text-danger'}[userData.PanStatus]">{{userData.PanStatus}}</span>
		</div>
		<div class="col-sm-4">
			<label>Bank : </label>
			<span ng-class="{Pending:'text-danger', Verified:'text-success',Deleted:'text-danger',Blocked:'text-danger'}[userData.BankStatus]">{{userData.BankStatus}}</span>
		</div>
		<div class="col-sm-4">
			<label>Phone : </label>
			<span ng-class="userData.PhoneNumber!='' ? 'text-success' : 'text-danger' ">{{userData.PhoneNumber!='' ? 'Verified' : 'Pending' }}</span>
		</div>
	</div>
	<hr>
	<div class="row  text-right">

		<div class="col-sm-10 offset-1">
			<label><b>Deposit : </b></label>
			<span>₹ {{userData.WalletAmount}}</span>
		</div>
		<div class="col-sm-10 offset-1">
			<label><b>Winning : </b></label>
			<span>₹ {{userData.WinningAmount}}</span>
		</div>
		<div class="col-sm-10 offset-1">
			<label><b>Cash Bonus : </b></label>
			<span>₹ {{userData.CashBonus}}</span>
		</div>
		<div class="col-sm-10 offset-1">
			<label><b>Cash Bonus : </b></label>
			<span>₹ {{userData.TotalCash}}</span>
		</div>
	</div>

	<hr>
	<div class="row" >
		<div class="col-md-12 pl-2 pr-2">
			<div class="verified_tabs">
				<nav>
					<div class="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
						<a class="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#nav-home" role="tab" aria-controls="nav-home" aria-selected="true" ng-click="getList('WalletAmount'); ">Cash Transaction</a>
						<a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#nav-profile" role="tab" aria-controls="nav-profile" aria-selected="false" ng-click="getList('WinningAmount'); ">Cash Withdrawal</a>
						<a class="nav-item nav-link" id="nav-contact-tab" data-toggle="tab" href="#nav-contact" role="tab" aria-controls="nav-contact" aria-selected="false" ng-click="getList('CashBonus'); ">Cash Bonus Transaction</a>
					</div>
				</nav>
				<div class="tab-content py-3 px-3 px-sm-0" id="nav-tabContent">
					<div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">
						<div class="table-responsive block_pad_md" > 

							<!-- loading -->
							<p ng-if="data.listLoading" class="text-center data-loader"><img src="asset/img/loader.svg"></p>
							<form name="records_form" id="records_form">
								<!-- data table -->
								<table class="table table-striped table-hover text-center" >
									<!-- table heading -->
									<thead>
										<tr>
											<th>Transaction ID</th>
                                            <th>Details</th>
                                            <th>Status</th>
                                            <th>Opening Balance</th>
                                            <th>Cr.</th>
                                            <th>Dr.</th>
                                            <th>Available Balance</th>
                                            <th>Date &amp; Time</th>
										</tr>
									</thead>
									<!-- table body -->
									<tbody>
										<tr ng-repeat="transactionDetails in transactions" ng-if="transactions.length">
											<td>{{transactionDetails.TransactionID ? transactionDetails.TransactionID : '-' }}</td>
                                            <td>{{transactionDetails.Narration}}</td>
                                            <td>{{transactionDetails.Status}}</td>
                                            <td>
                                                <i class="fa fa-dollar"></i>{{ transactionDetails.OpeningBalance}}</td>
                                            <td>
                                                <i class="fa fa-dollar" ng-if="transactionDetails.TransactionType=='Cr'"></i> {{ transactionDetails.TransactionType=='Cr' ? transactionDetails.Amount : '0.00'}}</td>
                                            <td>
                                                <i class="fa fa-dollar" ng-if="transactionDetails.TransactionType=='Dr'"></i> {{ transactionDetails.TransactionType=='Dr' ? transactionDetails.Amount : '0.00'}}</td>
                                            <td>
                                                <i class="fa fa-dollar"></i> {{ transactionDetails.ClosingBalance}}</td>
                                            <td>{{transactionDetails.EntryDate}}</td>
                                        </tr>
                                        <tr ng-if="!transactions.length" >
                                            <td colspan="8" class="text-center">No transactions found.</td>
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
					</div>
					<div class="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab">
						<div class="table-responsive block_pad_md" > 

							<!-- loading -->
							<p ng-if="data.listLoading" class="text-center data-loader"><img src="asset/img/loader.svg"></p>
							<form name="records_form" id="records_form">
								<!-- data table -->
								<table class="table table-striped table-hover text-center" >
									<!-- table heading -->
									<thead>
										<tr>
											<th>Transaction ID</th>
                                            <th>Details</th>
                                            <th>Status</th>
                                            <th>Opening Balance</th>
                                            <th>Cr.</th>
                                            <th>Dr.</th>
                                            <th>Available Balance</th>
                                            <th>Date &amp; Time</th>
										</tr>
									</thead>
									<!-- table body -->
									<tbody>
										<tr ng-repeat="transactionDetails in transactions" ng-if="transactions.length">
											<td>{{transactionDetails.TransactionID}}</td>
                                            <td>{{transactionDetails.Narration}}</td>
                                            <td>{{transactionDetails.Status}}</td>
                                            <td>
                                                <i class="fa fa-dollar"></i>{{ transactionDetails.OpeningBalance}}</td>
                                            <td>
                                                <i class="fa fa-dollar" ng-if="transactionDetails.TransactionType=='Cr'"></i> {{ transactionDetails.TransactionType=='Cr' ? transactionDetails.Amount : '0.00'}}</td>
                                            <td>
                                                <i class="fa fa-dollar" ng-if="transactionDetails.TransactionType=='Dr'"></i> {{ transactionDetails.TransactionType=='Dr' ? transactionDetails.Amount : '0.00'}}</td>
                                            <td>
                                                <i class="fa fa-dollar"></i> {{ transactionDetails.ClosingBalance}}</td>
                                            <td>{{transactionDetails.EntryDate}}</td>
                                        </tr>
                                        <tr ng-if="!transactions.length" >
                                            <td colspan="8" class="text-center">No transactions found.</td>
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
					</div>
					<div class="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab">
						<div class="table-responsive block_pad_md" > 

							<!-- loading -->
							<p ng-if="data.listLoading" class="text-center data-loader"><img src="asset/img/loader.svg"></p>
							<form name="records_form" id="records_form">
								<!-- data table -->
								<table class="table table-striped table-hover text-center" >
									<!-- table heading -->
									<thead>
										<tr>
											<th>Transaction ID</th>
                                            <th>Details</th>
                                            <th>Status</th>
                                            <th>Opening Balance</th>
                                            <th>Cr.</th>
                                            <th>Dr.</th>
                                            <th>Available Balance</th>
                                            <th>Date &amp; Time</th>
										</tr>
									</thead>
									<!-- table body -->
									<tbody>
										<tr ng-repeat="transactionDetails in transactions" ng-if="transactions.length">
											<td>{{transactionDetails.TransactionID}}</td>
                                            <td>{{transactionDetails.Narration}}</td>
                                            <td>{{transactionDetails.Status}}</td>
                                            <td>
                                                <i class="fa fa-dollar"></i>{{ transactionDetails.OpeningBalance}}</td>
                                            <td>
                                                <i class="fa fa-dollar" ng-if="transactionDetails.TransactionType=='Cr'"></i> {{ transactionDetails.TransactionType=='Cr' ? transactionDetails.Amount : '0.00'}}</td>
                                            <td>
                                                <i class="fa fa-dollar" ng-if="transactionDetails.TransactionType=='Dr'"></i> {{ transactionDetails.TransactionType=='Dr' ? transactionDetails.Amount : '0.00'}}</td>
                                            <td>
                                                <i class="fa fa-dollar"></i> {{ transactionDetails.ClosingBalance}}</td>
                                            <td>{{transactionDetails.EntryDate}}</td>
                                        </tr>
                                        <tr ng-if="!transactions.length" >
                                            <td colspan="8" class="text-center">No transactions found.</td>
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
					</div>

				</div>
			</div>

		</div>
	</div>

	<!-- Data table/ -->

</div><!-- Body/ -->