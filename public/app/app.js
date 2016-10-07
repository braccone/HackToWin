'use strict'

var myapp = angular.module('Myapp',['ngRoute'],function($locationProvider){
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});
// +1
$(document).ready(function() {
  $('#navbar li.active').removeClass('active');
  $('a[href="' + location.pathname + '"]').closest('li').addClass('active');
});
