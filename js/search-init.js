// Search functionality
jQuery(document).ready(function($) {
    var $searchIcon = $('.search-icon a');
    var $searchPage = $('.search-page');
    var $searchClose = $('.search-icon-close');
    var $searchInput = $('#search-input');

    // Open search page
    $searchIcon.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $searchPage.addClass('search-active');
        setTimeout(function() {
            $searchInput.focus();
        }, 400);
    });

    // Close search page
    $searchClose.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $searchPage.removeClass('search-active');
    });

    // Close search on escape key
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && $searchPage.hasClass('search-active')) {
            $searchPage.removeClass('search-active');
        }
    });

    // Prevent document click from closing search when clicking inside search page
    $searchPage.on('click', function(e) {
        e.stopPropagation();
    });
});
