alt.directive 'fancybox', ->
	return {
    restrict: 'A',
    link: (scope, element, attrs) ->
      $(element).fancybox()
           
  }