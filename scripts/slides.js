(function($){
    
    var sizeSlides = function(){
        var wheight = $(window).height() - $('.navbar-fixed-top').height();
        var wwidth = $(window).width();
        $('.slide.full-height .slide-inner').height(wheight);
        $('.slide-inner').width(wwidth);
        
        $('.align-vertical-middle').each(function(idx, el){
           var $el = $(el);
           $el.css('padding-top', ($el.parent().height() - $el.height())/2);
        });
    };
    $(document).ready(function(){
        sizeSlides();
    });
    $(window).on('resize', sizeSlides);
    
}(jQuery));


