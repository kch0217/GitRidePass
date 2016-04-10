// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ionic.service.core', 'starter.controllers', 'starter.services','starter.directives', 'ngResource', 'lbServices', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }





  });
  $ionicPlatform.registerBackButtonAction(function (event) {
                    event.preventDefault();
            }, 100);
  
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  .state('signIn', {
    url: '/signin',
    templateUrl: 'templates/signin.html',
    controller: 'signInCtrl'

  })

  .state('register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'registerCtrl'
  })

  .state('forgetPW',{
    url:'/forget',
    templateUrl: 'templates/forgetPW.html',
    controller: 'forgetCtrl'
  })

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'tabController'
  })

  // Each tab has its own nav history stack:

  .state('tab.gohome', {
    url: '/gohome',
    views: {
      'tab-gohome': {
        templateUrl: 'templates/passenger-leave.html',
        controller: 'goHomeCtrl'
      }
    }
  })
  .state('tab.gohome-matching', {
    url: '/gohome/:destination/:pickUp/:requestId',
    views: {
      'tab-gohome': {
        templateUrl: 'templates/passenger-matching.html',
        controller: 'matchingCtrl',
        params: ['destination', 'pickUp','requestId']
      }
    }
  })

  .state('tab.gohome-matching-confirm', {
    url: '/gohome/:destination/:pickUp/:time/:licence/:requestId/:matchicon/:countDown',
    views: {
      'tab-gohome': {
        templateUrl: 'templates/passenger-confirmmatch.html',
        controller: 'matchingConfirmCtrl',
        params: ['destination', 'pickUp','time','licence', 'requestId', 'matchicon', 'countDown']
      }
    }
  })




  .state('tab.setting', {
      url: '/setting',
      views: {
        'tab-setting': {
          templateUrl: 'templates/passenger-setting.html',
          controller: 'settingCtrl'
        }
      }
    })

  .state('tab.setting_change_PW',{
    url: '/changePW',
    views: {
      'tab-setting':{
        templateUrl: 'templates/changePassword.html',
        controller: 'changePWCtrl'
      }
    }

  })


  .state('tab.gohkust', {
    url: '/gohkust',
    views: {
      'tab-gohkust': {
        templateUrl: 'templates/passenger-toUST.html',
        controller: 'toUSTCtrl'
      }
    }
  })


  .state('tab.gohkust-matching', {
    url: '/gohkust/:destination/:pickUp/:requestId',
    views: {
      'tab-gohkust': {
        templateUrl: 'templates/passenger-matching.html',
        controller: 'matchingCtrl',
        params: ['destination', 'pickUp','requestId']
      }
    }
  })

  .state('tab.gohkust-matching-confirm', {
    url: '/gohkust/:destination/:pickUp/:time/:licence/:requestId/:matchicon/:countDown',
    views: {
      'tab-gohkust': {
        templateUrl: 'templates/passenger-confirmmatch.html',
        controller: 'matchingConfirmCtrl',
        params: ['destination', 'pickUp','time','licence', 'requestId', 'matchicon', 'countDown']
      }
    }
  })
;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/signin');

})

.config(function(LoopBackResourceProvider){
  // Change the URL where to access the LoopBack REST API server
    LoopBackResourceProvider.setUrlBase('http://ridesharingfyp.ddns.net:3000/api');
     // LoopBackResourceProvider.setUrlBase('http://192.168.0.111:3000/api');
     LoopBackResourceProvider.setUrlBase('http://54.254.203.214:3000/api');
})


;
