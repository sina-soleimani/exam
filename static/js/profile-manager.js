
const csrfToken = $("input[name=csrfmiddlewaretoken]").val();


$(document).ready(function () {

    $('#profileTable').DataTable();

});

function uploadExcelFile(id) {
    var fileInput = document.getElementById('excelFileInput');
    var file = fileInput.files[0];

    if (file) {
        var formData = new FormData();
        formData.append('excelFile', file);
        formData.append('csrfmiddlewaretoken', csrfToken);

        $.ajax({
            url: 'upload_excel/',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                window.location.href = '/profile/list';
            },
            error: function () {
                alert('File upload failed.');
            }
        });
    } else {
        alert('Please select an Excel file to upload.');
    }
}



