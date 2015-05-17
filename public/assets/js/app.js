var alt;

alt = angular.module('alt', ['ngResource', 'ngRoute', 'toaster', 'firebase', 'wu.masonry', "ngSanitize", "com.2fdevs.videogular", "com.2fdevs.videogular.plugins.controls", "com.2fdevs.videogular.plugins.poster"]);

alt.constant('FIREBASE_URL', 'https://alovelything.firebaseio.com');

alt.run(function($rootScope, $location) {
  return $rootScope.$on('$routeChangeError', function(event, next, previous, error) {
    if (error === 'AUTH_REQUIRED') {
      return $rootScope.message = '';
    }
  });
});

alt.config(function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  return $routeProvider.when('/', {
    templateUrl: 'views/pages/index.html'
  }).when('/signup', {
    templateUrl: 'views/pages/user/signup.html'
  }).when('/info/:section', {
    templateUrl: 'views/pages/info/info.html'
  }).when('/user/:userID/love/loves', {
    templateUrl: 'views/pages/user/loves.html'
  }).when('/user/:userID/love/reserves', {
    templateUrl: 'views/pages/user/reserves.html'
  }).when('/user/:userID/love/follows', {
    templateUrl: 'views/pages/user/follows.html'
  }).when('/user/:userID/profile', {
    templateUrl: 'views/pages/user/profile.html'
  }).when('/brand/:brand/products', {
    templateUrl: 'views/pages/brand/products.html'
  }).when('/brand/:brand/brand', {
    templateUrl: 'views/pages/brand/brand.html'
  }).when('/brand/:brand/inspirations', {
    templateUrl: 'views/pages/brand/inspirations.html'
  }).when('/brand/:brand/traces', {
    templateUrl: 'views/pages/brand/traces.html'
  }).when('/search', {
    templateUrl: 'views/pages/search/search.html'
  }).when('/search/:section', {
    templateUrl: 'views/pages/search/search-section.html'
  }).when('/explore', {
    templateUrl: 'views/pages/explore.html'
  }).when('/product/:productID', {
    templateUrl: 'views/pages/product.html'
  }).when('/admin/products', {
    templateUrl: 'views/pages/admin/products.html',
    resolve: {
      currentAuth: function(auth) {
        return auth.requireAuth();
      }
    }
  }).otherwise({
    redirectTo: '/'
  });
});

alt.controller('authCtrl', function($scope, $route, $location, auth, toaster) {
  $scope.login = function() {
    return auth.login($scope.user).then(function(data) {
      $location.path('/');
      toaster.pop('success', 'Successfully login');
      return $route.reload();
    })["catch"](function(error) {
      switch (error.code) {
        case 'INVALID_USER':
          return toaster.pop('warning', 'Invalid user email');
        case 'INVALID_PASSWORD':
          return toaster.pop('warning', 'Invalid password');
        default:
          return toaster.pop('warning', error);
      }
    });
  };
  $scope.logout = function() {
    auth.logout();
    toaster.pop('success', 'Successfully logout');
  };
  return $scope.register = function() {
    auth.register($scope.user).then(function(data) {
      auth.storeUserInfo($scope.user, data);
      toaster.pop('success', 'Successfully registered');
      return auth.login($scope.user).then(function(data) {
        $location.path('/');
        toaster.pop('success', 'Successfully login');
        return $route.reload();
      });
    })["catch"](function(error) {
      console.log(error.code);
      switch (error.code) {
        case 'EMAIL_TAKEN':
          return toaster.pop('warning', 'Email has been taken');
        default:
          return toaster.pop('warning', error);
      }
    });
  };
});

