alt.factory 'user', ($rootScope, FIREBASE_URL, $firebaseArray, $firebaseObject) ->
  usersRef = new Firebase FIREBASE_URL + '/users'
  product = (userID) ->
    return $firebaseObject productsRef.child(userID)

  output =
    getUser: (user) ->
      userObject = $firebaseObject usersRef.child(user)
      promise = userObject.$loaded (data) ->
        return data
      return promise

    getUserColour: (user) ->
      colourArray = $firebaseArray usersRef.child(user).child('colour')
      promise = colourArray.$loaded (data) ->
        return data
      return promise

    getUserCategory: (user) ->
      categoryArray = $firebaseArray usersRef.child(user).child('category')
      promise = categoryArray.$loaded (data) ->
        return data
      return promise

    getUserBrand: (user) ->
      brandArray = $firebaseArray usersRef.child(user).child('brand')
      promise = brandArray.$loaded (data) ->
        return data
      return promise

    getUserFashion: (user) ->
      return usersRef.child(user).child('fashion')

    getUserNewsletter: (user) ->
      return usersRef.child(user).child('newsletter')

    updateUserInfo: (user) ->
      if user != undefined
        if user.firstname == undefined then firstname = $rootScope.currentUser.firstname else firstname = user.firstname
        if user.lastname == undefined then lastname = $rootScope.currentUser.lastname else lastname = user.lastname
        if user.username == undefined then username = $rootScope.currentUser.username else username = user.username
        if user.address == undefined then address = $rootScope.currentUser.address else address = user.address
        if user.fashion == undefined then fashion = $rootScope.currentUser.fashion else fashion = user.fashion
        if user.colour == undefined then colour = $rootScope.currentUser.colour else colour = user.colour
        if user.category == undefined then category = $rootScope.currentUser.category else category = user.category
        if user.brand == undefined then brand = $rootScope.currentUser.brand else brand = user.brand
        if user.newsletter == undefined then newsletter = $rootScope.currentUser.newsletter else newsletter = user.newsletter
        if $rootScope.currentUser.loves != undefined then loves = $rootScope.currentUser.loves else loves = ''
        if $rootScope.currentUser.follows != undefined then follows = $rootScope.currentUser.follows else follows = ''
        if $rootScope.currentUser.reserves != undefined then reserves = $rootScope.currentUser.reserves else reserves = ''

        userInfo =
          uid: $rootScope.currentUser.uid
          date: $rootScope.currentUser.date
          firstname: firstname
          lastname: lastname
          username: username
          email: $rootScope.currentUser.email
          address: address
          fashion: fashion
          colour: colour
          category: category
          brand: brand
          newsletter: newsletter
          loves: loves
          follows: follows
          reserves: reserves

        usersRef.child($rootScope.currentUser.$id).set userInfo, ->
      return
      
  return output