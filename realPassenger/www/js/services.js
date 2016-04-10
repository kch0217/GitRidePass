angular.module('starter.services', [])

.factory('loadingService', function() {
  return {
    start: function($ionicLoading){
      $ionicLoading.show({
      template: 'Loading...'
    });
    },
    end: function($ionicLoading){
      $ionicLoading.hide();
    }
  }
})

.service('userRegister', function(LoopBackAuth){
    //user
  this.register = function(){
    // kick off the platform web client
    Ionic.io();

    // this will give you a fresh user or the previously saved 'current user'
    var user = Ionic.User.current();

    // if the user doesn't have an id, you'll need to give it one.
    // if (!user.id) {
      // user.id = Ionic.User.anonymousId();
      user.id = ''+LoopBackAuth.currentUserId;
    // }

    user.set('accessTokenId', LoopBackAuth.accessTokenId);

    //persist the user
    user.save();
  }


})

.service('pushRegister', function(Member, $rootScope){
  //push
  this.token = null;
  var user = Ionic.User.current();
  var push = new Ionic.Push({
    "debug": false,
    'onNotification': function(notification) {
      // var payload = notification.payload;
      console.log(notification);
      if (notification.payload!=null){

        var data = notification.payload;
        if (data.status === "match")
          $rootScope.$broadcast('match-received',{"ridetime": data.ridetime,
                                                "destination": data.destination,
                                                "licence": data.license_number });
        else
          $rootScope.$broadcast('cancel-received', {
            "requestId": data.requestId,
            "newDesName": data.newDesName
          });
      }
    },
    "onRegister": function(data) {
      console.log(data.token);
    }
  });

  var callback = function(pushToken) {
    console.log(pushToken.token);
    this.token = pushToken.token;
    user.addPushToken(pushToken);
    user.save(); // you NEED to call a save after you add the token
    Member.updateToken({'deviceToken': this.token}, function(value, responseheaders){
        console.log(value);
      }, function(error){

      });

  }


  this.register = function(){


    push.register(callback);
  };

  this.unregister = function(){
    push.unregister();
  }

})

.service('eventTime', function($timeout){

  this.countdown = 0;
  this.counter = null;

  this.setTime = function(time){
    this.countdown = time;

  }

  this.startTime = function(){
    this.counter = $timeout(counting , 1000);

  }

  var counting = function(){
    if (this.countdown <= 0){
      //stop
    }
    else
    {
      this.countdown = this.countdown - 10000;
      this.counter = $timeout(counting, 1000);
    }
  }



})

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}])

 
.factory('commonCallback', function($q){
  return {
    defaultHandling: function(promise){

      var deferred = $q.defer();
      promise.then(function(value, responseHeaders){
        deferred.resolve(value);
      }, function(error){
        console.log(error);
        deferred.reject(error);
      });

      return deferred.promise;
    }, 

    emptyErrorHandling: function(){
      var deferred = $q.defer();
      deferred.reject('early exit!');
      return deferred.promise;
    },

    success: function(value, responseHeaders){
      var deferred = $q.defer();
      deferred.resolve(value);
      return deferred.promise;
    },
    error: function(error){
      var deferred = $q.defer();
      deferred.resolve(error);
      return deferred.promise;
    }
  }

})

.factory('LoginService', function(Member, commonCallback){




  return {
    login: function(info){

      var promise = Member.login({"email": info.email, "password": info.password}).$promise;

      return commonCallback.defaultHandling(promise);
    },

    getGenderPreference: function(){

      var promise = Member.getGenderPreference().$promise;



      return commonCallback.defaultHandling(promise);
    },

    validation: function(datasent){
      var promise = Member.validationandregister(datasent).$promise;

      return commonCallback.defaultHandling(promise);
    },

    register: function(datasent){
      var promise = Member.register(datasent).$promise;

      return commonCallback.defaultHandling(promise);
    },

    registerForNon : function(datasent){
      var promise = Member.registerNonUST(datasent).$promise;
      return commonCallback.defaultHandling(promise);
    }

  }

})