alt.controller('brandCtrl', function($scope, $timeout, $location, $route, $routeParams, $rootScope, $sce, auth, brand, products) {
  $scope.brand = $routeParams.brand;
  if ($scope.brand) {
    $scope.brandData = brand.getBrand($scope.brand);
    $scope.brandChapters = ['products', 'brand', 'inspirations', 'traces'];
    $scope.brandData.on('value', function(data) {
      return $timeout((function() {
        $scope.brandIntro = '/assets/brands/' + data.val().intro;
        $scope.brandTitle = data.val().title;
        return $scope.brandStory = '/assets/brands/' + data.val().article;
      }), 0);
    });
    $scope.brandProducts = brand.getBrandProducts($scope.brand);
    $scope.brandInspirations = brand.getBrandInspirations($scope.brand);
    $scope.brandTraces = brand.getBrandTraces($scope.brand);
  }
  if ($rootScope.currentUser.$id !== void 0) {
    $scope.followBrand = function(brandID) {
      return brand.followBrand(brandID);
    };
  }
  $scope.unfollowBrand = function(brandID) {
    brand.unfollowBrand(brandID);
    return $route.reload();
  };
  if ($routeParams.userID) {
    console.log($routeParams.userID);
    brand.followedBrands($routeParams.userID).then(function(data) {
      return $scope.followedBrands = data;
    });
  }
  if ($rootScope.currentUser.$id !== void 0) {
    brand.currentUserFollowedBrands().$loaded().then(function(data) {
      return $scope.ifFollowed = function(brandID) {
        var ifFollowed;
        ifFollowed = data.$getRecord(brandID);
        if (ifFollowed !== null) {
          return true;
        } else {
          return false;
        }
      };
    });
  }
  return $scope.chapterActive = function(chapter) {
    var currentRoute, ref;
    currentRoute = $location.path().split('/');
    return (ref = chapter === currentRoute[3]) != null ? ref : {
      'active': ''
    };
  };
});

alt.controller('infoCtrl', function($scope, $timeout, $location, $routeParams, $rootScope, $sce, info) {
  $scope.section = $routeParams.section;
  $scope.info = info.getInfo();
  info.getInfoSection($scope.section).child('/title').on('value', function(title) {
    return $timeout((function() {
      $scope.infoTitle = title.val();
      return $scope.infoBody = '/views/pages/info/' + $scope.section + '.html';
    }), 0);
  });
  return $scope.sectionActive = function(section) {
    var currentRoute, ref;
    currentRoute = $location.path().split('/');
    return (ref = section === currentRoute[2]) != null ? ref : {
      'active': ''
    };
  };
});

alt.controller('productsCtrl', function($scope, $window, $location, $route, $routeParams, $rootScope, $timeout, auth, products, toaster) {
  var currentRoute, productID;
  currentRoute = $location.path().split('/');
  $scope.ready = false;
  products.products().then(function(data) {
    $scope.products = data;
    return $scope.ready = true;
  });
  $scope.ready = false;
  products.randomProducts().then(function(data) {
    $scope.randomProducts = data;
    return $scope.ready = true;
  });
  productID = $routeParams.productID;
  if (productID !== void 0) {
    $scope.productID = productID;
    products.product(productID).on('value', function(data) {
      console.log(data.val());
      return $timeout((function() {
        $scope.productName = data.val().name;
        $scope.productImage = data.val().image;
        $scope.productBrand = data.val().brand;
        $scope.productPrice = data.val().price;
        $scope.productCategory = data.val().category;
        $scope.productColor = data.val().color;
        $scope.productMaterial = data.val().material;
        return $scope.productPurchace = data.val().purchace;
      }), 0);
    });
  }
  if ($rootScope.currentUser.$id !== void 0) {
    auth.getCurrentUser($rootScope.currentUser.$id).$loaded().then(function(data) {
      return $scope.userFilter = [data.fashion];
    });
  }
  $scope.addProduct = function() {
    products.addProduct($scope);
    return $scope.name = '';
  };
  $scope.deleteProduct = function(productID) {
    return products.deleteProduct(productID);
  };
  if ($rootScope.currentUser !== void 0) {
    $scope.flagProduct = function(flagType, productID) {
      return products.flagProduct(flagType, productID);
    };
  }
  $scope.disflagProduct = function(flagType, productID) {
    var flagSection;
    products.disflagProduct(flagType, productID);
    flagSection = currentRoute[4];
    if (flagSection && flagSection === 'loves' || flagSection === 'reserves') {
      return $route.reload();
    }
  };
  if ($routeParams.userID) {
    products.flaggedProducts(currentRoute[4], $routeParams.userID).then(function(data) {
      return $scope.flaggedProducts = data;
    });
  }
  if ($rootScope.currentUser.$id !== void 0) {
    products.currentUserFlaggedProducts('love').$loaded().then(function(data) {
      return $scope.ifLoved = function(productID) {
        var ifLoved;
        ifLoved = data.$getRecord(productID);
        if (ifLoved !== null) {
          return true;
        } else {
          return false;
        }
      };
    });
    products.currentUserFlaggedProducts('reserve').$loaded().then(function(data) {
      return $scope.ifReserved = function(productID) {
        var ifReserved;
        ifReserved = data.$getRecord(productID);
        if (ifReserved !== null) {
          return true;
        } else {
          return false;
        }
      };
    });
  }
  $scope.genderIncludes = [];
  $scope.includeGender = function(gender) {
    return $scope.genderIncludes = [gender];
  };
  $scope.colourIncludes = [];
  return $scope.includeColour = function(colour) {
    var i;
    i = _.indexOf($scope.colourIncludes, colour);
    if (i > -1) {
      return $scope.colourIncludes.splice(i, 1);
    } else {
      return $scope.colourIncludes.push(colour);
    }
  };
});

