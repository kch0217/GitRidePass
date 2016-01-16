angular.module('starter.controllers', [])



.controller('signInCtrl',function($scope, $state,$ionicPopup, loadingService, $ionicLoading, LoopBackAuth, userRegister, pushRegister, $localstorage, $ionicHistory, LoginService){


  // if (LoopBackAuth.currentUserId != null && LoopBackAuth.accessTokenId != null){
  //   $state.go('tab.gohome');
  // }




  $scope.signin = function(info){
    loadingService.start($ionicLoading);
    console.log('Test');
    console.log(info.email);
    console.log(info.password);

    LoginService.login(info).then(function(value){
      userRegister.register();
      pushRegister.register();
      $localstorage.setObject('userInfo',{'email':info.email, 'pw': info.password});

      return LoginService.getGenderPreference();

    }).then(function(value){
      $localstorage.set('genderPreference', value.status);
      $state.go('tab.gohome');
    }).catch(function(error){
      var alertPopup = $ionicPopup.alert({
        title: 'Error',
        template: 'Unable to login'
      });
      alertPopup.then(function(res) {
        console.log('Error to login');
      });
    }).finally(function(){
      loadingService.end($ionicLoading);
    });

    
  }

$scope.$on("$ionicView.enter", function(scopes, states){
    $ionicHistory.clearHistory();
    $ionicHistory.clearCache();
    var user = $localstorage.getObject('userInfo');
    if (user == null)
      return;
    if (!(user.email ==null || user.pw == null)){
      $scope.signin({"email": user.email, "password": user.pw});
    }

    console.log("Go to login page");
  });

})


.controller('registerCtrl',function($scope, $ionicPopup, $ionicHistory, LoginService, commonCallback){
  $scope.numOfCar = 0;
  $scope.carLicence = [];
  $scope.info = { 'carNo':[], 'gender': 'male'}



  

  $scope.checkCar = function(){
    console.log("click check car");

    
    if ($scope.info.haveCar){
      $scope.numOfCar = 1;
      $scope.carLicence.push('');
      
      $scope.info.carNo.push('');
      console.log($scope.carLicence);
    }
    else{
      $scope.numOfCar = 0;
      $scope.carLicence = [];
    }
  }

  $scope.addCar = function(){
    if ($scope.info.haveCar){
      console.log("click add car");
      $scope.numOfCar++;
      $scope.carLicence.push('');
    }
  }

  $scope.removeCar = function(){
    if ($scope.info.haveCar && $scope.numOfCar > 1){
      console.log("click remove car");
      $scope.numOfCar--;
      $scope.carLicence.splice(-1,1);
    }
  }

  $scope.confirm = function(){
    // A confirm dialog
    console.log($scope.info.carNo);

   var confirmPopup = $ionicPopup.confirm({
     title: 'Confirm you application',
     template: 'Do you want to submit the data?'
   });

    var datasent = { "first_name": $scope.info.firstname,
                  "last_name": $scope.info.lastname,
                  "phone_number": parseInt($scope.info.phonenumber),
                  "gender": $scope.info.gender,
                  "gender_preference": 0,
                  "authorized": 'no',
                  "isDriver": $scope.numOfCar>0? 'yes': 'no',
                  "email": $scope.info.email,
                  "password": $scope.info.password,
                  "car": $scope.info.carNo
                };

    confirmPopup.then(function(res) {
      console.log(res);
      if(res) {
       //submit


       
      console.log(datasent);

      return LoginService.validation(datasent);


      } else {
      return commonCallback.emptyErrorHandling();  
      }

    }).then(function(value){
      console.log(value);
      if (value.status =='success'){

      return LoginService.register(datasent);
      }
      else{
        var alertPopup = $ionicPopup.alert({
          title: 'Error',
          template: 'Please check your information.'
        });
        alertPopup.then(function(res) {
        
        });
        return commonCallback.emptyErrorHandling();
      }

    }).then(function(value){
      return $ionicPopup.alert({
           title: 'Done',
           template: 'Please activate your account from your email.'
      });

    }).then(function(value){
      $ionicHistory.goBack();
    }).catch(function(error){
      console.log(error);
    });


  }

  $scope.reset = function(){
    $scope.numOfCar = 0;
    $scope.carLicence = [];
    $scope.info = { 'carNo':[],'gender': 'male'};


  }
})

