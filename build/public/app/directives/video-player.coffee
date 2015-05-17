alt.directive 'videoPlayer', ->
  return {
    restrict: 'A',
    templateUrl: '/views/directives/video-player.html',
    scope: 'true',
    controller: ($scope, $sce, brand) ->
      brand.getBrand($scope.brand).child('videoFile').on 'value', (video) ->
        $scope.brandVideo = video.val()
        brand.getBrand($scope.brand).child('videoPoster').on 'value', (poster) ->
          $scope.brandVideoPoster = poster.val()
          $scope.config =
            autoHide: true
            preload: 'none'
            sources: [
              {
                src: $sce.trustAsResourceUrl('/assets/videos/' + $scope.brandVideo)
                type: 'video/mp4'
              }
            ]
            theme: url: 'http://www.videogular.com/styles/themes/default/latest/videogular.css'
            plugins: {
              poster: '/assets/videos/' + $scope.brandVideoPoster
            }
  }