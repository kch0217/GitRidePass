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
  });