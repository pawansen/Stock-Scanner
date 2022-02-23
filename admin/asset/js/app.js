var app = angular.module('myApp', ['infinite-scroll']);
var contentType = {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
};

/*main controller*/
app.controller('MainController', ["$scope", "$http", "$timeout", function($scope, $http, $timeout) {
    $scope.data = {
        dataList: [],
        totalRecords: '0',
        pageNo: 1,
        pageSize: 25,
        noRecords: false,
        UserGUID: UserGUID,
        notificationCount: 0,
        OrderBy: '',
        Sequence: ''
    };
    $scope.orig = angular.copy($scope.data);
    $scope.UserTypeID = UserTypeID;

    /*delete Entity*/
    $scope.deleteData = function(EntityGUID) {
        $scope.deleteDataLoading = true;
        alertify.confirm('Are you sure you want to delete?', function() {
            var data = 'SessionKey=' + SessionKey + '&EntityGUID=' + EntityGUID;
            $http.post(API_URL + 'admin/entity/delete', data, contentType).then(function(response) {
                var response = response.data;
                if (response.ResponseCode == 200) { /* success case */
                    alertify.success(response.Message);
                    $scope.data.dataList.splice($scope.data.Position, 1); /*remove row*/
                    $scope.data.totalRecords--;
                    $('.modal-header .close').click();
                } else {
                    alertify.error(response.Message);
                }
                if ($scope.data.totalRecords == 0) {
                    $scope.data.noRecords = true;
                }
            });
        }).set('labels', {
            ok: 'Yes',
            cancel: 'No'
        });
        $scope.deleteDataLoading = false;

    }



    $scope.getTimeZone = function () {
        return  new Date().getTimezoneOffset();
         
    }
    /*get notifications*/
    $scope.getNotifications = function() {
        var data = 'SessionKey=' + SessionKey + '&PageNo=1&PageSize=5';
        $http.post(API_URL + 'notifications', data, contentType).then(function(response) {
            var response = response.data;
            if (response.ResponseCode == 200 && response.Data.Records) { /* success case */
                $scope.notificationList = response.Data.Records;
                $scope.data.notificationCount = 0;
            } else {
                $scope.data.noNotifications = true;
            }
        });
    }


    /*get notification count*/
    $scope.getNotificationCount = function() {
        if ($scope.data.listLoading || $scope.data.noRecords) return;
        var data = 'SessionKey=' + SessionKey;
        $http.post(API_URL + 'notifications/getNotificationCount', data, contentType).then(function(response) {
            var response = response.data;
            if (response.ResponseCode == 200) { /* success case */
                $scope.data.notificationCount = response.Data.TotalUnread;
                $timeout(function() {
                    $scope.getNotificationCount();
                }, 15000);
            } else {
                $scope.data.noNotifications = true;
            }
        });
    }
    
    $scope.reloadPage =function(){
        location.reload();
    }

    /*change password*/
    $scope.changePassword = function() {
        $scope.changeCP = true;
        var data = 'SessionKey=' + SessionKey + '&'+$('#changePassword_form').serialize();
        $http.post(API_URL + 'users/changePassword', data, contentType).then(function(response) {
            var response = response.data;
            if (response.ResponseCode == 200 ) { /* success case */
                $('.modal-header .close').click();
                alertify.success(response.Message);
            } else {
                alertify.error(response.Message);
            }
            $scope.changeCP = false;    
        });
    }


    /*call function on load*/
    if (typeof(SessionKey) !== 'undefined') {
        //$scope.getNotificationCount();
    }


    // Listen for click on toggle checkbox
    $(document).on('click', "#select-all", function(event) {
        $('.select-all-checkbox').not(this).prop('checked', this.checked);
    });

    $(document).on('click', ".select-all-checkbox", function(event) {
        var anyBoxesChecked = false;
        $('.select-all-checkbox').each(function() {
            if ($(this).is(":checked")) {
                anyBoxesChecked = true;
            }
        });

        if (anyBoxesChecked) {
            $('#select-all').prop('checked', true);
        } else {
            $('#select-all').prop('checked', false);
        }

    });


}]);