alt.controller('searchCtrl', function($scope, $routeParams, $location, products) {
  var searchSections;
  products.products().then(function(data) {
    return $scope.products = data;
  });
  $scope.section = $routeParams.section;
  searchSections = [
    {
      value: "brand",
      text: "Brands"
    }, {
      value: "name",
      text: "Name"
    }, {
      value: "id",
      text: "Recents"
    }, {
      value: "price",
      text: "Price"
    }
  ];
  if ($scope.section !== void 0) {
    $scope.sectionText = _.where(searchSections, {
      'value': $scope.section
    })[0].text;
  }
  return $scope.query = $location.search().target;
});

alt.controller('userCtrl', function($scope, $route, $location, $routeParams, $rootScope, auth, products, user) {
  var currentRoute, userID;
  currentRoute = $location.path().split('/');
  $scope.sectionActive = function(section) {
    var ref;
    return (ref = section === currentRoute[3]) != null ? ref : {
      'active': ''
    };
  };
  $scope.subSectionActive = function(subSection) {
    var ref;
    return (ref = subSection === currentRoute[4]) != null ? ref : {
      'active': ''
    };
  };
  $scope.ifUnderLove = function() {
    if (currentRoute[3] === 'love') {
      return true;
    } else {
      return false;
    }
  };
  userID = $routeParams.userID;
  $scope.userInfoUpdate = function() {
    user.updateUserInfo($scope.user);
    return $route.reload();
  };
  user.getUserColour(userID).then(function(data) {
    var colours;
    colours = [];
    _.forEach(data, function(snapshot) {
      return colours.push(_.capitalize(snapshot.$id));
    });
    return $scope.colours = _(colours).toString();
  });
  user.getUserCategory(userID).then(function(data) {
    var categories;
    categories = [];
    _.forEach(data, function(snapshot) {
      return categories.push(_.capitalize(snapshot.$id));
    });
    return $scope.categories = _(categories).toString();
  });
  user.getUserBrand(userID).then(function(data) {
    var brands;
    brands = [];
    _.forEach(data, function(snapshot) {
      return brands.push(_.capitalize(snapshot.$value));
    });
    return $scope.brands = _(brands).toString();
  });
  user.getUserFashion(userID).on('value', function(data) {
    if (data.val() === 'x') {
      return $scope.fashion = "Man's fashion";
    } else {
      return $scope.fashion = "Woman's fashion";
    }
  });
  user.getUserNewsletter(userID).on('value', function(data) {
    console.log(data.val());
    if (data.val() === true) {
      return $scope.newsletter = 'You have subscribbed to our newsletter and recommendation';
    } else {
      return $scope.newsletter = 'You have not yet subscribbed to our newsletter and recommendation';
    }
  });
  $scope.ifEditable = function() {
    if (userID === $rootScope.currentUser.$id) {
      return true;
    } else {
      return false;
    }
  };
  return $scope.showEditForm = function() {
    $scope.showEdit = true;
    return user.getUser(userID).then(function(data) {
      return $scope.user = data;
    });
  };
});

