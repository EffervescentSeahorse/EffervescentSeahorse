(function() {
  'use strict';
  angular.module('starter.controllers')
    .controller('SearchController', SearchController);

    SearchController.$inject = ['$scope','$state', 'GPS', '$ionicLoading', '$timeout', 'userService'];

    function SearchController ($scope, $state, GPS, $ionicLoading, $timeout, userService) {
      var vm = this;

      vm.sendToProfile = function () {
        $state.go('profile');
      };

      $scope.$on('$ionicView.enter', function(e) {

        //set up user list
        vm.users = [];

        $ionicLoading.show({
          template: '<p>Loading Matches...</p><ion-spinner></ion-spinner>'
        });

        //set User position
        GPS.getGeo().then(function (position) {
          var longitude = position.coords.longitude;
          var latitude = position.coords.latitude;
          var uid = window.localStorage['uid'];
          $ionicLoading.hide();
          geoFire.set(uid, [latitude, longitude]).then(function () {

            var geoQuery = geoFire.query({
              center: [latitude, longitude],
              radius: 10.000 //kilometers
            });

            geoQuery.on("key_entered", function (id, location, distance) {
              if (id !== uid) {
                 userService.getCompleteUser(id).then(function(user){
                   user.distance = distance;
                   $timeout(function(){
                     vm.users.push(user);
                   });
                 })
              }
            });

            geoQuery.on("key_exited", function (key, location, distance) {
              console.log("User " + key + " left query to " + location + " (" + distance + " km away)");
            });

          }, function (error) {
            console.log("Error: " + error);
          });
        }).catch(function (error) {
          console.error(error);
        });
      });
    }
})();
