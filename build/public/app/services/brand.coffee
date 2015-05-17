alt.factory 'brand', ($rootScope, FIREBASE_URL, $firebaseArray, $firebaseObject) ->
  brandsRef = new Firebase FIREBASE_URL + '/brands'
  productsRef = new Firebase FIREBASE_URL + '/products'
  inspirationsRef = new Firebase FIREBASE_URL + '/inspirations'
  tracesRef = new Firebase FIREBASE_URL + '/traces'
  usersRef = new Firebase FIREBASE_URL + '/users'
  
  output =
    getBrand: (brand) ->
      return brandsRef.child(brand)

    getBrandProducts: (brand) ->
      return $firebaseArray productsRef.orderByChild('brand').equalTo(brand)

    getBrandInspirations: (brand) ->
      return $firebaseArray inspirationsRef.orderByChild('brand').equalTo(brand)

    getBrandTraces: (brand) ->
      return $firebaseArray tracesRef.orderByChild('brand').equalTo(brand)

    ### Follow brand ###
    followBrand: (brand) ->
      brandFollowedRef = brandsRef.child(brand).child('follows')
      followedCountRef = brandsRef.child(brand).child('followsCount')
      followedCountArray = $firebaseArray brandFollowedRef
      
      followInfo = 
        date: Firebase.ServerValue.TIMESTAMP

      ### Collect info about the user who follows this brand ###
      brandFollowedRef.child($rootScope.currentUser.$id).set followInfo, ->
        console.log 'Follow added to brand'
        followedCountRef.set followedCountArray.length, ->
          console.log 'Follows counted'

      ### Collect info about the product which has been loved ###
      userFollowsRef = usersRef.child($rootScope.currentUser.$id).child('follows')
      userFollowsRef.child(brand).set followInfo, ->
        console.log 'Follow added to user'

    unfollowBrand: (brand) ->
      brandFollowedRef = brandsRef.child(brand).child('follows')
      followedCountRef = brandsRef.child(brand).child('followsCount')
      followedCountArray = $firebaseArray brandFollowedRef

      ### Collect info about the user who follows this brand ###
      brandFollowedRef.child($rootScope.currentUser.$id).remove ->
        console.log 'Follow removed from brand'
        followedCountRef.set followedCountArray.length, ->
          console.log 'Follows counted'

      ### Collect info about the product which has been loved ###
      followsRefUser = usersRef.child($rootScope.currentUser.$id).child('follows').child(brand)
      followsRefUser.remove ->
        console.log 'Follow removed from user'

    followedBrands: (userID) ->
      followedBrands = []
      followedBrandsRef = usersRef.child(userID).child('follows')
      followedBrandsArray = $firebaseArray followedBrandsRef

      promise = followedBrandsArray.$loaded (data) ->
        _.forEach data, (snapshot) ->
          followedBrandObj = $firebaseObject brandsRef.child(snapshot.$id)
          followedBrands.push followedBrandObj
        return followedBrands
      return promise

    currentUserFollowedBrands: ->
      currentUserFollowedBrandsRef = usersRef.child($rootScope.currentUser.$id).child('follows')
      return $firebaseArray currentUserFollowedBrandsRef

  return output