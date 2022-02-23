app.controller('PageController', function ($scope, $http,$timeout){
    $scope.data.pageSize = 15;
    /*----------------*/
    $scope.getFilterData = function ()
    {
        var data = 'SessionKey='+SessionKey+'&Params=SeriesName,SeriesGUID&'+$('#filterPanel form').serialize();
        $http.post(API_URL+'admin/matches/getFilterData', data, contentType).then(function(response) {
            var response = response.data;
            if(response.ResponseCode==200 && response.Data){ 
                /* success case */
             $scope.filterData =  response.Data;
             $timeout(function(){
                $("select.chosen-select").chosen({ width: '100%',"disable_search_threshold": 8}).trigger("chosen:updated");
            }, 300);          
         }
     });
    }

    /*list*/
    $scope.applyFilter = function ()
    {
        $scope.data = angular.copy($scope.orig); /*copy and reset from original scope*/
        $scope.getList();
    }
    /*list append*/
    $scope.getList = function ()
    {
        if ($scope.data.listLoading || $scope.data.noRecords) return;
        $scope.data.listLoading = true;
        if(getQueryStringValue('UserGUID')){
            var UserGUID = getQueryStringValue('UserGUID');
           
        }else{
            var UserGUID = '';
        }
        var data = 'SessionKey='+SessionKey+'&UserGUID='+UserGUID+'&Params=FullName, Email, Username, ProfilePic, PhoneNumber,SocialSecurityNumber,MediaPAN,MediaBANK,PanStatus,BankStatus&OrderBy=UserID&Sequence=DESC&PageNo='+$scope.data.pageNo+'&PageSize='+$scope.data.pageSize +'&'+ $('#filterForm1').serialize()+'&'+$('#filterForm').serialize();
        $http.post(API_URL+'admin/users', data, contentType).then(function(response) {
            var response = response.data;
            if(response.ResponseCode==200 && response.Data.Records){ /* success case */
                $scope.data.totalRecords = response.Data.TotalRecords;
                for (var i in response.Data.Records) {
                    if(response.Data.Records[i].MediaPAN.hasOwnProperty('MediaCaption')){
                       response.Data.Records[i].MediaPAN.MediaCaption = JSON.parse(response.Data.Records[i].MediaPAN.MediaCaption); 
                    }
                    if(response.Data.Records[i].MediaBANK.hasOwnProperty('MediaCaption')){
                       response.Data.Records[i].MediaBANK.MediaCaption = JSON.parse(response.Data.Records[i].MediaBANK.MediaCaption); 
                    }
                    $scope.data.dataList.push(response.Data.Records[i]);
                }
             $scope.data.pageNo++;               
         }else{
            $scope.data.noRecords = true;
        }
        $scope.data.listLoading = false;
        // setTimeout(function(){ tblsort(); }, 1000);
    });
    }



    /*edit data*/
    $scope.verifyDetails = function(UserGUID,VetificationType,Status) {
        $scope.editDataLoading = true;
        if(VetificationType=='PAN'){
            var Params = '&PanStatus='+Status;
        }else{
            var Params = '&BankStatus='+Status;
        }
        var data = 'SessionKey=' + SessionKey + '&UserGUID=' +UserGUID+'&VetificationType='+VetificationType+Params ;
        $http.post(API_URL + 'admin/users/changeVerificationStatus', data, contentType).then(function(response) {
            var response = response.data;
            if (response.ResponseCode == 200) { /* success case */
                alertify.success(response.Message);
                
            } else {
                alertify.error(response.Message);
            }
            $scope.editDataLoading = false;
        });
    }

    $scope.loadFormVerification = function(Position, UserGUID, Mode) {
        $scope.data.Position = Position;
        if(Mode=='PAN'){
            var Mode = 'MediaPAN';
        }else{
            var Mode = 'MediaBANK';
        }
        $scope.templateURLEdit = PATH_TEMPLATE + 'user/verification_form.htm?' + Math.random();
        $scope.data.pageLoading = true;
        $http.post(API_URL + 'users/getProfile', 'SessionKey=' + SessionKey + '&UserGUID=' + UserGUID + '&Params='+Mode+',UserTypeName,ProfilePic,FullName', contentType).then(function(response) {
            var response = response.data;
            if (response.ResponseCode == 200) { /* success case */
                $scope.data.pageLoading = false;
                $scope.formData = response.Data;
                
                if(Mode=='MediaPAN'){
                    $scope.MediaURL =  $scope.formData.MediaPAN.MediaURL;   
                }else{
                    $scope.MediaURL =  $scope.formData.MediaBANK.MediaURL;
                }
                console.log($scope.MediaURL);
                $('#Verification_model').modal({
                    show: true
                });
                $timeout(function() {
                    $(".chosen-select").chosen({
                        width: '100%',
                        "disable_search_threshold": 8,
                        "placeholder_text_multiple": "Please Select",
                    }).trigger("chosen:updated");
                }, 200);
            }
        });

    }

}); 
