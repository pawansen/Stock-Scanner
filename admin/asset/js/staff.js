app.controller('PageController', function ($scope, $http,$timeout){

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
        var data = 'SessionKey='+SessionKey+'&IsAdmin=Yes&PageNo='+$scope.data.pageNo+'&PageSize='+$scope.data.pageSize+'&Params=RegisteredOn,LastLoginDate,UserTypeName, FullName, Email, Username, ProfilePic, Gender, BirthDate, PhoneNumber, Status, StatusID&'+$('#filterForm').serialize();
        $http.post(API_URL+'admin/users', data, contentType).then(function(response) {
            var response = response.data;
            if(response.ResponseCode==200 && response.Data.Records){ /* success case */
                $scope.data.totalRecords = response.Data.TotalRecords;
                for (var i in response.Data.Records) {
                   $scope.data.dataList.push(response.Data.Records[i]);
               }
               $scope.data.pageNo++;               
           }else{
            $scope.data.noRecords = true;
        }
        $scope.data.listLoading = false;
    });
    }



    /*load add form*/
    $scope.loadFormAdd = function (Position, CategoryGUID)
    {
        $scope.templateURLAdd = PATH_TEMPLATE+module+'/add_form.htm?'+Math.random();
        $('#add_model').modal({show:true});
                $timeout(function(){            
                   $(".chosen-select").chosen({ width: '100%',"disable_search_threshold": 8 ,"placeholder_text_multiple": "Please Select",}).trigger("chosen:updated");
               }, 200);
    }



    /*load edit form*/
    $scope.loadFormEdit = function (Position, UserGUID)
    {
        $scope.data.Position = Position;
        $scope.templateURLEdit = PATH_TEMPLATE+module+'/edit_form.htm?'+Math.random();
        $scope.data.pageLoading = true;
        $http.post(API_URL+'users/getProfile', 'SessionKey='+SessionKey+'&UserGUID='+UserGUID+ '&Params=Status,ProfilePic', contentType).then(function(response) {
            var response = response.data;
            if(response.ResponseCode==200){ /* success case */
                $scope.data.pageLoading = false;
                $scope.formData = response.Data
                $('#edit_model').modal({show:true});
                $timeout(function(){            
                 $(".chosen-select").chosen({ width: '100%',"disable_search_threshold": 8 ,"placeholder_text_multiple": "Please Select",}).trigger("chosen:updated");
             }, 200);
            }
        });

    }


  /*add data*/
    $scope.addData = function ()
    {
        $scope.addDataLoading = true;
        var data = 'SessionKey='+SessionKey+'&'+$("form[name='add_form']").serialize();
        $http.post(API_URL+'admin/users/add', data, contentType).then(function(response) {
            var response = response.data;
            if(response.ResponseCode==200){ /* success case */               
                alertify.success(response.Message);
                 $scope.applyFilter();
                  $('.modal-header .close').click();
            }else{
                alertify.error(response.Message);
            }
            $scope.addDataLoading = false;          
        });
    }



    /*delete selected */
    $scope.deleteSelectedRecords = function ()
    {
        alertify.confirm('Are you sure you want to delete?', function(){  
            var data = 'SessionKey='+SessionKey+'&'+$('#records_form').serialize();
            $http.post(API_URL+'admin/entity/deleteSelected', data, contentType).then(function(response) {
                var response = response.data;
                if(response.ResponseCode==200){ /* success case */               
                    alertify.success(response.Message);
                    $scope.applyFilter();
                }else{
                    alertify.error(response.Message);
                }
                if($scope.data.totalRecords==0){
                   $scope.data.noRecords = true;
               }
           });
        }).set('labels', {ok:'Yes', cancel:'No'});
    }




    /*edit data*/
    $scope.editData = function ()
    {
        $scope.editDataLoading = true;
        var data = 'SessionKey='+SessionKey+'&'+$('#edit_form').serialize();
        $http.post(API_URL+'admin/users/updateUserInfo', data, contentType).then(function(response) {
            var response = response.data;
            if(response.ResponseCode==200){ /* success case */               
                alertify.success(response.Message);
                $scope.data.dataList[$scope.data.Position] = response.Data;
                $('.modal-header .close').click();
            }else{
                alertify.error(response.Message);
            }
            $scope.editDataLoading = false;          
        });
    }


    /*load delete form*/
    $scope.loadFormDelete = function (Position, UserGUID)
    {
        $scope.data.Position = Position;
        $scope.templateURLDelete = PATH_TEMPLATE+module+'/delete_form.htm?'+Math.random();
        $scope.data.pageLoading = true;
        $http.post(API_URL+'users/getProfile', 'SessionKey='+SessionKey+'&UserGUID='+UserGUID+'&Params=ProfilePic', contentType).then(function(response) {
            var response = response.data;
            if(response.ResponseCode==200){ /* success case */
                $scope.data.pageLoading = false;
                $scope.formData = response.Data
                $('#delete_model').modal({show:true});
                $timeout(function(){            
                 $(".chosen-select").chosen({ width: '100%',"disable_search_threshold": 8 ,"placeholder_text_multiple": "Please Select",}).trigger("chosen:updated");
             }, 200);
            }
        });

    }


}); 





