$(document).ready(function () {

    $("#service-search-input").on('keyup', function () {
        console.log('sss')

        var str = document.getElementById('service-search-input').value;
        // $.post("gethint.php", {q: str});
        console.log(str)
        var x = $('.services').children()
        var z = x.find(".title").val()
        console.log(z)

        console.log(x)

    });
})