.controller('forgetCtrl', function($scope, Member, $ionicPopup, $ionicHistory){
  $scope.sendForget = function(email){
    console.log(email);
    Member.resetPw({'email': email}, function(value, responseheader){
      console.log(value);
      var alertPopup = $ionicPopup.alert({
        title: 'Done',
        template: 'Please check your email account.'
      });
      alertPopup.then(function(res) {
        $ionicHistory.goBack();
      });

    }, function(error){

      console.log(error);
      var alertPopup = $ionicPopup.alert({
        title: 'Error',
        template: 'Email does not exist.'
      });
      alertPopup.then(function(res) {
        $ionicHistory.goBack();
      });
    });
  };

  // Member.resetPassword({'email': 'testing@gmail.com'});
})

.controller('askAcceptCtrl', function($scope){
})

.controller('goHomeCtrl', function($scope, $state,  $ionicHistory, $localstorage, RideRequestService){

  

  $scope.ready = function(destination){
    $ionicHistory.clearCache();
    $scope.genderPreferred = $localstorage.get("genderPreference", "false");

    RideRequestService.addRequest({'destination_name': destination, 'gender_preference': ($scope.genderPreferred==="true")}).then(function(value){
      console.log(value.req.requestId);
      var requestId = value.req.requestId;
      destination = value.req.newDesName;
      
      $state.go('tab.gohome-matching', {'destination': destination, 'pickUp': availablePoints[destination],'requestId': requestId });

    }).catch(function(error){

    });

    

  };


var availablePoints = {'Hang Hau' : 'North Gate', 'Choi Hung' :'South Gate', 'Sai Kung': 'North Gate' };

  $scope.pickupPt = availablePoints[4];


})


.controller('goHomeMatchingCtrl', function($scope, $stateParams, $ionicHistory, $timeout, $state, Request){

  $scope.destination = $stateParams.destination;
  $scope.pickUp = $stateParams.pickUp;
  $scope.licence = 'TBC';
  $scope.matchiconId = -1;
  $scope.requestId = $stateParams.requestId;

  $scope.searching = true;
  var timeCounter;
  // var timeCounter2;

  $scope.goBack = function() {
    //contact the server to call off the ride
    console.log("Back");
    $timeout.cancel(timeCounter);
    // $timeout.cancel(timeCounter2);
    Request.cancelMatch({"requestId": $scope.requestId}, function(value, responseheader){
      console.log(value);
    }, function(error){
      console.log(error);


    })
    // $ionicHistory.goBack();
    $state.go('tab.gohome');

  };


$scope.confirm = function(){
    $timeout.cancel(timeCounter);
    // $timeout.cancel(timeCounter2);
    // $ionicHistory.goBack();
    Request.confirmMatch({"requestId": $scope.requestId}, function(value, responseheader){
      console.log(value.matchicon);
      $state.go("tab.gohome-matching-confirm", {'destination': $scope.destination, 'pickUp': $scope.pickUp, 'time':$scope.targetTime, 'licence': $scope.licence, 'requestId': $scope.requestId, 'matchicon':value.matchicon});
    }, function(error){
      console.log(error);


    });
    
}
  
  $scope.$on('match-received', function(event, args){
    console.log("received a match from the server");
    console.log(args);
    $scope.licence = args.licence;
    // $scope.matchiconId = parseInt(args.matchicon);

    // console.log($scope.matchiconId);
    console.log(args.ridetime);
    

    //calc time
    var currentTime = new Date();
    var targetTime = new Date(args.ridetime);

    $scope.targetTime = args.ridetime;

    currentTime.setSeconds(parseInt(currentTime.getSeconds()) + 20);
    console.log("Current Time second is" + currentTime.getSeconds());
    console.log("Target Time second is" + targetTime.getSeconds());
    console.log("Current Time minute is" + currentTime.getMinutes());
    console.log("Target Time minute is" + targetTime.getMinutes());
    if (parseInt(targetTime.getMinutes()) - parseInt(currentTime.getMinutes()) < 0){
      $scope.ridetime  = 60 + parseInt(targetTime.getMinutes()) - parseInt(currentTime.getMinutes());
    }
    else
      $scope.ridetime  = parseInt(targetTime.getMinutes()) - parseInt(currentTime.getMinutes());

    if (parseInt(targetTime.getSeconds()) < parseInt(currentTime.getSeconds())){
      $scope.ridetime--;
    }
    Request.checkAutoCancel({'requestId': $scope.requestId}, function(value, responseheaders){
      console.log(value);
    }, function(error){

    });
    console.log($scope.ridetime);

    matched();
    // $scope.carLicence = args.ln;

  });

  $scope.$on('cancel-received', function(event, args){
    cnosole.log("received a cancel from the server");
    $timeout.cancel(timeCounter);

    $scope.searching = true;

    $scope.requestId = args.requestId;
    $scope.destination = args.newDesName;


    var alertPopup = $ionicPopup.alert({
         title: 'Sorry!',
         template: 'The driver has cancelled it.'
    });
    alertPopup.then(function(res) {
    
    });


  });




  
  var matched = function(){
    $scope.searching = false;
    $scope.countDownTime = 20;
    console.log('matched');
    timeCounter = $timeout(decreaseCount, 1000);

  }

  var decreaseCount = function(){
    $scope.countDownTime--;
    if ($scope.countDownTime ==0){
      $scope.goBack();
    }
    else
    {
      timeCounter = $timeout(decreaseCount, 1000);
    }


  }






  
})


