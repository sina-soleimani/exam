var desiredId = null;
const csrfToken = $("input[name=csrfmiddlewaretoken]").val();
var candidate_delete_course = null;
$(document).ready(function () {
    
    var table=$('#courseTable').DataTable();

    $('#courseTable thead tr').clone(true).appendTo('#courseTable thead');
        $('#courseTable thead tr:eq(1) th').each(function (i) {
            // if(i>2){
            //     return false;
            //
            // }
            var title = $(this).text();
            $(this).html('<input type="text" placeholder="Search ' + title + '" />');

            $('input', this).on('keyup change', function () {
                if (table.column(i).search() !== this.value) {
                    table.column(i).search(this.value).draw();
                }
            });
        });


});


function exportToExcel() {
    console.log('132123')
    // Create a new workbook
    var wb = XLSX.utils.book_new();

    // Add the table data to a worksheet
    var ws = XLSX.utils.table_to_sheet(document.getElementById('courseTable'));

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Save the workbook as an Excel file
    XLSX.writeFile(wb, 'exported_data.xlsx');
}



