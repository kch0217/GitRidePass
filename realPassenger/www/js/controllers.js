angular.module('starter.controllers', [])



.controller('signInCtrl',function($scope, $state,$ionicPopup, loadingService, $ionicLoading, LoopBackAuth, userRegister, pushRegister, $localstorage, $ionicHistory, LoginService, commonCallback, RideRequestService, pushIDManager){



  $scope.signin = function(info){
    loadingService.start($ionicLoading);
    console.log('Test');
    console.log(info.email);
    console.log(info.password);
    var previousInfo = $localstorage.getObject("offerInfo");
    var previousRequest = $localstorage.getObject("requestInfo");
    

    LoginService.login(info).then(function(value){
      pushIDManager.init();
      // userRegister.register();
      // pushRegister.register();
      $localstorage.setObject('userInfo',{'email':info.email, 'pw': info.password});

      return LoginService.getGenderPreference();

    }).then(function(value){
      $localstorage.set('genderPreference', value.status);
      
      var currentTime = new Date();
      var targetTime = new Date(previousInfo.time);
      var userinfo = $localstorage.getObject('userInfo');
      console.log(previousInfo);
      if (previousInfo == null || JSON.stringify(previousInfo) === "{}" || currentTime >= targetTime || userinfo.email !== previousInfo.owner)
        // $state.go('tab.gohome');
        return RideRequestService.checkValid(null);
      else{
        return RideRequestService.checkValid(previousInfo.requestId);

      } 





      // $state.go('tab.gohome');
    }).then(function(value){
      console.log(value);
      if (value.valid){
        if (previousInfo.destination === "HKUST"){
          $state.go("tab.gohkust-matching-confirm", {'destination': previousInfo.destination, 'pickUp': previousInfo.pickUp, 'time':previousInfo.time, 'licence': previousInfo.licence, 'requestId': previousInfo.requestId, 'matchicon':previousInfo.matchicon});
        }
        else
          $state.go("tab.gohome-matching-confirm", {'destination': previousInfo.destination, 'pickUp': previousInfo.pickUp, 'time':previousInfo.time, 'licence': previousInfo.licence, 'requestId': previousInfo.requestId, 'matchicon':previousInfo.matchicon});
        

      }else{
        $state.go('tab.gohome');
      }


    }).catch(function(error){
      var alertPopup = $ionicPopup.alert({
        title: 'Error',
        template: 'Unable to login'
      });
      alertPopup.then(function(res) {
        console.log('Error to login');
      });
      //delete
      // $state.go('tab.gohome');
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
    previousInfo = $localstorage.getObject("offerInfo");

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

.controller('goHomeCtrl', function($scope, $state,  $ionicHistory, $localstorage, RideRequestService, safeChecking, $ionicPopup, QueueSeatProvider){

  

  $scope.ready = function(destination){
    $ionicHistory.clearCache();
    if (!safeChecking.safeToStart()){
      var warningPopup = $ionicPopup.alert({
         title: 'Error',
         template: 'You can only initiate one request.'
       });
      warningPopup.then(function(res){

      }, function(error){

      });
      return;
    }

    $scope.genderPreferred = $localstorage.get("genderPreference", "false");

    RideRequestService.addRequest({'destination_name': destination, 'gender_preference': ($scope.genderPreferred==="true"), 'leaveUst': true}).then(function(value){
      console.log(value.req.requestId);
      var requestId = value.req.requestId;
      destination = value.req.newDesName;
      var userinfo = $localstorage.getObject('userInfo');
      $localstorage.setObject('requestInfo', {'owner': userinfo.email, 'destination': destination, 'pickUp': availablePoints[destination],'requestId': requestId });
      safeChecking.start(0);
      $state.go('tab.gohome-matching', {'destination': destination, 'pickUp': availablePoints[destination],'requestId': requestId });

    }).catch(function(error){

    });
  };


  var availablePoints = {'Hang Hau' : 'North Gate', 'Choi Hung' :'South Gate', 'Sai Kung': 'North Gate' };

  // $scope.pickupPt = availablePoints[4];
  $scope.$on("$ionicView.enter", function(scopes, states){
    
    RideRequestService.getQueueSeatNumber(true).then(function(value){
      $scope.statistics = value.num;
    });
    safeChecking.end(0);

  });

  $scope.doRefresh = function(){
    QueueSeatProvider.clear();
    QueueSeatProvider.update(true, null);
    $scope.$broadcast('scroll.refreshComplete', {"leaveUst": true});
    $scope.$apply();
  }


})


.controller('matchingCtrl', function($scope, $stateParams, $ionicHistory, $timeout, $state, Request, $ionicPopup, $localstorage){

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
    var leaveOption = true;
    if ($scope.destination ==="HKUST"){
      leaveOption = false;
    }
    $localstorage.setObject('requestInfo', null);
    Request.cancelMatch({"requestId": $scope.requestId, 'leaveUst': leaveOption}, function(value, responseheader){
      console.log(value);
    }, function(error){
      console.log(error);


    })
    // $ionicHistory.goBack();
    if ($scope.destination ==="HKUST"){
      $state.go('tab.gohkust');
    }
    else
      $state.go('tab.gohome');
    

  };


$scope.confirm = function(){
    $timeout.cancel(timeCounter);
    // $timeout.cancel(timeCounter2);
    // $ionicHistory.goBack();
    var leaveOption = true;
    if ($scope.destination ==="HKUST"){
      leaveOption = false;
    }
    Request.confirmMatch({"requestId": $scope.requestId, 'leaveUst': leaveOption}, function(value, responseheader){
      console.log(value.matchicon);
      var userinfo = $localstorage.getObject('userInfo');
      $localstorage.setObject('requestInfo', null);
      $localstorage.setObject('offerInfo', {'owner': userinfo.email, 'destination': $scope.destination, 'pickUp': $scope.pickUp, 'time':$scope.targetTime, 'licence': $scope.licence, 'requestId': $scope.requestId, 'matchicon':value.matchicon})
      if ($scope.destination === "HKUST")
        $state.go("tab.gohkust-matching-confirm", {'destination': $scope.destination, 'pickUp': $scope.pickUp, 'time':$scope.targetTime, 'licence': $scope.licence, 'requestId': $scope.requestId, 'matchicon':value.matchicon});
      else
        $state.go("tab.gohome-matching-confirm", {'destination': $scope.destination, 'pickUp': $scope.pickUp, 'time':$scope.targetTime, 'licence': $scope.licence, 'requestId': $scope.requestId, 'matchicon':value.matchicon});
    }, function(error){
      console.log(error);


    });
    // $state.go("tab.gohome-matching-confirm", {'destination': $scope.destination, 'pickUp': $scope.pickUp, 'time':$scope.targetTime, 'licence': $scope.licence, 'requestId': $scope.requestId, 'matchicon':13});
    
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

    if (targetTime <= currentTime || (targetTime.getTime() - currentTime.getTime())/1000/60 % 60 <= 1 ){
      
      var alertPopup = $ionicPopup.alert({
       title: 'Sorry!',
       template: 'The ride has expired.'
      });
      alertPopup.then(function(res) {
        
      });
      return;
    }
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
    var leaveOption = true;
    if ($scope.destination ==="HKUST"){
      leaveOption = false;
    }
    Request.checkAutoCancel({'requestId': $scope.requestId, 'leaveUst': leaveOption}, function(value, responseheaders){
      console.log(value);
    }, function(error){

    });
    console.log($scope.ridetime);

    matched();
    // $scope.carLicence = args.ln;

  });

  $scope.$on('cancel-received', function(event, args){
    console.log("received a cancel from the server");
    $timeout.cancel(timeCounter);

    $scope.searching = true;

    $scope.requestId = args.requestId;
    if ($scope.destination !== "HKUST")
      $scope.destination = args.newDesName;


    var alertPopup = $ionicPopup.alert({
         title: 'Sorry!',
         template: 'The driver has cancelled it.'
    });
    alertPopup.then(function(res) {
      if ($scope.destination == null || $scope.destination ==""){
        console.log("error");
      }
      
    });


  });




  var timer20;
  $scope.confirmCounting = true;
  var matched = function(){
    timer20 = new Date();
    timer20.setSeconds(parseInt(timer20.getSeconds()) + 20);
    var currentTime = new Date();
    $scope.searching = false;
    $scope.countDownTime = Math.floor((timer20.getTime() - currentTime.getTime())/1000);
    console.log('matched');
    timeCounter = $timeout(decreaseCount, 1000);

  }

  var decreaseCount = function(){
    // $scope.countDownTime--;
    var currentTime = new Date();
    console.log("confirm Counting...");
    if (currentTime >= timer20){
      // $scope.goBack();
      $scope.confirmCounting = false;
    }
    else
    {
      $scope.countDownTime = Math.floor((timer20.getTime() - currentTime.getTime())/1000);
      timeCounter = $timeout(decreaseCount, 1000);
    }


  }






  
})


.controller('matchingConfirmCtrl', function($scope, $stateParams, $state, $timeout, $ionicHistory, $ionicActionSheet, Request, $ionicHistory,$ionicPopup){
  
  //retrieve from server
  $scope.licence = $stateParams.licence;
  $scope.targetTime = $stateParams.time;
  var targetTime = new Date($scope.targetTime);
  $scope.destination = $stateParams.destination;
  $scope.location = $stateParams.pickUp;
  $scope.confirmationTime = 20;
  $scope.requestId = $stateParams.requestId;
  $scope.matchicon = parseInt($stateParams.matchicon);
  console.log($scope.destination, $scope.location);

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



      

  }

  $scope.$on("$ionicView.enter", function(scopes, states){
      if($scope.matchicon < 10)
        $scope.imglocation = "img/icon_00" + $scope.matchicon + ".png";
      else
        $scope.imglocation = "img/icon_0" + $scope.matchicon + ".png";

      
    });

    $ionicHistory.nextViewOptions({
      
      disableBack: true
    });

  var timer;
  var timer2;

  $scope.cancel = function(){

    $timeout.cancel(timer);
    $timeout.cancel(timer2);

    var leaveOption = true;
    if ($scope.destination ==="HKUST"){
      leaveOption = false;
    }
    
    Request.cancelConfirmMatch({'requestId': $scope.requestId,'leaveUst': leaveOption}, function(value, responseheader){
      console.log(value);
    }, function(error){
      console.log(error);
    });

    if ($scope.destination ==="HKUST"){
      console.log("Going back to HKUST");
      $state.go("tab.gohkust");
    }
    else
        $state.go('tab.gohome');
  }

  $scope.finishedCount = false;

  $scope.countDown = function(){
    console.log("countdown");

    // timer = $timeout(changeCount,1000*60*($scope.time+1));
    //change less than 1 min


    targetTime = targetTime.setMinutes(targetTime.getMinutes() - 1);
    timer = $timeout(changeCount,1000);
    timer2 = $timeout(confirmCountDown, 1000);
  }

  var confirmCountDown = function(){
    $scope.confirmationTime--;
    console.log("confirm Counting...")
    if ($scope.confirmationTime > 0){
      timer2 = $timeout(confirmCountDown, 1000);
    }
  }

  var changeCount  = function(){
    var currentTime = new Date();
    if (targetTime > currentTime){
      console.log("counting");
      timer = $timeout(changeCount, 1000);
      
    }
    else{
      console.log('finish counting');
      $scope.finishedCount = true;
      console.log($scope.finishedCount);
    }


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
        var leaveOption = true;
        if ($scope.destination ==="HKUST"){
          leaveOption = false;
        }
        Request.addRequestAgain({'requestId': $scope.requestId, 'leaveUst': leaveOption}, function(value, responseheader){
          var requestId = value.req.requestId;
          var destination = value.req.newDesName;
          $timeout.cancel(timer);
          $timeout.cancel(timer2);
        if ($scope.destination ==="HKUST"){
          $state.go('tab.gohkust-matching', {'destination': "HKUST", 'pickUp': $scope.location, 'requestId': requestId },  { reload: true });
        }
        else
          $state.go('tab.gohome-matching', {'destination': destination, 'pickUp': availablePoints[destination], 'requestId': requestId },  { reload: true });
          return true;
        }, function(error){
          console.log(error);
          return true;
        })
        
        
     },
     destructiveButtonClicked: function(){
        $ionicHistory.clearCache();
        $timeout.cancel(timer);
          $timeout.cancel(timer2);
        if ($scope.destination ==="HKUST")
          $state.go("tab.gohkust");
        else
          $state.go("tab.gohome");
        return true;
     }
   });





 };

 var availablePoints = {'Hang Hau' : 'North Gate', 'Choi Hung' :'South Gate', 'Sai Kung': 'North Gate' };

  $scope.goBack = function(){
    console.log("Pressed Go home/hkust");
    if ($scope.destination == "HKUST"){
      $state.go("tab.gohkust")
    }
    else

      $state.go('tab.gohome');
  }


  $scope.$on('cancel-received', function(event, args){
    console.log("received a cancel from the server");
    $timeout.cancel(timer);
    $timeout.cancel(timer2);




    var alertPopup = $ionicPopup.alert({
         title: 'Sorry!',
         template: 'The driver has cancelled it.'
    });
    alertPopup.then(function(res) {
      console.log($scope.destination);
      if ($scope.destination === "HKUST")
        $state.go('tab.gohkust-matching', {'destination': "HKUST", 'pickUp': $scope.location, 'requestId': args.requestId },  { reload: true });
      else
        $state.go('tab.gohome-matching', {'destination': args.newDesName, 'pickUp': availablePoints[args.newDesName], 'requestId': args.requestId },  { reload: true });
    });


  });

})

