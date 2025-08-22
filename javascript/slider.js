$(document).ready(function(){
    $('.slider img').each(function(){
        $(this).css({
            'width': '100%',
            'height': 'auto', // 固定の高さを設定
            'object-fit': 'cover'
        });
    });

    $('.slider').bxSlider({
        auto: true,
        pause: 5000,
        slideWidth: 1000
    });
});
