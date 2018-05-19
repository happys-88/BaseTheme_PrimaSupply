define([ 
	"modules/jquery-mozu"
], function( $) {
	$(document).on('click', '#mz-print-content-confirmation', function (event) {
		alert("hello"); 
		window.print();
    });
}); 