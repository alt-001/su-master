alt.factory 'auth', ($rootScope, FIREBASE_URL, $firebaseAuth, $firebaseObject) ->
  rootRef = new Firebase FIREBASE_URL
  authRef = $firebaseAuth rootRef

  authRef.$onAuth (authUser) ->
    if authUser
      userRef = new Firebase FIREBASE_URL + '/users/' + authUser.uid
      userObj = $firebaseObject userRef
      $rootScope.currentUser = userObj
    else
      $rootScope.currentUser = ''

  output =
    login: (userObj) ->
      authRef.$authWithPassword userObj

    logout: ->
      authRef.$unauth()

    register: (userObj) ->
      authRef.$createUser userObj

    storeUserInfo: (userObj, regUser) ->
      usersRef = new Firebase FIREBASE_URL + '/users'

      if userObj.newsletter == undefined
        userObj.newsletter = false

      userInfo = 
        uid: regUser.uid
        firstname: userObj.firstname
        lastname: userObj.lastname
        email: userObj.email
        fashion: userObj.fashion
        newsletter: userObj.newsletter
        date: Firebase.ServerValue.TIMESTAMP
        address: ''
        fashion: ''
        colour: ''
        category: ''
        brand: ''

      usersRef.child(regUser.uid).set userInfo, ->
        console.log userInfo
      return

    requireAuth: ->
      authRef.$requireAuth()

    getCurrentUser: (uid) ->
      userRef = new Firebase FIREBASE_URL + '/users/' + uid
      return $firebaseObject userRef

  return output