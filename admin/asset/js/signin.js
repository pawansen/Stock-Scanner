app.controller('PageController', function ($scope, $http,$timeout){
    var module = 'signin';

    /*add data*/
    $scope.signIn = function ()
    {
        $scope.processing = true;
        var data = $('#login_form').serialize();
        $http.post(module, data, contentType).then(function(Response) {
          console.log(Response);
            var response = Response.data;
            
            if(response.ResponseCode==200){ /* success case */
                $('#login_form')[0].reset();
                window.location.href = 'dashboard';               
            }else{
                alertify.error(response.Message);
            }
            $scope.processing = false;           
        });

    }


    
}); 



