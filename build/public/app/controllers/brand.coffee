alt.controller 'brandCtrl', ($scope, $timeout, $location, $route, $routeParams, $rootScope, $sce, auth, brand, products) ->
  $scope.brand = $routeParams.brand

  if $scope.brand
    $scope.brandData = brand.getBrand($scope.brand)
    $scope.brandChapters = ['products', 'brand', 'inspirations', 'traces']
    
    $scope.brandData.on 'value', (data) ->
      $timeout (->
        $scope.brandIntro = '/assets/brands/' + data.val().intro
        $scope.brandTitle = data.val().title
        $scope.brandStory = '/assets/brands/' + data.val().article
      ), 0

    $scope.brandProducts = brand.getBrandProducts($scope.brand)
    $scope.brandInspirations = brand.getBrandInspirations($scope.brand)
    $scope.brandTraces = brand.getBrandTraces($scope.brand)

  if $rootScope.currentUser.$id != undefined
    $scope.followBrand = (brandID) ->
      brand.followBrand brandID

  $scope.unfollowBrand = (brandID) ->
    brand.unfollowBrand brandID
    $route.reload()

  if $routeParams.userID
    console.log $routeParams.userID
    brand.followedBrands($routeParams.userID).then (data) ->
      $scope.followedBrands = data

  if $rootScope.currentUser.$id != undefined
    brand.currentUserFollowedBrands().$loaded().then (data) ->
      $scope.ifFollowed = (brandID) ->
        ifFollowed = data.$getRecord(brandID)
        if ifFollowed != null then return true else return false

  $scope.chapterActive = (chapter) ->
    currentRoute = $location.path().split('/')
    chapter == currentRoute[3] ? 'active' : ''