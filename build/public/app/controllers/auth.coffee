alt.controller 'authCtrl', ($scope, $route, $location, auth, toaster) ->
  $scope.login = ->
    auth.login($scope.user).then( (data) ->
      $location.path '/'
      toaster.pop 'success', 'Successfully login'
      $route.reload()
    ).catch (error) ->
      switch error.code
        when 'INVALID_USER' then toaster.pop 'warning', 'Invalid user email'
        when 'INVALID_PASSWORD' then toaster.pop 'warning', 'Invalid password'
        else toaster.pop 'warning', error
  $scope.logout = ->
    auth.logout()
    toaster.pop 'success', 'Successfully logout'
    return
  $scope.register = ->
    auth.register($scope.user).then( (data) ->
      auth.storeUserInfo($scope.user, data)
      toaster.pop 'success', 'Successfully registered'
      auth.login($scope.user).then (data) ->
        $location.path '/'
        toaster.pop 'success', 'Successfully login'
        $route.reload()
    ).catch (error) ->
      console.log error.code
      switch error.code
        when 'EMAIL_TAKEN' then toaster.pop 'warning', 'Email has been taken'
        else toaster.pop 'warning', error
    return