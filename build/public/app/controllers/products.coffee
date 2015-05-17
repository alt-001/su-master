alt.controller 'productsCtrl', ($scope, $window, $location, $route, $routeParams, $rootScope, $timeout, auth, products, toaster) ->
  currentRoute = $location.path().split('/')

  $scope.ready = false
  products.products().then (data) ->
    $scope.products = data
    $scope.ready = true

  $scope.ready = false
  products.randomProducts().then (data) ->
    $scope.randomProducts = data
    $scope.ready = true

  productID = $routeParams.productID
  if productID != undefined
    $scope.productID = productID
    products.product(productID).on 'value', (data) ->
      console.log data.val()
      $timeout (->
        $scope.productName = data.val().name
        $scope.productImage = data.val().image
        $scope.productBrand = data.val().brand
        $scope.productPrice = data.val().price
        $scope.productCategory = data.val().category
        $scope.productColor = data.val().color
        $scope.productMaterial = data.val().material
        $scope.productPurchace = data.val().purchace
      ), 0

  if $rootScope.currentUser.$id != undefined
    auth.getCurrentUser($rootScope.currentUser.$id).$loaded().then (data) ->
      $scope.userFilter = [data.fashion]

  $scope.addProduct = ->
    products.addProduct $scope
    $scope.name = ''
  $scope.deleteProduct = (productID) ->
    products.deleteProduct productID

  if $rootScope.currentUser != undefined
    $scope.flagProduct = (flagType, productID) ->
      products.flagProduct flagType, productID

  $scope.disflagProduct = (flagType, productID) ->
    products.disflagProduct flagType, productID
    flagSection = currentRoute[4]
    if flagSection && flagSection == 'loves' || flagSection == 'reserves'
      $route.reload()

  if $routeParams.userID
    products.flaggedProducts(currentRoute[4], $routeParams.userID).then (data) ->
      $scope.flaggedProducts = data

  if $rootScope.currentUser.$id != undefined
    products.currentUserFlaggedProducts('love').$loaded().then (data) ->
      $scope.ifLoved = (productID) ->
        ifLoved = data.$getRecord(productID)
        if ifLoved != null then return true else return false
    products.currentUserFlaggedProducts('reserve').$loaded().then (data) ->
      $scope.ifReserved = (productID) ->
        ifReserved = data.$getRecord(productID)
        if ifReserved != null then return true else return false


  $scope.genderIncludes = []
  $scope.includeGender = (gender) ->
    $scope.genderIncludes = [gender]

  $scope.colourIncludes = []
  $scope.includeColour = (colour) ->
    i = _.indexOf $scope.colourIncludes, colour
    if i > -1
      $scope.colourIncludes.splice i, 1
    else
      $scope.colourIncludes.push colour