.controller('settingCtrl', function($scope, $state, Member, pushRegister, $localstorage, pushIDManager){
  $scope.logout = function(){
    Member.logout({}, function(value, responseheader){
      pushIDManager.unregister();
      // pushRegister.unregister();
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
  // var timeInSec = this.time*60;
  var targetTime = new Date(this.time);
  console.log(targetTime);
  $scope.displayTime = null;
  var ctrl = this;
  var counter;

  

  $scope.startTime = function(){
    var currentTime = new Date();
    if (targetTime > currentTime){
      var difference = targetTime.getTime() - currentTime.getTime();
      difference = difference/1000;
      var second = Math.floor(difference % 60);
      difference = difference/60;
      var minute = Math.floor(difference % 60);
      if (minute < 1){
        $scope.displayTime = "Arriving";
      }
      else{
        if (second < 10)
          second = '0' + second;
        $scope.displayTime = minute + ' : ' + second;
      }
      counter = $timeout($scope.startTime);

    }


    
  }

  $scope.$on('$destroy', function(){
    $timeout.cancel(counter);
  });

})

.controller('toUSTCtrl', function($scope, $ionicHistory, $localstorage, RideRequestService, $state, safeChecking, $ionicPopup, QueueSeatProvider){
    $scope.ready = function(destination){
    $ionicHistory.clearCache();
    if (!safeChecking.safeToStart()){
      var warningPopup = $ionicPopup.alert({
         title: 'Error',
         template: 'You can only initiate one request.'
       });
      warningPopup.then(function(res){

      }, function(error){

      });
      return;
    }
    $scope.genderPreferred = $localstorage.get("genderPreference", "false");

    RideRequestService.addRequest({'destination_name': destination, 'gender_preference': ($scope.genderPreferred==="true"), 'leaveUst': false}).then(function(value){
      console.log(value.req.requestId);
      var requestId = value.req.requestId;
      destination = value.req.newDesName;
      safeChecking.start(1);
      var userinfo = $localstorage.getObject('userInfo');
      $localstorage.setObject('requestInfo', {'owner': userinfo.email, 'destination': "HKUST", 'pickUp': destination,'requestId': requestId });
      
      $state.go('tab.gohkust-matching', {'destination': "HKUST", 'pickUp': destination,'requestId': requestId });

    }).catch(function(error){

    });

    

  };

  $scope.$on("$ionicView.enter", function(scopes, states){
    safeChecking.end(1);
  });

  $scope.doRefresh = function(){
    QueueSeatProvider.clear();
    QueueSeatProvider.update(false, null);
    $scope.$broadcast('scroll.refreshComplete', {"leaveUst": false});
    $scope.$apply();
  }


 


})

.controller("tabController", function($scope){
  $scope.disableSelected = [true, false, false];
  $scope.select = function(dest){
    // console.log(dest, $scope.disableSelected[dest]);
    if (dest === 0 && !$scope.disableSelected[dest]){
      // console.log("0 is selected");
      $scope.disableSelected = [true, false, false];
    }
    else if (dest === 1 && !$scope.disableSelected[dest]){
      // console.log("1 is selected");
      $scope.disableSelected = [false, true, false];
    }
    else if (dest === 2 && !$scope.disableSelected[dest]){
      // console.log("2 is selected");
      $scope.disableSelected = [false, false, true];
    }
  }
});

