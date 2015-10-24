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

.controller('signInCtrl', function($scope, $state){

  $scope.signin = function(){
    console.log('Test');
    $state.go('tab.gohome');
  }
})

.controller('askAcceptCtrl', function($scope){
})

.controller('goHomeCtrl', function($scope, $state, $ionicActionSheet){

  

  $scope.ready = function(destination){
    $state.go('tab.gohome-matching', {'destination': destination, 'pickUp': $scope.pickupPt });
  };


var availablePoints = ['North Gate', 'South Gate', 'Piazza', 'Hall 9', 'No Preference' ]

$scope.pickupPt = availablePoints[4];

   // Triggered on a button click, or some other target
 $scope.showOption = function() {

   // Show the action sheet
   var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: 'North Gate' },
       { text: 'South Gate' },
       { text: 'Piazza' },
       { text: 'Hall 9' }
     ],
     destructiveText: 'No preferred point',
     titleText: 'Choose a pickup point',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {
        $scope.pickupPt = availablePoints[index]; 
        return true;
     },
     destructiveButtonClicked: function(){
        $scope.pickupPt = availablePoints[4];
        return true;
     }
   });



 };

})


.controller('goHomeMatchingCtrl', function($scope, $stateParams, $ionicHistory, $timeout){

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
    $ionicHistory.goBack();

  };



  
  //temp
  $scope.testing = function(){
    timeCounter2 = $timeout(matched, 5000);
  }

  var matched = function(){
    $scope.searching = false;
    console.log('matched');
    timeCounter = $timeout($scope.goBack, 20000);

  }




  
})

.controller('settingCtrl', function($scope){

})


.controller('timeCtrl', function($scope, $timeout){
  var timeInSec = this.time*60;
  $scope.displayTime = null;


  

  $scope.startTime = function(){
    if (timeInSec > 0){
      timeInSec--;
      var min = Math.floor(timeInSec/60);
      var sec = timeInSec %60


      $scope.displayTime = sec;

      $timeout($scope.startTime, 1000);
    }
    
  }



});
