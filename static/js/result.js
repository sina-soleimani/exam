const csrfToken = $("input[name=csrfmiddlewaretoken]").val();
let id;
$(document).ready(function () {
    $('#resultTable').DataTable();

    $("#calc_results").click(function () {
        $.ajax({
            type: "POST",  // Use POST or GET as needed
            url: '/results/calc_result/',
            data: {
                exam_id: id
                // Include any data needed for calculations
            },
            headers: {
                "X-CSRFToken": csrfToken
            },
            success: function (data) {
                console.log('success')

            window.location.href = '/results/list/'+id;
                // Handle the response if needed
            }
        });
    });


});

document.addEventListener("DOMContentLoaded", function () {
    // Get the current URL
    const url = new URL(window.location.href);

    // Extract the last path segment as the ID
    const pathSegments = url.pathname.split('/').filter(segment => segment.trim() !== ''); // Remove empty segments
    id = pathSegments.pop();

    if (id) {
        // The 'id' variable contains the extracted ID.
        console.log("ID from URL: " + id);

        // Now, you can use the 'id' variable in your JavaScript code as needed.
    } else {
        // Handle the case where the 'id' is not found in the URL.
        console.log("ID not found in the URL");
    }
});