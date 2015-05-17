alt.directive 'adminProducts', ->
  return {
    restrict: 'A',
    templateUrl: '/views/directives/admin-products.html',
    scope: true
    controller: ($scope) ->
      $scope.deleting = false
      $scope.startDelete = ->
        $scope.deleting = true
      $scope.cancelDelete = ->
        $scope.deleting = false
  }