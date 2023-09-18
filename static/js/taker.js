
//TODO
$(document).on('click', 'button.showqbtn', function (event) {

    console.log($(this).parent().parent().children('.q-desc')[0].innerHTML.trim())

    $('#qlistModal').modal('toggle');
})