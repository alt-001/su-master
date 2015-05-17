alt.filter 'colourFilter', () ->
  (products, scope) ->
    if scope.colourIncludes.length > 0
      products.filter (product) ->
        _.intersection(product.color, scope.colourIncludes).length > 0
    else 
      products