app.controller('PageController', function ($scope, $http,$timeout){
    $scope.saveDataLoading = false;


    /*edit data*/
    $scope.saveData = function (PageGUID)
    {
        $scope.saveDataLoading = true;
        CKEDITOR.instances['editor'].updateElement();
        var data = 'PageGUID='+PageGUID+'&'+$("form[name='save_form']").serialize();
        $http.post(API_URL+'admin/page/savePage', data, contentType).then(function(response) {
            var response = response.data;
            if(response.ResponseCode==200){ /* success case */               
                alertify.success(response.Message);
            }else{
                alertify.error(response.Message);
            }
            $scope.saveDataLoading = false;          
        });
    }




}); 


/*jquery*/
$( document ).ready(function() {

    CKEDITOR.editorConfig = function (config) {
        config.language = 'es';
        config.uiColor = '#F7B42C';
        config.height = 500;
        config.toolbarCanCollapse = true;

    };


    CKEDITOR.replace( 'editor', {
        toolbar: [
        { name: 'styles', items: [  'Format', 'Font', 'FontSize' ] },
        { name: 'colors', items: [ 'TextColor'] },
        { name: 'basicstyles', groups: [ 'basicstyles'], items: [ 'Bold', 'Italic', 'Underline'] },
        { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align'], items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
        /*{ name: 'insert', items: [ 'Image'] },*/
        ]
    });


});/* document ready end */






