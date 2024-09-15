var desiredId = null;
const csrfToken = $("input[name=csrfmiddlewaretoken]").val();
var candidate_delete_course = null;
$(document).ready(function () {

    // var table=$('#courseTable').DataTable();
    console.log('dfaskjdfahskdfhasdfkhasdkjfn')
    $('#searchReport').click(function (event) {
        console.log('fdsasd')
        var username = $('.username-search').val();
        var teacherId = $('#teacher_id').val();
        var examId = $('#exam_id').val();
        var courseId = $('#course_id').val();
        console.log(courseId)
        var entryYearId = $('#entry_year_id').val();
        console.log(entryYearId)

        // Construct the data payload
        var data = {
            username: username,
            teacherId: teacherId,
            examId: examId,
            courseId: courseId,
            entryYearId: entryYearId
        };

        // Send an AJAX request to the Django backend
        $.ajax({
            url: '/report/filter/', // Replace with the actual URL to your Django view
            type: 'GET', // or 'POST' depending on your backend implementation
            data: data,
            success: function (response) {

                $('#courseTable tbody').empty();
                var newData = [
                    {
                        username: 'Alice',
                        entry_year: 2020,
                        course_name: 'Math',
                        term: 'Fall',
                        teacher: 'Mr. Smith',
                        exam_label: 'Midterm',
                        pass_score: 60,
                        max_score: 100,
                        avg_score: 75,
                        score: 80
                    },
                    {
                        username: 'Bob',
                        entry_year: 2019,
                        course_name: 'Science',
                        term: 'Spring',
                        teacher: 'Ms. Johnson',
                        exam_label: 'Final',
                        pass_score: 70,
                        max_score: 100,
                        avg_score: 85,
                        score: 90
                    },
                    // Add more data as needed
                ];

// Fill the table with new data
                response['results_data'].forEach(function (field) {
                    $('#courseTable tbody').append(
                        '<tr>' +
                        '<td>' + field.username + '</td>' +
                        '<td>' + field.entry_year + '</td>' +
                        '<td>' + field.course_name + '</td>' +
                        '<td>' + field.term + '</td>' +
                        '<td>' + field.teacher + '</td>' +
                        '<td>' + field.exam_label + '</td>' +
                        '<td>' + field.pass_score + '</td>' +
                        '<td>' + field.max_score + '</td>' +
                        // '<td>' + field.avg_score + '</td>' +
                        '<td>' + field.score + '</td>' +
                        '</tr>'
                    );
                });

            },
            error: function (xhr, errmsg, err) {
                // Handle any errors that occur during the request
                console.log(errmsg);
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



