// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ionic.service.core', 'starter.controllers', 'starter.services','starter.directives', 'ngResource', 'lbServices'])

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
    templateUrl: 'templates/tabs.html'
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
    cache: false,
    url: '/gohome/:destination/:pickUp',
    views: {
      'tab-gohome': {
        templateUrl: 'templates/passenger-leavematching.html',
        controller: 'goHomeMatchingCtrl',
        params: ['destination', 'pickUp']
      }
    }
  })

  .state('tab.gohome-matching-confirm', {
    url: '/gohome/:destination/:pickUp/:time/:licence',
    views: {
      'tab-gohome': {
        templateUrl: 'templates/passenger-confirmmatch.html',
        controller: 'goHomeMatchingConfirmCtrl',
        params: ['destination', 'pickUp','time','licence']
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
        controller: 'changePwCtrl'
      }
    }

  })

  .state('tab.chat-detail', {
    url: '/chats/:chatId',
    views: {
      'tab-chats': {
        templateUrl: 'templates/chat-detail.html',
        controller: 'ChatDetailCtrl'
      }
    }
  })

  .state('tab.gohkust', {
    url: '/gohkust',
    views: {
      'tab-gohkust': {
        templateUrl: 'templates/passenger-toUSTaskaccept.html',
        controller: 'askAcceptCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/signin');

})

.config(function(LoopBackResourceProvider){
  // Change the URL where to access the LoopBack REST API server
    LoopBackResourceProvider.setUrlBase('http://175.159.197.72:3000/api');
     // LoopBackResourceProvider.setUrlBase('http://localhost:3000/api');
})


;
