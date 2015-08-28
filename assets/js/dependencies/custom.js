angular.module('MyApp').controller('userCtrl', [
  '$scope', '$http',
  function($scope, $http) {


    /////////////////////////////////////////////////////////////////////////////
    // Empezar sirviendo la lista de recetas
    /////////////////////////////////////////////////////////////////////////////

    // First, show a loading spinner
    $scope.recetasLoading = true;

    $scope.submitRecetasError = false;


    // Get the existing videos.
    io.socket.get('/video', function whenServerResponds(data, JWR) {
      $scope.recetasLoading = false;

      if (JWR.statusCode >= 400) {
       $scope.submitRecetasError = true;
        console.log('something bad happened');
        return;
      }

      $scope.recetas = data;

      // Apply the changes to the DOM
      // (we have to do this since `io.socket.get` is not a
      // angular-specific magical promisy-thing)
      $scope.$apply();

      
    });
    ///////////////////////////////////////////////////////////////
    // SET UP LISTENERS FOR DOM EVENTS
    ///////////////////////////////////////////////////////////////

    /**
     * When new video is submitted...
     * (the binding from our form's "submit" event to this function is
     *  handled via `ng-submit="submitNewVideo($event)` in the HTML)
     */

    $scope.submitNewReceta = function() {

      // A little "spin-lock" to prevent double-submission
      // (because disabling the submit button still allows double-posts
      //  if a user hits the ENTER key to submit the form multiple times.)
      if ($scope.busySubmittingReceta) {
        return;
      }

      // Harvest the data out of the form
      // (thanks to ng-model, it's already in the $scope object)
      var _newReceta = {
        nombre: $scope.newNombreReceta,
        preparacion: $scope.newRecetaPreparacion,
      };

      // create placeholder anchor element
      var parser = document.createElement('a');

      // assign url to parser.href
      parser.href = _newReceta.src


      // Side note:
      // Why not use something like `$scope.videoForm.title` or `$scope.newVideo.title`?
      // While this certainly keeps things more organized, it is a bit risky in the Angular
      // world.  I'm no Angular expert, but we have run into plenty of 2-way-binding issues/bugs
      // in the past from trying to do this.  I've found two guiding principles that help prevent
      // these sorts of issues:
      // + very clearly separate the $scope variables in your form from the $scope variables
      //   representing the rest of your page.
      // + don't point `ng-model` at the property of an object or array (e.g. `ng-model="foo.bar"`)
      //   Angular handles its 2-way bindings by reference, and it's not too hard to get into weird
      //   situations where your objects are all tangled up.

      // Now we'll submit the new video to the server:

      // First, show a loading state
      // (also disables form submission)
      $scope.busySubmittingReceta = true;

      io.socket.post('/receta', {
        nombre: _newReceta.nombre,
        preparacion: _newReceta.preparacion
      }, function whenServerResponds(data, JWR) {

        $scope.recetasLoading = false;

        if (JWR.statusCode>=400) {
          console.log('something bad happened');
          return;
        }

        $scope.recetas.unshift(_newVideo);

        // Hide the loading state
        // (also re-enables form submission)
        $scope.busySubmittingRecetas = false;

        //Clear out form inputs
        $scope.newRecetasNombre = '';
        $scope.newRecetasPreparacion = '';

        $scope.$apply();

      });

      io.socket.on('receta', function whenARecetaIsCreatedUpdatedOrDestroyed(event) {

        // Add the new video to the DOM
        $scope.recetas.unshift({
          nombre: event.data.title,
          preparacion: event.data.src,

        });

        // Apply the changes to the DOM
        // (we have to do this since `io.socket.get` is not a
        // angular-specific magical promisy-thing)
        $scope.$apply();
      });

    };

  }
]);