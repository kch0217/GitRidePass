"use strict";
angular.module('starter.controllers', [])



.controller('signInCtrl',function($scope, $state,$ionicPopup, loadingService, $ionicLoading, LoopBackAuth, userRegister, pushRegister, $localstorage, $ionicHistory, LoginService, commonCallback, RideRequestService, pushIDManager, $timeout, $rootScope){


  var cacheOfBroadcast;
  var previousInfo;
  var currentTime;
  var targetTime;
  var previousRequest;
  $scope.signin = function(info){
    loadingService.start($ionicLoading);
    console.log('Test');
    console.log(info.email);
    console.log(info.password);
    previousInfo = $localstorage.getObject("offerInfo");
    previousRequest = $localstorage.getObject("requestInfo");
    console.log("Request is ", previousRequest);
    console.log("Offer", previousInfo);
    console.log("Request", previousRequest);
    

    LoginService.login(info).then(function(value){
      pushIDManager.init();
      
      $localstorage.setObject('userInfo',{'email':info.email, 'pw': info.password});

      return LoginService.getGenderPreference();

    }).then(function(value){
      $localstorage.set('genderPreference', value.status);
      
      currentTime = new Date();
      targetTime = null;
      if (previousInfo != null)
        targetTime = new Date(previousInfo.time);
      var userinfo = $localstorage.getObject('userInfo');
      console.log(currentTime, targetTime);

      if (previousInfo == null || JSON.stringify(previousInfo) === "{}" || currentTime >= targetTime || userinfo.email !== previousInfo.owner){

        if (previousInfo != null){
          $localstorage.setObject('offerInfo', null);
          previousInfo = null
        }
        
        if (previousRequest == null || JSON.stringify(previousRequest) === "{}" || userinfo.email !== previousRequest.owner){
          if (previousRequest != null){
            previousRequest = null;
            $localstorage.setObject('requestInfo', null);
          }
          return RideRequestService.checkValid(null);
        }
        else{
          return RideRequestService.checkValid(previousRequest.requestId);
        }

      }
        
      else{
        return RideRequestService.checkValid(previousInfo.requestId);

      } 





      // $state.go('tab.gohome');
    }).then(function(value){
      console.log(value);
      if (value.valid){
        if (!(previousInfo == null || JSON.stringify(previousInfo) === "{}"|| currentTime >= targetTime)){
          var countTime = new Date(previousInfo.countDown);
          if (previousInfo.destination === "HKUST"){
            $state.go("tab.gohkust-matching-confirm", {'destination': previousInfo.destination, 'pickUp': previousInfo.pickUp, 'time':previousInfo.time, 'licence': previousInfo.licence, 'requestId': previousInfo.requestId, 'matchicon':previousInfo.matchicon, 'countDown': countTime});
          }
          else
            $state.go("tab.gohome-matching-confirm", {'destination': previousInfo.destination, 'pickUp': previousInfo.pickUp, 'time':previousInfo.time, 'licence': previousInfo.licence, 'requestId': previousInfo.requestId, 'matchicon':previousInfo.matchicon, 'countDown': countTime});
        }else{
          if (!(previousRequest == null || JSON.stringify(previousRequest) === "{}")){
            if (previousRequest.destination == "HKUST")
              return RideRequestService.checkPending({"requestId": previousRequest.requestId, "leaveUst": false});
            else
              return RideRequestService.checkPending({"requestId": previousRequest.requestId, "leaveUst": true});

          }
        }
        
        

      }else{
        $state.go('tab.gohome');
      }
      return commonCallback.success("end", null);


    }).then(function(value){
      //only for previous request
      console.log(value);
      if (value == "end"){
        return;
      }else{
        if (previousRequest.destination === "HKUST"){
          $state.go('tab.gohkust-matching', {'destination': "HKUST", 'pickUp': previousRequest.pickUp,'requestId': previousRequest.requestId });
        }
        else
        {
          $state.go('tab.gohome-matching', {'destination': previousRequest.destination, 'pickUp': previousRequest.pickUp,'requestId': previousRequest.requestId });
        }
        if (value.request != null){
          cacheOfBroadcast = value.request;
          $timeout(broadcastFunc, 1000);
          console.log("broadcasting an event to matching", cacheOfBroadcast);
          
        }
      }


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

  var broadcastFunc = function(){
    $rootScope.$broadcast('match-received',{"ridetime": cacheOfBroadcast.time,
                                      "destination": cacheOfBroadcast.destination_name,
                                      "licence": cacheOfBroadcast.license_number });  

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


.controller('registerCtrl',function($scope, $ionicPopup, $ionicHistory, LoginService, commonCallback, loadingService, $ionicLoading){
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

       //handle the email
    if ($scope.info.hkustMember){
      $scope.info.email += "@ust.hk"
    }

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
      loadingService.start($ionicLoading);
      console.log(res);
      if(res) {


      return LoginService.validation(datasent);


      } else {
      return commonCallback.emptyErrorHandling();  
      }

    }).then(function(value){
      loadingService.end($ionicLoading)
      console.log(value);
      if (value.status =='success'){
        if ($scope.info.hkustMember)
          return LoginService.register(datasent);
        else
          return LoginService.registerForNon(datasent);
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
      var alertPopup = $ionicPopup.alert({
          title: 'Error',
          template: 'Cannot register.'
      });
      alertPopup.then(function(res) {
        
      });
    }).finally(function(){
      loadingService.end($ionicLoading);
    });


  }

  $scope.reset = function(){
    $scope.numOfCar = 0;
    $scope.carLicence = [];
    $scope.info = { 'carNo':[],'gender': 'male'};


  }
})

.controller('forgetCtrl', function($scope, Member, $ionicPopup, $ionicHistory, loadingService, $ionicLoading){
  $scope.sendForget = function(email){

    loadingService.start($ionicLoading);
    Member.resetPw({'email': email}, function(value, responseheader){

      var alertPopup = $ionicPopup.alert({
        title: 'Done',
        template: 'Please check your email account.'
      });
      alertPopup.then(function(res) {
        $ionicHistory.goBack();
      });

    }, function(error){
      loadingService.end($ionicLoading);
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

.controller('goHomeCtrl', function($scope, $state,  $ionicHistory, $localstorage, RideRequestService, safeChecking, $ionicPopup, QueueSeatProvider, loadingService, $ionicLoading, errorBox){

  

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
    loadingService.start($ionicLoading);
    RideRequestService.addRequest({'destination_name': destination, 'pickup_name': null,  'gender_preference': ($scope.genderPreferred==="true"), 'leaveUst': true}).then(function(value){
      console.log(value.req.requestId);
      var requestId = value.req.requestId;
      destination = value.req.newDesName;
      var userinfo = $localstorage.getObject('userInfo');
      $localstorage.setObject('requestInfo', {'owner': userinfo.email, 'destination': destination, 'pickUp': availablePoints[destination],'requestId': requestId });
      safeChecking.start(0);
      $state.go('tab.gohome-matching', {'destination': destination, 'pickUp': availablePoints[destination],'requestId': requestId });

    }).catch(function(error){
      console.log(error);
      errorBox.start();
    }).finally(function(){
      loadingService.end($ionicLoading);
    });
  };


  var availablePoints = {'Hang Hau' : 'North Gate', 'Choi Hung' :'South Gate', 'Sai Kung': 'North Gate' };


  $scope.$on("$ionicView.enter", function(scopes, states){
    QueueSeatProvider.clear();
    QueueSeatProvider.update(true, null);
    $scope.doRefresh();
    
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


.controller('matchingCtrl', function($scope, $stateParams, $ionicHistory, $timeout, $state, Request, $ionicPopup, $localstorage, RideRequestService, $ionicLoading, loadingService, safeChecking, errorBox){

  $scope.destination = $stateParams.destination;
  $scope.pickUp = $stateParams.pickUp;
  $scope.licence = 'TBC';
  $scope.matchiconId = -1;
  $scope.requestId = $stateParams.requestId;

  $scope.searching = true;
  var timeCounter;
  console.log($scope.pickUp);


  $scope.goBack = function() {
    //contact the server to call off the ride

    $timeout.cancel(timeCounter);
    var leaveOption = true;
    if ($scope.destination ==="HKUST"){
      leaveOption = false;
    }
    $localstorage.setObject('requestInfo', null);
    loadingService.start($ionicLoading);
    RideRequestService.cancelMatch({"requestId": $scope.requestId, 'leaveUst': leaveOption}).then(function(value){

    }).catch(function(error){
      errorBox.start();
      console.log(error);
    }).finally(function(){
      loadingService.end($ionicLoading);
    })
    

    if ($scope.destination ==="HKUST"){
      $state.go('tab.gohkust');
    }
    else
      $state.go('tab.gohome');
    

  };


$scope.confirm = function(){
    $timeout.cancel(timeCounter);

    var leaveOption = true;
    if ($scope.destination ==="HKUST"){
      leaveOption = false;
    }
    loadingService.start($ionicLoading);
    RideRequestService.confirmMatch({"requestId": $scope.requestId, 'leaveUst': leaveOption}).then(function(value){
      console.log(value.matchicon);
      var userinfo = $localstorage.getObject('userInfo');
      var confirmCountdownTime = new Date();
      confirmCountdownTime.setSeconds(parseInt(confirmCountdownTime.getSeconds()) + 20);
      $localstorage.setObject('requestInfo', null);
      $localstorage.setObject('offerInfo', {'owner': userinfo.email, 'destination': $scope.destination, 'pickUp': $scope.pickUp, 'time':$scope.targetTime, 'licence': $scope.licence, 'requestId': $scope.requestId, 'matchicon':value.matchicon, 'countDown': confirmCountdownTime});
      if ($scope.destination === "HKUST")
        $state.go("tab.gohkust-matching-confirm", {'destination': $scope.destination, 'pickUp': $scope.pickUp, 'time':$scope.targetTime, 'licence': $scope.licence, 'requestId': $scope.requestId, 'matchicon':value.matchicon, 'countDown': confirmCountdownTime});
      else
        $state.go("tab.gohome-matching-confirm", {'destination': $scope.destination, 'pickUp': $scope.pickUp, 'time':$scope.targetTime, 'licence': $scope.licence, 'requestId': $scope.requestId, 'matchicon':value.matchicon, 'countDown': confirmCountdownTime});
    }).catch(function(error){
      errorBox.start();
      console.log(error);
    }).finally(function(){
      loadingService.end($ionicLoading);
    })


    
}


  
  $scope.$on('match-received', function(event, args){
    console.log("received a match from the server");
    console.log(args);
    $scope.licence = args.licence;

    console.log(args.ridetime);
    

    //calc time
    var currentTime = new Date();
    var targetTime = new Date(args.ridetime);
    $localstorage.setObject('requestInfo', null);//kill app when receiving notification

    if (targetTime <= currentTime || (targetTime.getTime() - currentTime.getTime())/1000/60 % 60 <= 1 ){

      var alertPopup = $ionicPopup.alert({
       title: 'Sorry!',
       template: 'The ride has expired.'
      });
      var leaveOption = true;
      if ($scope.destination ==="HKUST"){
          leaveOption = false;
      }
      alertPopup.then(function(res) {

        loadingService.start($ionicLoading);
        return RideRequestService.cancelMatch({"requestId": $scope.requestId, 'leaveUst': leaveOption});
      }).then(function(res){
        return RideRequestService.addRequestAgain({'requestId': $scope.requestId, 'leaveUst': leaveOption});
      }).then(function(res){
        $scope.requestId = res.req.requestId;
        var userinfo = $localstorage.getObject('userInfo');
        if ($scope.destination !== "HKUST")
          $scope.destination = res.req.newDesName;
        $localstorage.setObject('requestInfo', {'owner': userinfo.email, 'destination': $scope.destination, 'pickUp': $scope.pickUp,'requestId': $scope.requestId });

      }).catch(function(error){
        errorBox.start();
        console.log(error);
      }).finally(function(){
        loadingService.end($ionicLoading);
      });


        
      return;
    }
    $scope.targetTime = args.ridetime;

    currentTime.setSeconds(parseInt(currentTime.getSeconds()) + 20);

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

    }, function(error){

    });


    matched();
    // $scope.carLicence = args.ln;

  });

  $scope.$on('cancel-received', function(event, args){
    $timeout.cancel(timeCounter);


    var alertPopup = $ionicPopup.alert({
         title: 'Sorry!',
         template: 'The driver has cancelled it.'
    });
    alertPopup.then(function(res) {
      if ($scope.destination == null || $scope.destination ==""){
        console.log("error");
      }

      var leaveOption = true;
      if ($scope.destination ==="HKUST"){
        leaveOption = false;
      }
      loadingService.start($ionicLoading);
      return RideRequestService.addRequestAgain({'requestId': $scope.requestId, 'leaveUst': leaveOption});
      
    }).then(function(res){
      console.log("cancel-received", res);
      $scope.searching = true;
      $scope.requestId = res.req.requestId;
      var userinfo = $localstorage.getObject('userInfo');
      if ($scope.destination !== "HKUST")
        $scope.destination = res.req.newDesName;
      $localstorage.setObject('requestInfo', {'owner': userinfo.email, 'destination': $scope.destination, 'pickUp': $scope.pickUp,'requestId': $scope.requestId });


    }).catch(function(error){
      errorBox.start();
      console.log(error);
    }).finally(function(){
      loadingService.end($ionicLoading);
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
    
    timeCounter = $timeout(decreaseCount, 1000);

  }

  var decreaseCount = function(){
    // $scope.countDownTime--;
    var currentTime = new Date();
    
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

  $scope.$on("$ionicView.enter", function(scopes, states){
    if ($scope.destination == "HKUST")
      safeChecking.start(1);
    else
      safeChecking.start(0);

  });




  
})


.controller('matchingConfirmCtrl', function($scope, $stateParams, $state, $timeout, $ionicHistory, $ionicActionSheet, Request,$ionicPopup, RideRequestService, $ionicLoading, loadingService, safeChecking, $localstorage, errorBox){
  
  //retrieve from server
  $scope.licence = $stateParams.licence;
  $scope.targetTime = $stateParams.time;
  var targetTime = new Date($scope.targetTime);
  $scope.destination = $stateParams.destination;
  $scope.location = $stateParams.pickUp;
  var cur_time = new Date();
  
  var conf_time = new Date($stateParams.countDown);
  $scope.confirmationTime =  parseInt((conf_time.getTime() - cur_time.getTime())/1000);
  
  $scope.requestId = $stateParams.requestId;
  $scope.matchicon = parseInt($stateParams.matchicon);
  

  $scope.calcTime = function(){
    var targetTime = new Date($scope.targetTime);
    var currentTime = new Date();





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

      if ($scope.destination == "HKUST")
        safeChecking.start(1);
      else
        safeChecking.start(0);

      
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

    loadingService.start($ionicLoading);
    RideRequestService.cancelConfirmMatch({'requestId': $scope.requestId,'leaveUst': leaveOption}).then(function(value){
      console.log(value);
    }).catch(function(error){
      errorBox.start();
      console.log(error);
    }).finally(function(){
      loadingService.end($ionicLoading)
    })
    

    $localstorage.setObject("offerInfo", null);

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

        $localstorage.setObject("offerInfo", null);
        loadingService.start($ionicLoading);
        RideRequestService.addRequestAgain({'requestId': $scope.requestId, 'leaveUst': leaveOption}).then(function(value){
          var requestId = value.req.requestId;
          var destination = value.req.newDesName;
          $timeout.cancel(timer);
          $timeout.cancel(timer2);
        if ($scope.destination ==="HKUST"){
          $state.go('tab.gohkust-matching', {'destination': "HKUST", 'pickUp': $scope.location, 'requestId': requestId },  { reload: true });
        }
        else
          $state.go('tab.gohome-matching', {'destination': destination, 'pickUp': availablePoints[destination], 'requestId': requestId },  { reload: true });
        }).catch(function(error){
          errorBox.start();
          console.log(error);
        }).finally(function(){
          loadingService.end($ionicLoading);
        });


        
        
     },
     destructiveButtonClicked: function(){
        $ionicHistory.clearCache();
        $timeout.cancel(timer);
        $timeout.cancel(timer2);
        $localstorage.setObject("offerInfo", null);
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
    $localstorage.setObject("offerInfo", null);
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
      var leaveUst = true;
      if ($scope.destination =="HKUST"){
        leaveUst = false
      }

      loadingService.start($ionicLoading);


      return RideRequestService.addRequestAgain({'requestId': $scope.requestId, 'leaveUst': leaveUst});


      
    }).then(function(res){
      if ($scope.destination === "HKUST")
        $state.go('tab.gohkust-matching', {'destination': "HKUST", 'pickUp': $scope.location, 'requestId': res.req.requestId },  { reload: true });
      else
        $state.go('tab.gohome-matching', {'destination': res.req.newDesName, 'pickUp': availablePoints[res.req.newDesName], 'requestId': res.req.requestId },  { reload: true });

    }).catch(function(error){
      errorBox.start();
      
    }).finally(function(){
      loadingService.end($ionicLoading);
    });


  });

})

.controller('settingCtrl', function($scope, $state, Member, pushRegister, $localstorage, pushIDManager){
  $scope.logout = function(){
    Member.logout({}, function(value, responseheader){
      pushIDManager.unregister();
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

  $scope.ridesharing = function(){
    $state.go("tab.culture");
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

.controller('toUSTCtrl', function($scope, $ionicHistory, $localstorage, RideRequestService, $state, safeChecking, $ionicPopup, QueueSeatProvider, errorBox, loadingService, $ionicLoading){
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
    loadingService.start($ionicLoading);

    RideRequestService.addRequest({'destination_name': "HKUST", 'pickup_name':  destination, 'gender_preference': ($scope.genderPreferred==="true"), 'leaveUst': false}).then(function(value){
      console.log(value.req, destination);

      var requestId = value.req.requestId;
      destination = value.req.newDesName;
      safeChecking.start(1);
      var userinfo = $localstorage.getObject('userInfo');
      $localstorage.setObject('requestInfo', {'owner': userinfo.email, 'destination': "HKUST", 'pickUp': destination,'requestId': requestId });
      
      $state.go('tab.gohkust-matching', {'destination': "HKUST", 'pickUp': destination,'requestId': requestId });

    }).catch(function(error){
      errorBox.start();

    }).finally(function(){
      loadingService.end($ionicLoading);
    });

    

  };

  $scope.$on("$ionicView.enter", function(scopes, states){
    QueueSeatProvider.clear();
    QueueSeatProvider.update(true, null);
    safeChecking.end(1);
    $scope.doRefresh();
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

