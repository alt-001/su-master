alt.filter 'genderFilter', () ->
  (products, scope) ->
    if scope.genderIncludes.length > 0
      products.filter (product) ->
        _.intersection(product.gender, scope.genderIncludes).length > 0
    else 
      products