/*jquery*/
$(document).ready(function() {
    /*Used to display menu active*/
    $('.navbar-nav ul li a.active').closest('ul').addClass('show');
    $('.navbar-nav ul li a.active').closest('ul').parent().closest('li').addClass('show');



    /*Submit Form*/
    $(".form-control").keypress(function(e) {
        if (e.which == 13) {
            $(this.form).find(':submit').focus().click();
        }
    });


    /*disable right click*/
    $('html').on("contextmenu", function(e) {
        return false;
    });


    $(document).on('keypress', ".numeric", function(event) {
        var key = window.event ? event.keyCode : event.which;
        if (event.keyCode === 8 || event.keyCode === 46) {
            return true;
        } else if (key < 48 || key > 57) {
            return false;
        } else {
            return true;
        }
    });


    $(document).on('keypress', ".integer", function(event) {
        var key = window.event ? event.keyCode : event.which;
        if (event.keyCode === 8 /* || event.keyCode === 46*/ ) {
            return true;
        } else if (key < 48 || key > 57) {
            return false;
        } else {
            return true;
        }
    });




    /*upload profile picture*/
    $(document).on('click', "#picture-uploadBtn", function() {
        $(this).parent().find('#fileInput').focus().val("").trigger('click');
    });


    $(document).on('change', '#fileInput', function() {
        var target = $(this).data('target');
        var croptarget = $(this).data('croptarget');

        var mediaGUID = $(this).data('targetinput');
        var progressBar = $('.progressBar'),
        bar = $('.progressBar .bar'),
        percent = $('.progressBar .percent');
        $(this).parent().ajaxForm({
            data: {
                SessionKey: SessionKey
            },
            dataType: 'json',
            beforeSend: function() {
                progressBar.fadeIn();
                var percentVal = '0%';
                bar.width(percentVal)
                percent.html(percentVal);
            },
            uploadProgress: function(event, position, total, percentComplete) {
                var percentVal = percentComplete + '%';
                bar.width(percentVal)
                percent.html(percentVal);
            },
            success: function(obj, statusText, xhr, $form) {
                if (obj.ResponseCode == 200) {
                    var percentVal = '100%';
                    bar.width(percentVal)
                    percent.html(percentVal);
                    $(target).prop("src", obj.Data.MediaURL);
                    //$("input[name='MediaGUIDs']").val(obj.Data.MediaGUID);
                    $(mediaGUID).val(obj.Data.MediaGUID);

                    if (obj.Data.ImageCropper == "Yes") {
                        $(croptarget).show();
                        /*crop plugin - starts*/
                        jQuery('img#picture-box-picture').imgAreaSelect({
                            handles: true,
                            onSelectEnd: getCropSizes,
                            disable: false,
                            hide: false,
                        });
                        /*crop plugin - ends*/
                    }

                } else {
                    alertify.error(obj.Message);
                }
            },
            complete: function(xhr) {
                progressBar.fadeOut();
                $('#fileInput').val("");


            }
        }).submit();

    });


    $(document).on('click', '#cropBtn', function() {
        var target = $(this).data('target');
        var croptarget = $(this).data('croptarget');

        var progressBar = $('.progressBar'),
        bar = $('.progressBar .bar'),
        percent = $('.progressBar .percent');
        $(this).parent().ajaxForm({
            data: {
                SessionKey: SessionKey
            },
            dataType: 'json',
            beforeSend: function() {
                progressBar.fadeIn();
                var percentVal = '0%';
                bar.width(percentVal)
                percent.html(percentVal);
            },
            uploadProgress: function(event, position, total, percentComplete) {
                var percentVal = percentComplete + '%';
                bar.width(percentVal)
                percent.html(percentVal);
            },
            success: function(obj, statusText, xhr, $form) {
                if (obj.ResponseCode == 200) {
                    var percentVal = '100%';
                    bar.width(percentVal)
                    percent.html(percentVal);
                    $(target).prop("src", obj.Data.MediaURL + '?' + Math.random());

                    jQuery('img#picture-box-picture').imgAreaSelect({
                        disable: true,
                        hide: true,
                    });
                    $(croptarget).hide();

                } else {
                    alertify.error(obj.Message);
                }
            },
            complete: function(xhr) {
                progressBar.fadeOut();
            }
        }).submit();

    });


    /* Function to get images size */
    function getCropSizes(img, obj) {
        var x_axis = obj.x1;
        var x2_axis = obj.x2;
        var y_axis = obj.y1;
        var y2_axis = obj.y2;
        var thumb_width = obj.width;
        var thumb_height = obj.height;
        if (thumb_width > 0) {
            jQuery('#x1-axis').val(x_axis);
            jQuery('#y1-axis').val(y_axis);
            jQuery('#x2-axis').val(x2_axis);
            jQuery('#y2-axis').val(y2_axis);
            jQuery('#thumb-width').val(thumb_width);
            jQuery('#thumb-height').val(thumb_height);
        } else {
            alert("Please select portion..!");
        }
    }




    $(document).on('keypress', ".numeric", function(event) {
        var key = window.event ? event.keyCode : event.which;
        if (event.keyCode === 8 || event.keyCode === 46) {
            return true;
        } else if (key < 48 || key > 57) {
            return false;
        } else {
            return true;
        }
    });





}); /* document ready end */

function getQueryStringValue(key)
{ 
  var vars = [], hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for(var i = 0; i < hashes.length; i++)
  {
    hash = hashes[i].split('=');
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
}
return (!vars[key]) ? '' : vars[key];
}