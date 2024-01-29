const csrfToken = $("input[name=csrfmiddlewaretoken]").val();


$(document).ready(function () {

    $('#profileTable').DataTable();
    $('#profileTable thead tr').clone(true).appendTo('#profileTable thead');

    $('#profileTable thead tr:eq(1) th').each(function (i) {

        var title = $(this).text();
        $(this).html('<input type="text" placeholder="Search ' + title + '" />');
        $('input', this).on('keyup change', function () {
            if (table.column(i).search() !== this.value) {
                table.column(i).search(this.value).draw();
            }
        });
    });

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



