alt.directive 'listProducts', ->
  return {
    restrict: 'AE'
    transclude: true
    scope: true
    templateUrl: '/views/directives/list-products.html'
  }