.controller('goHomeMatchingConfirmCtrl', function($scope, $stateParams, $state, $timeout, $ionicHistory, $ionicActionSheet, Request, $ionicHistory){
  
  //retrieve from server
  $scope.licence = $stateParams.licence;
  $scope.targetTime = $stateParams.time;
  
  $scope.destination = $stateParams.destination;
  $scope.location = $stateParams.pickUp;
  $scope.confirmationTime = 20;
  $scope.requestId = $stateParams.requestId;
  $scope.matchicon = parseInt($stateParams.matchicon);

  $scope.calcTime = function(){
    var targetTime = new Date($scope.targetTime);
    var currentTime = new Date();

    console.log(targetTime);
    console.log(currentTime);



    var min, sec;
    if (parseInt(targetTime.getMinutes()) < parseInt(currentTime.getMinutes())){
      min = parseInt(targetTime.getMinutes()) + 60 - parseInt(currentTime.getMinutes());
      sec = parseInt(targetTime.getSeconds()) - parseInt(currentTime.getSeconds());
      if (sec < 0){
        sec+= 60;
        min--;
      }
    }
    else{
      min = parseInt(targetTime.getMinutes()) - parseInt(currentTime.getMinutes());
      sec = parseInt(targetTime.getSeconds()) - parseInt(currentTime.getSeconds());
      if (sec < 0){
        sec+= 60;
        min--;
      }
    }

    $scope.time = min + sec/60;


    $scope.$on("$ionicView.enter", function(scopes, states){
      if($scope.matchicon < 10)
        $scope.imglocation = "img/icon_00" + $scope.matchicon + ".png";
      else
        $scope.imglocation = "img/icon_0" + $scope.matchicon + ".png";

      
    });

    $ionicHistory.nextViewOptions({
      
      disableBack: true
    });
      

  }

  var timer;
  var timer2;

  $scope.cancel = function(){

    $timeout.cancel(timer);
    $timeout.cancel(timer2);
    
    Request.cancelConfirmMatch({'requestId': $scope.requestId}, function(value, responseheader){
      console.log(value);
    }, function(error){
      console.log(error);
    });
    $state.go('tab.gohome');
  }

  $scope.finishedCount = false;

  $scope.countDown = function(){
    console.log("countdown");

    timer = $timeout(changeCount,1000*60*($scope.time+1));
    timer2 = $timeout(confirmCountDown, 1000);
  }

  var confirmCountDown = function(){
    $scope.confirmationTime--;
    if ($scope.confirmationTime > 0){
      timer2 = $timeout(confirmCountDown, 1000);
    }
  }

  var changeCount  = function(){
    $scope.finishedCount = true;
    console.log($scope.finishedCount);
  }

  $ionicHistory.nextViewOptions({
    disableBack: true
  });


// Triggered on a button click, or some other target
 $scope.cancelOption = function() {

   // Show the action sheet
   var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: 'Wait for another ride.' }
     ],
     destructiveText: 'Cancel the queuing',
     titleText: 'Have a problem with the current match?',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        Request.addRequestAgain({'requestId': $scope.requestId}, function(value, responseheader){
          var requestId = value.req.requestId;
          var destination = value.req.newDesName;
          $state.go('tab.gohome-matching', {'destination': destination, 'pickUp': availablePoints[destination], 'requestId': requestId },  { reload: true });
          return true;
        }, function(error){
          console.log(error);
          return true;
        })
        
        
     },
     destructiveButtonClicked: function(){
        $ionicHistory.clearCache();
        $state.go("tab.gohome");
        return true;
     }
   });





 };

 var availablePoints = {'Hang Hau' : 'North Gate', 'Choi Hung' :'South Gate', 'Sai Kung': 'North Gate' };

  $scope.goBack = function(){
    console.log("Pressed Go home");
    $state.go('tab.gohome');
  }


  $scope.$on('cancel-received', function(event, args){
    cnosole.log("received a cancel from the server");
    $timeout.cancel(timer);
    $timeout.cancel(timer2);




    var alertPopup = $ionicPopup.alert({
         title: 'Sorry!',
         template: 'The driver has cancelled it.'
    });
    alertPopup.then(function(res) {
      $state.go('tab.gohome-matching', {'destination': args.newDesName, 'pickUp': availablePoints[destination], 'requestId': args.requestId },  { reload: true });
    });


  });

})

