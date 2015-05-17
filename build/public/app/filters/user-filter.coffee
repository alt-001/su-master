alt.filter 'userFilter', () ->
  (products, scope) ->
    if products != undefined 
      products.filter (product) ->
        gender = scope.userFilter
        _.intersection(product.gender, gender).length > 0