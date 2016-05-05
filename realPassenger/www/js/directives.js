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

      console.log("LOCATION DISPLAY");

      var getNumber = function(data){

        console.log("Directive data is ", data);
        if ($scope.location === "Choi Hung"){
          $scope.requestCount = data.chCount;
          $scope.offerNum = data.chSeatNum;

        }
        else{
          $scope.requestCount = data.hhCount;
          $scope.offerNum = data.hhSeatNum;
        }

      }

      $scope.location = this.location;

      QueueSeatProvider.update($scope.leaveUst, getNumber);
      $scope.showInfo = false;


      var showInfoFunc = function(){
        $scope.showInfo = !$scope.showInfo;


        QueueSeatProvider.update($scope.leaveUst, getNumber);
      }


        $scope.$on('$destroy', function(){

        })

        $scope.$on('scroll.refreshComplete', function(event, message){
          showInfoFunc();
        });


          

    },
    controllerAs: "locationCtrl"

  }

});