alt.directive('adminProducts', function() {
  return {
    restrict: 'A',
    templateUrl: '/views/directives/admin-products.html',
    scope: true,
    controller: function($scope) {
      $scope.deleting = false;
      $scope.startDelete = function() {
        return $scope.deleting = true;
      };
      return $scope.cancelDelete = function() {
        return $scope.deleting = false;
      };
    }
  };
});

alt.directive('fancybox', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      return $(element).fancybox();
    }
  };
});

alt.directive('listProducts', function() {
  return {
    restrict: 'AE',
    transclude: true,
    scope: true,
    templateUrl: '/views/directives/list-products.html'
  };
});

alt.directive('searchResults', function() {
  return {
    restrict: 'A',
    templateUrl: '/views/directives/search-results.html'
  };
});

alt.directive('videoPlayer', function() {
  return {
    restrict: 'A',
    templateUrl: '/views/directives/video-player.html',
    scope: 'true',
    controller: function($scope, $sce, brand) {
      return brand.getBrand($scope.brand).child('videoFile').on('value', function(video) {
        $scope.brandVideo = video.val();
        return brand.getBrand($scope.brand).child('videoPoster').on('value', function(poster) {
          $scope.brandVideoPoster = poster.val();
          return $scope.config = {
            autoHide: true,
            preload: 'none',
            sources: [
              {
                src: $sce.trustAsResourceUrl('/assets/videos/' + $scope.brandVideo),
                type: 'video/mp4'
              }
            ],
            theme: {
              url: 'http://www.videogular.com/styles/themes/default/latest/videogular.css'
            },
            plugins: {
              poster: '/assets/videos/' + $scope.brandVideoPoster
            }
          };
        });
      });
    }
  };
});

alt.filter('colourFilter', function() {
  return function(products, scope) {
    if (scope.colourIncludes.length > 0) {
      return products.filter(function(product) {
        return _.intersection(product.color, scope.colourIncludes).length > 0;
      });
    } else {
      return products;
    }
  };
});

alt.filter('genderFilter', function() {
  return function(products, scope) {
    if (scope.genderIncludes.length > 0) {
      return products.filter(function(product) {
        return _.intersection(product.gender, scope.genderIncludes).length > 0;
      });
    } else {
      return products;
    }
  };
});

alt.filter('userFilter', function() {
  return function(products, scope) {
    if (products !== void 0) {
      return products.filter(function(product) {
        var gender;
        gender = scope.userFilter;
        return _.intersection(product.gender, gender).length > 0;
      });
    }
  };
});

alt.filter('wordsTrunc', function() {
  return function(value, max) {
    if (!value) {
      return '';
    }
    max = parseInt(max, 20);
    if (!max || value.length <= max) {
      return value;
    } else {
      return value.substr(0, max) + ' …';
    }
  };
});

alt.factory('auth', function($rootScope, FIREBASE_URL, $firebaseAuth, $firebaseObject) {
  var authRef, output, rootRef;
  rootRef = new Firebase(FIREBASE_URL);
  authRef = $firebaseAuth(rootRef);
  authRef.$onAuth(function(authUser) {
    var userObj, userRef;
    if (authUser) {
      userRef = new Firebase(FIREBASE_URL + '/users/' + authUser.uid);
      userObj = $firebaseObject(userRef);
      return $rootScope.currentUser = userObj;
    } else {
      return $rootScope.currentUser = '';
    }
  });
  output = {
    login: function(userObj) {
      return authRef.$authWithPassword(userObj);
    },
    logout: function() {
      return authRef.$unauth();
    },
    register: function(userObj) {
      return authRef.$createUser(userObj);
    },
    storeUserInfo: function(userObj, regUser) {
      var userInfo, usersRef;
      usersRef = new Firebase(FIREBASE_URL + '/users');
      if (userObj.newsletter === void 0) {
        userObj.newsletter = false;
      }
      userInfo = {
        uid: regUser.uid,
        firstname: userObj.firstname,
        lastname: userObj.lastname,
        email: userObj.email,
        fashion: userObj.fashion,
        newsletter: userObj.newsletter,
        date: Firebase.ServerValue.TIMESTAMP,
        address: '',
        fashion: '',
        colour: '',
        category: '',
        brand: ''
      };
      usersRef.child(regUser.uid).set(userInfo, function() {
        return console.log(userInfo);
      });
    },
    requireAuth: function() {
      return authRef.$requireAuth();
    },
    getCurrentUser: function(uid) {
      var userRef;
      userRef = new Firebase(FIREBASE_URL + '/users/' + uid);
      return $firebaseObject(userRef);
    }
  };
  return output;
});

