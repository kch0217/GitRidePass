angular.module('starter.directives', [])
.directive('timer', function(){
	return{
		restrict: 'E',
		scope: {
			time: '=',
			context: '='
		},
		template: '<span ng-init="startTime()">{{displayTime}}</span>',
		controller : 'timeCtrl',
		controllerAs: 'tCtrl',
		bindToController: true
	}
})

.directive('compareTo', function () {
return {
      require: "ngModel",
      scope: {
        otherModelValue: "=compareTo"
      },
      link: function(scope, element, attributes, ngModel) {
        ngModel.$validators.compareTo = function(modelValue) {
          return modelValue == scope.otherModelValue;
        };

        scope.$watch("otherModelValue", function() {
          ngModel.$validate();
        });
      }
    };
  })

.directive('domainCheck', function(){
  return{
    require: "ngModel",
    link: function(scope, element, attributes, ngModel){
      ngModel.$validators.domainCheck = function(modelValue){
        // return !(modelValue == null ||modelValue.indexOf("@connect.ust.hk") === -1 && modelValue.indexOf("@ust.hk") === -1 && modelValue.indexOf("@stu.ust.hk") === -1);
        return true;
      };

    }
  }
})

.directive('locationDisplay', function(){
  return{
    restrict:'E',
    scope: {},
    transclude: true,
    bindToController:{
      info: '@',
      location: '@'
    },
    templateUrl: "./templates/locationDisplay.html",
    controller: function($scope, QueueSeatProvider, $timeout){
      $scope.leaveUst = this.info;
      // console.log(this);
      console.log("LOCATION DISPLAY");

      var getNumber = function(data){
        // console.log('getNumber', data);
        // $scope.statistics = QueueSeatProvider.get($scope.leaveUst);
        // console.log($scope.statistics);
        console.log("Directive data is ", data);
        if ($scope.location === "Choi Hung"){
          $scope.requestCount = data.chCount;
          $scope.offerNum = data.chSeatNum;
          // console.log("requestCount", $scope.requestCount);
        }
        else{
          $scope.requestCount = data.hhCount;
          $scope.offerNum = data.hhSeatNum;
        }
        // console.log("getting number is", $scope.statistics);
      }

      $scope.location = this.location;
      // console.log("location is", $scope.location);
      QueueSeatProvider.update($scope.leaveUst, getNumber);
      $scope.showInfo = false;
      // $scope.requestCount;
      // $scope.offerNum;

      var showInfoFunc = function(){
        $scope.showInfo = !$scope.showInfo;
        // console.log('location counting');
        // console.log($scope.statistics);
        // infoTimer = $timeout(showInfoFunc, 5000);

        QueueSeatProvider.update($scope.leaveUst, getNumber);
      }
      // var infoTimer = $timeout(showInfoFunc, 5000);



      // QueueSeatProvider.update(getNumber);

        $scope.$on('$destroy', function(){
          // $timeout.cancel(infoTimer);
        })

        $scope.$on('scroll.refreshComplete', function(event, message){
          showInfoFunc();
        });


          

    },
    controllerAs: "locationCtrl"

  }

});