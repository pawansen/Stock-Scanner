<header class="panel-heading">
  <h1 class="h4">Dashboard</h1>
</header>

<div class="panel-body" ng-controller="PageController" ng-init="getList()"><!-- Body -->
    <div class="">
        <div class="wrapper wrapper-content">
            <div class="row mb-3 align-items-stretch">
                <div class="col-xl-3 col-sm-6 py-2">
                    <div class="card">
                        <div class="card-body custom-card-body">
                            <div class="rotate col-3">
                                <i class="fa fa-user font_icon"></i>
                            </div>
                            <div class="card-info col-9" ng-click="LoadUserList('')">
                                <h6> Total Users </h6>
                                <h4>{{data.dataList.TotalUsers}}</h4>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-sm-6 py-2" ng-click="LoadDepositsList('All')">
                    <div class="card">
                        <div class="card-body custom-card-body">
                            <div class="rotate col-3">
                                <i class="fa fa-rupee font_icon"></i>
                            </div>
                            <div class="card-info col-9">
                                <h6>Total Deposits</h6>
                                <h4>{{data.dataList.TotalDeposits | number : 2 }}</h4>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-sm-6 py-2" ng-click="withdrawalsList()">
                    <div class="card">
                        <div class="card-body custom-card-body">
                            <div class="rotate col-3">
                                <i class="fa fa-reply-all font_icon"></i>
                            </div>
                            <div class="card-info col-9">
                                <h6>Total withdrawls</h6>
                                <h4>{{data.dataList.TotalWithdraw | number : 2 }}</h4>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-sm-6 py-2">
                    <div class="card">
                        <div class="card-body custom-card-body" ng-click="withdrawalsList()">
                            <div class="rotate col-3">
                                <i class="fa fa-share font_icon"></i>
                            </div>
                            <div class="card-info col-9">
                                <h6>Pending Withdrawls</h6>
                                <h4>{{data.dataList.PendingWithdraw | number : 2 }}</h4>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-sm-6 py-2" ng-click="LoadUserList('Today')">
                    <div class="card">
                        <div class="card-body custom-card-body">
                            <div class="rotate col-3">
                                <i class="fa fa-user font_icon"></i>
                            </div>
                            <div class="card-info col-9">
                                <h6> New Users </h6>
                                <h4>{{data.dataList.NewUsers}}</h4>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-sm-6 py-2" ng-click="LoadDepositsList('Today')">
                    <div class="card">
                        <div class="card-body custom-card-body">
                            <div class="rotate col-3">
                                <i class="fa fa-rupee font_icon"></i>
                            </div>
                            <div class="card-info col-9">
                                <h6> Today Deposits </h6>
                                <h4>{{data.dataList.TodayDeposit | number : 2 }}</h4>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-sm-6 py-2">
                    <div class="card">
                        <div class="card-body custom-card-body">
                            <div class="rotate col-3">
                                <i class="fa fa-trophy font_icon"></i>
                            </div>
                            <div class="card-info col-9">
                                <h6>Today Contests</h6>
                                <h4>{{data.dataList.TodayContests}}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <hr/>

    <div class="">
            <div class="table-responsive block_pad_md">
                <h3 class="heading_h3"> Running Matches </h3>
                <table class="table table-striped table-condensed table-hover table-sortable mt-3" ng-if="matches.Records.length">
                    <thead>
                        <th>Series Name</th>
                        <th></th>
                        <th>Team Local</th>
                        <th></th>
                        <th>Team Visitor</th>
                        <th>Match Type</th>
                        <th>Match Started At</th>
                        <th>Status</th>
                    </thead>
                    <tbody>
                        <tr ng-repeat="row in matches.Records">
                            <td>
                                <a target="_blank" href="contests?MatchGUID={{row.MatchGUID}}"><strong>{{row.SeriesName}}</strong></a>
                            </td>
                            <td class="text-center">
                                <img class="float-left" ng-src="{{row.TeamFlagLocal}}" width="70px" height="45px;">
                            </td>
                            <td>
                                <p>{{row.TeamNameLocal}} <br><small>( {{row.TeamNameShortLocal}} )</small></p>
                            </td>
                            <td class="text-center">
                                <img class="float-left" ng-src="{{row.TeamFlagVisitor}}" width="70px" height="45px;">
                            </td>
                            <td>
                                <p>{{row.TeamNameVisitor}} <br><small>( {{row.TeamNameShortVisitor}} )</small></p>
                            </td>
                            <td>
                                <p>{{row.MatchType}} at {{row.MatchLocation}} </p>
                            </td>
                            
                            <td>
                                <p>{{row.MatchStartDateTime}}</p>
                            </td>
                            
                            <td class="text-center"><span ng-class="{Pending:'text-secondary', Completed:'text-success',Cancelled:'text-danger',Running:'text-primary'}[row.Status]">{{row.Status}}</span></td>
                        </tr>
                    </tbody>
                </table>
                <p class="no-records text-center" ng-if="!matches.Records.length">
                    <span ng-if="!matches.Records.length">No records found.</span>
                </p>
            </div>
    </div>
</div><!-- Body/ -->

