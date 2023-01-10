$(document).ready(function () {
	"use strict"; // start of use strict

    $('.latest-pack-open').slick({
        dots: false,
        arrows: false,
        infinite: true,
        speed: 300,
        slidesToShow: 1,
        // vertical: false,
        // asNavFor: '.ball-scroll',
        // verticalSwiping: true,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
      });

      $('.company-logo-scroller').slick({
        dots: false,
        infinite: false,
        speed: 300,
        arrows: false,
        slidesToShow: 4,
        autoplay: true,
        autoplaySpeed: 2000,
        slidesToScroll: 4,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 3,
              infinite: true,
              dots: false
            }
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1
            }
          }
          // You can unslick at a given breakpoint now by adding:
          // settings: "unslick"
          // instead of a settings object
        ]
      });

      $('.ball-scroll').slick({
        dots: true,
        infinite: false,
        arrows: false,
        speed: 300,
        slidesToShow: 1,
        vertical: true,
        asNavFor: '.ball-scroll-2',
        verticalSwiping: true,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        responsive: [
          {
            //   breakpoint: 1024,
            //   settings: {
            //     slidesToShow: 3,
            //     slidesToScroll: 3,
            //     infinite: true,
            //     dots: true
            //   }
            // },
            // {
            //   breakpoint: 600,
            //   settings: {
            //     slidesToShow: 2,
            //     slidesToScroll: 2
            //   }
            // },
            // {
            //   breakpoint: 480,
            //   settings: {
            //     slidesToShow: 1,
            //     slidesToScroll: 1
            //   }
          }
          // You can unslick at a given breakpoint now by adding:
          // settings: "unslick"
          // instead of a settings object
        ]
      });

      $('.ball-scroll-2').slick({
        dots: true,
        arrows: false,
        infinite: false,
        speed: 300,
        slidesToShow: 1,
        vertical: true,
        asNavFor: '.ball-scroll',
        verticalSwiping: true,
        slidesToScroll: 1,
        autoplay: true,
        appendDots: $('.third-one-dots'),
        autoplaySpeed: 2000,
        responsive: [
          {
            //   breakpoint: 1024,
            //   settings: {
            //     slidesToShow: 3,
            //     slidesToScroll: 3,
            //     infinite: true,
            //     dots: true
            //   }
            // },
            // {
            //   breakpoint: 600,
            //   settings: {
            //     slidesToShow: 2,
            //     slidesToScroll: 2
            //   }
            // },
            // {
            //   breakpoint: 480,
            //   settings: {
            //     slidesToShow: 1,
            //     slidesToScroll: 1
            //   }
          }
          // You can unslick at a given breakpoint now by adding:
          // settings: "unslick"
          // instead of a settings object
        ]
      });

      $('.ball-scroll-nav li a').click(function (e) {
        e.preventDefault();

        if ($(this).hasClass('next')) {
          $('.ball-scroll').slick('slickNext');
        }
        else {
          $('.ball-scroll').slick('slickPrev');
        }
      });
      AOS.init({
        mirror: true,
        offset: 50
      });

      var menu = document.getElementById('menu');

      function toggleClass() {
        if (menu.classList == 'menu-opened') {
          menu.classList.remove('menu-opened')
        }
        else {
          menu.classList.add('menu-opened');
        }
      }
      
})