alt.factory('brand', function($rootScope, FIREBASE_URL, $firebaseArray, $firebaseObject) {
  var brandsRef, inspirationsRef, output, productsRef, tracesRef, usersRef;
  brandsRef = new Firebase(FIREBASE_URL + '/brands');
  productsRef = new Firebase(FIREBASE_URL + '/products');
  inspirationsRef = new Firebase(FIREBASE_URL + '/inspirations');
  tracesRef = new Firebase(FIREBASE_URL + '/traces');
  usersRef = new Firebase(FIREBASE_URL + '/users');
  output = {
    getBrand: function(brand) {
      return brandsRef.child(brand);
    },
    getBrandProducts: function(brand) {
      return $firebaseArray(productsRef.orderByChild('brand').equalTo(brand));
    },
    getBrandInspirations: function(brand) {
      return $firebaseArray(inspirationsRef.orderByChild('brand').equalTo(brand));
    },
    getBrandTraces: function(brand) {
      return $firebaseArray(tracesRef.orderByChild('brand').equalTo(brand));
    },

    /* Follow brand */
    followBrand: function(brand) {
      var brandFollowedRef, followInfo, followedCountArray, followedCountRef, userFollowsRef;
      brandFollowedRef = brandsRef.child(brand).child('follows');
      followedCountRef = brandsRef.child(brand).child('followsCount');
      followedCountArray = $firebaseArray(brandFollowedRef);
      followInfo = {
        date: Firebase.ServerValue.TIMESTAMP
      };

      /* Collect info about the user who follows this brand */
      brandFollowedRef.child($rootScope.currentUser.$id).set(followInfo, function() {
        console.log('Follow added to brand');
        return followedCountRef.set(followedCountArray.length, function() {
          return console.log('Follows counted');
        });
      });

      /* Collect info about the product which has been loved */
      userFollowsRef = usersRef.child($rootScope.currentUser.$id).child('follows');
      return userFollowsRef.child(brand).set(followInfo, function() {
        return console.log('Follow added to user');
      });
    },
    unfollowBrand: function(brand) {
      var brandFollowedRef, followedCountArray, followedCountRef, followsRefUser;
      brandFollowedRef = brandsRef.child(brand).child('follows');
      followedCountRef = brandsRef.child(brand).child('followsCount');
      followedCountArray = $firebaseArray(brandFollowedRef);

      /* Collect info about the user who follows this brand */
      brandFollowedRef.child($rootScope.currentUser.$id).remove(function() {
        console.log('Follow removed from brand');
        return followedCountRef.set(followedCountArray.length, function() {
          return console.log('Follows counted');
        });
      });

      /* Collect info about the product which has been loved */
      followsRefUser = usersRef.child($rootScope.currentUser.$id).child('follows').child(brand);
      return followsRefUser.remove(function() {
        return console.log('Follow removed from user');
      });
    },
    followedBrands: function(userID) {
      var followedBrands, followedBrandsArray, followedBrandsRef, promise;
      followedBrands = [];
      followedBrandsRef = usersRef.child(userID).child('follows');
      followedBrandsArray = $firebaseArray(followedBrandsRef);
      promise = followedBrandsArray.$loaded(function(data) {
        _.forEach(data, function(snapshot) {
          var followedBrandObj;
          followedBrandObj = $firebaseObject(brandsRef.child(snapshot.$id));
          return followedBrands.push(followedBrandObj);
        });
        return followedBrands;
      });
      return promise;
    },
    currentUserFollowedBrands: function() {
      var currentUserFollowedBrandsRef;
      currentUserFollowedBrandsRef = usersRef.child($rootScope.currentUser.$id).child('follows');
      return $firebaseArray(currentUserFollowedBrandsRef);
    }
  };
  return output;
});

