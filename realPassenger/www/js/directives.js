angular.module('starter.directives', [])
.directive('timer', function(){
	return{
		restrict: 'E',
		scope: {
			time: '='
		},
		template: '<span ng-init="startTime()">{{displayTime}}</span>',
		controller : 'timeCtrl',
		controllerAs: 'tCtrl',
		bindToController: true
	}
});