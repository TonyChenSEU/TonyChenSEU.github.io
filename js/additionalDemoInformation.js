window.onload = function () {
  var additionalInfo = [];
  if (window.bitmovin) {
    if (window.bitmovin.analytics) {
      additionalInfo.push(
        '<div class="mb-1">Bitmovin Analytics Version ' + window.bitmovin.analytics.version + '</div>'
      );
    }

    if (window.bitmovin.player && window.bitmovin.player.Player) {
      additionalInfo.push(
        '<div class="mb-1">Bitmovin Player Version ' + window.bitmovin.player.Player.version + '</div>'
      );
    }
  }
  if (additionalInfo.length > 0) {
    $('#bitmovin-info').html(additionalInfo);
  }
};
