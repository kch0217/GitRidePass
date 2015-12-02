angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('signInCtrl', function($scope, $state, Member,$ionicPopup){

  $scope.signin = function(){
    console.log('Test');
    
    Member.login({"username": "ken93939", "password":"24657021"}, function(content, code){
      //success
      console.log(content);
      console.log('success');
    }, function(error){
      //fail
      console.log(error);
      console.log('fail');
      var alertPopup = $ionicPopup.alert({
        title: 'Error',
        template: 'Unable to login'
      });
      alertPopup.then(function(res) {
        console.log('Error to login');
      });
    });
    $state.go('tab.gohome');
  }
})


.controller('registerCtrl', function($scope, $ionicPopup, $ionicHistory){
  $scope.numOfCar = 0;
  $scope.carLicence = [];

  $scope.checkCar = function(){
    console.log("click check car");
    
    if (this.haveCar){
      $scope.numOfCar = 1;
      $scope.carLicence.push('');
      console.log($scope.carLicence);
    }
    else{
      $scope.numOfCar = 0;
      $scope.carLicence = [];
    }
  }

  $scope.addCar = function(){
    if (this.haveCar){
      console.log("click add car");
      $scope.numOfCar++;
      $scope.carLicence.push('');
    }
  }

  $scope.removeCar = function(){
    if (this.haveCar && $scope.numOfCar > 1){
      console.log("click remove car");
      $scope.numOfCar--;
      $scope.carLicence.splice(-1,1);
    }
  }

  $scope.confirm = function(){
    // A confirm dialog

   var confirmPopup = $ionicPopup.confirm({
     title: 'Confirm you application',
     template: 'Do you want to submit the data?'
   });
   confirmPopup.then(function(res) {
     if(res) {
       //submit
       var alertPopup = $ionicPopup.alert({
         title: 'Done',
         template: 'Please activate your account from your email.'
       });
       alertPopup.then(function(res) {
         $ionicHistory.goBack();
       });

     } else {
       
     }
   });


  }
})

.controller('askAcceptCtrl', function($scope){
})

.controller('goHomeCtrl', function($scope, $state, $ionicActionSheet, $ionicHistory){

  

  $scope.ready = function(destination){
    $ionicHistory.clearCache();
    $state.go('tab.gohome-matching', {'destination': destination, 'pickUp': availablePoints[destination] });

  };


var availablePoints = {'Hang Hau' : 'North Gate', 'Choi Hung' :'South Gate', 'Sai Kung': 'North Gate' };

$scope.pickupPt = availablePoints[4];

 //   // Triggered on a button click, or some other target
 // $scope.showOption = function() {

 //   // Show the action sheet
 //   var hideSheet = $ionicActionSheet.show({
 //     buttons: [
 //       { text: 'North Gate' },
 //       { text: 'South Gate' },
 //       { text: 'Piazza' },
 //       { text: 'Hall 9' }
 //     ],
 //     destructiveText: 'No preferred point',
 //     titleText: 'Choose a pickup point',
 //     cancelText: 'Cancel',
 //     cancel: function() {
 //          // add cancel code..
 //        },
 //     buttonClicked: function(index) {
 //        $scope.pickupPt = availablePoints[index]; 
 //        return true;
 //     },
 //     destructiveButtonClicked: function(){
 //        $scope.pickupPt = availablePoints[4];
 //        return true;
 //     }
 //   });



 // };

})


.controller('goHomeMatchingCtrl', function($scope, $stateParams, $ionicHistory, $timeout, $state){

  $scope.destination = $stateParams.destination;
  $scope.pickUp = $stateParams.pickUp;

  $scope.searching = true;
  var timeCounter;
  var timeCounter2;

  $scope.goBack = function() {
    //contact the server to call off the ride
    console.log("Back");
    $timeout.cancel(timeCounter);
    $timeout.cancel(timeCounter2);
    // $ionicHistory.goBack();
    $state.go('tab.gohome');

  };


$scope.confirm = function(){
    $timeout.cancel(timeCounter);
    $timeout.cancel(timeCounter2);
    // $ionicHistory.goBack();
  $state.go("tab.gohome-matching-confirm", {'destination': $scope.destination, 'pickUp': $scope.pickUp, 'id':'001'});
}
  
  //temp
  $scope.testing = function(){
    timeCounter2 = $timeout(matched, 5000);
  }


  
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


.controller('goHomeMatchingConfirmCtrl', function($scope, $stateParams, $state, $timeout, $ionicHistory, $ionicActionSheet){
  
  //retrieve from server
  $scope.licence = 'AB 123';
  $scope.time = 1/2;
  $scope.destination = $stateParams.destination;
  $scope.location = $stateParams.pickUp;
  $scope.confirmationTime = 20;

  var timer;
  var timer2;

  $scope.cancel = function(){
    $timeout.cancel(timer);
    $timeout.cancel(timer2);
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
        $state.go('tab.gohome-matching', {'destination': $scope.destination, 'pickUp': $scope.location },  { reload: true });
        return true;
     },
     destructiveButtonClicked: function(){
        $ionicHistory.clearCache();
        $state.go("tab.gohome");
        return true;
     }
   });



 };



})

.controller('settingCtrl', function($scope){

})


.controller('timeCtrl', function($scope, $timeout){
  var timeInSec = this.time*60;
  $scope.displayTime = null;
  var ctrl = this;

  

  $scope.startTime = function(){
    if (timeInSec > 0){
      timeInSec--;
      var min = Math.floor(timeInSec/60);
      var sec = timeInSec %60;
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



});
