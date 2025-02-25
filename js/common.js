function initImageSwap() {
  function selectSwap($el) {
    var $root = $el.closest('.image-swap');
    var selectedClassName = $root.data('swap-selected-class');
    var unselectedClassName = $root.data('swap-unselected-class');
    var showTarget = $el.data('show-target');

    deselectSwap($root);

    $root.find('.swap').addClass(unselectedClassName);

    if (selectedClassName) {
      $el.removeClass(unselectedClassName);
      $el.addClass('swap-selected');
      $el.addClass(selectedClassName);
    }

    if (showTarget) {
      $(showTarget).show();
    }
  }

  function deselectSwap($root) {
    var selectedClassName = $root.data('swap-selected-class');
    var unselectedClassName = $root.data('swap-unselected-class');
    var $all = $root.find('.swap');

    $root.find('.swap').addClass(unselectedClassName);
    $all.removeClass('swap-selected');
    $all.removeClass(selectedClassName);

    hideShowTargets();
  }

  function hideShowTargets() {
    $('.swap').each(function (i, el) {
      var target = $(el).data('show-target');
      if (target) $(target).hide();
    });
  }

  $('.swap.swap-selected').each(function (i, el) {
    selectSwap($(el));
  });

  $('.swap').on('click', function () {
    var $el = $(this);
    var $root = $el.closest('.image-swap');
    var $target = $('#' + $root.data('image-swap-target'));

    if ($el.hasClass('swap-selected')) {
      deselectSwap($root);
      $target.attr('src', $root.data('img-url'));
      return;
    }

    $target.attr('src', $el.data('img-url'));
    selectSwap($el);
  });

  hideShowTargets();
}

$(document).ready(initImageSwap);