.controller('settingCtrl', function($scope, $state, Member, pushRegister, $localstorage){
  $scope.logout = function(){
    Member.logout({}, function(value, responseheader){
      pushRegister.unregister();
      $localstorage.setObject('userInfo', null);
      $localstorage.set('genderPreference', null);
      $state.go('signIn');
    }, function(error){
      console.log('fail to logout');

    })
    
  }

  $scope.changePW = function(){
    $state.go("tab.setting_change_PW");

  }

  $scope.setting = {'sameGender': false};

  $scope.saveSettings = function(genderPreferred){
    console.log(genderPreferred);
    $localstorage.set('genderPreference', genderPreferred);
    Member.setGenderPreference({'gender_preference': genderPreferred}, function(value, responseheader){
      console.log(value);
    }, function(error){

    });
  }

  $scope.$on("$ionicView.enter", function(scopes, states){
    
    $scope.setting.sameGender = $localstorage.get('genderPreference', "false");
    console.log($scope.setting.sameGender);
    if ($scope.setting.sameGender == null){
      $scope.setting.sameGender = "false";
    }
    if ($scope.setting.sameGender ==="true")
      $scope.setting.sameGender = true;
    else
      $scope.setting.sameGender = false;

  });

  var user = $localstorage.getObject('userInfo');
  $scope.username = user.email;

})


.controller('changePWCtrl', function($scope){
  $scope.sendPW = function(){

    loadingService.start($ionicLoading);
    Member.updatePw({'oldpassword': this.info.oldpw, 'newpassword': this.info.newpw}, function(value, responseheader){
      console.log(value);
      if (value.status == 'fail'){
        var alertPopup = $ionicPopup.alert({
         title: 'Error',
         template: 'Password cannot be changed.'
       });
       alertPopup.then(function(res) {
       });
       
      }else{
        var alertPopup = $ionicPopup.alert({
           title: 'Done',
           template: 'You can now use the new password.'
        });
        alertPopup.then(function(res) {
           $ionicHistory.goBack();
        });
      }
      loadingService.end($ionicLoading);

    }, function(error){
      var alertPopup = $ionicPopup.alert({
         title: 'Error',
         template: 'Password cannot be changed.'
       });
       alertPopup.then(function(res) {
       });
       loadingService.end($ionicLoading);

    })

  }

})


.controller('timeCtrl', function($scope, $timeout){
  var timeInSec = this.time*60;
  $scope.displayTime = null;
  var ctrl = this;

  

  $scope.startTime = function(){
    if (timeInSec > 0){
      timeInSec--;
      var min = Math.floor(timeInSec/60);
      var sec = Math.floor(timeInSec %60);
      // console.log(min + " " + ctrl.context);
      if (min < 1 && ctrl.context =="matchToHome"){
        $scope.displayTime = "Arriving";
        console.log("matchToHome");
      }else{
        if (sec <10)
          sec = '0' + sec;
        $scope.displayTime = min + ' : ' + sec;

      }



      $timeout($scope.startTime, 1000);
    }
    else if (ctrl.context == "matchToHome" && sec > -60 ){
      timeInSec--;
      $timeout($scope.startTime, 1000);
    }
    
  }



})

.controller('toUSTCtrl', function($scope){
  $scope.ready = function(destination){
    console.log(destination);
  }

});
