<header class="panel-heading">
    <h1 class="h4"><?php echo $this->ModuleData['ModuleTitle']; ?></h1>
</header>

<div class="panel-body" ng-controller="PageController" ><!-- Body -->
        <div class="form-group">
            <div class="picture-box banner">
                <img src="./asset/img/broadcast.png">
            </div>
            <!-- <div id="picture-box" class="picture-box banner">
                    <img id="picture-box-picture" src="./asset/img/broadcast.png">

                    <div class="picture-upload">
                            <img src="./asset/img/upload.svg" id="picture-uploadBtn">
                            <form enctype="multipart/form-data" action="../api/upload/image" method="post" name="picture_upload_form" id="picture_upload_form">
                                    <input type="hidden" name="Section" value="Broadcast">
                                    <input type="file" accept="image/*" name="File" id="fileInput" data-target="#picture-box #picture-box-picture" data-targetinput="#MediaGUIDs">
                            </form>
                    </div>

                    <div class="progressBar">
                            <div class="bar"></div>
                            <div class="percent">0%</div>
                    </div>
            </div> -->
        </div>

    <div class="form-area" style="max-width:70%; margin: auto; border:1px solid #f7f7f7; padding:10px;">
        <div class="col-md-12">
            <div class="row float-right" ng-if="Switch == 'Selected'">
                <form id="filterForm" role="form" autocomplete="off" ng-submit="applyFilter()" class="ng-pristine ng-valid">
                    <input type="text" class="form-control" name="Keyword" placeholder="Search">
                </form>
            </div>
        </div>
        <form id="add_form" name="add_form" autocomplete="off" >
            <div class="row">
                <div class="col-md-8">
                    <div class="form-group">
                        <label class="control-label">Send To</label>
                        <div class="col-md-12">
                            <input name="UserType" ng-model="Switch" ng-click="SwitchCheck('All')" type="radio" class="Type" value="All">All Users
                        </div>
                        <div class="col-md-12">
                            <input name="UserType" ng-model="Switch" ng-click="SwitchCheck('Selected')" type="radio" class="Type" value="Selected">Selected Users
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <div class="form-group">
                        <label class="control-label">Broadcast Way</label>
                        <div class="row">
                            <div class="col-md-6"> Email</div>
                            <div class="col-md-6">
                                <input name="Email" type="checkbox" ng-model="Email" class="Type" value="1" ng-click="Editor()"> 
                            </div>
                            <!-- <div class="col-md-6"> SMS </div>
                               <div class="col-md-6">
                                   <input name="SMS" type="checkbox" class="Type" value="2">
                            </div> -->
                            <div class="col-md-6"> Notification</div>
                            <div class="col-md-6"> 
                                <input name="Notification" type="checkbox" class="Type" value="3">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row" ng-if="Switch == 'Selected'">
                <div class="col-md-12">
                    <div class="form-group">
                        <select class="form-control chosen-select" name="selectedUser[]" multiple="">
                            <option value="">Select User</option>
                            <option ng-repeat="User in data.dataList" ng-if="User.Email || User.PhoneNumber" value="{{User.UserGUID}}">{{(User.Email) ? User.Email : User.PhoneNumber}} ({{User.FullName}})</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-12">
                    <div class="form-group">
                        <label class="control-label">Title</label>
                        <input name="Title" type="text" class="form-control" value="" maxlength="40">
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-12">
                    <div class="form-group">
                        <label class="control-label">Message</label>
                        <textarea name="Message" id="editor" class="form-control" rows="10"></textarea>
                    </div>
                </div>
            </div>

            <!-- hidden parameters -->
            <input type="hidden" class="MediaGUIDs" id="MediaGUIDs" name="MediaGUIDs" value=""> <!-- for banner -->
            <!-- hidden parameters /-->
        </form>
        <button type="submit" class="btn btn-success btn-sm" ng-disabled="addDataLoading" ng-click="addData()">Send</button>
    </div>


    </div>
</div><!-- Body/ -->