alt.factory 'products', ($rootScope, FIREBASE_URL, $firebaseArray, $firebaseObject) ->
  productsRef = new Firebase FIREBASE_URL + '/products'
  usersRef = new Firebase FIREBASE_URL + '/users'
  product = (productID) ->
    return $firebaseObject productsRef.child(productID)

  output =
    products: () ->
      productsArray = $firebaseArray productsRef
      promise = productsArray.$loaded (data) ->
        return data
      return promise

    randomProducts: () ->
      productsArray = $firebaseArray productsRef
      promise = productsArray.$loaded (data) ->
        return _.shuffle data
      return promise

    featuredProducts: ->
      return $firebaseArray productsRef.orderByChild('featured').equalTo(true)

    product: (productID) ->
      return productsRef.child(productID) 

    addProduct: (product) ->
      productInfo = 
        name: product.name 
        date: Firebase.ServerValue.TIMESTAMP

      productsRef.push productInfo, ->
        console.log 'Product added'

    deleteProduct: (productID) ->
      productRef = productsRef.child(productID)
      productRef.child('loves').on 'value', (users) ->
        if users.val() != null
          users.forEach (user) ->
            usersRef.child(user.key()).child('loves').child(productID).remove ->
              console.log 'Love removed from user'
            productRef.remove ->
              console.log 'Product deleted'
        else
          productRef.remove ->
            console.log 'Product deleted'

    flagProduct: (flagType, productID) ->
      productFlagRef = productsRef.child(productID).child(flagType + 's')
      flagCountRef = productsRef.child(productID).child(flagType + 'sCount')
      flagCountArray = $firebaseArray productFlagRef

      flagInfo = 
        date: Firebase.ServerValue.TIMESTAMP

      productFlagRef.child($rootScope.currentUser.$id).set flagInfo, ->
        console.log flagType + ' added to product'
        flagCountRef.set flagCountArray.length, ->
          console.log flagType + ' counted'

      userFlagRef = usersRef.child($rootScope.currentUser.$id).child(flagType + 's')
      userFlagRef.child(productID).set flagInfo, ->
        console.log flagType + ' added to user'

    disflagProduct: (flagType, productID) ->
      productFlagRef = productsRef.child(productID).child(flagType + 's')
      flagCountRef = productsRef.child(productID).child(flagType + 'sCount')
      flagCountArray = $firebaseArray productFlagRef

      productFlagRef.child($rootScope.currentUser.$id).remove ->
        console.log flagType + ' removed from product'
        flagCountRef.set flagCountArray.length, ->
          console.log flagType + ' counted'

      userFlagRef = usersRef.child($rootScope.currentUser.$id).child(flagType + 's').child(productID)
      userFlagRef.remove ->
        console.log flagType + ' removed from user'

    flaggedProducts: (flagSection, userID) ->
      flaggedProducts = []
      flaggedProductsRef = usersRef.child(userID).child(flagSection)
      flaggedProductsArray = $firebaseArray flaggedProductsRef
      promise = flaggedProductsArray.$loaded (data) ->
        _.forEach data, (snapshot) ->
          flaggedProductObj = $firebaseObject productsRef.child(snapshot.$id)
          flaggedProducts.push flaggedProductObj
        return flaggedProducts
      return promise

    currentUserFlaggedProducts: (flagType) ->
      currentUserFlaggedProductsRef = usersRef.child($rootScope.currentUser.$id).child(flagType + 's')
      return $firebaseArray currentUserFlaggedProductsRef
      
  return output