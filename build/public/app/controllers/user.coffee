alt.controller 'userCtrl', ($scope, $route, $location, $routeParams, $rootScope, auth, products, user) ->
  currentRoute = $location.path().split('/')
  $scope.sectionActive = (section) ->
    section == currentRoute[3] ? 'active' : ''
  $scope.subSectionActive = (subSection) ->
    subSection == currentRoute[4] ? 'active' : ''
  $scope.ifUnderLove = () ->
    if currentRoute[3] == 'love' then return true else return false

  userID = $routeParams.userID

  $scope.userInfoUpdate = ->
    user.updateUserInfo $scope.user
    $route.reload()


  user.getUserColour(userID).then (data) ->
    colours = []
    _.forEach data, (snapshot) ->
      colours.push(_.capitalize(snapshot.$id))
    
    $scope.colours = _(colours).toString()

  user.getUserCategory(userID).then (data) ->
    categories = []
    _.forEach data, (snapshot) ->
      categories.push(_.capitalize(snapshot.$id))
    
    $scope.categories = _(categories).toString()

  user.getUserBrand(userID).then (data) ->
    brands = []
    _.forEach data, (snapshot) ->
      brands.push(_.capitalize(snapshot.$value))
    
    $scope.brands = _(brands).toString()

  user.getUserFashion(userID).on 'value', (data) ->
    if data.val() == 'x' then $scope.fashion = "Man's fashion" else $scope.fashion = "Woman's fashion"

  user.getUserNewsletter(userID).on 'value', (data) ->
    console.log data.val()
    if data.val() == true then $scope.newsletter = 'You have subscribbed to our newsletter and recommendation' else $scope.newsletter = 'You have not yet subscribbed to our newsletter and recommendation'

  $scope.ifEditable = () ->
    if userID == $rootScope.currentUser.$id then return true else return false

  $scope.showEditForm = () ->
    $scope.showEdit = true
    user.getUser(userID).then (data) ->
      $scope.user = data