alt.factory('info', function($rootScope, FIREBASE_URL, $firebaseArray, $firebaseObject) {
  var infoRef, output;
  infoRef = new Firebase(FIREBASE_URL + '/info');
  output = {
    getInfo: function() {
      return $firebaseArray(infoRef);
    },
    getInfoSection: function(section) {
      return infoRef.child(section);
    }
  };
  return output;
});

alt.factory('products', function($rootScope, FIREBASE_URL, $firebaseArray, $firebaseObject) {
  var output, product, productsRef, usersRef;
  productsRef = new Firebase(FIREBASE_URL + '/products');
  usersRef = new Firebase(FIREBASE_URL + '/users');
  product = function(productID) {
    return $firebaseObject(productsRef.child(productID));
  };
  output = {
    products: function() {
      var productsArray, promise;
      productsArray = $firebaseArray(productsRef);
      promise = productsArray.$loaded(function(data) {
        return data;
      });
      return promise;
    },
    randomProducts: function() {
      var productsArray, promise;
      productsArray = $firebaseArray(productsRef);
      promise = productsArray.$loaded(function(data) {
        return _.shuffle(data);
      });
      return promise;
    },
    featuredProducts: function() {
      return $firebaseArray(productsRef.orderByChild('featured').equalTo(true));
    },
    product: function(productID) {
      return productsRef.child(productID);
    },
    addProduct: function(product) {
      var productInfo;
      productInfo = {
        name: product.name,
        date: Firebase.ServerValue.TIMESTAMP
      };
      return productsRef.push(productInfo, function() {
        return console.log('Product added');
      });
    },
    deleteProduct: function(productID) {
      var productRef;
      productRef = productsRef.child(productID);
      return productRef.child('loves').on('value', function(users) {
        if (users.val() !== null) {
          return users.forEach(function(user) {
            usersRef.child(user.key()).child('loves').child(productID).remove(function() {
              return console.log('Love removed from user');
            });
            return productRef.remove(function() {
              return console.log('Product deleted');
            });
          });
        } else {
          return productRef.remove(function() {
            return console.log('Product deleted');
          });
        }
      });
    },
    flagProduct: function(flagType, productID) {
      var flagCountArray, flagCountRef, flagInfo, productFlagRef, userFlagRef;
      productFlagRef = productsRef.child(productID).child(flagType + 's');
      flagCountRef = productsRef.child(productID).child(flagType + 'sCount');
      flagCountArray = $firebaseArray(productFlagRef);
      flagInfo = {
        date: Firebase.ServerValue.TIMESTAMP
      };
      productFlagRef.child($rootScope.currentUser.$id).set(flagInfo, function() {
        console.log(flagType + ' added to product');
        return flagCountRef.set(flagCountArray.length, function() {
          return console.log(flagType + ' counted');
        });
      });
      userFlagRef = usersRef.child($rootScope.currentUser.$id).child(flagType + 's');
      return userFlagRef.child(productID).set(flagInfo, function() {
        return console.log(flagType + ' added to user');
      });
    },
    disflagProduct: function(flagType, productID) {
      var flagCountArray, flagCountRef, productFlagRef, userFlagRef;
      productFlagRef = productsRef.child(productID).child(flagType + 's');
      flagCountRef = productsRef.child(productID).child(flagType + 'sCount');
      flagCountArray = $firebaseArray(productFlagRef);
      productFlagRef.child($rootScope.currentUser.$id).remove(function() {
        console.log(flagType + ' removed from product');
        return flagCountRef.set(flagCountArray.length, function() {
          return console.log(flagType + ' counted');
        });
      });
      userFlagRef = usersRef.child($rootScope.currentUser.$id).child(flagType + 's').child(productID);
      return userFlagRef.remove(function() {
        return console.log(flagType + ' removed from user');
      });
    },
    flaggedProducts: function(flagSection, userID) {
      var flaggedProducts, flaggedProductsArray, flaggedProductsRef, promise;
      flaggedProducts = [];
      flaggedProductsRef = usersRef.child(userID).child(flagSection);
      flaggedProductsArray = $firebaseArray(flaggedProductsRef);
      promise = flaggedProductsArray.$loaded(function(data) {
        _.forEach(data, function(snapshot) {
          var flaggedProductObj;
          flaggedProductObj = $firebaseObject(productsRef.child(snapshot.$id));
          return flaggedProducts.push(flaggedProductObj);
        });
        return flaggedProducts;
      });
      return promise;
    },
    currentUserFlaggedProducts: function(flagType) {
      var currentUserFlaggedProductsRef;
      currentUserFlaggedProductsRef = usersRef.child($rootScope.currentUser.$id).child(flagType + 's');
      return $firebaseArray(currentUserFlaggedProductsRef);
    }
  };
  return output;
});

