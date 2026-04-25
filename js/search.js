// Search functionality initialization
$(document).ready(function() {
    if (typeof SimpleJekyllSearch !== 'undefined') {
        SimpleJekyllSearch({
            searchInput: document.getElementById('search-input'),
            resultsContainer: document.getElementById('search-results'),
            json: '/search.json',
            searchResultTemplate: '<div class="post-preview item">'+
                '<a href="{url}">'+
                    '<h2 class="post-title">{title}</h2>'+
                    '{subtitle}'+
                    '<h3 class="post-subtitle">{subtitle}</h3>'+
                '</a>'+
                '<hr>'+
            '</div>',
            noResultsText: '没有找到相关文章',
            limit: 10,
            fuzzy: false,
            exclude: ['Welcome']
        });
    }
});