.factory('RideRequestService', function(Ride, Request, commonCallback){
  return{
    addRide: function(info){
      var promise = Ride.addRide(info).$promise;

      return commonCallback.defaultHandling(promise);
    },

    addRequest: function(info){
      var promise = Request.addRequest(info).$promise;
      return commonCallback.defaultHandling(promise);
    },
    getQueueSeatNumber: function(leaveOption){
      // console.log(leaveOption);
      var promise = Request.getQueueSeatNumber({"leaveUst": leaveOption}).$promise;
      return commonCallback.defaultHandling(promise);
    },
    checkValid: function(requestId){
      var promise = Request.checkValid({"requestId": requestId}).$promise;
      return commonCallback.defaultHandling(promise);
    },

    addRequestAgain: function(info){
      var promise = Request.addRequestAgain(info).$promise;
      return commonCallback.defaultHandling(promise);
    },

    cancelMatch: function(info){
      var promise = Request.cancelMatch(info).$promise;
      return commonCallback.defaultHandling(promise);
    },

    confirmMatch: function(info){
      var promise = Request.confirmMatch(info).$promise;
      return commonCallback.defaultHandling(promise);
    },

    cancelConfirmMatch: function(info){
      var promise = Request.cancelConfirmMatch(info).$promise;
      return commonCallback.defaultHandling(promise);
    },

    checkPending: function(info){
      var promise = Request.checkPending(info).$promise;
      return commonCallback.defaultHandling(promise);
    }
  }
})

.service('safeChecking', function(){
  var pageControl = [true, true];

  this.safeToStart = function(page){
    if (pageControl[0] && pageControl[1])
      return true;
    else
      return false;
  }

  this.start = function(page){
    pageControl[page] = false;
  }

  this.end = function(page){
    pageControl[page] = true;
  }

})

.service('QueueSeatProvider', function(RideRequestService){
  var queueSeat = {'home': null, 'hkust': null};

  this.update = function(leaveUst, callback){
    if (queueSeat.home == null || queueSeat.hkust == null){
      RideRequestService.getQueueSeatNumber(true).then(function(value){
        console.log("QueueSeatProvider Leave UST", value);
        queueSeat['home'] = value.num;
        return RideRequestService.getQueueSeatNumber(false);
      }).then(function(value){
        console.log("QueueSeatProvider Go UST", value);
        queueSeat['hkust'] = value.num;
      }).catch(function(error){
        console.log(error);
      }).finally(function(){
        if (callback !== null){
          // console.log(queueSeat);
          console.log(leaveUst);
          if (leaveUst == "true"){
            // console.log("QueueSeatProvider return home");
            callback(queueSeat['home']);
          }
          else{
            // console.log("QueueSeatProvider going hkust", queueSeat['hkust'], callback);
            callback(queueSeat['hkust']);
          }
            
        }
      });
    }else
    {
      if (callback !== null){
        // console.log("QueueSeatProvider no update callback", leaveUst, callback);
        if (leaveUst == "true"){
          // console.log("QueueSeatProvider no update callback 2", queueSeat['home']);
          callback(queueSeat['home']);
        }
        else{
          // console.log("QueueSeatProvider no update callback 3", queueSeat['hkust']);
          callback(queueSeat['hkust']);
        }
          

      }

    }
  }

  this.clear = function(){
    queueSeat = {'home': null, 'hkust': null};
  }




})

.service("pushIDManager", function($ionicPlatform, Member, $rootScope){
  var gcmID;
  var push;
  var manager = this;

  this.init = function(){
    // return;
    $ionicPlatform.ready(function(){
      push = PushNotification.init({
        android:{
          senderID: "721443256606"
        },
        ios: {
          
          "badge": "true",
          "sound": "true",
          "alert": "true"
        
        },
        windows: {}
      });

      push.on('registration', function(data){
        console.log("receive data", data);
        manager.registerGCM(data.registrationId);
        Member.updateToken({'deviceToken': data.registrationId}, function(value, responseheaders){
          console.log(value);
        }, function(error){
          console.log(error);
        });

      });

      push.on('notification', function(data) {
        // console.log(data.message);
        // console.log(data.title);
        // console.log(data.count);
        // console.log(data.sound);
        // console.log(data.image);
        console.log("Received push", data.additionalData);
        var pushData = data.additionalData;
        if (pushData.status == "match"){
          $rootScope.$broadcast('match-received',{"ridetime": pushData.ridetime,
                                      "destination": pushData.destination,
                                      "licence": pushData.license_number });  
        }
        else if (pushData.status =="cancel"){
            $rootScope.$broadcast('cancel-received', {
            "requestId": pushData.requestId,
            "newDesName": pushData.newDesName
          });
        }

      });

      push.on('error', function(e) {
        console.log(e.message);
      });


    });
    
  }

  this.registerGCM = function(id){
    gcmID = id;
  }

  this.unregister = function(){
    if (push!= null){
      push.unregister(function(){
        console.log("success to unregister");
      }, function(){
        console.log("fail to unregister");
      })
    }
  }


});