alt.factory('user', function($rootScope, FIREBASE_URL, $firebaseArray, $firebaseObject) {
  var output, product, usersRef;
  usersRef = new Firebase(FIREBASE_URL + '/users');
  product = function(userID) {
    return $firebaseObject(productsRef.child(userID));
  };
  output = {
    getUser: function(user) {
      var promise, userObject;
      userObject = $firebaseObject(usersRef.child(user));
      promise = userObject.$loaded(function(data) {
        return data;
      });
      return promise;
    },
    getUserColour: function(user) {
      var colourArray, promise;
      colourArray = $firebaseArray(usersRef.child(user).child('colour'));
      promise = colourArray.$loaded(function(data) {
        return data;
      });
      return promise;
    },
    getUserCategory: function(user) {
      var categoryArray, promise;
      categoryArray = $firebaseArray(usersRef.child(user).child('category'));
      promise = categoryArray.$loaded(function(data) {
        return data;
      });
      return promise;
    },
    getUserBrand: function(user) {
      var brandArray, promise;
      brandArray = $firebaseArray(usersRef.child(user).child('brand'));
      promise = brandArray.$loaded(function(data) {
        return data;
      });
      return promise;
    },
    getUserFashion: function(user) {
      return usersRef.child(user).child('fashion');
    },
    getUserNewsletter: function(user) {
      return usersRef.child(user).child('newsletter');
    },
    updateUserInfo: function(user) {
      var address, brand, category, colour, fashion, firstname, follows, lastname, loves, newsletter, reserves, userInfo, username;
      if (user !== void 0) {
        if (user.firstname === void 0) {
          firstname = $rootScope.currentUser.firstname;
        } else {
          firstname = user.firstname;
        }
        if (user.lastname === void 0) {
          lastname = $rootScope.currentUser.lastname;
        } else {
          lastname = user.lastname;
        }
        if (user.username === void 0) {
          username = $rootScope.currentUser.username;
        } else {
          username = user.username;
        }
        if (user.address === void 0) {
          address = $rootScope.currentUser.address;
        } else {
          address = user.address;
        }
        if (user.fashion === void 0) {
          fashion = $rootScope.currentUser.fashion;
        } else {
          fashion = user.fashion;
        }
        if (user.colour === void 0) {
          colour = $rootScope.currentUser.colour;
        } else {
          colour = user.colour;
        }
        if (user.category === void 0) {
          category = $rootScope.currentUser.category;
        } else {
          category = user.category;
        }
        if (user.brand === void 0) {
          brand = $rootScope.currentUser.brand;
        } else {
          brand = user.brand;
        }
        if (user.newsletter === void 0) {
          newsletter = $rootScope.currentUser.newsletter;
        } else {
          newsletter = user.newsletter;
        }
        if ($rootScope.currentUser.loves !== void 0) {
          loves = $rootScope.currentUser.loves;
        } else {
          loves = '';
        }
        if ($rootScope.currentUser.follows !== void 0) {
          follows = $rootScope.currentUser.follows;
        } else {
          follows = '';
        }
        if ($rootScope.currentUser.reserves !== void 0) {
          reserves = $rootScope.currentUser.reserves;
        } else {
          reserves = '';
        }
        userInfo = {
          uid: $rootScope.currentUser.uid,
          date: $rootScope.currentUser.date,
          firstname: firstname,
          lastname: lastname,
          username: username,
          email: $rootScope.currentUser.email,
          address: address,
          fashion: fashion,
          colour: colour,
          category: category,
          brand: brand,
          newsletter: newsletter,
          loves: loves,
          follows: follows,
          reserves: reserves
        };
        usersRef.child($rootScope.currentUser.$id).set(userInfo, function() {});
      }
    }
  };
  return output;
});


